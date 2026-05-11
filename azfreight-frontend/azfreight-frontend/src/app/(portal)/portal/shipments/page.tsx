'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import StatusBadge from '@/components/status-badge';
import Loading from '@/components/loading';
import { useTranslation } from '@/lib/i18n';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

interface PortalShipment {
  id: string;
  referenceNumber: string;
  status: string;
  transportType: string;
  originCity: string;
  originCountry: string;
  destinationCity: string;
  destinationCountry: string;
  cargoDescription: string | null;
  eta: string | null;
  createdAt: string;
  customStatus?: { name: string; color: string } | null;
}

interface PortalRequest {
  id: string;
  requesterName: string;
  originCity: string;
  destinationCity: string;
  cargoType: string;
  status: string;
  requestStatus: string;
  isUrgent: boolean;
  createdAt: string;
}

async function fetchPortal<T>(path: string): Promise<T> {
  const token = localStorage.getItem('portalToken');
  const res = await fetch(`${API_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error('Failed');
  return res.json();
}

export default function PortalShipmentsPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [shipments, setShipments] = useState<PortalShipment[]>([]);
  const [requests, setRequests] = useState<PortalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'shipments' | 'requests'>('shipments');

  useEffect(() => {
    const token = localStorage.getItem('portalToken');
    if (!token) {
      setLoading(false);
      return;
    }

    Promise.all([
      fetchPortal<PortalShipment[]>('/public/portal/my-shipments').catch(() => []),
      fetchPortal<PortalRequest[]>('/public/portal/my-requests').catch(() => []),
    ]).then(([s, r]) => {
      setShipments(s);
      setRequests(r);
    }).finally(() => setLoading(false));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('portalToken');
    localStorage.removeItem('portalClient');
    router.push('/portal');
  };

  const clientData = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('portalClient') || '{}') : {};

  if (loading) return <Loading />;

  if (!localStorage.getItem('portalToken')) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Session expired</h2>
          <p className="text-slate-500 mb-4">Please use the magic link from your email to sign in.</p>
          <a href="/portal" className="btn-primary">Back to Portal</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-slate-900">{clientData.companyName || 'My Portal'}</h1>
            <p className="text-xs text-slate-500">{clientData.email}</p>
          </div>
          <button onClick={handleLogout} className="text-sm text-slate-600 hover:text-slate-900">
            {t('auth.signIn') === 'Sign in' ? 'Logout' : 'Выйти'}
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 sm:p-8">
        {/* Tabs */}
        <div className="flex gap-1 mb-6">
          <button
            onClick={() => setTab('shipments')}
            className={`px-4 py-2 text-sm font-medium rounded-lg ${tab === 'shipments' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 border border-slate-200'}`}
          >
            {t('nav.shipments')} ({shipments.length})
          </button>
          <button
            onClick={() => setTab('requests')}
            className={`px-4 py-2 text-sm font-medium rounded-lg ${tab === 'requests' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 border border-slate-200'}`}
          >
            {t('nav.requests')} ({requests.length})
          </button>
        </div>

        {/* Shipments */}
        {tab === 'shipments' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('dashboard.refNumber')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('requestsList.route')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('common.status')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('tracking.eta')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('common.date')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {shipments.map((s) => (
                    <tr key={s.id} onClick={() => router.push(`/portal/shipments/${s.id}`)} className="cursor-pointer hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm font-medium text-blue-600">{s.referenceNumber}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{s.originCity} → {s.destinationCity}</td>
                      <td className="px-6 py-4"><StatusBadge status={s.status} /></td>
                      <td className="px-6 py-4 text-sm text-slate-500">{s.eta ? new Date(s.eta).toLocaleDateString() : '—'}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{new Date(s.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {shipments.length === 0 && (
                    <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-500">{t('shipmentsList.noShipmentsFound')}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Requests */}
        {tab === 'requests' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('requestsList.route')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('requestsList.cargo')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('common.status')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('common.date')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {requests.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm text-slate-700">{r.originCity} → {r.destinationCity}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{t('cargoTypes.' + r.cargoType)}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-slate-100 text-slate-700">
                          {r.requestStatus ? t('requestStatus.' + r.requestStatus) : r.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">{new Date(r.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {requests.length === 0 && (
                    <tr><td colSpan={4} className="px-6 py-8 text-center text-sm text-slate-500">{t('requestsList.noRequestsFound')}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
