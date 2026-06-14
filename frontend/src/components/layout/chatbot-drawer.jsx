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

  const handleNewChat = () => {
    newChat();
    setShowHistory(false);
  };

  const handleSwitchThread = (threadId) => {
    switchThread(threadId);
    setShowHistory(false);
  };

  const handleDeleteThread = (e, threadId) => {
    e.stopPropagation();
    if (window.confirm('Delete this chat?')) {
      deleteThread(threadId);
    }
  };

  return (
    <Drawer isOpen={isOpen} title="AI Assistant" onClose={onClose}>
      <div className="flex flex-col h-full">
        {/* Header bar */}
        <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="text-xs px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            >
              {showHistory ? '← Back' : '📋 Chats'}
            </button>
            <button
              onClick={handleNewChat}
              className="text-xs px-2 py-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition-colors"
            >
              + New
            </button>
          </div>
          {messages.length > 0 && !showHistory && (
            <button onClick={() => { if (window.confirm('Clear this conversation?')) clearHistory(); }} className="text-xs text-slate-400 hover:text-red-500">
              Clear
            </button>
          )}
        </div>

        {/* Thread list (history sidebar) */}
        {showHistory ? (
          <div className="flex-1 overflow-y-auto">
            <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center">
              <p className="text-sm font-medium text-slate-700">Chat History</p>
              {threads.length > 0 && (
                <button onClick={() => { if (window.confirm('Delete ALL chats?')) { clearAllHistory(); setShowHistory(false); } }} className="text-xs text-red-400 hover:text-red-600">
                  Clear All
                </button>
              )}
            </div>
            {threads.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-slate-500">No previous chats</p>
                <p className="text-xs text-slate-400 mt-1">Start a conversation to see it here</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {threads.map((thread) => (
                  <div
                    key={thread._id}
                    onClick={() => handleSwitchThread(thread._id)}
                    className={`px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors ${
                      activeSessionId === thread._id ? 'bg-indigo-50 border-l-2 border-indigo-500' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{thread.title}</p>
                        <p className="text-xs text-slate-400 mt-0.5 truncate">{thread.lastMessage || 'No messages'}</p>
                        <p className="text-[10px] text-slate-300 mt-0.5">
                          {thread.totalMessages} msgs · {new Date(thread.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={(e) => handleDeleteThread(e, thread._id)}
                        className="text-slate-300 hover:text-red-500 ml-2 shrink-0"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {messages.length === 0 && !loading && (
                <div className="text-center py-8">
                  <p className="text-3xl mb-2">🤖</p>
                  <p className="text-sm text-slate-600 font-medium">How can I help you today?</p>
                  <p className="text-xs text-slate-400 mt-1">I remember our conversation within each chat session</p>
                  <div className="mt-4 space-y-2">
                    {[
                      'How am I doing overall?',
                      'What\'s my attendance like?',
                      'Am I overspending this month?',
                      'What deadlines are coming up?',
                      'Am I getting burned out?',
                    ].map((q) => (
                      <button
                        key={q}
                        onClick={() => setInput(q)}
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
                    {msg.role === 'user' ? (
                      <p className="whitespace-pre-wrap">{msg.message}</p>
                    ) : (
                      <MarkdownRenderer content={msg.message} />
                    )}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-1.5 pt-1.5 border-t border-slate-200/50">
                        <p className="text-[10px] opacity-60 font-medium">📎 {msg.sources.map((s) => s.label).join(' · ')}</p>
                      </div>
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
                  placeholder="Ask anything about your campus life..."
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
          </>
        )}
      </div>
    </Drawer>
  );
}
