import { useState, useCallback, useEffect } from 'react';
import { profileService } from '../services/profile-service.js';

export function useProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await profileService.getProfile();
      setProfile(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePreferences = useCallback(async (data) => {
    setError(null);
    try {
      const res = await profileService.updatePreferences(data);
      setProfile((prev) => (prev ? { ...prev, user: res.data.user } : prev));
      return res.data;
    } catch (err) {
      setError(err.message || 'Failed to update preferences');
      throw err;
    }
  }, []);

  const resetDemo = useCallback(async () => {
    setError(null);
    try {
      await profileService.resetDemo();
      await refreshProfile();
    } catch (err) {
      setError(err.message || 'Failed to reset demo');
      throw err;
    }
  }, [refreshProfile]);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  return {
    profile,
    loading,
    error,
    updatePreferences,
    resetDemo,
    refreshProfile,
  };
}
