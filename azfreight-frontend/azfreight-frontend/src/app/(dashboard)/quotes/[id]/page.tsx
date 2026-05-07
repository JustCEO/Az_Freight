'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getQuote, updateQuote, convertQuote, deleteQuote, type Quote } from '@/lib/api/quotes';
import { useTranslation } from '@/lib/i18n';
import Loading from '@/components/loading';

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-700',
  sent: 'bg-blue-100 text-blue-700',
  accepted: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
  expired: 'bg-amber-100 text-amber-700',
};

export default function QuoteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useTranslation();
  const id = params.id as string;

  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');

  const load = useCallback(async () => {
    try {
      const data = await getQuote(id);
      setQuote(data);
    } catch {
      router.push('/quotes');
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => { load(); }, [load]);

  const handleStatusChange = async (status: string) => {
    setActionLoading(status);
    try {
      await updateQuote(id, { status });
      await load();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error');
    } finally {
      setActionLoading('');
    }
  };

  const handleConvert = async () => {
    if (!confirm('Convert this quote to a shipment?')) return;
    setActionLoading('convert');
    try {
      const result = await convertQuote(id) as { id: string };
      router.push(`/shipments/${result.id}`);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error');
    } finally {
      setActionLoading('');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this quote permanently?')) return;
    try {
      await deleteQuote(id);
      router.push('/quotes');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error');
    }
  };

  if (loading) return <Loading />;
  if (!quote) return null;

  return (
    <div className="max-w-4xl">
      <Link href="/quotes" className="text-sm text-blue-600 hover:text-blue-700 mb-4 inline-block">
        ← {t('quotes.title')}
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900">{quote.quoteNumber}</h1>
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[quote.status] || STATUS_COLORS.draft}`}>
            {quote.status.toUpperCase()}
          </span>
        </div>
        <div className="flex gap-2">
          {quote.status === 'draft' && (
            <>
              <button onClick={() => handleStatusChange('sent')} disabled={!!actionLoading}
                className="btn-primary text-sm disabled:opacity-50">
                {actionLoading === 'sent' ? '...' : 'Send to Client'}
              </button>
              <button onClick={handleDelete} className="btn-danger text-sm">Delete</button>
            </>
          )}
          {quote.status === 'sent' && (
            <>
              <button onClick={() => handleStatusChange('accepted')} disabled={!!actionLoading}
                className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50">
                {actionLoading === 'accepted' ? '...' : 'Mark Approved'}
              </button>
              <button onClick={() => handleStatusChange('rejected')} disabled={!!actionLoading}
                className="btn-danger text-sm disabled:opacity-50">
                {actionLoading === 'rejected' ? '...' : 'Mark Rejected'}
              </button>
            </>
          )}
          {quote.status === 'accepted' && (
            <button onClick={handleConvert} disabled={!!actionLoading}
              className="btn-primary text-sm disabled:opacity-50">
              {actionLoading === 'convert' ? '...' : 'Convert to Shipment'}
            </button>
          )}
        </div>
      </div>

      {/* Info Grid */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-slate-500">Client</p>
            <p className="font-medium text-slate-900">{quote.client?.companyName || '—'}</p>
          </div>
          <div>
            <p className="text-slate-500">Route</p>
            <p className="font-medium text-slate-900">{quote.originCity} → {quote.destCity}</p>
          </div>
          <div>
            <p className="text-slate-500">Transport</p>
            <p className="font-medium text-slate-900">{quote.transportType}</p>
          </div>
          <div>
            <p className="text-slate-500">Valid Until</p>
            <p className="font-medium text-slate-900">{new Date(quote.validUntil).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-slate-500">Currency</p>
            <p className="font-medium text-slate-900">{quote.currency}</p>
          </div>
          <div>
            <p className="text-slate-500">Cargo</p>
            <p className="font-medium text-slate-900">{quote.cargoType || '—'}</p>
          </div>
          <div>
            <p className="text-slate-500">Weight</p>
            <p className="font-medium text-slate-900">{quote.weightKg ? `${quote.weightKg} kg` : '—'}</p>
          </div>
          <div>
            <p className="text-slate-500">Volume</p>
            <p className="font-medium text-slate-900">{quote.volumeCbm ? `${quote.volumeCbm} cbm` : '—'}</p>
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <h2 className="text-sm font-semibold text-slate-900 mb-4">Line Items</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-2 font-medium text-slate-600">Description</th>
              <th className="text-right py-2 font-medium text-slate-600 w-20">Qty</th>
              <th className="text-right py-2 font-medium text-slate-600 w-28">Unit Price</th>
              <th className="text-right py-2 font-medium text-slate-600 w-28">Total</th>
            </tr>
          </thead>
          <tbody>
            {(quote.lines || []).map((line) => (
              <tr key={line.id} className="border-b border-slate-100">
                <td className="py-3 text-slate-900">{line.description}</td>
                <td className="py-3 text-right text-slate-600">{line.quantity}</td>
                <td className="py-3 text-right text-slate-600">{Number(line.unitPrice).toFixed(2)}</td>
                <td className="py-3 text-right font-medium text-slate-900">{Number(line.total).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 border-t border-slate-200 pt-4 space-y-1 text-right text-sm">
          <div className="text-slate-600">Subtotal: <span className="font-semibold text-slate-900">{Number(quote.subtotal).toFixed(2)} {quote.currency}</span></div>
          <div className="text-slate-600">VAT ({Number(quote.vatRate)}%): <span className="font-semibold text-slate-900">{Number(quote.vatAmount).toFixed(2)} {quote.currency}</span></div>
          <div className="text-lg font-bold text-slate-900 pt-1">Total: {Number(quote.total).toFixed(2)} {quote.currency}</div>
        </div>
      </div>

      {/* Notes */}
      {quote.notes && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <h2 className="text-sm font-semibold text-slate-900 mb-2">Notes</h2>
          <p className="text-sm text-slate-700 whitespace-pre-wrap">{quote.notes}</p>
        </div>
      )}

      {/* Metadata */}
      <div className="text-xs text-slate-400">
        Created {new Date(quote.createdAt).toLocaleString()}
        {quote.margin && ` · Margin: ${quote.margin}%`}
      </div>
    </div>
  );
}
