'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { listCarriers } from '@/lib/api/carriers';
import type { Carrier } from '@/types';
import Pagination from '@/components/pagination';
import Loading from '@/components/loading';
import { TRANSPORT_LABELS } from '@/lib/constants';
import { useTranslation } from '@/lib/i18n';

export default function CarriersPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const limit = 20;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listCarriers({ page, limit, search: search || undefined });
      setCarriers(res.data);
      setTotal(res.total);
    } catch { /* ignore */ }
    setLoading(false);
  }, [page, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <input type="text" placeholder={t('carriersList.searchPlaceholder')} value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="input-field w-64" />
        <Link href="/carriers/new" className="btn-primary">{t('carriersList.newCarrier')}</Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        {loading ? <Loading /> : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('carriersList.companyName')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('carriersList.transportTypes')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('carriersList.country')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('common.phone')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('carriersList.rating')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('carriersList.shipments')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {carriers.map((c, idx) => (
                    <tr key={c.id} onClick={() => router.push(`/carriers/${c.id}`)} className={`cursor-pointer hover:bg-slate-50 ${idx % 2 === 1 ? 'bg-slate-50/50' : ''}`}>
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{c.companyName}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1 flex-wrap">
                          {(c.transportTypes || []).map((t) => (
                            <span key={t} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
                              {TRANSPORT_LABELS[t] || t}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">{c.country || '—'}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{c.phone || '—'}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{c.rating ?? '—'}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{c.totalShipments}</td>
                    </tr>
                  ))}
                  {carriers.length === 0 && (
                    <tr><td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-500">{t('carriersList.noCarriersFound')}</td></tr>
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
