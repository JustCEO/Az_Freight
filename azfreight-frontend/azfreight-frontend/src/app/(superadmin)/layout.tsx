'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { getToken, clearTokens } from '@/lib/api-client';
import { getMe } from '@/lib/api/auth';

// Навигационные элементы сайдбара
const navItems = [
  { label: 'Dashboard', href: '/superadmin/dashboard', icon: '📊' },
  { label: 'Tenants', href: '/superadmin/tenants', icon: '🏢' },
];

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Проверка авторизации при загрузке
  useEffect(() => {
    // Страница логина не требует авторизации
    if (pathname === '/superadmin/login') {
      setLoading(false);
      setAuthenticated(false);
      return;
    }

    const token = getToken();
    if (!token) {
      router.replace('/superadmin/login');
      return;
    }

    getMe()
      .then((user) => {
        // Проверяем, что пользователь — суперадмин
        if ((user as unknown as { role: string }).role !== 'superadmin') {
          clearTokens();
          router.replace('/superadmin/login');
        } else {
          setAuthenticated(true);
        }
      })
      .catch(() => {
        clearTokens();
        router.replace('/superadmin/login');
      })
      .finally(() => setLoading(false));
  }, [pathname, router]);

  // Страница логина — без сайдбара
  if (pathname === '/superadmin/login') {
    return <>{children}</>;
  }

  // Индикатор загрузки
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-gray-500 text-lg">Загрузка...</div>
      </div>
    );
  }

  // Не авторизован — ничего не показываем (идёт редирект)
  if (!authenticated) {
    return null;
  }

  // Выход из системы
  const handleLogout = () => {
    clearTokens();
    router.replace('/superadmin/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Боковая панель */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        {/* Логотип / бренд */}
        <div className="px-6 py-5 border-b border-gray-700">
          <h1 className="text-lg font-bold tracking-wide">AzFreight</h1>
          <p className="text-xs text-gray-400 mt-0.5">Super Admin</p>
        </div>

        {/* Навигация */}
        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Кнопка выхода */}
        <div className="px-4 py-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <span>🚪</span>
            <span>Выйти</span>
          </button>
        </div>
      </aside>

      {/* Основное содержимое */}
      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  );
}
