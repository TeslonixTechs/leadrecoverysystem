import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [business, setBusiness] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('serviceflow_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        setUser(res.data);
        setBusiness(res.data.business);
      } catch (err) {
        console.error('Auth load failed:', err);
        localStorage.removeItem('serviceflow_token');
        setToken(null);
        setUser(null);
        setBusiness(null);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: jwtToken, user: userData, business: businessData } = res.data;
    localStorage.setItem('serviceflow_token', jwtToken);
    setToken(jwtToken);
    setUser(userData);
    setBusiness(businessData);
    return res.data;
  };

  const register = async (data) => {
    const res = await api.post('/auth/register', data);
    const { token: jwtToken, user: userData, business: businessData } = res.data;
    localStorage.setItem('serviceflow_token', jwtToken);
    setToken(jwtToken);
    setUser(userData);
    setBusiness(businessData);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('serviceflow_token');
    setToken(null);
    setUser(null);
    setBusiness(null);
  };

  const updateBusinessState = (newBusiness) => {
    setBusiness(newBusiness);
  };

  return (
    <AuthContext.Provider value={{
      user,
      business,
      token,
      loading,
      login,
      register,
      logout,
      updateBusinessState
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
