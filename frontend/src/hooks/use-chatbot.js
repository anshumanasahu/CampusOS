import { useState, useCallback, useEffect } from 'react';
import { chatbotService } from '../services/chatbot-service.js';

export function useChatbot() {
  const [messages, setMessages] = useState([]);
  const [threads, setThreads] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ═══ Thread management ═══

  const refreshThreads = useCallback(async () => {
    try {
      const res = await chatbotService.listThreads();
      setThreads(res.data.threads || []);
    } catch {
      // Non-critical
    }
  }, []);

  const newChat = useCallback(() => {
    setActiveSessionId(null);
    setMessages([]);
    setError(null);
  }, []);

  const switchThread = useCallback(async (threadId) => {
    setActiveSessionId(threadId);
    setError(null);
    try {
      const res = await chatbotService.getHistory({ sessionId: threadId, limit: 100 });
      setMessages(res.data.messages || []);
    } catch {
      setMessages([]);
    }
  }, []);

  const renameThread = useCallback(async (threadId, title) => {
    try {
      await chatbotService.renameThread(threadId, title);
      await refreshThreads();
    } catch (err) {
      setError(err.message || 'Failed to rename');
    }
  }, [refreshThreads]);

  const deleteThread = useCallback(async (threadId) => {
    try {
      await chatbotService.deleteThread(threadId);
      if (activeSessionId === threadId) {
        setActiveSessionId(null);
        setMessages([]);
      }
      await refreshThreads();
    } catch (err) {
      setError(err.message || 'Failed to delete');
    }
  }, [activeSessionId, refreshThreads]);

  // ═══ Messaging ═══

  const sendMessage = useCallback(async (query) => {
    if (!query || query.trim().length === 0) return;

    setError(null);
    setLoading(true);

    // Optimistic: add user message
    const userMsg = { role: 'user', message: query, createdAt: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await chatbotService.sendMessage(query, activeSessionId);
      const data = res.data;

      // Update active session (backend may have created one)
      if (data.sessionId && !activeSessionId) {
        setActiveSessionId(data.sessionId);
      }

      const assistantMsg = {
        role: 'assistant',
        message: data.answer,
        sources: data.sources || [],
        dataNotFound: data.dataNotFound || false,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);

      // Refresh thread list (new thread may have been created)
      refreshThreads();

      return data;
    } catch (err) {
      const errorMsg = {
        role: 'assistant',
        message: 'Sorry, I encountered an error. Please try again.',
        dataNotFound: true,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
      setError(err.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  }, [activeSessionId, refreshThreads]);

  const clearHistory = useCallback(async () => {
    setError(null);
    try {
      await chatbotService.clearHistory(activeSessionId);
      setMessages([]);
      if (activeSessionId) {
        await refreshThreads();
      }
    } catch (err) {
      setError(err.message || 'Failed to clear history');
    }
  }, [activeSessionId, refreshThreads]);

  const clearAllHistory = useCallback(async () => {
    setError(null);
    try {
      await chatbotService.clearHistory(null);
      setMessages([]);
      setThreads([]);
      setActiveSessionId(null);
    } catch (err) {
      setError(err.message || 'Failed to clear all history');
    }
  }, []);

  // ═══ Init ═══

  const refreshHistory = useCallback(async () => {
    if (activeSessionId) {
      try {
        const res = await chatbotService.getHistory({ sessionId: activeSessionId, limit: 100 });
        setMessages(res.data.messages || []);
      } catch { /* ignore */ }
    }
  }, [activeSessionId]);

  useEffect(() => {
    refreshThreads();
  }, [refreshThreads]);

  return {
    messages,
    threads,
    activeSessionId,
    loading,
    error,
    sendMessage,
    clearHistory,
    clearAllHistory,
    refreshHistory,
    refreshThreads,
    newChat,
    switchThread,
    renameThread,
    deleteThread,
  };
}
