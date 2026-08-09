# 02 — Recon & OSINT

Used mostly for external/web-in-scope targets with a real domain name. Less relevant for internal AD boxes with raw IPs (skip to `03-scanning-enum-nmap.md` for those).

## Passive Recon (no packets hit target infra directly)

```bash
whois target.com
dig target.com ANY
dig target.com MX
dig target.com TXT
dig target.com NS
```

## Subdomain Enumeration

```bash
# Passive - certificate transparency
curl -s "https://crt.sh/?q=%25.target.com&output=json" | jq -r '.[].name_value' | sort -u

# subfinder (fast, passive sources)
subfinder -d target.com -all -o subs.txt

# amass (thorough, slower)
amass enum -passive -d target.com -o amass_subs.txt

# Resolve + check alive
cat subs.txt | httpx -silent -status-code -title
```

**Better than HTB's teaching:** HTB Academy leans on manual `dig`/gobuster vhost brute force. In practice `subfinder` + `httpx` (ProjectDiscovery tools) is 10x faster and gives you live status codes/titles in one shot. Always chain: `subfinder -d x.com -silent | httpx -silent -sc -title`.

## Virtual Host / Directory Fuzzing (when only 1 IP but multiple sites)

```bash
ffuf -u http://target.com -H "Host: FUZZ.target.com" -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt -fs <baseline_size>
```
Add found vhost to `/etc/hosts`.

## Google Dorking Cheatsheet

```
site:target.com filetype:pdf
site:target.com inurl:admin
site:target.com ext:php intitle:"index of"
"target.com" site:pastebin.com
```

## People / Email OSINT (for password spraying username lists)

```bash
# Generate likely usernames from full names (firstname.lastname, flastname, etc.)
# Tool: username-anarchy
./username-anarchy -i names.txt > usernames.txt

# theHarvester for emails/subdomains
theHarvester -d target.com -b all
```

## Wayback Machine (old endpoints, leaked params, forgotten admin panels)

```bash
waybackurls target.com | tee wayback.txt
gau target.com | tee gau.txt
cat wayback.txt gau.txt | sort -u | grep -E "\.(php|asp|aspx|jsp)\?" 
```

## GitHub Recon (leaked creds/keys in public/company repos)

```bash
# Manual: search github.com for "target.com password", org repos, commit history
# Tool: trufflehog on a cloned repo
trufflehog git file:///path/to/repo
```

## Quick Reference — Tools In This File

| Task | HTB-taught | Faster alternative |
|---|---|---|
| Subdomains | manual dig/gobuster dns | `subfinder` + `httpx` |
| Dir fuzzing | gobuster | `ffuf` (faster, more flexible filters) |
| Wayback data | manual browsing | `gau` / `waybackurls` |
| Screenshotting many hosts | manual | `eyewitness` / `gowitness` |

Next: `03-scanning-enum-nmap.md`
