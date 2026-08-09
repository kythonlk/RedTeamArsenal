# 01 — Methodology (The Loop You Repeat On Every Box/Network)

CPTS is really this loop, repeated on every host until you own the domain:

```
Recon → Enumerate → Find Vuln → Exploit → Foothold → Enumerate (local) → Privesc → Loot/Pivot → Repeat
```

## The Standard Flow

1. **Scope check** — confirm IP/host is in scope before touching it.
2. **Recon (passive)** — OSINT, whois, subdomains, no packets to target if external engagement rules say so. (see `02-recon-osint.md`)
3. **Port scan (active)** — full TCP + top UDP ports. (see `03-scanning-enum-nmap.md`)
4. **Service enumeration** — version-specific enum per open port. (see `04-service-enumeration.md`)
5. **Web enumeration** — if 80/443/8080 etc. open. (see `05-web-enumeration.md`)
6. **Vulnerability research** — searchsploit, Google `<service> <version> exploit`, GitHub, CVE databases.
7. **Exploitation** — get code execution / a foothold.
8. **Stabilize shell** — upgrade to a proper TTY. (see `08-shells-payloads.md`)
9. **Local enumeration** — linpeas/winpeas + manual checks.
10. **Privilege escalation** — root/SYSTEM. (see `10-`, `11-`)
11. **Loot** — creds, hashes, configs, SSH keys, history files, secrets.
12. **Pivot** — use loot to reach next host / pivot network. (see `12-`, `13-`, `14-`, `15-`)
13. **Document as you go** — screenshot every step NOW, not at the end. (see `18-report-writing.md`)

## Mental Checklist Per New Host

- [ ] All TCP ports scanned (not just top 1000)?
- [ ] All UDP relevant ports checked (SNMP, DNS, TFTP)?
- [ ] Every open port enumerated with the right tool/script?
- [ ] Anonymous/guest access tried everywhere (FTP, SMB, LDAP, NFS)?
- [ ] Default creds tried?
- [ ] Version numbers googled?
- [ ] robots.txt, source code, JS files checked on web apps?
- [ ] Any creds found reused everywhere (password spraying across all discovered users/services)?
- [ ] Screenshots taken for report?

## The #1 Rule for CPTS

**Enumerate harder, not smarter-guess.** Almost every stuck point in CPTS is solved by going back and enumerating something you skipped — not by some 1337 0-day. If stuck >30-45 min: re-scan all ports (`-p-`), re-check UDP, re-check every service banner/version, and re-read every file grabbed so far for creds/hints.

## Credential Reuse Is King in AD Networks

Every credential (even a hash) you find should immediately be tried against:
- Every other service (SMB, WinRM, RDP, SSH, web logins)
- Every other user (password spraying, NOT one user brute force — avoid lockouts)
- CrackMapExec / NetExec across the whole subnet

## Note-Taking Discipline (do this from minute 1)

Use a folder-per-host structure, e.g.:
```
/exam/10.10.11.5-dc01/
  ├── scans/
  ├── loot/
  ├── screenshots/
  └── notes.md
```
Keep a master `progress.md` with: IP, hostname, role, creds found, status (foothold/privesc/domain admin), open TODOs.

Next: `02-recon-osint.md`
