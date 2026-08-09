import { useState, ReactNode } from 'react';
import { Copy, Check } from 'lucide-react';

interface MarkdownRendererProps {
    content: string;
    target: string;
}

/* ---------- Inline formatting ---------- */
// Handles **bold**, `code`, [text](url) inside a single line of text.
function renderInline(text: string, keyPrefix: string): ReactNode[] {
    const nodes: ReactNode[] = [];
    // Split on inline code first so we never format inside backticks.
    const parts = text.split(/(`[^`]+`)/g);
    parts.forEach((part, i) => {
        if (part.startsWith('`') && part.endsWith('`') && part.length > 1) {
            nodes.push(
                <code
                    key={`${keyPrefix}-c${i}`}
                    className="bg-gray-950/70 text-emerald-300 px-1.5 py-0.5 rounded font-mono text-[0.85em] border border-gray-700/60"
                >
                    {part.slice(1, -1)}
                </code>
            );
            return;
        }
        // Bold + links on the remaining text.
        const tokens = part.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g);
        tokens.forEach((tok, j) => {
            const k = `${keyPrefix}-${i}-${j}`;
            if (tok.startsWith('**') && tok.endsWith('**') && tok.length > 2) {
                nodes.push(<strong key={k} className="text-white font-semibold">{tok.slice(2, -2)}</strong>);
            } else {
                const link = tok.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
                if (link) {
                    nodes.push(
                        <a key={k} href={link[2]} target="_blank" rel="noreferrer"
                           className="text-cyan-400 underline decoration-cyan-700 hover:text-cyan-300">
                            {link[1]}
                        </a>
                    );
                } else if (tok) {
                    nodes.push(<span key={k}>{tok}</span>);
                }
            }
        });
    });
    return nodes;
}

/* ---------- Code block with copy button ---------- */
function CodeBlock({ code, lang }: { code: string; lang: string }) {
    const [copied, setCopied] = useState(false);
    const copy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
    };
    return (
        <div className="my-4 rounded-lg border border-gray-700/70 overflow-hidden bg-[#0b1020] group">
            <div className="flex items-center justify-between px-3 py-1.5 bg-gray-800/70 border-b border-gray-700/60">
                <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500">{lang || 'sh'}</span>
                <button
                    onClick={copy}
                    className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-cyan-300 transition-colors"
                >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied' : 'Copy'}
                </button>
            </div>
            <pre className="p-4 overflow-x-auto text-[13px] leading-relaxed custom-scrollbar">
                <code className="font-mono text-cyan-200 whitespace-pre">{code}</code>
            </pre>
        </div>
    );
}

/* ---------- Table ---------- */
function MdTable({ rows }: { rows: string[] }) {
    const parseRow = (r: string) => r.replace(/^\||\|$/g, '').split('|').map(c => c.trim());
    const header = parseRow(rows[0]);
    const body = rows.slice(2).map(parseRow); // rows[1] is the --- separator
    return (
        <div className="my-4 overflow-x-auto custom-scrollbar rounded-lg border border-gray-700/70">
            <table className="w-full text-sm border-collapse">
                <thead>
                    <tr className="bg-gray-800/80">
                        {header.map((h, i) => (
                            <th key={i} className="text-left px-3 py-2 font-semibold text-cyan-300 border-b border-gray-700 whitespace-nowrap">
                                {renderInline(h, `th${i}`)}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {body.map((row, ri) => (
                        <tr key={ri} className={ri % 2 ? 'bg-gray-900/40' : 'bg-transparent'}>
                            {row.map((c, ci) => (
                                <td key={ci} className="px-3 py-2 text-gray-300 border-b border-gray-800/70 align-top">
                                    {renderInline(c, `td${ri}-${ci}`)}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

/* ---------- Block-level parser ---------- */
export default function MarkdownRenderer({ content, target }: MarkdownRendererProps) {
    const src = content.replace(/\{target\}/g, target || '10.10.10.10');
    const lines = src.split('\n');
    const blocks: ReactNode[] = [];

    let i = 0;
    let key = 0;
    const nextKey = () => `b${key++}`;

    while (i < lines.length) {
        const line = lines[i];

        // Fenced code block
        const fence = line.match(/^```(\w*)/);
        if (fence) {
            const lang = fence[1];
            const buf: string[] = [];
            i++;
            while (i < lines.length && !lines[i].startsWith('```')) {
                buf.push(lines[i]);
                i++;
            }
            i++; // skip closing fence
            blocks.push(<CodeBlock key={nextKey()} code={buf.join('\n')} lang={lang} />);
            continue;
        }

        // Table (line starts with | and next line is a separator)
        if (line.trim().startsWith('|') && i + 1 < lines.length && /^\s*\|?[\s:|-]+\|/.test(lines[i + 1])) {
            const tbl: string[] = [];
            while (i < lines.length && lines[i].trim().startsWith('|')) {
                tbl.push(lines[i]);
                i++;
            }
            blocks.push(<MdTable key={nextKey()} rows={tbl} />);
            continue;
        }

        // Headings
        if (line.startsWith('#### ')) {
            blocks.push(<h4 key={nextKey()} className="text-base font-bold text-emerald-300 mt-5 mb-2">{renderInline(line.slice(5), nextKey())}</h4>);
            i++; continue;
        }
        if (line.startsWith('### ')) {
            blocks.push(<h3 key={nextKey()} className="text-lg font-bold text-white mt-6 mb-2">{renderInline(line.slice(4), nextKey())}</h3>);
            i++; continue;
        }
        if (line.startsWith('## ')) {
            blocks.push(<h2 key={nextKey()} className="text-2xl font-bold text-cyan-400 mt-8 mb-3 border-b border-gray-700 pb-2">{renderInline(line.slice(3), nextKey())}</h2>);
            i++; continue;
        }
        if (line.startsWith('# ')) {
            blocks.push(<h1 key={nextKey()} className="text-3xl font-bold text-white mb-4 mt-2">{renderInline(line.slice(2), nextKey())}</h1>);
            i++; continue;
        }

        // Horizontal rule
        if (/^---+\s*$/.test(line) || /^\*\*\*+\s*$/.test(line)) {
            blocks.push(<hr key={nextKey()} className="my-6 border-gray-700/60" />);
            i++; continue;
        }

        // Blockquote (supports > [!NOTE] style callouts)
        if (line.startsWith('>')) {
            const buf: string[] = [];
            while (i < lines.length && lines[i].startsWith('>')) {
                buf.push(lines[i].replace(/^>\s?/, ''));
                i++;
            }
            blocks.push(
                <blockquote key={nextKey()} className="my-4 border-l-4 border-amber-500/70 bg-amber-500/5 pl-4 pr-3 py-2 rounded-r">
                    {buf.map((b, bi) => (
                        <p key={bi} className="text-amber-100/90 text-sm leading-relaxed">{renderInline(b, `bq${bi}`)}</p>
                    ))}
                </blockquote>
            );
            continue;
        }

        // Ordered list
        if (/^\s*\d+\.\s/.test(line)) {
            const items: string[] = [];
            while (i < lines.length && /^\s*\d+\.\s/.test(lines[i])) {
                items.push(lines[i].replace(/^\s*\d+\.\s/, ''));
                i++;
            }
            blocks.push(
                <ol key={nextKey()} className="list-decimal ml-6 my-3 space-y-1.5">
                    {items.map((it, ii) => <li key={ii} className="text-gray-300 leading-relaxed pl-1">{renderInline(it, `ol${ii}`)}</li>)}
                </ol>
            );
            continue;
        }

        // Unordered list (- or *)
        if (/^\s*[-*]\s/.test(line)) {
            const items: string[] = [];
            while (i < lines.length && /^\s*[-*]\s/.test(lines[i])) {
                items.push(lines[i].replace(/^\s*[-*]\s/, ''));
                i++;
            }
            blocks.push(
                <ul key={nextKey()} className="list-disc ml-6 my-3 space-y-1.5">
                    {items.map((it, ii) => <li key={ii} className="text-gray-300 leading-relaxed pl-1">{renderInline(it, `ul${ii}`)}</li>)}
                </ul>
            );
            continue;
        }

        // Blank line
        if (line.trim() === '') {
            i++; continue;
        }

        // Paragraph
        blocks.push(<p key={nextKey()} className="text-gray-300 my-2 leading-relaxed">{renderInline(line, nextKey())}</p>);
        i++;
    }

    return <div className="max-w-none">{blocks}</div>;
}
