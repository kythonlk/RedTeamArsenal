# Fast Enumeration Checklist for CPTS Exam

Get live data and map the attack surface instantly. This flow moves from basic connectivity to full service discovery in minutes, tailored for the CPTS scenario.

## Attack Workflow

1. **Connectivity & Ping Sweep**: Verify reachability and identify live hosts.
2. **Port Enumeration**: Open ports and check for services.
3. **Banner Grabbing**: Identify service versions.
4. **Directory & File Discovery**: Find web content and configuration files.
5. **Service Vulnerability Scanning**: Test specific protocols for exploits.
6. **Header Analysis**: Look for misconfigurations and exposed data.

## Commands Section

### 1. Connectivity & Ping Sweep
```bash
ping -c 3 -W 1 {target}
ping6 -c 3 -W 1 {target}
traceroute -n {target}
```

### 2. Port Enumeration (Nmap)
```bash
# All ports (fast)
nmap -sT -p- -oG /tmp/nmap.txt -v {target}

# TCP Syn Scan with Version Detection & OS detection
nmap -sS -sV -O --open -oN /tmp/nmap.txt {target}

# Specific port scan (common services)
nmap -p 20,21,22,23,25,53,80,110,143,443,3306,3389,5432 {target}
```

### 3. Banner Grabbing
```bash
# Grab banners from open ports
for port in $(cat /tmp/nmap.txt | sort -n -u | grep open); do
    netstat -tlnp | grep $port | grep LISTEN
done | while read line; do
    service=$(echo $line | awk '{print $4}' | cut -d: -f1)
    nc -zv {target} $service 2>/dev/null | grep -o "[A-Za-z0-9_-]" | tail -1
done
```

### 4. Web Directory & File Discovery
```bash
# Basic fuzzing with gobuster
gobuster dir -u http://{target} -w /usr/share/wordlists/dirb/common.txt

# Fuzzing with ffuf (faster)
ffuf -u http://{}/{{FUSSYWORD}/} -w /usr/share/wordlists/dirb/common.txt -t 100 {target}

# Fuzzing with dirb
dirb -u http://{} -F 64 {target}
```

### 5. HTTP Header Analysis & Misconfig
```bash
# Check for Server/Version exposure
curl -I http://{target}
```

### 6. Service Vulnerability Scanning
```bash
# Check for CVE exploits
gobuster dcv -u http://{} -w /usr/share/wordlists/directory/.git/

# Check for exposed directories
gobuster dcv -u http://{} -w /usr/share/wordlists/directory/.git/
```

### 7. Banner Grabbing (Service Specific)
```bash
# Check for vulnerable services
for port in $(seq 1 1000); do
    nc -zv {target} $port 2>/dev/null | grep -o "[A-Za-z0-9_-]" | tail -1
done
```

## Tips & Shortcuts

*   **Nmap Flags**: `-sT` (TCP SYN), `-sS` (SYN scan), `-sV` (Version), `-O` (OS detection), `-p-` (all ports).
*   **Gobuster Flags**: `-w` (wordlist), `-u` (URL), `-e` (extension).
*   **FFuf Flags**: `-t` (threads), `-w` (wordlist), `-max-age` (max age).
*   **Netcat Flags**: `-zv` (vivid), `-nc` (connection), `-p` (port), `-c` (command).
*   **Curl Flags**: `-I` (headers), `-v` (verbose), `-d` (data).

## Common Mistakes

*   **Wrong Port Numbers**: Using incorrect port numbers in commands.
*   **Missing Extensions**: Forgetting to check common file extensions (`.git`, `.bak`).
*   **Ignoring Headers**: Not checking HTTP headers for vulnerabilities.
*   **No Target Verification**: Assuming target is reachable without verifying connectivity.
*   **Incorrect Wordlists**: Using outdated wordlists for enumeration.

## Mini Automation Scripts

### Bash: Port Scanner
```bash
#!/bin/bash
for port in $(seq 1 1000); do
    if nc -zv {target} $port 2>/dev/null; then
        echo "Port $port is open"
    fi
done
```

### Python: Enumerating HTTP Headers
```python
import urllib.request, urllib.error

try:
    req = urllib.request.Request("http://{target}/")
    with urllib.request.urlopen(req) as response:
        print(response.headers)
except Exception as e:
    print(f"Error: {e}")
```

### Bash: Quick Service Check
```bash
#!/bin/bash
for port in $(seq 1 65535); do
    if nc -zv {target} $port 2>/dev/null; then
        service=$(echo $line | awk '{print $4}' | cut -d: -f1)
        nc -zv {target} $service 2>/dev/null | grep -o "[A-Za-z0-9_-]" | tail -1
    fi
done
```