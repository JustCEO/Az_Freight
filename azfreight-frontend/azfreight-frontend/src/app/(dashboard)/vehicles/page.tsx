'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { listVehicles, type Vehicle } from '@/lib/api/vehicles';
import { useTranslation } from '@/lib/i18n';
import Loading from '@/components/loading';

const STATUS_COLORS: Record<string, string> = {
  available: 'bg-emerald-100 text-emerald-700',
  on_route: 'bg-blue-100 text-blue-700',
  maintenance: 'bg-amber-100 text-amber-700',
  inactive: 'bg-red-100 text-red-700',
};

export default function VehiclesPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    listVehicles(search || undefined, statusFilter || undefined)
      .then(setVehicles).catch(() => {}).finally(() => setLoading(false));
  }, [search, statusFilter]);

  if (loading) return <Loading />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{t('vehicles.title')}</h1>
        <Link href="/vehicles/new" className="btn-primary text-sm">+ {t('vehicles.new') === 'vehicles.new' ? 'New Vehicle' : t('vehicles.new')}</Link>
      </div>

      <div className="flex gap-3 mb-4">
        <input className="input-field w-64" placeholder="Search plate or brand..." value={search}
          onChange={(e) => setSearch(e.target.value)} />
        <select className="input-field w-40" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          {['available', 'on_route', 'maintenance', 'inactive'].map((s) => (
            <option key={s} value={s}>{s.replace('_', ' ')}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Plate</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Brand / Model</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Year</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Driver</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Capacity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {vehicles.map((v) => (
              <tr key={v.id} onClick={() => router.push(`/vehicles/${v.id}`)} className="cursor-pointer hover:bg-slate-50">
                <td className="px-6 py-4 text-sm font-semibold text-slate-900">{v.plateNumber}</td>
                <td className="px-6 py-4 text-sm text-slate-700">{[v.brand, v.model].filter(Boolean).join(' ') || '—'}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{v.year || '—'}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${STATUS_COLORS[v.status] || ''}`}>
                    {v.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{v.driver?.name || '—'}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{v.capacityTons ? `${v.capacityTons}t` : '—'}</td>
              </tr>
            ))}
            {vehicles.length === 0 && (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-500">No vehicles added yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
