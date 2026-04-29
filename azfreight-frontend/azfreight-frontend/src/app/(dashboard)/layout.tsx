'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import Sidebar from '@/components/sidebar';
import Header from '@/components/header';
import Loading from '@/components/loading';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login');
    } else if (user.role === 'client') {
      router.replace('/portal');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (!user || user.role === 'client') return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className="lg:ml-64">
        <Header />
        <main className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">{children}</main>
      </div>
    </div>
  );
}
