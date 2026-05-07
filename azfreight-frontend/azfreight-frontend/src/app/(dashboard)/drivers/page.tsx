'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { listDrivers, type Driver } from '@/lib/api/drivers';
import { useTranslation } from '@/lib/i18n';
import Loading from '@/components/loading';

const STATUS_COLORS: Record<string, string> = {
  available: 'bg-emerald-100 text-emerald-700',
  on_route: 'bg-blue-100 text-blue-700',
  on_leave: 'bg-amber-100 text-amber-700',
  inactive: 'bg-red-100 text-red-700',
};

function isExpiringSoon(date: string | null): 'expired' | 'warning' | null {
  if (!date) return null;
  const d = new Date(date);
  const now = new Date();
  if (d < now) return 'expired';
  const diff = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  if (diff <= 30) return 'warning';
  return null;
}

export default function DriversPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    listDrivers(search || undefined, statusFilter || undefined)
      .then(setDrivers).catch(() => {}).finally(() => setLoading(false));
  }, [search, statusFilter]);

  if (loading) return <Loading />;

  const expiringDrivers = drivers.filter((d) => isExpiringSoon(d.licenseExpiry) !== null);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{t('drivers.title')}</h1>
        <Link href="/drivers/new" className="btn-primary text-sm">+ New Driver</Link>
      </div>

      {expiringDrivers.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg mb-4 text-sm">
          <strong>License warning:</strong> {expiringDrivers.length} driver(s) have expired or expiring licenses within 30 days.
        </div>
      )}

      <div className="flex gap-3 mb-4">
        <input className="input-field w-64" placeholder="Search name or license..." value={search}
          onChange={(e) => setSearch(e.target.value)} />
        <select className="input-field w-40" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          {['available', 'on_route', 'on_leave', 'inactive'].map((s) => (
            <option key={s} value={s}>{s.replace('_', ' ')}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">License</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">License Expiry</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Categories</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {drivers.map((d) => {
              const expiry = isExpiringSoon(d.licenseExpiry);
              return (
                <tr key={d.id} onClick={() => router.push(`/drivers/${d.id}`)} className="cursor-pointer hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm font-semibold text-slate-900">{d.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{d.phone || '—'}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{d.licenseNumber || '—'}</td>
                  <td className={`px-6 py-4 text-sm font-medium ${expiry === 'expired' ? 'text-red-600' : expiry === 'warning' ? 'text-amber-600' : 'text-slate-600'}`}>
                    {d.licenseExpiry ? new Date(d.licenseExpiry).toLocaleDateString() : '—'}
                    {expiry === 'expired' && ' ⚠ Expired'}
                    {expiry === 'warning' && ' ⚠ Soon'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${STATUS_COLORS[d.status] || ''}`}>
                      {d.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{d.licenseCategories.join(', ') || '—'}</td>
                </tr>
              );
            })}
            {drivers.length === 0 && (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-500">No drivers added yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
