import { useState, useRef, useEffect } from 'react';
import { useChatbot } from '../../hooks/use-chatbot.js';
import Drawer from '../shared/drawer.jsx';
import Button from '../shared/button.jsx';
import MarkdownRenderer from '../shared/markdown-renderer.jsx';

export default function ChatbotDrawer({ isOpen, onClose }) {
  const {
    messages, threads, activeSessionId, loading, error,
    sendMessage, clearHistory, clearAllHistory, newChat,
    switchThread, renameThread, deleteThread,
  } = useChatbot();

  const [input, setInput] = useState('');
  const [showHistory, setShowHistory] = useState(false);
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

  const handleNewChat = () => { newChat(); setShowHistory(false); };
  const handleSwitchThread = (id) => { switchThread(id); setShowHistory(false); };
  const handleDeleteThread = (e, id) => { e.stopPropagation(); if (window.confirm('Delete this chat?')) deleteThread(id); };

  return (
    <Drawer isOpen={isOpen} title="✨ AI Assistant" onClose={onClose}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="px-4 py-2.5 border-b border-slate-100 dark:border-white/[0.06] flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.02]">
          <div className="flex items-center gap-1.5">
            <button onClick={() => setShowHistory(!showHistory)} className="text-[11px] px-2.5 py-1 rounded-lg bg-white dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-300 hover:border-brand-200 dark:hover:border-brand-700 hover:text-brand-600 dark:hover:text-brand-400 transition-all">
              {showHistory ? '← Chat' : '📋 History'}
            </button>
            <button onClick={handleNewChat} className="text-[11px] px-2.5 py-1 rounded-lg bg-brand-50 dark:bg-brand-950/40 border border-brand-100 dark:border-brand-800/30 text-brand-600 dark:text-brand-300 hover:bg-brand-100 dark:hover:bg-brand-900/40 transition-all">
              + New
            </button>
          </div>
          {messages.length > 0 && !showHistory && (
            <button onClick={() => { if (window.confirm('Clear this conversation?')) clearHistory(); }} className="text-[10px] text-slate-400 hover:text-red-500 transition-colors">Clear</button>
          )}
        </div>

        {/* Thread History */}
        {showHistory ? (
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            <div className="px-4 py-3 flex justify-between items-center">
              <p className="text-xs font-semibold text-slate-700">Conversations</p>
              {threads.length > 0 && (
                <button onClick={() => { if (window.confirm('Delete ALL chats?')) { clearAllHistory(); setShowHistory(false); } }} className="text-[10px] text-red-400 hover:text-red-600">Clear All</button>
              )}
            </div>
            {threads.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <p className="text-2xl mb-2">💬</p>
                <p className="text-sm text-slate-500">No conversations yet</p>
              </div>
            ) : (
              <div className="px-2 space-y-1 stagger-children">
                {threads.map((t) => (
                  <div key={t._id} onClick={() => handleSwitchThread(t._id)} className={`px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 group ${activeSessionId === t._id ? 'bg-brand-50 border border-brand-100' : 'hover:bg-slate-50 border border-transparent'}`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-slate-800 truncate">{t.title}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5 truncate">{t.lastMessage || 'Empty'}</p>
                      </div>
                      <button onClick={(e) => handleDeleteThread(e, t._id)} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-400 ml-2 transition-opacity">✕</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-thin">
              {messages.length === 0 && !loading && (
                <div className="text-center py-10 animate-fade-in">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-brand-100 to-violet-100 flex items-center justify-center">
                    <span className="text-2xl">✨</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-700">How can I help today?</p>
                  <p className="text-xs text-slate-400 mt-1">I know your schedule, expenses, & wellness</p>
                  <div className="mt-5 space-y-1.5">
                    {['How am I doing overall?', "What's my attendance?", 'Am I overspending?', 'What deadlines are coming?', 'What do I need to buy?'].map((q) => (
                      <button key={q} onClick={() => setInput(q)} className="block w-full text-left text-[12px] px-3 py-2 bg-slate-50 dark:bg-white/[0.03] rounded-xl text-slate-600 dark:text-slate-400 hover:bg-brand-50 dark:hover:bg-brand-950/30 hover:text-brand-700 dark:hover:text-brand-300 transition-all duration-150 border border-transparent hover:border-brand-100 dark:hover:border-brand-800/30">{q}</button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} chat-bubble-enter`}>
                  <div className={`max-w-[88%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-brand-600 text-white rounded-br-md shadow-soft'
                      : 'bg-slate-100 dark:bg-white/[0.05] text-slate-800 dark:text-slate-200 rounded-bl-md'
                  }`}>
                    {msg.role === 'user' ? (
                      <p className="whitespace-pre-wrap">{msg.message}</p>
                    ) : (
                      <MarkdownRenderer content={msg.message} />
                    )}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-2 pt-1.5 border-t border-slate-200/30">
                        <p className="text-[9px] opacity-60">📎 {msg.sources.map((s) => s.label).join(' · ')}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start chat-bubble-enter">
                  <div className="bg-slate-100 dark:bg-white/[0.05] px-4 py-3 rounded-2xl rounded-bl-md">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="px-4 py-3 border-t border-slate-100 dark:border-white/[0.06] bg-white dark:bg-[#0c0e16]">
              {error && <p className="text-[11px] text-red-500 mb-2">{error}</p>}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask anything about your campus life..."
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 text-[13px] bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:focus:ring-brand-500/20 focus:border-brand-400 dark:focus:border-brand-500/40 disabled:opacity-50 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 dark:text-slate-200"
                />
                <Button type="submit" variant="brand" size="md" disabled={!input.trim() || loading} className="px-3 rounded-xl">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </Drawer>
  );
}
