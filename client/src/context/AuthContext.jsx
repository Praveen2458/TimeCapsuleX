import { createContext, useContext, useEffect, useState } from 'react';
import { login as apiLogin, register as apiRegister } from '../services/api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('accessToken');
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setAccessToken(storedToken);
    }
    setLoading(false);
  }, []);

  const handleAuthSuccess = (data) => {
    const { user: u, accessToken: token } = data;
    setUser(u);
    setAccessToken(token);
    localStorage.setItem('user', JSON.stringify(u));
    localStorage.setItem('accessToken', token);
  };

  const login = async (credentials) => {
    const res = await apiLogin(credentials);
    handleAuthSuccess(res.data);
  };

  const register = async (payload) => {
    const res = await apiRegister(payload);
    handleAuthSuccess(res.data);
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
