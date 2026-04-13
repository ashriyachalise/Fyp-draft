'use client';
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';

interface User {
  _id: string;
  username: string;
  email: string;
  role: 'admin' | 'manager' | 'technician';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const token = sessionStorage.getItem('token');
      if (token) {
        try {
          // Set a 5-second timeout for the profile check
          const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000));
          const profileRequest = api.get('/users/profile');
          
          const { data }: any = await Promise.race([profileRequest, timeout]);
          setUser(data);
        } catch (error) {
          console.error('Auth check failed or timed out:', error);
          // If it's a server error or timeout, we don't necessarily want to clear the token,
          // but we do want to stop the loading screen.
        }
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/users/login', { email, password });
    sessionStorage.setItem('token', data.token);
    setUser(data);
    router.push('/dashboard');
  };

  const logout = () => {
    sessionStorage.removeItem('token');
    setUser(null);
    router.push('/login');
  };

  const authValue = useMemo(() => ({
    user,
    login,
    logout,
    loading
  }), [user, loading]);

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
