import { useState } from 'react';
import { Search, Download, Globe, Shield, Clock } from 'lucide-react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

interface OnionURL {
  id: string;
  url: string;
  title: string;
  category: string;
  lastSeen: string;
  threatLevel: 'low' | 'medium' | 'high';
}

export default function Extractor() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<OnionURL[]>([]);
  const [loading, setLoading] = useState(false);

  const generateResults = (searchQuery: string): OnionURL[] => {
    const categories = ['Marketplace', 'Forum', 'Database', 'Service', 'Hidden Wiki'];
    const threatLevels: Array<'low' | 'medium' | 'high'> = ['low', 'medium', 'high'];
    const count = Math.floor(Math.random() * 15) + 10;

    return Array.from({ length: count }, (_, i) => {
      const randomHash = Math.random().toString(36).substring(2, 18);
      return {
        id: `${Date.now()}-${i}`,
        url: `http://${randomHash}.onion`,
        title: `${searchQuery} - ${categories[Math.floor(Math.random() * categories.length)]} ${i + 1}`,
        category: categories[Math.floor(Math.random() * categories.length)],
        lastSeen: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        threatLevel: threatLevels[Math.floor(Math.random() * threatLevels.length)],
      };
    });
  };

  const handleSearch = () => {
    if (!query.trim()) return;

    setLoading(true);
    setResults([]);

    setTimeout(() => {
      const mockResults = generateResults(query);
      setResults(mockResults);
      setLoading(false);
    }, 1500);
  };

  const handleExportToExcel = () => {
    if (results.length === 0) return;

    const worksheet = XLSX.utils.json_to_sheet(
      results.map((result) => ({
        URL: result.url,
        Title: result.title,
        Category: result.category,
        'Last Seen': result.lastSeen,
        'Threat Level': result.threatLevel.toUpperCase(),
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Dark Web URLs');

    worksheet['!cols'] = [
      { wch: 35 },
      { wch: 40 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
    ];

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(data, `dark_web_extraction_${Date.now()}.xlsx`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getThreatColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'medium':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'low':
        return 'text-green-400 bg-green-500/10 border-green-500/30';
      default:
        return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-[calc(100vh-73px)] max-w-7xl mx-auto px-6 py-12">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-500/30 mb-4">
            <Globe className="w-10 h-10 text-blue-400" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            Dark Web Extractor
          </h1>
          <p className="text-gray-400 text-lg">
            Query and extract .onion URLs from the dark web intelligence database
          </p>
        </div>

        <div className="relative mb-8">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter dark web query (e.g., marketplace, drugs, weapons)..."
                className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl pl-12 pr-6 py-5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all text-lg"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={!query.trim() || loading}
              className="px-8 py-5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl hover:from-blue-500 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 font-semibold"
            >
              {loading ? 'Scanning...' : 'Extract'}
            </button>
          </div>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
            </div>
            <p className="text-gray-400 animate-pulse">Scanning dark web nodes...</p>
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <p className="text-gray-400">
                  Found <span className="text-blue-400 font-bold">{results.length}</span> results
                </p>
              </div>
              <button
                onClick={handleExportToExcel}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-500 hover:to-green-600 transition-all shadow-lg shadow-green-500/30 hover:shadow-green-500/50 font-semibold"
              >
                <Download className="w-5 h-5" />
                Download Excel
              </button>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
              <div className="max-h-[calc(100vh-450px)] overflow-y-auto scrollbar-thin scrollbar-thumb-blue-600/20 scrollbar-track-transparent">
                <table className="w-full">
                  <thead className="bg-white/5 sticky top-0 backdrop-blur-xl border-b border-white/10">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Onion URL
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Threat
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Last Seen
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {results.map((result) => (
                      <tr
                        key={result.id}
                        className="hover:bg-white/5 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-blue-400 flex-shrink-0" />
                            <span className="text-blue-400 font-mono text-sm truncate max-w-xs">
                              {result.url}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-300 text-sm">{result.title}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-400 text-sm">{result.category}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-3 py-1 rounded-lg text-xs font-semibold border uppercase ${getThreatColor(
                              result.threatLevel
                            )}`}
                          >
                            {result.threatLevel}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-gray-400 text-sm">
                            <Clock className="w-3.5 h-3.5" />
                            {result.lastSeen}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {!loading && results.length === 0 && query && (
          <div className="text-center py-20">
            <Globe className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500">No results found. Try a different query.</p>
          </div>
        )}
      </div>
    </div>
  );
}
