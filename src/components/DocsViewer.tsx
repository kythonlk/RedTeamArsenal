import { useState, useMemo } from 'react';
import { Search, FileText, ChevronRight, BookOpen, ExternalLink, X } from 'lucide-react';
import { docsData, DocFile } from '../data/docsData';
import MarkdownRenderer from './MarkdownRenderer';

interface DocsViewerProps {
    target: string;
}

const DocsViewer = ({ target }: DocsViewerProps) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDoc, setSelectedDoc] = useState<DocFile | null>(null);

    const filteredDocs = useMemo(() => {
        if (!searchQuery.trim()) return docsData;
        const query = searchQuery.toLowerCase();
        return docsData.filter(doc =>
            doc.title.toLowerCase().includes(query) ||
            doc.category.toLowerCase().includes(query) ||
            doc.content.toLowerCase().includes(query)
        );
    }, [searchQuery]);

    const categories = useMemo(() => {
        const cats: Record<string, DocFile[]> = {};
        filteredDocs.forEach(doc => {
            if (!cats[doc.category]) cats[doc.category] = [];
            cats[doc.category].push(doc);
        });
        return cats;
    }, [filteredDocs]);

    return (
        <div className="flex flex-col h-[calc(100vh-250px)]">
            {/* Search Header */}
            <div className="mb-6 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search documentation (e.g., nmap, exploitation, reverse shell)..."
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all shadow-lg"
                />
                {searchQuery && (
                    <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            <div className="flex flex-1 gap-6 overflow-hidden">
                {/* Sidebar Navigation */}
                <div className="w-80 bg-gray-800/50 rounded-xl border border-gray-700 overflow-y-auto p-4 custom-scrollbar">
                    <div className="space-y-6">
                        {Object.entries(categories).map(([category, docs]) => (
                            <div key={category} className="space-y-2">
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest px-2 mb-3">
                                    {category}
                                </h3>
                                <div className="space-y-1">
                                    {docs.map(doc => (
                                        <button
                                            key={doc.id}
                                            onClick={() => setSelectedDoc(doc)}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between group transition-all ${selectedDoc?.id === doc.id
                                                    ? 'bg-cyan-600 text-white'
                                                    : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                                                }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <FileText className={`w-4 h-4 ${selectedDoc?.id === doc.id ? 'text-white' : 'text-cyan-500'}`} />
                                                {doc.title}
                                            </div>
                                            <ChevronRight className={`w-4 h-4 transition-transform ${selectedDoc?.id === doc.id ? 'translate-x-1' : 'opacity-0 group-hover:opacity-100'}`} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 bg-gray-800/30 rounded-xl border border-gray-700 overflow-y-auto p-8 custom-scrollbar relative">
                    {selectedDoc ? (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="flex items-center gap-2 text-xs font-medium text-cyan-500 uppercase tracking-wider mb-2">
                                <BookOpen className="w-4 h-4" />
                                {selectedDoc.category}
                            </div>
                            <MarkdownRenderer content={selectedDoc.content} target={target} />


                            <div className="mt-12 pt-6 border-t border-gray-800 flex justify-between items-center text-sm text-gray-500">
                                <span>Path: src/data/docs/{selectedDoc.path}</span>
                                <button className="flex items-center gap-1 hover:text-cyan-400 transition-colors">
                                    <ExternalLink className="w-4 h-4" />
                                    Open in Editor
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-12">
                            <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-6 shadow-inner">
                                <BookOpen className="w-10 h-10 text-gray-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Knowledge Base</h2>
                            <p className="text-gray-500 max-w-sm">
                                Select a topic from the sidebar or search for specific red team techniques and tools.
                            </p>
                            {searchQuery && filteredDocs.length === 0 && (
                                <div className="mt-4 p-3 bg-red-900/20 border border-red-900/50 rounded-lg text-red-400 text-sm">
                                    No documentation found matching "{searchQuery}"
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DocsViewer;
