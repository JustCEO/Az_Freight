'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from '@/lib/i18n';
import Loading from '@/components/loading';
import {
  getOverview, getMonthlyStats, getTopRoutes, getTopClients, getCarrierPerformance,
  type ReportOverview, type MonthlyStats, type TopRoute, type TopClient, type CarrierPerformance,
} from '@/lib/api/reports';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
const STATUS_COLORS: Record<string, string> = {
  request: '#64748B', confirmed: '#3B82F6', in_transit: '#F59E0B',
  customs: '#EA580C', delivered: '#10B981', cancelled: '#EF4444',
};

export default function ReportsPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<ReportOverview | null>(null);
  const [monthly, setMonthly] = useState<MonthlyStats[]>([]);
  const [routes, setRoutes] = useState<TopRoute[]>([]);
  const [clients, setClients] = useState<TopClient[]>([]);
  const [carriers, setCarriers] = useState<CarrierPerformance[]>([]);

  useEffect(() => {
    Promise.all([
      getOverview().catch(() => null),
      getMonthlyStats().catch(() => []),
      getTopRoutes().catch(() => []),
      getTopClients().catch(() => []),
      getCarrierPerformance().catch(() => []),
    ]).then(([ov, mo, ro, cl, ca]) => {
      setOverview(ov);
      setMonthly(mo);
      setRoutes(ro);
      setClients(cl);
      setCarriers(ca);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  const fmt = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 0 });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">{t('reports.title')}</h1>

      {/* KPI Cards */}
      {overview && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="text-sm text-slate-500">{t('reports.totalShipments')}</div>
            <div className="text-3xl font-bold text-slate-900 mt-1">{overview.totalShipments}</div>
            <div className="text-xs text-blue-600 mt-1">{overview.activeShipments} {t('reports.active')}</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="text-sm text-slate-500">{t('reports.revenue')}</div>
            <div className="text-3xl font-bold text-emerald-700 mt-1">${fmt(overview.revenue.totalClientRate)}</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="text-sm text-slate-500">{t('reports.profit')}</div>
            <div className="text-3xl font-bold text-blue-700 mt-1">${fmt(overview.revenue.totalProfit)}</div>
            <div className="text-xs text-slate-500 mt-1">{t('reports.margin')}: {overview.revenue.totalClientRate ? ((overview.revenue.totalProfit / overview.revenue.totalClientRate) * 100).toFixed(1) : 0}%</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="text-sm text-slate-500">{t('reports.clients')}</div>
            <div className="text-3xl font-bold text-slate-900 mt-1">{overview.totalClients}</div>
            <div className="text-xs text-slate-500 mt-1">{overview.totalInvoices} {t('reports.invoices')}</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Chart */}
        {monthly.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">{t('reports.monthlyRevenue')}</h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" fontSize={12} tickFormatter={(v) => v.slice(5)} />
                <YAxis fontSize={12} />
                <Tooltip formatter={(v: unknown) => `$${fmt(Number(v))}`} />
                <Legend />
                <Bar dataKey="revenue" name={t('reports.revenue')} fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="cost" name={t('reports.cost')} fill="#F59E0B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="profit" name={t('reports.profit')} fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Shipments by Status */}
        {overview && overview.shipmentsByStatus.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">{t('reports.byStatus')}</h2>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={overview.shipmentsByStatus}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="count"
                  nameKey="status"
                  label
                >
                  {overview.shipmentsByStatus.map((s) => (
                    <Cell key={s.status} fill={STATUS_COLORS[s.status] || '#94A3B8'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Monthly Shipment Volume */}
        {monthly.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">{t('reports.monthlyVolume')}</h2>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" fontSize={12} tickFormatter={(v) => v.slice(5)} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="shipments" name={t('reports.shipments')} stroke="#3B82F6" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Top Routes */}
        {routes.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">{t('reports.topRoutes')}</h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={routes.slice(0, 6)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" fontSize={12} />
                <YAxis type="category" dataKey="route" fontSize={11} width={120} />
                <Tooltip />
                <Bar dataKey="count" name={t('reports.shipments')} fill="#8B5CF6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Clients */}
        {clients.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">{t('reports.topClients')}</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">{t('common.company')}</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-slate-500">{t('reports.shipments')}</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-slate-500">{t('reports.revenue')}</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-slate-500">{t('reports.profit')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {clients.map((c) => (
                    <tr key={c.clientId}>
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">{c.companyName}</td>
                      <td className="px-4 py-3 text-sm text-right text-slate-700">{c.shipments}</td>
                      <td className="px-4 py-3 text-sm text-right text-slate-700">${fmt(c.revenue)}</td>
                      <td className="px-4 py-3 text-sm text-right text-emerald-700">${fmt(c.profit)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Carrier Performance */}
        {carriers.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">{t('reports.carrierPerformance')}</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">{t('reports.carrier')}</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-slate-500">{t('reports.shipments')}</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-slate-500">{t('reports.totalCost')}</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-slate-500">{t('reports.rating')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {carriers.map((c) => (
                    <tr key={c.carrierId}>
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">{c.companyName}</td>
                      <td className="px-4 py-3 text-sm text-right text-slate-700">{c.shipments}</td>
                      <td className="px-4 py-3 text-sm text-right text-slate-700">${fmt(c.totalCost)}</td>
                      <td className="px-4 py-3 text-sm text-right text-slate-700">{c.rating ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
