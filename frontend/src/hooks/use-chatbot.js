import { useState, useCallback, useEffect } from 'react';
import { chatbotService } from '../services/chatbot-service.js';

export function useChatbot() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refreshHistory = useCallback(async () => {
    try {
      const res = await chatbotService.getHistory();
      setMessages(res.data.messages || []);
    } catch (err) {
      // Non-critical — chat can work without history
    }
  }, []);

  const sendMessage = useCallback(async (query) => {
    if (!query || query.trim().length === 0) return;

    setError(null);
    setLoading(true);

    // Optimistic: add user message immediately
    const userMsg = { role: 'user', message: query, createdAt: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await chatbotService.sendMessage(query);
      const assistantMsg = {
        role: 'assistant',
        message: res.data.answer,
        sources: res.data.sources || [],
        dataNotFound: res.data.dataNotFound || false,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      return res.data;
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
  }, []);

  const clearHistory = useCallback(async () => {
    setError(null);
    try {
      await chatbotService.clearHistory();
      setMessages([]);
    } catch (err) {
      setError(err.message || 'Failed to clear history');
    }
  }, []);

  useEffect(() => {
    refreshHistory();
  }, [refreshHistory]);

  return {
    messages,
    loading,
    error,
    sendMessage,
    clearHistory,
    refreshHistory,
  };
}
