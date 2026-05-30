import React, { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from './api';

interface User { id: number; username: string; email: string; is_admin: boolean; }
interface AuthCtx { user: User | null; loading: boolean; login: (u: string, p: string) => Promise<void>; logout: () => void; }

const AuthContext = createContext<AuthCtx>({} as AuthCtx);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      authApi.me().then(r => setUser(r.data)).catch(() => localStorage.clear()).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username: string, password: string) => {
    const { data } = await authApi.login(username, password);
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    const me = await authApi.me();
    setUser(me.data);
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
