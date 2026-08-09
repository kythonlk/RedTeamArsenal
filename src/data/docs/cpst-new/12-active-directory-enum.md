# 12 — Active Directory Enumeration

This is the heart of CPTS. Master this file.

## Step 0: Get Domain Info From Any Foothold

```bash
nxc smb <IP>                    # banner reveals domain name, hostname, OS, signing
nmap -p88,389 --script krb5-enum-users --script-args krb5-enum-users.realm='target.local' <IP>
```

## Step 1: Unauthenticated / Null Session Enum

```bash
nxc smb <IP> -u '' -p '' --shares
nxc smb <IP> -u 'guest' -p '' --users
rpcclient -U "" -N <IP>
enum4linux-ng -A <IP>

# Username enumeration via Kerberos (no creds, no lockout risk)
kerbrute userenum -d target.local --dc <IP> /usr/share/seclists/Usernames/xato-net-10-million-usernames.txt
```

## Step 2: With Valid (Even Low-Priv) Creds — Full LDAP Enum

```bash
# BloodHound — THE tool for AD. Collect first, analyze in GUI.
bloodhound-python -u user -p pass -d target.local -ns <DC_IP> -c All

# Or SharpHound from a Windows foothold
.\SharpHound.exe -c All

# Load the .json into BloodHound GUI, run built-in queries:
#  - Shortest Path to Domain Admins
#  - Find Kerberoastable Users
#  - Find AS-REP Roastable Users
#  - Shortest Path from Owned Principals
```
**This is the single highest-leverage tool for CPTS AD sections.** Always collect BloodHound data the moment you have any domain creds, even a low-priv user. It will show you the attack path graphically instead of guessing.

## Step 3: LDAP Manual Digging (when BloodHound isn't enough / want raw detail)

```bash
ldapsearch -x -H ldap://<IP> -D "user@target.local" -w 'pass' -b "DC=target,DC=local" "(objectClass=user)" | less
ldapdomaindump -u 'target.local\user' -p pass <IP>       # generates nice HTML reports of users/groups/computers

# windapsearch for quick targeted queries
windapsearch.py -d target.local --dc-ip <IP> -u user -p pass -PU     # privileged users
windapsearch.py -d target.local --dc-ip <IP> -u user -p pass --da    # domain admins
```

## Step 4: What To Look For

- **Kerberoastable users** (SPN set on user accounts) → see `13-active-directory-attacks.md`
- **AS-REP roastable users** (DONT_REQ_PREAUTH flag)
- **Users with descriptions containing passwords** — very common in HTB: `net user /domain` or LDAP `description` field
- **Group memberships** — nested groups leading to Domain Admins, Backup Operators, Account Operators
- **ACL abuse paths** — GenericAll/GenericWrite/WriteDACL/ForceChangePassword on users or groups (BloodHound shows these as edges)
- **Trust relationships** between domains/forests
- **GPP passwords** (old, cached in SYSVOL — `Get-GPPPassword` / `gpp-decrypt`)
- **Unconstrained/constrained delegation** on computer objects

```bash
# Search descriptions for creds
nxc ldap <IP> -u user -p pass --users | grep -i pass  # or via ldapsearch grepping description attr

# GPP cpassword hunt
crackmapexec smb <IP> -u user -p pass -M gpp_password
# or manually find Groups.xml in SYSVOL and:
gpp-decrypt <cpassword_value>
```

## Step 5: Password Policy (before spraying)

```bash
nxc smb <IP> -u user -p pass --pass-pol
```

## Domain Enum Cheat Table

| Goal | Command |
|---|---|
| List all domain users | `nxc smb <IP> -u user -p pass --users` |
| List all domain groups | `nxc smb <IP> -u user -p pass --groups` |
| List computers | `nxc smb <IP> -u user -p pass --computers` |
| Find where I have local admin | `nxc smb <IP-range> -u user -p pass` (green "Pwn3d!" flags) |
| Full graph | BloodHound |

## Quick Reference — Tools In This File

| Task | HTB-taught | Faster/better alternative |
|---|---|---|
| AD attack path mapping | manual notes / basic ldapsearch | `BloodHound` (bloodhound-python or SharpHound collector) — non-negotiable, use it always |
| Multi-host enum/spray | CrackMapExec | `netexec (nxc)` |
| GPP password decrypt | manual | `gpp-decrypt` one-liner |

Next: `13-active-directory-attacks.md`
