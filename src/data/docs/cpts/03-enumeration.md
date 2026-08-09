# Enumeration — Ports & Services

**Enumeration wins engagements. Slow down here.** The goal: know every open port, its exact service version, and what you can do with it *before* you touch an exploit. `{target}` = victim IP.

> Methodology: fast full-port sweep → targeted deep scan on found ports → per-service enumeration. Keep every output file — the exam wants evidence and you'll re-reference it.

---

## Nmap — The Right Way

### Stage 1: Fast full TCP port discovery
```bash
# All 65535 ports fast, then feed the open ones into a deep scan
nmap -p- --min-rate 10000 -T4 -Pn {target} -oN allports.txt
# Grab just the open ports as a comma list
ports=$(grep '^[0-9]' allports.txt | grep open | cut -d/ -f1 | tr '\n' ',' | sed 's/,$//')
echo $ports
```

### Stage 2: Deep scan on the open ports
```bash
# -sC default scripts, -sV version detection, -O OS detection, -A = all of that + traceroute
nmap -p$ports -sC -sV -O -Pn {target} -oA deep_scan
# Manual equivalent if you prefer:
nmap -p$ports -A -Pn {target} -oN deep.txt
```

### UDP — don't skip it (SNMP, DNS, TFTP, IKE live here)
```bash
# UDP is slow; scan top ports only
sudo nmap -sU --top-ports 100 -Pn {target} -oN udp.txt
```

### Vuln scripts
```bash
nmap -p$ports --script vuln -Pn {target} -oN vuln.txt
```

### What the flags ACTUALLY mean (memorise — the exam punishes guessing)
| Flag | Meaning |
|------|---------|
| `-sS` | TCP **SYN / half-open** scan (default when root; stealthier, faster) |
| `-sT` | TCP **connect** scan (full 3-way handshake; used when non-root) |
| `-sU` | **UDP** scan |
| `-sN` / `-sF` / `-sX` | **Null / FIN / Xmas** scans (firewall evasion) |
| `-sV` | **Service/version** detection |
| `-sC` | Run **default** NSE scripts (`= --script=default`) |
| `-O` | **OS** fingerprinting |
| `-A` | Aggressive: `-sV -sC -O --traceroute` combined |
| `-p-` | All **65535** ports (`-p1-65535`) |
| `-Pn` | **Skip host discovery** (treat host as up — needed when ICMP is blocked) |
| `-sn` | **Ping sweep only**, no port scan (host discovery) |
| `-n` | **No DNS** resolution (faster, quieter) |
| `-T0..T5` | Timing: `T0` paranoid (IDS evasion) → `T4` aggressive → `T5` insane |
| `--min-rate` | Minimum packets/sec (speed) |
| `-oA <base>` | Output **all three** formats (.nmap/.gnmap/.xml) |
| `-6` | Scan over **IPv6** |

> Note: `-Pn` is your friend on Windows/AD targets that don't answer ping. `-sn` is the opposite — discovery only.

---

## Per-Service Enumeration Playbook

### 21 — FTP
```bash
nmap -p21 --script ftp-anon,ftp-syst {target}
ftp {target}                     # try user: anonymous / pass: anything
# Once in: binary; passive; ls -la; mget *
```

### 22 — SSH
```bash
nmap -p22 --script ssh2-enum-algos,ssh-auth-methods {target}
ssh-audit {target}
# note the version -> searchsploit; try username enum / weak creds only if in scope
```

### 25 — SMTP
```bash
nmap -p25 --script smtp-commands,smtp-enum-users {target}
smtp-user-enum -M VRFY -U users.txt -t {target}
```

### 53 — DNS
```bash
dig axfr @{target} corp.local          # zone transfer (jackpot if allowed)
dnsenum --dnsserver {target} corp.local
```

### 80/443 — HTTP(S)
```bash
whatweb http://{target}
nmap -p80,443 --script http-enum,http-title,http-headers {target}
# then dir brute + vhost -> see the Web Attacks chapter
gobuster dir -u http://{target} -w /usr/share/seclists/Discovery/Web-Content/directory-list-2.3-medium.txt -x php,txt,html
```

### 111 — RPCbind / NFS
```bash
rpcinfo -p {target}
showmount -e {target}                  # list NFS exports
sudo mount -t nfs {target}:/export /mnt/nfs -o nolock
```

### 139/445 — SMB
```bash
nxc smb {target}                       # OS, domain, signing at a glance
smbclient -N -L //{target}/            # null-session share list
smbmap -H {target}                     # share permissions
smbmap -H {target} -u {user} -p {pass} -R    # recursive with creds
enum4linux-ng -A {target}
nmap -p445 --script smb-vuln* {target} # EternalBlue etc.
```

### 161 — SNMP (UDP)
```bash
snmpwalk -v2c -c public {target}
onesixtyone -c /usr/share/seclists/Discovery/SNMP/common-snmp-community-strings.txt {target}
snmpbulkwalk -v2c -c public {target} 1.3.6.1.2.1.25.4.2.1.2   # running processes
```

### 389/636 — LDAP
```bash
ldapsearch -x -H ldap://{target} -s base namingcontexts
ldapsearch -x -H ldap://{target} -b "DC=corp,DC=local"
```

### 3306 / 5432 / 1433 — Databases
```bash
mysql -h {target} -u root -p
psql -h {target} -U postgres
impacket-mssqlclient {domain}/{user}:{pass}@{target} -windows-auth
```

### 3389 — RDP
```bash
nmap -p3389 --script rdp-ntlm-info {target}     # leaks hostname/domain
xfreerdp /u:{user} /p:{pass} /v:{target} /cert:ignore /dynamic-resolution
```

---

## Enumeration Checklist (tick every box)

- [ ] Full TCP `-p-` scan completed and saved
- [ ] Deep `-sC -sV` scan on all open ports
- [ ] UDP top-100 scanned
- [ ] Every service version fed to `searchsploit`
- [ ] SMB: null session, shares, signing status
- [ ] Web: whatweb, dir brute, vhost fuzz, source/robots.txt/comments
- [ ] Default creds tried on every login you found
- [ ] All output files kept for the report

## Common Mistakes

- **Scanning only the top 1000 ports.** The flag is on `12345`. Always `-p-`.
- **Forgetting `-Pn`** on hosts that block ICMP → nmap reports "host down" and skips everything.
- **Ignoring UDP.** SNMP with `public` is a free win people miss.
- **Not versioning services.** `-sV` output is what turns into a `searchsploit` hit.
- **Rushing to exploit.** 80% of the work is enumeration; the exploit is the easy part.
