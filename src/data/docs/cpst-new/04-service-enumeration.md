# 04 — Per-Service Enumeration Cheat Sheet

## FTP (21)
```bash
nmap -p21 -sC -sV <IP>
ftp <IP>          # try anonymous:anonymous
wget -m ftp://anonymous:anonymous@<IP>   # mirror whole FTP if anon allowed
```

## SSH (22)
```bash
ssh -oKexAlgorithms=+diffie-hellman-group1-sha1 user@<IP>   # old ciphers
# Try key reuse, weak creds, check version for known CVEs (e.g. libssh auth bypass)
```

## SMTP (25/587)
```bash
nc -nv <IP> 25
VRFY root         # user enumeration
smtp-user-enum -M VRFY -U userlist.txt -t <IP>
```

## DNS (53)
```bash
dig axfr @<IP> target.com     # zone transfer attempt
nslookup -type=any target.com <IP>
```

## HTTP/HTTPS (80/443) → see `05-web-enumeration.md`

## Kerberos (88)
```bash
kerbrute userenum -d target.local --dc <IP> userlist.txt
```

## RPC (135) / NetBIOS (139) / SMB (445)
```bash
nmap --script smb-os-discovery,smb-enum-shares,smb-enum-users -p139,445 <IP>
smbclient -L //<IP>/ -N                     # null session, list shares
smbclient //<IP>/share -N
smbmap -H <IP> -u null -p null              # cleaner share/permissions view
crackmapexec smb <IP> -u '' -p '' --shares  # null session shares
crackmapexec smb <IP> -u user -p pass --shares
enum4linux-ng -A <IP>                       # all-in-one enum (users, groups, shares, policy)
rpcclient -U "" -N <IP>
  > enumdomusers
  > querydominfo
```
**Better than HTB's `enum4linux` (old):** use `enum4linux-ng` — actively maintained, cleaner JSON-able output. And use **NetExec (nxc)** — the maintained fork of CrackMapExec (`crackmapexec` is semi-abandoned upstream now):
```bash
nxc smb <IP> -u '' -p '' --shares
nxc smb <IP> -u users.txt -p passwords.txt --continue-on-success
```

## LDAP (389/636)
```bash
ldapsearch -x -H ldap://<IP> -s base namingcontexts
ldapsearch -x -H ldap://<IP> -D "" -w "" -b "DC=target,DC=local"
windapsearch -d target.local --dc-ip <IP> -u '' -m users
```

## POP3/IMAP (110/143)
```bash
nc -nv <IP> 110
USER user
PASS pass
```

## SNMP (161/UDP)
```bash
snmpwalk -c public -v1 <IP>
snmpwalk -c public -v2c <IP> .1.3.6.1.2.1.1
onesixtyone -c community.txt <IP>
```

## MSSQL (1433)
```bash
mssqlclient.py user:pass@<IP>              # impacket
nxc mssql <IP> -u user -p pass
# xp_cmdshell if sysadmin:
EXEC sp_configure 'show advanced options',1; RECONFIGURE;
EXEC sp_configure 'xp_cmdshell',1; RECONFIGURE;
EXEC xp_cmdshell 'whoami';
```

## MySQL (3306)
```bash
mysql -h <IP> -u root -p
mysql -h <IP> -u root -p -e "select load_file('/etc/passwd');"   # file read if FILE priv
```

## RDP (3389)
```bash
xfreerdp /u:user /p:pass /v:<IP>
rdesktop <IP>
```

## WinRM (5985/5986)
```bash
evil-winrm -i <IP> -u user -p pass
nxc winrm <IP> -u user -p pass
```

## NFS (2049)
```bash
showmount -e <IP>
mount -t nfs <IP>:/share /mnt/nfs -o nolock
```

## Oracle TNS (1521)
```bash
nmap --script oracle-tns-version -p1521 <IP>
odat.py all -s <IP>
```

## Redis (6379) / Memcached (11211) / Elasticsearch (9200) — often unauth
```bash
redis-cli -h <IP>
curl <IP>:9200/_cat/indices?v
```

## Quick Reference — Tools In This File

| Task | HTB-taught | Faster/better alternative |
|---|---|---|
| SMB user/share enum | enum4linux | `enum4linux-ng`, `smbmap` |
| Multi-protocol AD enum/spray | CrackMapExec | `netexec (nxc)` — actively maintained fork |
| MSSQL/SMB/WMI exec | manual | `impacket` suite (psexec.py, wmiexec.py, mssqlclient.py) |

Next: `05-web-enumeration.md`
