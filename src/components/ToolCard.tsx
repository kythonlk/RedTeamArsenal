import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface ToolCardProps {
  name: string;
  description: string;
  commands: string[];
  target: string;
}

export default function ToolCard({ name, description, commands, target }: ToolCardProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const replaceVariables = (command: string) => {
    return command
      .replace(/\{domain\}/g, target || 'target.com')
      .replace(/\{ip\}/g, target || '192.168.1.1');
  };

  const copyToClipboard = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-5 hover:border-cyan-500 transition-all duration-300">
      <h3 className="text-lg font-semibold text-cyan-400 mb-2">{name}</h3>
      <p className="text-gray-400 text-sm mb-4">{description}</p>
      <div className="space-y-2">
        {commands.map((cmd, index) => {
          const processedCmd = replaceVariables(cmd);
          return (
            <div
              key={index}
              className="group bg-gray-900 border border-gray-700 rounded p-3 font-mono text-sm flex items-start justify-between hover:border-cyan-600 transition-colors"
            >
              <code className="text-green-400 flex-1 break-all pr-2">
                {processedCmd}
              </code>
              <button
                onClick={() => copyToClipboard(processedCmd, index)}
                className="text-gray-500 hover:text-cyan-400 transition-colors flex-shrink-0 ml-2"
                title="Copy to clipboard"
              >
                {copiedIndex === index ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
