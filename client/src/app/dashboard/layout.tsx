'use client';
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'client') router.replace('/shop');
      if (user.role === 'technician') router.replace('/technician');
    }
  }, [user, loading, router]);

  if (loading || (user && ['client', 'technician'].includes(user.role))) return null;

  return <DashboardLayout>{children}</DashboardLayout>;
}
