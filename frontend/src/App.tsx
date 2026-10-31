import React, { useState } from 'react';
import './index.css';
import ReactMarkdown from 'react-markdown';

// --- ICONS (SVG) ---
const IconImage = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);
const IconText = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
  </svg>
);
const IconMulti = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  </svg>
);
const IconShield = () => (
  <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

function App() {
  const [view, setView] = useState<'detector' | 'extractor'>('detector');
  const [activeTab, setActiveTab] = useState<'text' | 'image' | 'multi'>('text');
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);


  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Extractor State
  const [extractorQuery, setExtractorQuery] = useState('');
  const [extractorReport, setExtractorReport] = useState<any>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };



  // Download Handler
  const handleDownloadReport = () => {
    if (!extractorReport || typeof extractorReport !== 'string') return;
    const blob = new Blob([extractorReport], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Intel_Report_${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExtractorSubmit = async () => {
    if (!extractorQuery) return;
    setLoading(true);
    setExtractorReport(null);

    const formData = new FormData();
    formData.append('query', extractorQuery);

    try {
      // Use 127.0.0.1 for consistency
      const response = await fetch('http://127.0.0.1:8000/extractor', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const txt = await response.text();
        throw new Error(txt);
      }

      const data = await response.json();
      if (data.status === 'success') {
        setExtractorReport(data.report);
      } else {
        // Handle error as an object or string
        setExtractorReport(data.report);
      }
    } catch (e) {
      setExtractorReport(`### System Failure\n${e}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Attempting submit. Mode:", activeTab);

    if (activeTab === 'text') {
      if (!inputText) {
        alert("Please enter text for analysis.");
        return;
      }
    }

    if (activeTab === 'image' && !selectedImage) {
      alert("Please upload an image.");
      return;
    }

    if (activeTab === 'multi' && (!selectedImage || !inputText)) {
      alert("Multimodal mode requires BOTH an image and a caption.");
      return;
    }

    setLoading(true);
    setAnalysisResult(null);

    const formData = new FormData();
    // Appending Logic
    if (activeTab === 'text') {
      if (inputText) formData.append('caption', inputText);
    }
    else if (activeTab === 'image') {
      formData.append('image', selectedImage as File);
      if (inputText) formData.append('caption', inputText);
    }
    else if (activeTab === 'multi') {
      formData.append('image', selectedImage as File);
      formData.append('caption', inputText);
    }

    console.log("Sending Request to Backend...");
    try {
      const response = await fetch('http://127.0.0.1:8000/analyze', {
        method: 'POST',
        body: formData,
      });
      console.log("Response Status:", response.status);

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Server Error: ${response.status} ${errText}`);
      }

      const data = await response.json();
      console.log("Data Received:", data);
      setAnalysisResult(data);
    } catch (error) {
      console.error("Error:", error);
      alert(`Analysis failed: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  // --- ICONS (SVG) ---


  return (
    <div className="min-h-screen bg-black text-blue-50 font-sans flex flex-col">
      {/* NAVBAR */}
      <nav className="border-b border-blue-900/30 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <IconShield />
            <h1 className="text-2xl font-bold tracking-tight text-white">
              NarcoLink<span className="text-blue-500">AI</span>
            </h1>
          </div>
          <div className="flex bg-gray-900/50 rounded-full p-1 border border-blue-900/30">
            <button
              onClick={() => setView('detector')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${view === 'detector'
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                : 'text-gray-500 hover:text-gray-300'}`}
            >
              DETECTOR
            </button>
            <button
              onClick={() => setView('extractor')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${view === 'extractor'
                ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                : 'text-gray-500 hover:text-gray-300'}`}
            >
              EXTRACTOR
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6">

        {view === 'detector' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* LEFT PANEL: INPUT */}
            <div className="lg:col-span-5 space-y-8">
              {/* Mode Tabs */}
              <div className="grid grid-cols-3 gap-2 bg-gray-900/50 p-1 rounded-lg border border-gray-800">
                {[
                  { id: 'text', label: 'Text', icon: IconText },
                  { id: 'image', label: 'Image', icon: IconImage },
                  { id: 'multi', label: 'Multi', icon: IconMulti }
                ].map((mode: any) => (
                  <button
                    key={mode.id}
                    onClick={() => { setActiveTab(mode.id); setAnalysisResult(null); }}
                    className={`flex items-center justify-center gap-2 py-2 rounded-md text-xs font-medium transition-all ${activeTab === mode.id
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                      }`}
                  >
                    <mode.icon />
                    {mode.label}
                  </button>
                ))}
              </div>

              <div className="bg-gray-950 border border-blue-900/20 rounded-2xl p-6 shadow-2xl shadow-blue-900/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-blue-500/5 pointer-events-none"></div>

                <div className="relative space-y-6">

                  {/* Image Input */}
                  {(activeTab === 'image' || activeTab === 'multi') && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-blue-400 uppercase tracking-wider">Source Media</label>
                      <div className="group relative border border-blue-900/30 bg-black/40 rounded-xl h-64 flex items-center justify-center overflow-hidden transition-all hover:border-blue-500/50 hover:bg-blue-900/10">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        {selectedImage ? (
                          <div className="relative h-full w-full">
                            <img src={URL.createObjectURL(selectedImage)} alt="Preview" className="h-full w-full object-contain" />
                            <div className="absolute bottom-2 left-0 right-0 text-center bg-black/50 text-xs text-white py-1">{selectedImage.name}</div>
                          </div>
                        ) : (
                          <div className="text-center p-6">
                            <div className="mx-auto w-12 h-12 mb-3 text-blue-500/50 group-hover:text-blue-400 transition-colors">
                              <IconImage />
                            </div>
                            <p className="text-sm text-gray-400">Drag & Drop or Click to Upload</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Text Input (Doc Upload Removed) */}
                  {(activeTab === 'text' || activeTab === 'multi') && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-blue-400 uppercase tracking-wider">Analysis Content</label>
                        <textarea
                          value={inputText}
                          onChange={(e) => setInputText(e.target.value)}
                          className="w-full bg-black/40 border border-blue-900/30 rounded-xl p-4 text-gray-200 placeholder-gray-700 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all h-32 resize-none font-mono text-sm leading-relaxed"
                          placeholder={activeTab === 'multi' ? "Enter caption..." : "Enter text to analyze..."}
                        ></textarea>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className={`w-full py-4 rounded-xl font-bold tracking-wide uppercase text-sm transition-all transform active:scale-[0.98] ${loading
                      ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)]'
                      }`}
                  >
                    {loading ? 'Processing Intelligence...' : 'Initiate Analysis'}
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT PANEL: DISPLAY */}
            <div className="lg:col-span-7 h-full">
              {!analysisResult && !loading && (
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-gray-800 border-2 border-dashed border-gray-900 rounded-2xl bg-gray-950/50">
                  <IconShield />
                  <p className="mt-4 text-gray-700 font-mono text-xs uppercase tracking-widest">System Ready</p>
                </div>
              )}

              {loading && (
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center">
                  <div className="w-16 h-16 border-4 border-blue-600/30 border-t-blue-500 rounded-full animate-spin mb-8"></div>
                  <p className="text-blue-400 font-mono text-xs animate-pulse">Running Neural Fusion...</p>
                </div>
              )}

              {analysisResult && (
                <div className="bg-gray-950 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">

                  {/* Result Header */}
                  <div className="relative p-8 border-b border-gray-800">
                    <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] rounded-full pointer-events-none ${analysisResult.analysis.decision === 'Positive' ? 'bg-red-600/20' : 'bg-green-600/20'
                      }`}></div>

                    <div className="relative z-10 flex justify-between items-start">
                      <div>
                        <p className="text-xs font-mono text-gray-500 uppercase mb-2">Analysis Outcome</p>
                        <h2 className={`text-4xl font-black tracking-tight ${analysisResult.analysis.decision === 'Positive' ? 'text-red-500' : 'text-green-500'
                          }`}>
                          {analysisResult.analysis.decision === 'Positive' ? 'THREAT DETECTED' : 'CLEAN CONTENT'}
                        </h2>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-mono text-gray-500 uppercase mb-1">Confidence</p>
                        <p className="text-3xl font-mono font-bold text-white">
                          {(analysisResult.analysis.confidence * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>

                    {/* Bar */}
                    <div className="mt-8 h-1 bg-gray-900 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-1000 ${analysisResult.analysis.decision === 'Positive' ? 'bg-red-500' : 'bg-green-500'
                          }`}
                        style={{ width: `${analysisResult.analysis.confidence * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Logic Explainer */}
                    <div className="md:col-span-2 bg-gray-900/30 border border-gray-800 p-6 rounded-xl">
                      <h3 className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-4">Fusion Logic</h3>
                      <p className="text-sm text-gray-400 font-mono leading-relaxed">
                        {analysisResult.analysis.retrieval_data.explanation}
                      </p>
                    </div>

                    {/* Retrieved Entities */}
                    <div className="bg-gray-900/30 border border-gray-800 p-6 rounded-xl">
                      <h3 className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-4">Slang Vectors</h3>
                      {analysisResult.analysis.retrieval_data.detected_slang_candidates?.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {analysisResult.analysis.retrieval_data.detected_slang_candidates.map((s: string, i: number) => (
                            <span key={i} className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded text-xs text-purple-300 font-mono">
                              {s}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-600 text-xs italic">No anomalies detected</p>
                      )}
                    </div>

                    {/* Identified Substances */}
                    <div className="bg-gray-900/30 border border-gray-800 p-6 rounded-xl">
                      <h3 className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-4">Substances</h3>
                      {analysisResult.analysis.retrieval_data.potential_drugs?.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {analysisResult.analysis.retrieval_data.potential_drugs.map((d: string, i: number) => (
                            <span key={i} className="px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded text-xs text-orange-300 font-mono">
                              {d}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-600 text-xs italic">N/A</p>
                      )}
                    </div>

                    {/* Multimodal Context */}
                    {analysisResult.meta.gemma_context && (
                      <div className="md:col-span-2 bg-gray-900/30 border border-gray-800 p-6 rounded-xl opacity-75">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Contextual Analysis</h3>
                        <p className="text-xs text-gray-400 italic">
                          "{analysisResult.meta.gemma_context.substring(0, 300)}..."
                        </p>
                      </div>
                    )}

                  </div>

                  <div className="px-8 py-4 bg-gray-950 border-t border-gray-800 flex justify-between items-center text-[10px] text-gray-600 font-mono uppercase">
                    <span>Stage: {analysisResult.analysis.stage}</span>
                    <span>Mode: {analysisResult.meta.mode}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          // --- EXTRACTOR VIEW (Pretty JSON UI) ---
          <div className="flex flex-col items-center justify-start min-h-[600px] max-w-5xl mx-auto space-y-12 pt-12">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                Dark Web Intelligence Agent
              </h2>
              <p className="text-gray-400">Autonomous Deep Web Reconnaissance</p>
            </div>

            <div className="w-full relative group max-w-3xl">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative flex bg-black rounded-lg border border-gray-800 p-2">
                <input
                  type="text"
                  value={extractorQuery}
                  onChange={(e) => setExtractorQuery(e.target.value)}
                  placeholder="Target Identifiers (e.g. 'Hydra Vendor List', 'PCP synthesis guide')..."
                  className="flex-1 bg-transparent text-white px-4 py-3 outline-none placeholder-gray-600 font-mono text-sm"
                  onKeyDown={(e) => e.key === 'Enter' && handleExtractorSubmit()}
                />
                <button
                  onClick={handleExtractorSubmit}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-2 rounded-md font-bold transition-all disabled:opacity-50"
                >
                  {loading ? 'CRAWLING...' : 'HUNT'}
                </button>
              </div>
            </div>

            {loading && view === 'extractor' && (
              <div className="text-center space-y-4 animate-in fade-in duration-700">
                <div className="inline-block w-12 h-12 border-t-2 border-blue-500 rounded-full animate-spin"></div>
                <div className="space-y-1">
                  <p className="text-sm text-blue-400 font-mono animate-pulse">Establishing Tor Circuit...</p>
                  <p className="text-xs text-gray-500 font-mono">Running recursive depth crawl (Depth 2)</p>
                </div>
              </div>
            )}

            {extractorReport && !loading && (
              <div className="w-full bg-gray-950/50 border border-gray-800 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-10 fade-in duration-500 overflow-hidden backdrop-blur-sm p-8 text-left relative group-hover:border-blue-500/30 transition-all">
                <div className="flex justify-between items-center border-b border-gray-800 pb-4 mb-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-3">
                    <IconShield />
                    Intelligence Report
                  </h3>
                  <button
                    onClick={handleDownloadReport}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-900/30 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg text-xs font-mono text-blue-300 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Download .MD
                  </button>
                </div>

                <div className="prose prose-invert prose-blue max-w-none font-mono text-sm leading-relaxed">
                  <ReactMarkdown
                    components={{
                      h1: ({ node, ...props }) => <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-6 border-b border-gray-800 pb-2" {...props} />,
                      h2: ({ node, ...props }) => <h2 className="text-lg font-bold text-blue-400 uppercase tracking-widest mt-8 mb-4 flex items-center gap-2" {...props} />,
                      ul: ({ node, ...props }) => <ul className="space-y-2 my-4" {...props} />,
                      li: ({ node, ...props }) => <li className="flex items-start gap-2" {...props} />,
                      a: ({ node, ...props }) => <a className="text-green-400 hover:underline break-all" target="_blank" rel="noopener noreferrer" {...props} />,
                      p: ({ node, ...props }) => <p className="mb-4 text-gray-300" {...props} />,
                      strong: ({ node, ...props }) => <strong className="text-white font-bold" {...props} />
                    }}
                  >
                    {extractorReport}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}

export default App;

