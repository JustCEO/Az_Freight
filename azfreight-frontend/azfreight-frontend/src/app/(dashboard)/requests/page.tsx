'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { listShipmentRequests, type ShipmentRequestSummary } from '@/lib/api/shipment-requests';
import { CARGO_TYPE_LABELS } from '@/lib/cargo-requirements';
import Pagination from '@/components/pagination';
import Loading from '@/components/loading';
import { useTranslation } from '@/lib/i18n';

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  reviewing: 'bg-yellow-100 text-yellow-700',
  quoted: 'bg-purple-100 text-purple-700',
  rejected: 'bg-red-100 text-red-700',
  converted: 'bg-green-100 text-green-700',
};

const STATUSES = ['', 'new', 'reviewing', 'quoted', 'rejected', 'converted'];

export default function RequestsPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [data, setData] = useState<ShipmentRequestSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const limit = 20;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listShipmentRequests({ page, limit, search: search || undefined, status: status || undefined });
      setData(res.data);
      setTotal(res.total);
    } catch { /* ignore */ }
    setLoading(false);
  }, [page, search, status]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{t('requestsList.title')}</h1>
      </div>
      <div className="flex items-center gap-4 mb-4">
        <input
          type="text"
          placeholder={t('requestsList.searchPlaceholder')}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="input-field w-64"
        />
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="input-field w-44"
        >
          <option value="">{t('requestsList.allStatuses')}</option>
          {STATUSES.filter(Boolean).map((s) => (
            <option key={s} value={s}>{t('statuses.' + s)}</option>
          ))}
        </select>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        {loading ? (
          <Loading />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('requestsList.requester')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('requestsList.company')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('requestsList.route')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('requestsList.cargo')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('requestsList.transport')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('common.status')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('common.date')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {data.map((r, idx) => (
                    <tr
                      key={r.id}
                      onClick={() => router.push(`/requests/${r.id}`)}
                      className={`cursor-pointer hover:bg-slate-50 ${idx % 2 === 1 ? 'bg-slate-50/50' : ''}`}
                    >
                      <td className="px-6 py-4 text-sm">
                        <div className="font-medium text-slate-900">{r.requesterName}</div>
                        <div className="text-slate-500 text-xs">{r.requesterEmail}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">{r.companyName || '—'}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{r.originCity} &rarr; {r.destinationCity}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{CARGO_TYPE_LABELS[r.cargoType] || r.cargoType}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{r.transportTypes.map(tp => t('transport.' + tp)).join(', ')}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[r.status] || 'bg-slate-100 text-slate-700'}`}>
                          {r.isUrgent && <span className="mr-1">!</span>}
                          {t('statuses.' + r.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">{new Date(r.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {data.length === 0 && (
                    <tr><td colSpan={7} className="px-6 py-8 text-center text-sm text-slate-500">{t('requestsList.noRequestsFound')}</td></tr>
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
