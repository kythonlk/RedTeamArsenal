# Reconnaissance

**Recon = building the target map before you knock.** Passive recon touches third parties, not the target; active recon probes the target directly. In a CPTS lab you usually jump straight to active recon of the given box, but know both. `{target}` = victim.

> Output discipline: save everything. `mkdir -p {target}/{scans,web,loot,creds}` and write every scan to a file. The exam report needs evidence and you'll re-reference these constantly.

---

## Passive Recon (external / OSINT)

```bash
whois {domain}
# DNS records without hammering the target
dig {domain} A +short
dig {domain} MX +short
dig {domain} TXT +short
dig {domain} NS +short
# Emails, hosts, subdomains from public sources
theHarvester -d {domain} -b crtsh,bing,duckduckgo
# Certificate transparency = free subdomain list
curl -s 'https://crt.sh/?q=%25.{domain}&output=json' | jq -r '.[].name_value' | sort -u
# Historical URLs / endpoints
waybackurls {domain} | sort -u | tee web/wayback.txt
```

---

## Active Host Discovery

```bash
# Which hosts are alive on the subnet?
nmap -sn 10.10.10.0/24 -oN scans/hosts.txt
fping -a -g 10.10.10.0/24 2>/dev/null
# From a foothold, sweep the internal range
for i in $(seq 1 254); do (ping -c1 -W1 172.16.5.$i >/dev/null && echo "172.16.5.$i up" &); done
```

---

## Active Port & Service Scanning

```bash
# Stage 1: all ports, fast
nmap -p- --min-rate 10000 -T4 -Pn {target} -oN scans/allports.txt
ports=$(grep open scans/allports.txt | cut -d/ -f1 | tr '\n' ',' | sed 's/,$//')

# Stage 2: deep scan on the open ports
nmap -p$ports -sC -sV -O -Pn {target} -oA scans/deep

# UDP top ports (SNMP/DNS/TFTP hide here)
sudo nmap -sU --top-ports 100 -Pn {target} -oN scans/udp.txt
```
> Use `-Pn` on hosts that block ICMP (most Windows/AD boxes) or nmap will skip them. Full flag reference is in the **Enumeration** chapter.

---

## Web Reconnaissance

```bash
# Fingerprint the stack
whatweb -a3 http://{target}
curl -sI http://{target}
# Content discovery
feroxbuster -u http://{target} -x php,txt,html,bak --scan-limit 4
gobuster dir -u http://{target} -w /usr/share/seclists/Discovery/Web-Content/directory-list-2.3-medium.txt -x php,txt,html
# Virtual host fuzzing (real app is often on a Host header)
ffuf -u http://{target} -H 'Host: FUZZ.{domain}' -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt -fs 0
# Always check by hand:
curl -s http://{target}/robots.txt
curl -s http://{target}/sitemap.xml
curl -s http://{target} | grep -iE '<!--|generator|version'
```

---

## Recon Checklist

- [ ] All-ports nmap saved; open ports fed into a deep `-sC -sV` scan
- [ ] UDP top-100 scanned
- [ ] Every service version noted → `searchsploit`
- [ ] Web: whatweb, dir brute, vhost fuzz, robots.txt, HTML comments, JS files
- [ ] Subdomains/vhosts discovered and added to `/etc/hosts`
- [ ] Everything written to files under the target folder

## Common Mistakes

- **Only scanning top 1000 ports.** Always `-p-` — services hide on high ports.
- **Forgetting `-Pn`** on ping-filtered hosts → "host down" and nothing scanned.
- **Skipping vhost fuzzing.** The vulnerable app is frequently a hidden virtual host.
- **Not saving output.** You'll waste time re-scanning and have no evidence for the report.
- **Ignoring UDP.** SNMP `public` and TFTP are easy wins people miss.
