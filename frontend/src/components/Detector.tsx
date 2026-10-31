import { useState, useRef } from 'react';
import { Send, Type, Image as ImageIcon, Layers } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  inputType?: 'text' | 'image' | 'multimodal';
  detection?: {
    status: 'positive' | 'negative';
    confidence: number;
    patterns: string[];
  };
}

export default function Detector() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [inputMode, setInputMode] = useState<'text' | 'image' | 'multimodal'>('text');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    if (inputMode === 'text' && !input.trim()) return;
    if (inputMode === 'image' && !selectedFile) return;
    if (inputMode === 'multimodal' && !input.trim() && !selectedFile) return;

    let messageContent = '';
    if (inputMode === 'text') {
      messageContent = input;
    } else if (inputMode === 'image') {
      messageContent = selectedFile ? `[IMAGE: ${selectedFile.name}]\n${input}` : '';
    } else {
      messageContent = selectedFile ? `[IMAGE: ${selectedFile.name}]\n${input}` : input;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: messageContent,
      inputType: inputMode,
    };

    setMessages(prev => [...prev, userMessage]);

    setTimeout(() => {
      const isPositive = Math.random() > 0.5;
      const confidence = Math.floor(Math.random() * 20) + 80;

      const patterns = isPositive
        ? [
            'Cryptographic language patterns detected',
            'Suspicious transaction terminology identified',
            'Coded communication markers present',
            'Known dealer communication style matched',
            'Geographic location correlation positive',
          ]
        : [
            'Standard communication patterns observed',
            'No suspicious terminology detected',
            'Clean linguistic profile',
            'No correlation with known patterns',
          ];

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: '',
        detection: {
          status: isPositive ? 'positive' : 'negative',
          confidence,
          patterns: patterns.slice(0, Math.floor(Math.random() * 3) + 2),
        },
      };

      setMessages(prev => [...prev, aiMessage]);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 1000);

    setInput('');
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-73px)] max-w-6xl mx-auto px-6 py-6">
      <div className="flex-1 overflow-y-auto space-y-4 mb-6 scrollbar-thin scrollbar-thumb-blue-600/20 scrollbar-track-transparent">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-blue-600/20 to-blue-800/20 flex items-center justify-center border border-blue-500/30">
                <Layers className="w-10 h-10 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-300">AI-Powered Detection System</h3>
              <p className="text-gray-500 max-w-md">
                Submit text, images, or multimodal data for advanced drug dealer pattern analysis
              </p>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.type === 'user' ? (
              <div className="max-w-2xl bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl rounded-br-sm px-6 py-4 shadow-lg">
                <div className="flex items-center gap-2 mb-2">
                  {message.inputType === 'text' && <Type className="w-4 h-4 text-blue-200" />}
                  {message.inputType === 'image' && <ImageIcon className="w-4 h-4 text-blue-200" />}
                  {message.inputType === 'multimodal' && <Layers className="w-4 h-4 text-blue-200" />}
                  <span className="text-xs text-blue-200 uppercase tracking-wider">
                    {message.inputType} input
                  </span>
                </div>
                <p className="text-white">{message.content}</p>
              </div>
            ) : (
              <div className="max-w-2xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl rounded-bl-sm px-6 py-5 shadow-xl">
                {message.detection && (
                  <div className="space-y-4">
                    <div className={`flex items-center justify-between p-4 rounded-xl ${
                      message.detection.status === 'positive'
                        ? 'bg-red-500/10 border border-red-500/30'
                        : 'bg-green-500/10 border border-green-500/30'
                    }`}>
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Detection Status</p>
                        <p className={`text-xl font-bold ${
                          message.detection.status === 'positive' ? 'text-red-400' : 'text-green-400'
                        }`}>
                          {message.detection.status === 'positive' ? 'POSITIVE' : 'NEGATIVE'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-400 mb-1">Confidence Score</p>
                        <p className={`text-2xl font-bold ${
                          message.detection.status === 'positive' ? 'text-red-400' : 'text-green-400'
                        }`}>
                          {message.detection.confidence}%
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-400 mb-3 uppercase tracking-wider">
                        Retrieval Patterns & Suspect Reasoning
                      </p>
                      <ul className="space-y-2">
                        {message.detection.patterns.map((pattern, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-3 text-gray-300 text-sm"
                          >
                            <span className="text-blue-400 mt-1">•</span>
                            <span>{pattern}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl space-y-4">
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          className="hidden"
          accept="image/*"
        />

        <div className="flex gap-2">
          <button
            onClick={() => {
              setInputMode('text');
              setSelectedFile(null);
              if (fileInputRef.current) fileInputRef.current.value = '';
            }}
            className={`p-3 rounded-xl transition-all flex items-center gap-2 ${
              inputMode === 'text'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
            title="Text Input"
          >
            <Type className="w-5 h-5" />
            <span className="text-sm font-medium hidden sm:inline">Text</span>
          </button>
          <button
            onClick={() => {
              setInputMode('image');
              fileInputRef.current?.click();
            }}
            className={`p-3 rounded-xl transition-all flex items-center gap-2 ${
              inputMode === 'image'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
            title="Image Upload"
          >
            <ImageIcon className="w-5 h-5" />
            <span className="text-sm font-medium hidden sm:inline">Image</span>
          </button>
          <button
            onClick={() => {
              setInputMode('multimodal');
              fileInputRef.current?.click();
            }}
            className={`p-3 rounded-xl transition-all flex items-center gap-2 ${
              inputMode === 'multimodal'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
            title="Multimodal (Image + Text)"
          >
            <Layers className="w-5 h-5" />
            <span className="text-sm font-medium hidden sm:inline">Multimodal</span>
          </button>
        </div>

        {inputMode === 'text' && (
          <div className="flex items-end gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter text for analysis..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
            <button
              onClick={handleSubmit}
              disabled={!input.trim()}
              className="p-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-500 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        )}

        {inputMode === 'image' && (
          <div className="space-y-3">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-blue-500/50 rounded-xl p-8 cursor-pointer hover:border-blue-500 hover:bg-blue-500/5 transition-all text-center"
            >
              {selectedFile ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2 text-blue-400">
                    <ImageIcon className="w-5 h-5" />
                    <span className="font-medium">{selectedFile.name}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="text-xs text-gray-400 hover:text-white mx-auto"
                  >
                    Change image
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <ImageIcon className="w-8 h-8 text-gray-500 mx-auto" />
                  <p className="text-gray-400">Click to upload an image</p>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>
              )}
            </div>

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Add insights about the image..."
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
            />

            <div className="flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={!selectedFile}
                className="p-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-500 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {inputMode === 'multimodal' && (
          <div className="space-y-3">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-blue-500/50 rounded-xl p-8 cursor-pointer hover:border-blue-500 hover:bg-blue-500/5 transition-all text-center"
            >
              {selectedFile ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2 text-blue-400">
                    <ImageIcon className="w-5 h-5" />
                    <span className="font-medium">{selectedFile.name}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="text-xs text-gray-400 hover:text-white mx-auto"
                  >
                    Change image
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <ImageIcon className="w-8 h-8 text-gray-500 mx-auto" />
                  <p className="text-gray-400">Click to upload an image</p>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>
              )}
            </div>

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Add additional context and analysis..."
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
            />

            <div className="flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={!input.trim() && !selectedFile}
                className="p-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-500 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
