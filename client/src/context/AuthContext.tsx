'use client';
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getCookie, setCookie, deleteCookie } from 'cookies-next';
import api from '@/services/api';

interface User {
  _id: string;
  username: string;
  email: string;
  role: 'admin' | 'manager' | 'technician' | 'client' | 'contractor';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getDefaultRoute = (role: string) => {
  if (role === 'client') return '/shop';
  if (role === 'technician') return '/technician';
  if (role === 'contractor') return '/contractor';
  return '/dashboard';
};

const checkRoleAccess = (userRole: string, path: string) => {
  if (path.startsWith('/dashboard') && !['admin', 'manager'].includes(userRole)) return false;
  if (path.startsWith('/technician') && userRole !== 'technician') return false;
  if (path.startsWith('/contractor') && userRole !== 'contractor') return false;
  
  const shopRoutes = ['/shop', '/cart', '/checkout', '/order', '/client-chat', '/client-maintenance'];
  if (shopRoutes.some(r => path === r || path.startsWith(`${r}/`))) {
    if (!['client', 'admin', 'manager'].includes(userRole)) return false;
  }
  
  return true;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const isPublicRoute = pathname === '/login' || pathname === '/' || pathname?.startsWith('/login/');

  useEffect(() => {
    const checkUser = async () => {
      const token = getCookie('heavymach_token');
      
      if (token) {
        try {
          // Set a 5-second timeout for the profile check
          const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000));
          const profileRequest = api.get('/users/profile');
          
          const { data }: any = await Promise.race([profileRequest, timeout]);
          setUser(data);
        } catch (error) {
          console.error('Auth check failed or timed out:', error);
          // Clear cookies and state if authentication fails
          deleteCookie('heavymach_token');
          deleteCookie('heavymach_role');
          setUser(null);
          
          // Redirect if on a protected route
          if (!isPublicRoute) {
            router.push('/login');
          }
        }
      } else {
        // No token, redirect to login if on a protected route
        if (!isPublicRoute) {
          router.push('/login');
        }
      }
      setLoading(false);
    };
    checkUser();
  }, [router, isPublicRoute]);

  useEffect(() => {
    if (!loading && user && pathname && !isPublicRoute) {
      if (!checkRoleAccess(user.role, pathname)) {
        router.push(getDefaultRoute(user.role));
      }
    }
  }, [loading, user, pathname, isPublicRoute, router]);

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/users/login', { email, password });
    
    // Set cookies with reasonable expiry (e.g., 7 days) and explicit root path
    setCookie('heavymach_token', data.token, { maxAge: 60 * 60 * 24 * 7, path: '/' });
    setCookie('heavymach_role', data.role, { maxAge: 60 * 60 * 24 * 7, path: '/' });
    
    setUser(data);
    
    router.push(getDefaultRoute(data.role));
  };

  const logout = () => {
    deleteCookie('heavymach_token');
    deleteCookie('heavymach_role');
    setUser(null);
    router.push('/login');
  };

  const authValue = useMemo(() => ({
    user,
    login,
    logout,
    loading
  }), [user, loading]);

  // Protect routes from rendering if not authenticated
  if (!isPublicRoute) {
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }
    if (!user) {
      return null;
    }
    if (user && pathname && !checkRoleAccess(user.role, pathname)) {
      return null;
    }
  }

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
