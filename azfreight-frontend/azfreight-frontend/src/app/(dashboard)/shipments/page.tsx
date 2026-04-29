'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { listShipments } from '@/lib/api/shipments';
import type { Shipment } from '@/types';
import StatusBadge from '@/components/status-badge';
import Pagination from '@/components/pagination';
import { TRANSPORT_LABELS } from '@/lib/constants';
import Loading from '@/components/loading';
import { useTranslation } from '@/lib/i18n';
import { useAuth } from '@/context/auth-context';
import { exportToCSV } from '@/lib/export';

const ALL_STATUSES = ['', 'request', 'confirmed', 'in_transit', 'customs', 'delivered', 'cancelled'];

export default function ShipmentsPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [transportFilter, setTransportFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const limit = 20;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listShipments({ page, limit, search: search || undefined, status: status || undefined });
      setShipments(res.data);
      setTotal(res.total);
    } catch { /* ignore */ }
    setLoading(false);
  }, [page, search, status]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder={t('shipmentsList.searchPlaceholder')}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input-field w-64"
          />
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="input-field w-44"
          >
            <option value="">{t('shipmentsList.allStatuses')}</option>
            {ALL_STATUSES.filter(Boolean).map((s) => (
              <option key={s} value={s}>{t('statuses.' + s)}</option>
            ))}
          </select>
          <button onClick={() => setShowFilters(!showFilters)} className="px-3 py-2 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50">
            {showFilters ? '✕' : '⚙'} {t('common.search')}
          </button>
        </div>
        <div className="flex items-center gap-2">
          {(user?.role === 'admin' || user?.role === 'superadmin') && (
            <Link href="/shipments/settings/statuses" className="px-4 py-2 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50">
              {t('nav.statusSettings')}
            </Link>
          )}
          <button
            onClick={() => exportToCSV(shipments.map((s) => ({
              referenceNumber: s.referenceNumber, client: s.client?.companyName || '', carrier: s.carrier?.companyName || '',
              transport: s.transportType, origin: `${s.originCity}, ${s.originCountry}`, destination: `${s.destinationCity}, ${s.destinationCountry}`,
              status: s.status, created: new Date(s.createdAt).toLocaleDateString(),
            })), 'shipments')}
            className="px-3 py-2 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            CSV
          </button>
          <Link href="/shipments/new" className="btn-primary">
            {t('shipmentsList.newShipment')}
          </Link>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="label-field">{t('requestForm.transportType')}</label>
              <select value={transportFilter} onChange={(e) => { setTransportFilter(e.target.value); setPage(1); }} className="input-field">
                <option value="">All</option>
                {['road_tir', 'sea', 'air', 'rail'].map((tp) => (
                  <option key={tp} value={tp}>{t('transport.' + tp)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-field">{t('common.date')} (from)</label>
              <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} className="input-field" />
            </div>
            <div>
              <label className="label-field">{t('common.date')} (to)</label>
              <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} className="input-field" />
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        {loading ? (
          <Loading />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('dashboard.refNumber')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('shipmentsList.client')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('shipmentsList.carrier')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('requestsList.transport')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('shipmentsList.route')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('common.status')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('shipmentsList.created')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {shipments.map((s, idx) => (
                    <tr
                      key={s.id}
                      onClick={() => router.push(`/shipments/${s.id}`)}
                      className={`cursor-pointer hover:bg-slate-50 ${idx % 2 === 1 ? 'bg-slate-50/50' : ''}`}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-blue-600">{s.referenceNumber}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{s.client?.companyName || '—'}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{s.carrier?.companyName || '—'}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{TRANSPORT_LABELS[s.transportType] || s.transportType}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {s.originCity} → {s.destinationCity}
                      </td>
                      <td className="px-6 py-4"><StatusBadge status={s.status} /></td>
                      <td className="px-6 py-4 text-sm text-slate-500">{new Date(s.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {shipments.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-sm text-slate-500">{t('shipmentsList.noShipmentsFound')}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <Pagination page={page} limit={limit} total={total} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
}
