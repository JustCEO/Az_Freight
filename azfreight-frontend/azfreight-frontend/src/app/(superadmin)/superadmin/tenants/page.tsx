'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { listTenants, type TenantWithStats } from '@/lib/api/superadmin';
import { useTranslation } from '@/lib/i18n';

export default function TenantsListPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [tenants, setTenants] = useState<TenantWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Загрузка списка тенантов
  useEffect(() => {
    listTenants()
      .then(setTenants)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-slate-500">{t('superadmin.loadingTenants')}</div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div>
      {/* Заголовок и кнопка создания */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">{t('superadmin.tenants')}</h1>
        <Link
          href="/superadmin/tenants/new"
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          {t('superadmin.createTenant')}
        </Link>
      </div>

      {/* Таблица тенантов */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-6 py-3 font-medium text-slate-600">{t('superadmin.tenantName')}</th>
              <th className="text-left px-6 py-3 font-medium text-slate-600">{t('superadmin.tenantSlug')}</th>
              <th className="text-left px-6 py-3 font-medium text-slate-600">{t('superadmin.plan')}</th>
              <th className="text-center px-6 py-3 font-medium text-slate-600">{t('superadmin.usersTab')}</th>
              <th className="text-center px-6 py-3 font-medium text-slate-600">{t('superadmin.totalRequests')}</th>
              <th className="text-center px-6 py-3 font-medium text-slate-600">{t('common.status')}</th>
              <th className="text-left px-6 py-3 font-medium text-slate-600">{t('superadmin.createdDate')}</th>
            </tr>
          </thead>
          <tbody>
            {tenants.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                  {t('superadmin.noTenants')}
                </td>
              </tr>
            ) : (
              tenants.map((tenant) => (
                <tr
                  key={tenant.id}
                  onClick={() => router.push(`/superadmin/tenants/${tenant.id}`)}
                  className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-slate-800">{tenant.name}</td>
                  <td className="px-6 py-4 text-slate-500">{tenant.slug}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                      {tenant.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-slate-600">
                    {tenant._count?.users ?? 0}
                  </td>
                  <td className="px-6 py-4 text-center text-slate-600">
                    {tenant._count?.shipmentRequests ?? 0}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {/* Бейдж статуса: зелёный — активен, красный — неактивен */}
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        tenant.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {tenant.isActive ? t('superadmin.active') : t('superadmin.inactive')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {new Date(tenant.createdAt).toLocaleDateString('ru-RU')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
