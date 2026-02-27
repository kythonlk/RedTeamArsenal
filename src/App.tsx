import { useState } from 'react';
import { Shield, Terminal, Target } from 'lucide-react';
import CategorySection from './components/CategorySection';
import { toolCategories } from './data/tools';

function App() {
  const [target, setTarget] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | number>('all');

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50 backdrop-blur-sm bg-opacity-95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Shield className="w-10 h-10 text-cyan-400" />
              <div>
                <h1 className="text-3xl font-bold text-white">RedTeam Arsenal</h1>
                <p className="text-sm text-gray-400">Security Testing Command Reference</p>
              </div>
            </div>
            <Terminal className="w-8 h-8 text-cyan-400" />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="Enter target domain or IP (e.g., example.com or 192.168.1.1)"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-12 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
              />
            </div>
          </div>

          {target && (
            <div className="mt-4 p-3 bg-gray-900 border border-cyan-700 rounded-lg">
              <p className="text-sm text-cyan-400">
                <span className="font-semibold">Target set:</span>{' '}
                <span className="text-white font-mono">{target}</span>
              </p>
            </div>
          )}
        </div>
      </header>

      <nav className="bg-gray-800 border-b border-gray-700 sticky top-[140px] z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 py-3 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                activeTab === 'all'
                  ? 'bg-cyan-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              All Tools
            </button>
            {toolCategories.map((category, index) => (
              <button
                key={index}
                onClick={() => setActiveTab(index)}
                className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                  activeTab === index
                    ? 'bg-cyan-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!target && (
          <div className="mb-8 p-6 bg-yellow-900 bg-opacity-20 border border-yellow-700 rounded-lg">
            <p className="text-yellow-400 text-sm">
              <span className="font-semibold">Tip:</span> Enter a target domain or IP address above to see customized commands for your target.
            </p>
          </div>
        )}

        {activeTab === 'all' ? (
          toolCategories.map((category, index) => (
            <CategorySection
              key={index}
              name={category.name}
              icon={category.icon}
              tools={category.tools}
              target={target}
            />
          ))
        ) : (
          <CategorySection
            name={toolCategories[activeTab].name}
            icon={toolCategories[activeTab].icon}
            tools={toolCategories[activeTab].tools}
            target={target}
          />
        )}
      </main>

      <footer className="bg-gray-800 border-t border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-500 text-sm">
            Educational purposes only. Always obtain proper authorization before testing.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
