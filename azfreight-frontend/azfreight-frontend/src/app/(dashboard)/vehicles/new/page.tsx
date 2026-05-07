'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createVehicle } from '@/lib/api/vehicles';
import { useTranslation } from '@/lib/i18n';

export default function NewVehiclePage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    plateNumber: '', brand: '', model: '', year: '', vin: '',
    capacityTons: '', volumeCbm: '', fuelType: '', status: 'available',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data: Record<string, unknown> = { plateNumber: form.plateNumber, status: form.status };
      if (form.brand) data.brand = form.brand;
      if (form.model) data.model = form.model;
      if (form.year) data.year = Number(form.year);
      if (form.vin) data.vin = form.vin;
      if (form.capacityTons) data.capacityTons = Number(form.capacityTons);
      if (form.volumeCbm) data.volumeCbm = Number(form.volumeCbm);
      if (form.fuelType) data.fuelType = form.fuelType;
      const vehicle = await createVehicle(data);
      router.push(`/vehicles/${vehicle.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create');
    } finally {
      setLoading(false);
    }
  };

  const ic = 'w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm';
  const lc = 'block text-sm font-medium text-slate-700 mb-1';

  return (
    <div className="max-w-2xl">
      <Link href="/vehicles" className="text-sm text-blue-600 hover:text-blue-700 mb-4 inline-block">← {t('vehicles.title')}</Link>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">New Vehicle</h1>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><label className={lc}>Plate Number *</label><input className={ic} value={form.plateNumber} onChange={(e) => setForm((p) => ({ ...p, plateNumber: e.target.value }))} required /></div>
          <div><label className={lc}>Status</label>
            <select className={ic} value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}>
              {['available', 'on_route', 'maintenance', 'inactive'].map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div><label className={lc}>Brand</label><input className={ic} value={form.brand} onChange={(e) => setForm((p) => ({ ...p, brand: e.target.value }))} /></div>
          <div><label className={lc}>Model</label><input className={ic} value={form.model} onChange={(e) => setForm((p) => ({ ...p, model: e.target.value }))} /></div>
          <div><label className={lc}>Year</label><input type="number" className={ic} value={form.year} onChange={(e) => setForm((p) => ({ ...p, year: e.target.value }))} /></div>
          <div><label className={lc}>VIN</label><input className={ic} value={form.vin} onChange={(e) => setForm((p) => ({ ...p, vin: e.target.value }))} /></div>
          <div><label className={lc}>Capacity (tons)</label><input type="number" step="0.01" className={ic} value={form.capacityTons} onChange={(e) => setForm((p) => ({ ...p, capacityTons: e.target.value }))} /></div>
          <div><label className={lc}>Volume (cbm)</label><input type="number" step="0.01" className={ic} value={form.volumeCbm} onChange={(e) => setForm((p) => ({ ...p, volumeCbm: e.target.value }))} /></div>
          <div><label className={lc}>Fuel Type</label>
            <select className={ic} value={form.fuelType} onChange={(e) => setForm((p) => ({ ...p, fuelType: e.target.value }))}>
              <option value="">—</option><option value="diesel">Diesel</option><option value="petrol">Petrol</option><option value="gas">Gas/LPG</option><option value="electric">Electric</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">{loading ? 'Creating...' : 'Create Vehicle'}</button>
          <Link href="/vehicles" className="btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
