import { useState, useCallback, useEffect } from 'react';
import { burnoutService } from '../services/burnout-service.js';
import { computeBurnoutScore } from '../utils/burnout-calculator.js';

export function useBurnout() {
  const [burnout, setBurnout] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshBurnout = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await burnoutService.getLatest();
      setBurnout(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load burnout data');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshHistory = useCallback(async (params) => {
    try {
      const res = await burnoutService.getHistory(params);
      setHistory(res.data.records || []);
    } catch (err) {
      setError(err.message || 'Failed to load burnout history');
    }
  }, []);

  const submitCheckin = useCallback(async (data) => {
    setError(null);
    try {
      const res = await burnoutService.checkin(data);
      setBurnout(res.data);
      await refreshHistory();
      return res.data;
    } catch (err) {
      setError(err.message || 'Failed to submit check-in');
      throw err;
    }
  }, [refreshHistory]);

  useEffect(() => {
    refreshBurnout();
    refreshHistory();
  }, [refreshBurnout, refreshHistory]);

  return {
    burnout,
    history,
    loading,
    error,
    submitCheckin,
    refreshBurnout,
    refreshHistory,
    computeBurnoutScore, // Expose utility for preview calculations
  };
}
