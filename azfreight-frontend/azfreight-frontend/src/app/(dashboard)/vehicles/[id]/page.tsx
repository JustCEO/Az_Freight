'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getVehicle, updateVehicle, deleteVehicle, type Vehicle } from '@/lib/api/vehicles';
import { useTranslation } from '@/lib/i18n';
import Loading from '@/components/loading';

const STATUSES = ['available', 'on_route', 'maintenance', 'inactive'];

export default function VehicleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useTranslation();
  const id = params.id as string;
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    try {
      const v = await getVehicle(id);
      setVehicle(v);
      setForm({
        plateNumber: v.plateNumber, brand: v.brand || '', model: v.model || '',
        year: v.year ? String(v.year) : '', vin: v.vin || '', status: v.status,
        capacityTons: v.capacityTons ? String(v.capacityTons) : '',
        volumeCbm: v.volumeCbm ? String(v.volumeCbm) : '',
        fuelType: v.fuelType || '',
      });
    } catch { router.push('/vehicles'); }
    finally { setLoading(false); }
  }, [id, router]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const data: Record<string, unknown> = { plateNumber: form.plateNumber, status: form.status };
      if (form.brand) data.brand = form.brand;
      if (form.model) data.model = form.model;
      if (form.year) data.year = Number(form.year);
      if (form.vin) data.vin = form.vin;
      if (form.capacityTons) data.capacityTons = Number(form.capacityTons);
      if (form.volumeCbm) data.volumeCbm = Number(form.volumeCbm);
      if (form.fuelType) data.fuelType = form.fuelType;
      await updateVehicle(id, data);
      setEditing(false);
      await load();
    } catch (err: unknown) { alert(err instanceof Error ? err.message : 'Error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this vehicle?')) return;
    await deleteVehicle(id);
    router.push('/vehicles');
  };

  if (loading) return <Loading />;
  if (!vehicle) return null;

  const ic = 'w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm';

  const fields: [string, string, string][] = [
    ['Plate Number', 'plateNumber', vehicle.plateNumber],
    ['Brand', 'brand', vehicle.brand || '—'],
    ['Model', 'model', vehicle.model || '—'],
    ['Year', 'year', vehicle.year ? String(vehicle.year) : '—'],
    ['VIN', 'vin', vehicle.vin || '—'],
    ['Status', 'status', vehicle.status.replace('_', ' ')],
    ['Capacity (tons)', 'capacityTons', vehicle.capacityTons ? String(vehicle.capacityTons) : '—'],
    ['Volume (cbm)', 'volumeCbm', vehicle.volumeCbm ? String(vehicle.volumeCbm) : '—'],
    ['Fuel Type', 'fuelType', vehicle.fuelType || '—'],
  ];

  return (
    <div className="max-w-2xl">
      <Link href="/vehicles" className="text-sm text-blue-600 hover:text-blue-700 mb-4 inline-block">← {t('vehicles.title')}</Link>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{vehicle.plateNumber}</h1>
        <div className="flex gap-2">
          {!editing ? (
            <><button onClick={() => setEditing(true)} className="btn-secondary text-sm">Edit</button>
            <button onClick={handleDelete} className="btn-danger text-sm">Delete</button></>
          ) : (
            <><button onClick={handleSave} disabled={saving} className="btn-primary text-sm disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
            <button onClick={() => setEditing(false)} className="btn-secondary text-sm">Cancel</button></>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="grid grid-cols-2 gap-4">
          {fields.map(([label, key, display]) => (
            <div key={key}>
              <p className="text-sm text-slate-500">{label}</p>
              {editing && key !== 'status' ? (
                <input className={ic} value={form[key] || ''} onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))} />
              ) : editing && key === 'status' ? (
                <select className={ic} value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </select>
              ) : (
                <p className="font-medium text-slate-900">{display}</p>
              )}
            </div>
          ))}
          <div>
            <p className="text-sm text-slate-500">Assigned Driver</p>
            <p className="font-medium text-slate-900">
              {vehicle.driver ? <Link href={`/drivers/${vehicle.driver.id}`} className="text-blue-600">{vehicle.driver.name}</Link> : '—'}
            </p>
          </div>
        </div>
      </div>

      <div className="text-xs text-slate-400 mt-4">Created {new Date(vehicle.createdAt).toLocaleString()}</div>
    </div>
  );
}
