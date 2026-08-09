# 05 — Web Enumeration

## Step 1: Manual Look
- View source, `Ctrl+U`
- `/robots.txt`, `/sitemap.xml`, `/.well-known/`
- Check response headers (server, tech stack): `curl -I http://target`
- Wappalyzer browser extension / `whatweb http://target`

## Step 2: Directory / File Fuzzing

```bash
ffuf -u http://target/FUZZ -w /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt -e .php,.txt,.bak,.zip -recursion -recursion-depth 2 -c

gobuster dir -u http://target -w /usr/share/seclists/Discovery/Web-Content/common.txt -x php,txt,bak
```
**Better than HTB's gobuster-only approach:** `ffuf` supports multi-threaded recursion, filtering by size/words (`-fs`, `-fw`), and is faster. Use `ffuf` as your daily driver; gobuster is fine for quick one-offs.

## Step 3: Parameter / Vhost Fuzzing

```bash
# Parameter discovery
ffuf -u http://target/page.php?FUZZ=test -w params.txt -fs <baseline_size>

# Vhosts
ffuf -u http://target -H "Host: FUZZ.target.com" -w subdomains.txt -fs <baseline_size>
```

## Step 4: Tech-Specific Enumeration

```bash
# WordPress
wpscan --url http://target --enumerate vp,vt,u --api-token <token>

# Drupal / Joomla
droopescan scan drupal -u http://target
joomscan -u http://target

# CMS/framework fingerprint
whatweb -v http://target
```

## Step 5: API Enumeration

```bash
ffuf -u http://target/api/FUZZ -w api_endpoints.txt
# Check for swagger/openapi docs
curl http://target/swagger.json
curl http://target/api/v1/
```

## Step 6: Crawl For Hidden Endpoints / JS Secrets

```bash
katana -u http://target -jc -d 3 -o crawled.txt      # JS-aware crawler
# Then grep JS files for endpoints/keys
cat crawled.txt | grep '\.js$' | xargs -I{} curl -s {} | grep -Eo "(\"|')(\/[a-zA-Z0-9_?&=\/\-\#\.]*)(\"|')"

# Secrets scanner on JS
python3 secretfinder.py -i http://target/app.js -o cli
```

## Step 7: Vuln Scanning (noisy, use once enumerated manually first)

```bash
nikto -h http://target
nuclei -u http://target -t cve/ -severity critical,high
```

## Screenshot Many Web Hosts At Once (subnet with many web servers)

```bash
gowitness scan file -f urls.txt
# or
eyewitness --web -f urls.txt
```

## Login Pages — Always Try
- Default creds: `admin:admin`, `admin:password`, blank password
- SQLi bypass: `admin' OR '1'='1' -- -`
- Check for user enumeration via different error messages

## Quick Reference — Tools In This File

| Task | HTB-taught | Faster/better alternative |
|---|---|---|
| Dir busting | gobuster | `ffuf` (faster, more filters, recursion) |
| Vuln scanning | nikto only | add `nuclei` (templated, huge community DB, fast) |
| JS crawling | manual | `katana` (JS-aware, headless-capable) |
| Screenshotting | manual browsing | `gowitness` / `eyewitness` |

Next: `06-web-attacks.md`
