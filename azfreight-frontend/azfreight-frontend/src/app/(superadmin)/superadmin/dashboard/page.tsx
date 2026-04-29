'use client';

import { useEffect, useState } from 'react';
import { getStats, type PlatformStats } from '@/lib/api/superadmin';
import { useTranslation } from '@/lib/i18n';

export default function SuperAdminDashboardPage() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Загрузка статистики платформы
  useEffect(() => {
    getStats()
      .then(setStats)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-gray-500">{t('superadmin.loadingStats')}</div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  if (!stats) return null;

  // Карточки статистики
  const cards = [
    { label: t('superadmin.totalTenants'), value: stats.totalTenants, color: 'bg-blue-500' },
    { label: t('superadmin.activeTenants'), value: stats.activeTenants, color: 'bg-green-500' },
    { label: t('superadmin.totalUsers'), value: stats.totalUsers, color: 'bg-purple-500' },
    { label: t('superadmin.totalRequests'), value: stats.totalRequests, color: 'bg-orange-500' },
    { label: t('superadmin.totalShipments'), value: stats.totalShipments, color: 'bg-teal-500' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{t('superadmin.dashboard')}</h1>

      {/* Сетка карточек статистики */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className={`w-10 h-10 ${card.color} rounded-lg flex items-center justify-center mb-3`}>
              <span className="text-white text-lg font-bold">
                {card.value}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{card.value}</p>
            <p className="text-sm text-gray-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
