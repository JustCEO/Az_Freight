'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getVehicle, updateVehicle, deleteVehicle, type Vehicle } from '@/lib/api/vehicles';
import { useTranslation } from '@/lib/i18n';
import Loading from '@/components/loading';

const STATUSES = ['available', 'on_route', 'maintenance', 'inactive'];
const TRAILER_TYPES = ['CURTAINSIDER', 'FLATBED', 'REEFER', 'TANKER', 'BOX', 'LOWBOY', 'OTHER'];
const FUEL_TYPES = ['EURO5', 'EURO6', 'DIESEL', 'ELECTRIC', 'OTHER'];

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
      const rec = v as unknown as Record<string, unknown>;
      setForm({
        plateNumber: v.plateNumber, brand: v.brand || '', model: v.model || '',
        year: v.year ? String(v.year) : '', vin: v.vin || '', status: v.status,
        capacityTons: v.capacityTons ? String(v.capacityTons) : '',
        volumeCbm: v.volumeCbm ? String(v.volumeCbm) : '',
        fuelType: v.fuelType || '',
        // New fields
        trailerType: (rec.trailerType as string) || '',
        tareWeightKg: rec.tareWeightKg != null ? String(rec.tareWeightKg) : '',
        lastMaintenanceDate: rec.lastMaintenanceDate ? String(rec.lastMaintenanceDate).slice(0, 10) : '',
        maintenanceNotes: (rec.maintenanceNotes as string) || '',
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
      // New fields
      if (form.trailerType) data.trailerType = form.trailerType;
      if (form.tareWeightKg) data.tareWeightKg = Number(form.tareWeightKg);
      if (form.lastMaintenanceDate) data.lastMaintenanceDate = form.lastMaintenanceDate;
      if (form.maintenanceNotes) data.maintenanceNotes = form.maintenanceNotes;
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

  const rec = vehicle as unknown as Record<string, unknown>;
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

      {/* Basic Info */}
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

      {/* Technical */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mt-6">
        <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Technical</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-slate-500">Trailer Type</p>
            {editing ? (
              <select className={ic} value={form.trailerType || ''} onChange={(e) => setForm((p) => ({ ...p, trailerType: e.target.value }))}>
                <option value="">Select...</option>
                {TRAILER_TYPES.map((tt) => <option key={tt} value={tt}>{tt}</option>)}
              </select>
            ) : (
              <p className="font-medium text-slate-900">{String(rec.trailerType || '—')}</p>
            )}
          </div>
          <div>
            <p className="text-sm text-slate-500">Tare Weight (kg)</p>
            {editing ? (
              <input type="number" className={ic} value={form.tareWeightKg || ''} onChange={(e) => setForm((p) => ({ ...p, tareWeightKg: e.target.value }))} />
            ) : (
              <p className="font-medium text-slate-900">{rec.tareWeightKg != null ? String(rec.tareWeightKg) : '—'}</p>
            )}
          </div>
          <div>
            <p className="text-sm text-slate-500">Fuel Type</p>
            {editing ? (
              <select className={ic} value={form.fuelType || ''} onChange={(e) => setForm((p) => ({ ...p, fuelType: e.target.value }))}>
                <option value="">Select...</option>
                {FUEL_TYPES.map((ft) => <option key={ft} value={ft}>{ft}</option>)}
              </select>
            ) : (
              <p className="font-medium text-slate-900">{vehicle.fuelType || '—'}</p>
            )}
          </div>
        </div>
      </div>

      {/* Maintenance */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mt-6">
        <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Maintenance</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-slate-500">Last Maintenance Date</p>
            {editing ? (
              <input type="date" className={ic} value={form.lastMaintenanceDate || ''} onChange={(e) => setForm((p) => ({ ...p, lastMaintenanceDate: e.target.value }))} />
            ) : (
              <p className="font-medium text-slate-900">{rec.lastMaintenanceDate ? new Date(String(rec.lastMaintenanceDate)).toLocaleDateString() : '—'}</p>
            )}
          </div>
          <div className="col-span-2">
            <p className="text-sm text-slate-500">Maintenance Notes</p>
            {editing ? (
              <textarea className={ic} rows={3} value={form.maintenanceNotes || ''} onChange={(e) => setForm((p) => ({ ...p, maintenanceNotes: e.target.value }))} />
            ) : (
              <p className="font-medium text-slate-900 whitespace-pre-wrap">{String(rec.maintenanceNotes || '—')}</p>
            )}
          </div>
        </div>
      </div>

      <div className="text-xs text-slate-400 mt-4">Created {new Date(vehicle.createdAt).toLocaleString()}</div>
    </div>
  );
}
