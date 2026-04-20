'use client';
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ContractorLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/login');
      } else if (user.role !== 'contractor' && user.role !== 'admin') {
        // Only contractors and admins can see this
        router.replace('/dashboard');
      }
    }
  }, [user, loading, router]);

  if (loading || !user || (user && !['contractor', 'admin'].includes(user.role))) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
