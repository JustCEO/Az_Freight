'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { listQuotes, type Quote } from '@/lib/api/quotes';
import { useTranslation } from '@/lib/i18n';
import Loading from '@/components/loading';
import { exportToCSV } from '@/lib/export';

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-700', sent: 'bg-blue-100 text-blue-700',
  accepted: 'bg-emerald-100 text-emerald-700', rejected: 'bg-red-100 text-red-700',
  expired: 'bg-amber-100 text-amber-700',
};

export default function QuotesPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchData = useCallback(async () => {
    try { const data = await listQuotes(statusFilter || undefined); setQuotes(data); }
    catch { /* ignore */ }
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <Loading />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{t('quotes.title')}</h1>
        <div className="flex gap-2">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field w-40">
            <option value="">{t('shipmentsList.allStatuses')}</option>
            {['draft', 'sent', 'accepted', 'rejected', 'expired'].map((s) => (
              <option key={s} value={s}>{t('quotes.' + s)}</option>
            ))}
          </select>
          <button
            onClick={() => exportToCSV(quotes.map((q) => ({
              number: q.quoteNumber, route: `${q.originCity} → ${q.destCity}`,
              client: q.client?.companyName || '', total: q.total, currency: q.currency,
              status: q.status, validUntil: new Date(q.validUntil).toLocaleDateString(),
            })), 'quotes')}
            className="px-3 py-2 text-sm text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50"
          >CSV</button>
          <button onClick={() => router.push('/quotes/new')} className="btn-primary">
            + {t('quotes.newQuote')}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('quotes.quoteNumber')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('shipmentsList.client')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('requestsList.route')}</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">{t('quotes.total')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('common.status')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('quotes.validUntil')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {quotes.map((q) => (
                <tr key={q.id} onClick={() => router.push(`/quotes/${q.id}`)} className="cursor-pointer hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm font-medium text-blue-600">{q.quoteNumber}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">{q.client?.companyName || '—'}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">{q.originCity} → {q.destCity}</td>
                  <td className="px-6 py-4 text-sm text-right font-medium text-slate-900">{Number(q.total).toLocaleString()} {q.currency}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${STATUS_COLORS[q.status] || 'bg-slate-100'}`}>
                      {t('quotes.' + q.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{new Date(q.validUntil).toLocaleDateString()}</td>
                </tr>
              ))}
              {quotes.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-500">{t('quotes.noQuotes')}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
