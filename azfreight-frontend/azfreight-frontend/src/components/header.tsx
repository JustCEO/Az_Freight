'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/shipments': 'Shipments',
  '/shipments/new': 'New Shipment',
  '/clients': 'Clients',
  '/clients/new': 'New Client',
  '/carriers': 'Carriers',
  '/carriers/new': 'New Carrier',
  '/invoices': 'Invoices',
  '/invoices/new': 'New Invoice',
};

export default function Header() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  let title = PAGE_TITLES[pathname] || '';
  if (!title) {
    if (pathname.startsWith('/shipments/')) title = 'Shipment Details';
    else if (pathname.startsWith('/clients/')) title = 'Client Details';
    else if (pathname.startsWith('/carriers/')) title = 'Carrier Details';
    else if (pathname.startsWith('/invoices/')) title = 'Invoice Details';
  }

  return (
    <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
      <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
      <div className="flex items-center gap-4">
        <span className="text-sm text-slate-500">{user?.name}</span>
        <button
          onClick={logout}
          className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
