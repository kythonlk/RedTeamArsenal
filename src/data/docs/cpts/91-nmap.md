# Nmap Survival Guide: CPTS Exam Edition

Stop reading manuals and start running scans. This isn't about theory; it's about reconnaissance speed and coverage.

## Attack Workflow

1.  **Host Discovery**: Ping sweep first to map live hosts without hitting specific ports.
2.  **Service Enumeration**: Identify open ports and running services (protocols, versions).
3.  **Version Detection**: Get detailed fingerprinting to identify service specifics.
4.  **Script Fuzzing**: Run NSE scripts to discover vulnerabilities, user info, and backdoors.
5.  **Exploitation Prep**: Use findings to pivot or prepare for targeted attacks.

## Commands & One-Liners

### Basic Scan
```bash
nmap -sS -v -T4 {target}
nmap -A -T4 {target}
```

### Service + Version Detection
```bash
nmap -sV -O -p- {target}
```
*Flags:* `-sV` = Service detection, `-O` = OS detection, `-p-` = All ports.

### Full Fingerprint & Vulnerability Scan
```bash
nmap -A -p- {target} --script vuln,fingerprint,nmap-security-checks
```
*Note:* `-A` enables OS detection, version detection, script scanning, and default aggressiveness.

### Ping Sweep
```bash
nmap -sn 192.168.1.0/24
```
*Usage:* Replace `192.168.1.0/24` with your subnet.

### Service Version Dump
```bash
nmap -sC -sV --version-intensity high {target}
```

## Attack Chains & Payloads

### OS Detection
```bash
nmap -O {target}
```
*Usage:* Determines host OS without opening ports.

### Service Version
```bash
nmap -sV {target}
```
*Usage:* Shows service names and versions.

### Script Fuzzing
```bash
nmap -sC -sV -p- --script=vuln {target}
```
*Usage:* Runs vulnerability detection scripts against open ports.

### Service Fingerprinting
```bash
nmap -sO -p- {target}
```
*Usage:* Identifies OS and service info without opening ports.

### Host Discovery
```bash
nmap -sn -PR {target}
```
*Usage:* Ping scan with protocol resolution.

### Service Scanning
```bash
nmap -sS -sV -p- {target}
```
*Usage:* SYN scan with version detection for all ports.

### Version Intensity
```bash
nmap --version-intensity high {target}
```
*Usage:* Detailed version info.

## Tips & Shortcuts

**OS Detection**:
Use `-O` for OS detection; it's faster than `-A` and less noisy.
**Port Scanning**:
`-p 1-1000` is faster than `-p-` (all ports). Scan top 1000 first.
**Script Execution**:
Run specific scripts with `--script=name`. Example: `--script=vuln`.
**Aggressive Timing**:
Use `-T4` or `-T5` for speed, but be careful of triggering IDS/WAF.

## Common Mistakes

1.  **Ignoring ICMP**: Sometimes ping (`-sn`) fails due to firewall blocking. Use `nmap -sS` instead.
2.  **Not Using `-p-`**: Always specify `-p-` for full port enumeration unless you have a reason to limit.
3.  **Overlooking Scripts**: Don't just stop at port discovery; run `--script=vuln` for CVE detection.
4.  **Timing Issues**: Using `-T1` (Slow) in an exam context wastes time. Default or use `-T4` if allowed.
5.  **Forgetting `-A`**: The `-A` flag aggregates multiple scan types into one command. It's your best friend.

## Mini Automation Script (Bash)

```bash
#!/bin/bash
TARGET="${1:-example.com}"
echo "Scanning $TARGET..."
nmap -A -p- --script=vuln $TARGET
# Filter results for open ports > 1000
nmap -p 1000-65535 --top-ports 100 $TARGET | grep "open"
```