import { createContext, useState, useEffect, useCallback } from 'react';
import api from '../config/api.js';
import { API_ROUTES } from '../utils/constants.js';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * On app startup: check if token exists and restore session.
   * Do not require re-login after page refresh.
   */
  useEffect(() => {
    refreshSession();
  }, []);

  /**
   * Refresh session — verify token and load user.
   */
  const refreshSession = useCallback(async () => {
    const token = localStorage.getItem('campusos_token');
    if (!token) {
      setLoading(false);
      setIsAuthenticated(false);
      setUser(null);
      return;
    }

    try {
      const res = await api.get(API_ROUTES.AUTH.ME);
      setUser(res.data.user);
      setIsAuthenticated(true);
      setError(null);
    } catch (err) {
      // Token invalid or expired
      localStorage.removeItem('campusos_token');
      setUser(null);
      setIsAuthenticated(false);
      setError(null); // Don't show error for expired sessions
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Login with Google OAuth credential.
   */
  const loginWithGoogle = useCallback(async (credential) => {
    setError(null);
    setLoading(true);
    try {
      const res = await api.post(API_ROUTES.AUTH.GOOGLE, { credential });
      const { user: userData, token } = res.data;
      localStorage.setItem('campusos_token', token);
      setUser(userData);
      setIsAuthenticated(true);
      return userData;
    } catch (err) {
      setError(err.message || 'Google login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Login as demo user.
   */
  const loginAsDemo = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await api.post(API_ROUTES.AUTH.DEMO);
      const { user: userData, token } = res.data;
      localStorage.setItem('campusos_token', token);
      setUser(userData);
      setIsAuthenticated(true);
      return userData;
    } catch (err) {
      setError(err.message || 'Demo login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Logout — clear token and state.
   */
  const logout = useCallback(async () => {
    try {
      await api.post(API_ROUTES.AUTH.LOGOUT);
    } catch {
      // Logout failure is non-critical — clear state anyway
    } finally {
      localStorage.removeItem('campusos_token');
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
    }
  }, []);

  const value = {
    user,
    isAuthenticated,
    loading,
    error,
    loginWithGoogle,
    loginAsDemo,
    logout,
    refreshSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
