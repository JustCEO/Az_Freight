'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import Loading from '@/components/loading';

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <svg className="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3C6.5 3 2 6.5 2 6.5L5 18h14l3-11.5S17.5 3 12 3zM2 21h20M7 18v3M17 18v3" />
          </svg>
          <span className="text-lg font-bold text-slate-900">AzFreight Client Portal</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-500">{user.name}</span>
          <button onClick={logout} className="text-sm text-slate-500 hover:text-slate-700">
            Logout
          </button>
        </div>
      </header>
      <main className="max-w-6xl mx-auto p-8">{children}</main>
    </div>
  );
}
