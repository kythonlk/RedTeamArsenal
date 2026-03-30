# Pivoting, Tunneling & Chisel Masterclass

Bridge gaps, access internal nets, bypass firewalls. Move laterally from {target} to hidden assets.

## Attack Workflow

1.  **Discovery**: Find the bridge (DMZ, bastion, or compromised host).
2.  **Port Scan**: Identify open services on {target}.
3.  **Tunnel Setup**: SSH or Chisel tunnel to a pivot point.
4.  **Internal Enumeration**: Run scans through the tunnel against targets.
5.  **Exploit/PrivEsc**: Leverage findings, repeat.

## Commands Section

### Find the Bridge
```bash
# Quick port scan on {target}
nmap -p- -T4 {target}

# Check for SSH (22), HTTP (80), Telnet (23), SMB (139/445)
nc -zv {target} 22-65535 | head -50
```

### SSH Tunneling (The Standard)
```bash
# Forward port 80 from {target} to local port 8080
ssh -L 8080:{target}:80 user@{pivot_ip}

# Reverse tunnel (local to {target})
ssh -R 8080:{target}:80 user@{pivot_ip}

# Bind all interfaces
ssh -L *:8080:localhost:80 user@{pivot_ip}
```

### Chisel Tunneling (Fast, No Keys)
```bash
# Start listener on pivot
chisel server -p 8888 -d

# Connect to {target} and expose it locally
chisel client pivot:8888 localhost:8080 {user}:{pass} {target}:{port}

# Reverse tunnel using chisel server
chisel server -t {target}:{port} localhost:8080
```

### Proxychains / HTTP Tunnel
```bash
# Chain multiple hops
proxychains5 nmap -A -p- {target}

# SOCKS proxy via SSH
ssh -S /dev/null -D 9050 user@{pivot_ip} &
```

## Enumeration Flow (Through Tunnel)

### Web Fuzzing
```bash
# Fuzz site mapped via tunnel
curl -L http://localhost:8080/ -H "User-Agent: ffuf"
ffuf -U http://localhost:8080/ -w files.txt -H "Host: {domain}"

# Subdomain takeoff
ffuf -u http://localhost:8080/ -H "Host: FUZZ.{domain}" -t 100
```

### Internal Scanning
```bash
# Scan internal host {internal_target}
proxychains5 nmap -A -sV -sC -p- {internal_target}

# Service enumeration through tunnel
netdiscover -b 10.0.0.0/24 > internal_hosts.txt
```

### Privilege Escalation via Tunnel
```bash
# Run SUID binary check on {internal_target} via tunnel
gobuster dir -u http://localhost:8080 -w /usr/share/wordlists/dirb/common.txt
```

## Tips & Shortcuts

*   **Keep it simple**: Always bind `*` (`:8080`) to accept remote connections.
*   **Auto-restart**: Run tunnels in background with `&` or use `systemd`-style units.
*   **Monitor**: Watch logs (`tail -f /var/log/auth.log`) for pivoted access attempts.
*   **Multi-hop**: Combine SSH tunnel + HTTP proxy for complex environments.

## Common Mistakes

*   **Wrong Bind**: Forgetting `*` causes local-only binding.
*   **No Persistence**: Tunnels drop when the session ends.
*   **Overlooking Auth**: Pivots often require credentials you don't have.
*   **Firewall Rules**: Some organizations block `chisel` or specific ports by default.

## Mini Automation Scripts

### Bash: Auto-SSH Tunnel Generator
```bash
#!/bin/bash
PORT=8080
USER="admin"
PASS="password"
PIVOT_IP="192.168.1.50"
TARGET="${1}"

ssh -L *:${PORT}:${TARGET}:80 ${USER}@${PIVOT_IP} &
echo "Tunnel ready: http://localhost:${PORT}"
```

### Python: Auto-Sweep After Tunnel
```python
#!/usr/bin/env python3
import subprocess
import time
import sys

def run_tunnel(user, pivot, target, port=8080):
    p = subprocess.Popen(['ssh', '-L', f'*:{port}:{target}:80', f'{user}@{pivot}'])
    return p

def scan_via_tunnel():
    # Simulate scanning through tunnel
    import socket
    print("Scanning local gateway...")
    for i in range(1, 255):
        try:
            s = socket.socket()
            s.connect(("127.0.0.1", 80))
            print(f"Port {i} open on {target}")
        except:
            pass
    time.sleep(5)

if __name__ == "__main__":
    run_tunnel("admin", "192.168.1.50", "192.168.1.10")
    scan_via_tunnel()
```