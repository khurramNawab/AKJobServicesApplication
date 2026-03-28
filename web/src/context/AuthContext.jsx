import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const res = await api.get('/auth/me');
          setUser(res.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch user', error);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const login = async (phoneNumber, password) => {
    const res = await api.post('/auth/login', { phoneNumber, password });
    localStorage.setItem('token', res.data.token);
    // Flat response for login: { success, _id, name, ... }
    setUser(res.data);
    return res.data;
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    localStorage.setItem('token', res.data.token);
    // Flat response for register too
    setUser(res.data);
    return res.data;
  };

  const verifyAccount = async (phoneNumber, otp) => {
    const res = await api.post('/auth/forgot-password/verify', { phoneNumber, otp });
    // Since we are already logged in from register/login, we just need to update the state
    setUser(prev => prev ? { ...prev, isVerified: true } : null);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, verifyAccount, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
