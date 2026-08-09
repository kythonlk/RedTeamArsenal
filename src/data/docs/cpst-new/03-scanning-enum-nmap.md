# 03 — Scanning & Nmap

## The Standard Nmap Sequence

```bash
# 1. Fast full TCP port sweep (find open ports first, no scripts)
nmap -p- --min-rate 5000 -T4 -Pn -oN scans/allports.txt <IP>

# 2. Detailed scan on found ports only (versions + default scripts)
nmap -p<ports_found> -sC -sV -Pn -oN scans/detailed.txt <IP>

# 3. UDP top ports (often skipped — don't skip it, SNMP/DNS/TFTP live here)
nmap -sU --top-ports 100 -Pn -oN scans/udp.txt <IP>

# 4. Vuln scripts (optional, noisy, sometimes crashes services — use carefully)
nmap -p<ports> --script vuln -Pn <IP>
```

## Better/Faster Alternative — RustScan

HTB Academy teaches raw nmap for full-port scans, which is slow (`-p- --min-rate 5000` still takes a while). **RustScan is dramatically faster** for the initial port discovery, then hands off to nmap for the detail scan automatically:

```bash
rustscan -a <IP> -- -sC -sV -Pn -oN scans/rustscan.txt
```
For a full CIDR/subnet, RustScan + masscan combo beats nmap alone every time:
```bash
masscan -p1-65535 <IP> --rate 10000 -e tun0 -oG masscan.txt
```

## Full Subnet / Internal Network Sweep

```bash
# Host discovery across a subnet
nmap -sn 10.10.11.0/24 -oG - | grep Up | cut -d' ' -f2 > live_hosts.txt

# Fast port check across all live hosts
nmap -iL live_hosts.txt -p- --min-rate 5000 -T4 -oA scans/subnet_allports

# or with masscan for big ranges
masscan -iL live_hosts.txt -p1-65535 --rate 10000 -e tun0 -oL masscan_out.txt
```

## Useful NSE Script Categories

```bash
nmap --script "default,safe" -sV <IP>
nmap --script smb-enum-shares,smb-os-discovery,smb-vuln* -p445 <IP>
nmap --script http-enum,http-title,http-headers -p80,443 <IP>
nmap --script ssl-cert,ssl-enum-ciphers -p443 <IP>
```

## Output Formats — Always Save

```bash
-oA scans/name   # all formats (nmap, gnmap, xml) — do this always, not just -oN
```

## Nmap Cheat Flags

| Flag | Meaning |
|---|---|
| `-Pn` | Skip host discovery (assume up) — needed a lot on HTB, ICMP often blocked |
| `-n` | No DNS resolution (faster) |
| `--min-rate 5000` | Force min packet rate (speed) |
| `-T4` | Timing template (aggressive, safe for lab/exam) |
| `-A` | OS detect + version + scripts + traceroute (slow, use sparingly) |
| `-v` / `-vv` | Verbose (see progress) |

## AD Environment Extra Enum Ports To Never Skip

53 (DNS), 88 (Kerberos), 135 (RPC), 139/445 (SMB), 389/636 (LDAP/LDAPS), 3268/3269 (Global Catalog), 5985/5986 (WinRM) — if you see these together, it's a Domain Controller.

Next: `04-service-enumeration.md`
