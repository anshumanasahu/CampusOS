import { useState, useRef, useEffect } from 'react';
import { useChatbot } from '../../hooks/use-chatbot.js';
import Drawer from '../shared/drawer.jsx';
import Button from '../shared/button.jsx';
import LoadingSpinner from '../shared/loading-spinner.jsx';

export default function ChatbotDrawer({ isOpen, onClose }) {
  const { messages, loading, error, sendMessage, clearHistory } = useChatbot();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const query = input.trim();
    setInput('');
    await sendMessage(query);
  };

  const handleClear = async () => {
    if (window.confirm('Clear all chat history?')) {
      await clearHistory();
    }
  };

  return (
    <Drawer isOpen={isOpen} title="AI Chatbot" onClose={onClose}>
      <div className="flex flex-col h-full">
        {/* Header actions */}
        <div className="px-4 py-2 border-b border-slate-100 flex justify-between items-center">
          <p className="text-xs text-slate-500">Answers from your data only</p>
          {messages.length > 0 && (
            <button onClick={handleClear} className="text-xs text-slate-400 hover:text-red-500">
              Clear
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {messages.length === 0 && !loading && (
            <div className="text-center py-8">
              <p className="text-3xl mb-2">🤖</p>
              <p className="text-sm text-slate-600 font-medium">Ask me anything about your data</p>
              <p className="text-xs text-slate-400 mt-1">Schedule, deadlines, expenses, attendance...</p>
              <div className="mt-4 space-y-2">
                {['When is my next deadline?', 'What\'s my attendance in DSA?', 'How much did I spend this month?'].map((q) => (
                  <button
                    key={q}
                    onClick={() => { setInput(q); }}
                    className="block w-full text-left text-xs px-3 py-2 bg-slate-50 rounded-lg text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] px-3 py-2 rounded-xl text-sm ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-sm'
                    : 'bg-slate-100 text-slate-800 rounded-bl-sm'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.message}</p>
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-1 pt-1 border-t border-slate-200/50">
                    <p className="text-[10px] opacity-70">Sources: {msg.sources.map((s) => s.label).join(', ')}</p>
                  </div>
                )}
                {msg.dataNotFound && (
                  <p className="text-[10px] opacity-70 mt-1">ℹ️ No matching data found</p>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-100 px-3 py-2 rounded-xl rounded-bl-sm">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="px-4 py-3 border-t border-slate-100">
          {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your schedule, expenses..."
              disabled={loading}
              className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50"
            />
            <Button type="submit" variant="primary" disabled={!input.trim() || loading} className="px-3">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </Button>
          </div>
        </form>
      </div>
    </Drawer>
  );
}
