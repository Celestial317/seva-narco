import { Shield, Search } from 'lucide-react';

interface NavbarProps {
  activeTab: 'detector' | 'extractor';
  setActiveTab: (tab: 'detector' | 'extractor') => void;
}

export default function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  return (
    <nav className="relative border-b border-white/10 backdrop-blur-xl bg-black/40">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-lg shadow-blue-500/50">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              NarcoLink-AI
            </span>
          </div>

          <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-xl backdrop-blur-sm border border-white/10">
            <button
              onClick={() => setActiveTab('detector')}
              className={`
                relative px-6 py-2.5 rounded-lg font-medium transition-all duration-300 flex items-center gap-2
                ${activeTab === 'detector'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                }
              `}
            >
              <Shield className="w-4 h-4" />
              Detector
            </button>
            <button
              onClick={() => setActiveTab('extractor')}
              className={`
                relative px-6 py-2.5 rounded-lg font-medium transition-all duration-300 flex items-center gap-2
                ${activeTab === 'extractor'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                }
              `}
            >
              <Search className="w-4 h-4" />
              Extractor
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
