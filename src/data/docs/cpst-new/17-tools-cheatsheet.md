# 17 — Master Tools Cheat Sheet: HTB-Taught vs. Better/Faster

Full list in one place. If you only read one file for "what should I actually use," read this.

| Category | HTB Academy teaches | Use instead / in addition | Why |
|---|---|---|---|
| Full port scan | `nmap -p-` | `rustscan` → hand off to nmap | Massively faster full-port discovery |
| Subnet-wide scan | nmap loop | `masscan` | Handles huge ranges in seconds |
| Subdomain enum | manual dig/gobuster-dns | `subfinder` + `httpx` | Passive, fast, gives live status/titles |
| Directory fuzzing | `gobuster` | `ffuf` | Faster, recursion, better filtering (`-fs`,`-fw`) |
| Vuln scanning | `nikto` | add `nuclei` | Huge template DB, actively updated, fast |
| SMB/AD enum & spray | `enum4linux`, `CrackMapExec` | `enum4linux-ng`, `netexec (nxc)` | Both are maintained successors, cleaner output |
| AD attack path mapping | manual/PowerView only | `BloodHound` (bloodhound-python/SharpHound) | Non-negotiable — visual attack graph |
| Kerberos user enum/spray | hydra | `kerbrute` | Faster, avoids lockouts better, purpose-built |
| Linux privesc enum | `LinEnum` | `linpeas.sh` + `pspy64` | More checks + catches cron/timing issues live |
| Windows privesc enum | `winPEAS` | winPEAS + `Seatbelt` | Seatbelt is faster, quieter, strong AD checks |
| Token impersonation | `JuicyPotato` | `PrintSpoofer` / `GodPotato` | Original JuicyPotato is patched on modern Windows |
| Kernel exploit matching | manual searchsploit | `Watson` / `linux-exploit-suggester.sh` | Cross-references live patch level automatically |
| Hash cracking | `john` | `hashcat` (if GPU) | 10-100x faster with GPU acceleration |
| Pivoting | `chisel` + proxychains | `Ligolo-ng` | Real tun interface, no proxychains tool-breakage |
| Remote exec (WinRM) | `psexec`-first habit | `evil-winrm` when 5985 open | Cleaner, built-in upload/download, less noisy |
| ADCS abuse | light/none in Academy | `certipy-ad` | Modern standard, check every AD box for ESC1-8 |
| JS/endpoint discovery | manual browsing | `katana` + `gau`/`waybackurls` | Crawls JS, finds forgotten endpoints fast |
| Password wordlist from site content | none | `cewl` | Site-specific wordlist for CMS/app logins |
| Screenshotting many hosts | manual | `gowitness` / `eyewitness` | Batch visual triage of a big subnet |

## Tool Install Checklist (have these ready before exam day)

```bash
# Go-based (ProjectDiscovery + friends) - install via go install
subfinder, httpx, nuclei, katana, gau

# Python-based
impacket (psexec.py, wmiexec.py, secretsdump.py, GetUserSPNs.py, GetNPUsers.py, ticketer.py, getTGT.py, getST.py)
bloodhound-python
certipy-ad
netexec (pip install netexec, or nxc)
kerbrute (Go binary)

# Standard Kali toolset (already present)
nmap, ffuf, gobuster, hydra, john, hashcat, sqlmap, nikto, enum4linux-ng, smbclient, smbmap, evil-winrm, chisel, ligolo-ng, rustscan, masscan, crackmapexec

# Windows-side binaries to stage/upload
winPEAS, Seatbelt, PowerUp.ps1, PrintSpoofer64.exe, mimikatz.exe, SharpHound.exe, accesschk64.exe, Watson.exe
```

## Where To Get Them
- Most Go tools: `go install github.com/projectdiscovery/<tool>/cmd/<tool>@latest`
- Windows binaries: keep a personal repo/folder mirrored from PayloadsAllTheThings + official GitHub releases, host on your attack box with `python3 -m http.server`.
- SecLists: `/usr/share/seclists/` on Kali, or `git clone https://github.com/danielmiessler/SecLists`

Next: `18-report-writing.md`
