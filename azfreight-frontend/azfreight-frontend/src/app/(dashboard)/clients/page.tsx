'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { listClients } from '@/lib/api/clients';
import type { Client } from '@/types';
import Pagination from '@/components/pagination';
import Loading from '@/components/loading';

export default function ClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const limit = 20;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listClients({ page, limit, search: search || undefined });
      setClients(res.data);
      setTotal(res.total);
    } catch { /* ignore */ }
    setLoading(false);
  }, [page, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <input
          type="text"
          placeholder="Search clients..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="input-field w-64"
        />
        <Link href="/clients/new" className="btn-primary">New Client</Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        {loading ? <Loading /> : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Company Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Country</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">City</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {clients.map((c, idx) => (
                    <tr
                      key={c.id}
                      onClick={() => router.push(`/clients/${c.id}`)}
                      className={`cursor-pointer hover:bg-slate-50 ${idx % 2 === 1 ? 'bg-slate-50/50' : ''}`}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{c.companyName}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{c.country || '—'}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{c.city || '—'}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{c.phone || '—'}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{c.email || '—'}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${c.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {c.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {clients.length === 0 && (
                    <tr><td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-500">No clients found</td></tr>
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
