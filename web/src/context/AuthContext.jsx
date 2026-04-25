import React, { createContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state from HTTP-only cookies on mount.
  // The interceptor silently resolves /auth/me 401 → { data: { data: null } }
  // so this never throws for unauthenticated users.
  const fetchUser = useCallback(async () => {
    try {
      const res = await api.get('/auth/me');
      const userData = res.data?.data || null;
      setUser(userData);
      setError(null);
    } catch (err) {
      // Only real errors land here (network failure, 500, etc.)
      setUser(null);
      console.error('[AUTH] Unexpected error fetching user:', err.message);
      setError(err.response?.data?.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // ── Local Login ────────────────────────────────────────────────
  const login = async (email, password) => {
    setError(null);
    try {
      const res = await api.post('/auth/login', { email, password });
      const userData = res.data.user || res.data;
      setUser(userData);
      return res.data;
    } catch (err) {
      const errorData = err.response?.data || { message: 'Login failed' };
      setError(errorData.message);
      throw errorData; // preserve needsVerification flag for Login.jsx
    }
  };

  // ── Google Login ───────────────────────────────────────────────
  const googleLogin = async (credential) => {
    setError(null);
    try {
      const res = await api.post('/auth/google-login', { credential });
      const userData = res.data.user || res.data;
      setUser(userData);
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Google Login failed';
      setError(msg);
      throw new Error(msg);
    }
  };

  // ── Register — does NOT set user (user must verify first) ──────
  const register = async (userData) => {
    setError(null);
    try {
      const res = await api.post('/auth/register', userData);
      return res.data; // returns { success, message, email }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      setError(msg);
      throw new Error(msg);
    }
  };

  // ── Logout ─────────────────────────────────────────────────────
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('[AUTH] Logout API failed:', err);
    } finally {
      setUser(null);
    }
  };

  // ── Verify Email via Token Link ────────────────────────────────
  // Called by VerifyEmail.jsx on mount to validate the token from the URL
  const verifyEmailByToken = async (token) => {
    try {
      const res = await api.get(`/auth/verify-email/${token}`);
      // Backend sets cookies → re-fetch to populate user context
      await fetchUser();
      return res.data;
    } catch (err) {
      throw err; // preserve error.response.data for granular UI feedback
    }
  };

  // ── Resend Verification Link ───────────────────────────────────
  const resendVerificationLink = async (email) => {
    try {
      const res = await api.post('/auth/resend-verification', { email });
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      login,
      googleLogin,
      register,
      logout,
      fetchUser,
      verifyEmailByToken,
      resendVerificationLink,
      // Added for compatibility with VerifyAccount.jsx (if used for link re-triggering)
      verifyAccount: async (email) => {
          await api.post('/auth/resend-verification', { email });
          return { success: true };
      }
    }}>
      {children}
    </AuthContext.Provider>
  );
};
