'use client';
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { getCookie, setCookie, deleteCookie } from 'cookies-next';
import api from '@/services/api';

interface User {
  _id: string;
  username: string;
  email: string;
  role: 'admin' | 'manager' | 'technician' | 'client';
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
      const token = getCookie('token');
      if (token) {
        try {
          // Set a 5-second timeout for the profile check
          const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000));
          const profileRequest = api.get('/users/profile');
          
          const { data }: any = await Promise.race([profileRequest, timeout]);
          setUser(data);
        } catch (error) {
          console.error('Auth check failed or timed out:', error);
          // If token is invalid, we might want to clear it, but let middleware handle redirects
        }
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/users/login', { email, password });
    
    // Set cookies with reasonable expiry (e.g., 7 days)
    setCookie('token', data.token, { maxAge: 60 * 60 * 24 * 7 });
    setCookie('role', data.role, { maxAge: 60 * 60 * 24 * 7 });
    
    setUser(data);
    
    if (data.role === 'client') {
      router.push('/shop');
    } else if (data.role === 'technician') {
      router.push('/technician');
    } else {
      router.push('/dashboard');
    }
  };

  const logout = () => {
    deleteCookie('token');
    deleteCookie('role');
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
