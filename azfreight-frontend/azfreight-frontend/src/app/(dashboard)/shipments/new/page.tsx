'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createShipment } from '@/lib/api/shipments';
import { listClients } from '@/lib/api/clients';
import { listCarriers } from '@/lib/api/carriers';
import type { Client, Carrier } from '@/types';
import Loading from '@/components/loading';

const TRANSPORT_OPTIONS = [
  { value: 'road_tir', label: 'Road/TIR' },
  { value: 'sea', label: 'Sea' },
  { value: 'air', label: 'Air' },
  { value: 'rail', label: 'Rail' },
];

export default function NewShipmentPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    transportType: 'road_tir',
    clientId: '',
    carrierId: '',
    originCountry: '',
    originCity: '',
    originAddress: '',
    destinationCountry: '',
    destinationCity: '',
    destinationAddress: '',
    cargoDescription: '',
    cargoWeight: '',
    cargoVolume: '',
    packageCount: '',
    clientRate: '',
    carrierRate: '',
    currency: 'USD',
    eta: '',
    containerNumber: '',
    blNumber: '',
    vesselName: '',
    awbNumber: '',
    flightNumber: '',
    truckPlate: '',
    tirNumber: '',
    wagonNumbers: '',
    notes: '',
  });

  useEffect(() => {
    Promise.all([
      listClients({ limit: 500 }),
      listCarriers({ limit: 500 }),
    ]).then(([c, ca]) => {
      setClients(c.data);
      setCarriers(ca.data);
    }).finally(() => setLoadingData(false));
  }, []);

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const body: Record<string, unknown> = {
        transportType: form.transportType,
        clientId: form.clientId,
        originCountry: form.originCountry,
        originCity: form.originCity,
        destinationCountry: form.destinationCountry,
        destinationCity: form.destinationCity,
        currency: form.currency,
      };
      if (form.carrierId) body.carrierId = form.carrierId;
      if (form.originAddress) body.originAddress = form.originAddress;
      if (form.destinationAddress) body.destinationAddress = form.destinationAddress;
      if (form.cargoDescription) body.cargoDescription = form.cargoDescription;
      if (form.cargoWeight) body.cargoWeight = parseFloat(form.cargoWeight);
      if (form.cargoVolume) body.cargoVolume = parseFloat(form.cargoVolume);
      if (form.packageCount) body.packageCount = parseInt(form.packageCount);
      if (form.clientRate) body.clientRate = parseFloat(form.clientRate);
      if (form.carrierRate) body.carrierRate = parseFloat(form.carrierRate);
      if (form.eta) body.eta = form.eta;
      if (form.containerNumber) body.containerNumber = form.containerNumber;
      if (form.blNumber) body.blNumber = form.blNumber;
      if (form.vesselName) body.vesselName = form.vesselName;
      if (form.awbNumber) body.awbNumber = form.awbNumber;
      if (form.flightNumber) body.flightNumber = form.flightNumber;
      if (form.truckPlate) body.truckPlate = form.truckPlate;
      if (form.tirNumber) body.tirNumber = form.tirNumber;
      if (form.wagonNumbers) body.wagonNumbers = form.wagonNumbers;
      if (form.notes) body.notes = form.notes;

      const shipment = await createShipment(body);
      router.push(`/shipments/${shipment.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create shipment');
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingData) return <Loading />;

  return (
    <div className="max-w-4xl">
      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>
        )}

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Transport & Parties</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label-field">Transport Type *</label>
              <select value={form.transportType} onChange={(e) => updateField('transportType', e.target.value)} className="input-field" required>
                {TRANSPORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label-field">Currency</label>
              <input type="text" value={form.currency} onChange={(e) => updateField('currency', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="label-field">Client *</label>
              <select value={form.clientId} onChange={(e) => updateField('clientId', e.target.value)} className="input-field" required>
                <option value="">Select client</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.companyName}</option>)}
              </select>
            </div>
            <div>
              <label className="label-field">Carrier</label>
              <select value={form.carrierId} onChange={(e) => updateField('carrierId', e.target.value)} className="input-field">
                <option value="">Select carrier</option>
                {carriers.map((c) => <option key={c.id} value={c.id}>{c.companyName}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Route</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label-field">Origin Country *</label>
              <input type="text" value={form.originCountry} onChange={(e) => updateField('originCountry', e.target.value)} className="input-field" required />
            </div>
            <div>
              <label className="label-field">Origin City *</label>
              <input type="text" value={form.originCity} onChange={(e) => updateField('originCity', e.target.value)} className="input-field" required />
            </div>
            <div>
              <label className="label-field">Origin Address</label>
              <input type="text" value={form.originAddress} onChange={(e) => updateField('originAddress', e.target.value)} className="input-field" />
            </div>
            <div className="hidden md:block" />
            <div>
              <label className="label-field">Destination Country *</label>
              <input type="text" value={form.destinationCountry} onChange={(e) => updateField('destinationCountry', e.target.value)} className="input-field" required />
            </div>
            <div>
              <label className="label-field">Destination City *</label>
              <input type="text" value={form.destinationCity} onChange={(e) => updateField('destinationCity', e.target.value)} className="input-field" required />
            </div>
            <div>
              <label className="label-field">Destination Address</label>
              <input type="text" value={form.destinationAddress} onChange={(e) => updateField('destinationAddress', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="label-field">ETA</label>
              <input type="datetime-local" value={form.eta} onChange={(e) => updateField('eta', e.target.value)} className="input-field" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Cargo</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="label-field">Description</label>
              <input type="text" value={form.cargoDescription} onChange={(e) => updateField('cargoDescription', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="label-field">Weight (kg)</label>
              <input type="number" step="0.01" value={form.cargoWeight} onChange={(e) => updateField('cargoWeight', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="label-field">Volume (m³)</label>
              <input type="number" step="0.01" value={form.cargoVolume} onChange={(e) => updateField('cargoVolume', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="label-field">Package Count</label>
              <input type="number" value={form.packageCount} onChange={(e) => updateField('packageCount', e.target.value)} className="input-field" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Financials</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label-field">Client Rate</label>
              <input type="number" step="0.01" value={form.clientRate} onChange={(e) => updateField('clientRate', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="label-field">Carrier Rate</label>
              <input type="number" step="0.01" value={form.carrierRate} onChange={(e) => updateField('carrierRate', e.target.value)} className="input-field" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Transport Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label-field">Container Number</label>
              <input type="text" value={form.containerNumber} onChange={(e) => updateField('containerNumber', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="label-field">B/L Number</label>
              <input type="text" value={form.blNumber} onChange={(e) => updateField('blNumber', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="label-field">Vessel Name</label>
              <input type="text" value={form.vesselName} onChange={(e) => updateField('vesselName', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="label-field">AWB Number</label>
              <input type="text" value={form.awbNumber} onChange={(e) => updateField('awbNumber', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="label-field">Flight Number</label>
              <input type="text" value={form.flightNumber} onChange={(e) => updateField('flightNumber', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="label-field">Truck Plate</label>
              <input type="text" value={form.truckPlate} onChange={(e) => updateField('truckPlate', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="label-field">TIR Number</label>
              <input type="text" value={form.tirNumber} onChange={(e) => updateField('tirNumber', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="label-field">Wagon Numbers</label>
              <input type="text" value={form.wagonNumbers} onChange={(e) => updateField('wagonNumbers', e.target.value)} className="input-field" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Notes</h2>
          <textarea value={form.notes} onChange={(e) => updateField('notes', e.target.value)} className="input-field" rows={3} />
        </div>

        <div className="flex gap-4">
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? 'Creating...' : 'Create Shipment'}
          </button>
          <button type="button" onClick={() => router.back()} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
}
