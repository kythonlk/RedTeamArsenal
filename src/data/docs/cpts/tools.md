### HTB CPTS Modules and Associated Tools

**1. Introduction & Core Concepts**
*   **Linux Fundamentals:**
    *   [Linux Documentation Project](https://www.tldp.org/)
    *   [GNU Bash Manual](https://www.gnu.org/software/bash/manual/bash.html)
*   **Networking Fundamentals:**
    *   [Wireshark](https://www.wireshark.org/)
    *   [tcpdump](https://www.tcpdump.org/)
    *   [Nmap](https://nmap.org/)

**2. Information Gathering & Reconnaissance**
*   **Passive Reconnaissance:**
    *   [WHOIS Lookup](https://whois.icann.org/en)
    *   [Shodan](https://www.shodan.io/)
    *   [Maltego](https://www.maltego.com/downloads/)
    *   [theHarvester](https://github.com/laramies/theHarvester)
    *   [OSINT Framework](https://osintframework.com/)
*   **Active Reconnaissance:**
    *   [Nmap](https://nmap.org/) (Service Version Detection, OS Detection, Scripting Engine)
    *   [Nikto](https://github.com/sullo/nikto)
    *   [DirBuster / OWASP DirBuster](https://www.owasp.org/index.php/Category:OWASP_DirBuster_Project) (Often replaced by modern tools like ffuf or gobuster)
    *   [ffuf](https://github.com/ffuf/ffuf)
    *   [Gobuster](https://github.com/OJ/gobuster)

**3. Vulnerability Analysis**
*   **Vulnerability Scanners:**
    *   [Nessus](https://www.tenable.com/products/nessus)
    *   [OpenVAS / Greenbone Vulnerability Manager (GVM)](https://www.greenbone.net/en/community-edition/)
    *   [Nuclei](https://github.com/projectdiscovery/nuclei)
*   **Manual Analysis Tools:**
    *   [Burp Suite Community Edition](https://portswigger.net/burp/communitydownload)
    *   [OWASP ZAP](https://www.zaproxy.org/)

**4. Web Application Penetration Testing**
*   **Proxying & Interception:**
    *   [Burp Suite Community Edition](https://portswigger.net/burp/communitydownload)
    *   [OWASP ZAP](https://www.zaproxy.org/)
*   **Injection Attacks (SQLi, XSS, Command Injection):**
    *   [SQLMap](https://sqlmap.org/)
    *   [PayloadAllTheThings](https://github.com/swisskyrepo/PayloadsAllTheThings)
    *   Browser Developer Tools (e.g., Chrome DevTools, Firefox Developer Tools)
*   **Authentication & Session Management:**
    *   Burp Suite Intruder
*   **File Upload Vulnerabilities:**
    *   Web shells (e.g., `php-reverse-shell` from [Laudanum](https://github.com/epinna/weevely3/tree/master/modules/shell/laudanum))
*   **Deserialization & XXE:**
    *   [ysoserial](https://github.com/frohoff/ysoserial)
*   **API Testing:**
    *   [Postman](https://www.postman.com/downloads/)
    *   [cURL](https://curl.se/)

**5. System Penetration Testing (Linux & Windows)**
*   **Exploitation Frameworks:**
    *   [Metasploit Framework](https://www.metasploit.com/download)
*   **Shells & Reverse Shells:**
    *   [Reverse Shell Generator](https://www.revshells.com/)
    *   Netcat (often pre-installed, or via `apt install netcat-traditional`)
    *   [socat](http://www.dest-unreach.org/socat/)
*   **Privilege Escalation (Linux):**
    *   [LinPEAS](https://github.com/carlospolop/PEASS-ng/tree/master/linPEAS)
    *   [Privilege Escalation Awesome Scripts SUITE (PEASS-ng)](https://github.com/carlospolop/PEASS-ng)
    *   [GTFOBins](https://gtfobins.github.io/)
    *   [SUDO_KILLER](https://github.com/THM-REPO/SUDO_KILLER)
*   **Privilege Escalation (Windows):**
    *   [WinPEAS](https://github.com/carlospolop/PEASS-ng/tree/master/winPEAS)
    *   [PowerSploit (PowerUp.ps1)](https://github.com/PowerShellMafia/PowerSploit/tree/master/PrivEsc)
    *   [Empire (for post-exploitation)](https://github.com/BC-SECURITY/Empire) (Note: Empire development has shifted, GhostWriter is a successor)
    *   [Watson](https://github.com/rasta-mouse/Watson)
    *   [SharpSploit](https://github.com/cobbr/SharpSploit)
*   **Active Directory Exploitation:**
    *   [Impacket](https://github.com/SecureAuthCorp/impacket)
    *   [BloodHound](https://github.com/BloodHoundAD/BloodHound)
    *   [CrackMapExec](https://github.com/byt3bl33d3r/CrackMapExec)
    *   [Responder](https://github.com/lgandx/Responder)
    *   [Mimikatz](https://github.com/gentilkiwi/mimikatz)
    *   [Kerbrute](https://github.com/ropnop/kerbrute)
    *   [Rubeus](https://github.com/GhostPack/Rubeus)

**6. Post-Exploitation & Lateral Movement**
*   **Data Exfiltration:**
    *   `scp`, `sftp`, `smbclient`
    *   HTTP/HTTPS (e.g., Python SimpleHTTPServer)
*   **Pivoting:**
    *   `ssh -L`, `ssh -D` (Dynamic Proxy)
    *   Metasploit `portfwd`
    *   [chisel](https://github.com/jpillora/chisel)
    *   [ligolo-ng](https://github.com/nicocha30/ligolo-ng)
*   **Persistence:**
    *   Cron jobs (Linux)
    *   Startup folders, Registry Run Keys, Services (Windows)
    *   Scheduled Tasks (Windows)
    *   Malicious services/executables

**7. Reporting & Remediation**
*   No specific tools listed here, but focuses on documentation skills, using templates for reporting, and understanding remediation strategies.
