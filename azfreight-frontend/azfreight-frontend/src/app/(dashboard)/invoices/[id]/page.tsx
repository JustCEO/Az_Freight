'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getInvoice, updateInvoiceStatus } from '@/lib/api/invoices';
import type { Invoice } from '@/types';
import StatusBadge from '@/components/status-badge';
import Loading from '@/components/loading';
import { INVOICE_STATUS_LABELS } from '@/lib/constants';

const INVOICE_STATUS_TRANSITIONS: Record<string, string[]> = {
  draft: ['sent', 'cancelled'],
  sent: ['paid', 'partially_paid', 'overdue', 'cancelled'],
  partially_paid: ['paid', 'overdue'],
  overdue: ['paid', 'partially_paid', 'cancelled'],
  paid: [],
  cancelled: [],
};

const INV_BTN_STYLES: Record<string, string> = {
  sent: 'bg-blue-600 hover:bg-blue-700 text-white',
  paid: 'bg-emerald-600 hover:bg-emerald-700 text-white',
  partially_paid: 'bg-amber-500 hover:bg-amber-600 text-white',
  overdue: 'bg-red-500 hover:bg-red-600 text-white',
  cancelled: 'bg-red-600 hover:bg-red-700 text-white',
};

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    getInvoice(id)
      .then(setInvoice)
      .catch(() => router.push('/invoices'))
      .finally(() => setLoading(false));
  }, [id, router]);

  async function handleStatusChange(newStatus: string) {
    if (!invoice) return;
    setUpdatingStatus(true);
    try {
      const updated = await updateInvoiceStatus(id, newStatus);
      setInvoice(updated);
    } catch { /* ignore */ }
    setUpdatingStatus(false);
  }

  if (loading || !invoice) return <Loading />;

  const transitions = INVOICE_STATUS_TRANSITIONS[invoice.status] || [];

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-xl font-bold text-slate-900">{invoice.invoiceNumber}</h2>
              <StatusBadge status={invoice.status} />
            </div>
            <p className="text-sm text-slate-500">Created {new Date(invoice.createdAt).toLocaleString()}</p>
          </div>
          <button onClick={() => router.push('/invoices')} className="btn-secondary text-sm">
            Back to list
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Invoice Details */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Details</h3>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-slate-500">Client</dt>
              <dd className="font-medium">{invoice.client?.companyName || '—'}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Shipment</dt>
              <dd className="font-medium">{invoice.shipment?.referenceNumber || '—'}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Amount</dt>
              <dd className="font-medium text-lg">{invoice.amount.toLocaleString()} {invoice.currency}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Currency</dt>
              <dd className="font-medium">{invoice.currency}</dd>
            </div>
          </dl>
        </div>

        {/* Dates */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Dates</h3>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-slate-500">Issued</dt>
              <dd className="font-medium">{new Date(invoice.issuedDate).toLocaleDateString()}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Due</dt>
              <dd className="font-medium">{new Date(invoice.dueDate).toLocaleDateString()}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Paid</dt>
              <dd className="font-medium">{invoice.paidDate ? new Date(invoice.paidDate).toLocaleDateString() : '—'}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Created</dt>
              <dd className="font-medium">{new Date(invoice.createdAt).toLocaleString()}</dd>
            </div>
          </dl>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 lg:col-span-2">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Notes</h3>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{invoice.notes}</p>
          </div>
        )}
      </div>

      {/* Status Transition */}
      {transitions.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Update Status</h3>
          <div className="flex gap-2">
            {transitions.map((s) => (
              <button
                key={s}
                onClick={() => handleStatusChange(s)}
                disabled={updatingStatus}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 ${INV_BTN_STYLES[s] || 'bg-slate-500 hover:bg-slate-600 text-white'}`}
              >
                {INVOICE_STATUS_LABELS[s] || s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
