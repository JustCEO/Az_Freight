'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { listInvoices } from '@/lib/api/invoices';
import type { Invoice } from '@/types';
import StatusBadge from '@/components/status-badge';
import Pagination from '@/components/pagination';
import Loading from '@/components/loading';

export default function InvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const limit = 20;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listInvoices({ page, limit, search: search || undefined });
      setInvoices(res.data);
      setTotal(res.total);
    } catch { /* ignore */ }
    setLoading(false);
  }, [page, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <input type="text" placeholder="Search invoices..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="input-field w-64" />
        <Link href="/invoices/new" className="btn-primary">New Invoice</Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        {loading ? <Loading /> : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Invoice #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Client</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Currency</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Issued</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Due</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {invoices.map((inv, idx) => (
                    <tr key={inv.id} onClick={() => router.push(`/invoices/${inv.id}`)} className={`cursor-pointer hover:bg-slate-50 ${idx % 2 === 1 ? 'bg-slate-50/50' : ''}`}>
                      <td className="px-6 py-4 text-sm font-medium text-blue-600">{inv.invoiceNumber}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{inv.client?.companyName || '—'}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{inv.amount.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{inv.currency}</td>
                      <td className="px-6 py-4"><StatusBadge status={inv.status} /></td>
                      <td className="px-6 py-4 text-sm text-slate-500">{new Date(inv.issuedDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{new Date(inv.dueDate).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {invoices.length === 0 && (
                    <tr><td colSpan={7} className="px-6 py-8 text-center text-sm text-slate-500">No invoices found</td></tr>
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
