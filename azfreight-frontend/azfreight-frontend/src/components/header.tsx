'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { useTranslation } from '@/lib/i18n';
import NotificationBell from './notification-bell';

export default function Header() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  const titles: Record<string, string> = {
    '/dashboard': t('nav.dashboard'),
    '/shipments': t('nav.shipments'),
    '/shipments/new': t('shipmentsList.newShipment'),
    '/clients': t('nav.clients'),
    '/clients/new': t('clientsList.newClient'),
    '/carriers': t('nav.carriers'),
    '/invoices': t('nav.invoices'),
    '/leads': t('leads.title'),
    '/requests': t('nav.requests'),
    '/reports': t('reports.title'),
    '/quotes': t('quotes.title'),
    '/users': t('users.title'),
    '/settings': t('settings.title'),
  };

  let title = titles[pathname] || '';
  if (!title) {
    if (pathname.startsWith('/shipments/')) title = t('nav.shipments');
    else if (pathname.startsWith('/clients/')) title = t('nav.clients');
    else if (pathname.startsWith('/carriers/')) title = t('nav.carriers');
    else if (pathname.startsWith('/invoices/')) title = t('nav.invoices');
    else if (pathname.startsWith('/requests/')) title = t('nav.requests');
    else if (pathname.startsWith('/leads/')) title = t('leads.title');
    else if (pathname.startsWith('/quotes/')) title = t('quotes.title');
  }

  return (
    <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-4 flex items-center justify-between">
      <h1 className="text-lg sm:text-xl font-semibold text-slate-900">{title}</h1>
      <div className="flex items-center gap-3">
        <NotificationBell />
        <span className="text-sm text-slate-500 hidden sm:inline">{user?.name}</span>
        <button onClick={logout} className="text-sm text-slate-500 hover:text-slate-700">
          {t('auth.signIn') === 'Sign in' ? 'Logout' : 'Выйти'}
        </button>
      </div>
    </header>
  );
}
