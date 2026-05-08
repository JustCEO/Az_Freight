'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createShipment } from '@/lib/api/shipments';
import { listClients } from '@/lib/api/clients';
import { listCarriers } from '@/lib/api/carriers';
import type { Client, Carrier } from '@/types';
import Loading from '@/components/loading';
import { useTranslation } from '@/lib/i18n';

export default function NewShipmentPage() {
  const router = useRouter();
  const { t } = useTranslation();
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
    weightKg: '',
    volumeCbm: '',
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
      if (form.weightKg) body.weightKg = parseFloat(form.weightKg);
      if (form.volumeCbm) body.volumeCbm = parseFloat(form.volumeCbm);
      if (form.packageCount) body.packageCount = parseInt(form.packageCount);
      if (form.clientRate) body.clientRate = parseFloat(form.clientRate);
      if (form.carrierRate) body.carrierRate = parseFloat(form.carrierRate);
      if (form.eta) body.eta = form.eta;
      // Only submit transport details relevant to the selected transport type
      const relevantFields: Record<string, string[]> = {
        road_tir: ['truckPlate', 'tirNumber'],
        sea: ['containerNumber', 'blNumber', 'vesselName'],
        air: ['awbNumber', 'flightNumber'],
        rail: ['wagonNumbers', 'containerNumber'],
      };
      const allowed = relevantFields[form.transportType] || [];
      for (const field of allowed) {
        const val = (form as Record<string, string>)[field];
        if (val) body[field] = val;
      }
      if (form.notes) body.notes = form.notes;

      const shipment = await createShipment(body);
      router.push(`/shipments/${shipment.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('newShipment.failedToCreate'));
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
          <h2 className="text-lg font-semibold text-slate-900 mb-4">{t('newShipment.transportAndParties')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label-field">{t('newShipment.transportTypeRequired')}</label>
              <select value={form.transportType} onChange={(e) => updateField('transportType', e.target.value)} className="input-field" required>
                {[
                  { value: 'road_tir', key: 'transport.road_tir' },
                  { value: 'sea', key: 'transport.sea' },
                  { value: 'air', key: 'transport.air' },
                  { value: 'rail', key: 'transport.rail' },
                ].map((o) => <option key={o.value} value={o.value}>{t(o.key)}</option>)}
              </select>
            </div>
            <div>
              <label className="label-field">{t('newShipment.currency')}</label>
              <input type="text" value={form.currency} onChange={(e) => updateField('currency', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="label-field">{t('newShipment.clientRequired')}</label>
              <select value={form.clientId} onChange={(e) => updateField('clientId', e.target.value)} className="input-field" required>
                <option value="">{t('newShipment.selectClient')}</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.companyName}</option>)}
              </select>
            </div>
            <div>
              <label className="label-field">{t('newShipment.carrier')}</label>
              <select value={form.carrierId} onChange={(e) => updateField('carrierId', e.target.value)} className="input-field">
                <option value="">{t('newShipment.selectCarrier')}</option>
                {carriers.map((c) => <option key={c.id} value={c.id}>{c.companyName}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">{t('newShipment.route')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label-field">{t('newShipment.originCountryRequired')}</label>
              <input type="text" value={form.originCountry} onChange={(e) => updateField('originCountry', e.target.value)} className="input-field" required />
            </div>
            <div>
              <label className="label-field">{t('newShipment.originCityRequired')}</label>
              <input type="text" value={form.originCity} onChange={(e) => updateField('originCity', e.target.value)} className="input-field" required />
            </div>
            <div>
              <label className="label-field">{t('newShipment.originAddress')}</label>
              <input type="text" value={form.originAddress} onChange={(e) => updateField('originAddress', e.target.value)} className="input-field" />
            </div>
            <div className="hidden md:block" />
            <div>
              <label className="label-field">{t('newShipment.destinationCountryRequired')}</label>
              <input type="text" value={form.destinationCountry} onChange={(e) => updateField('destinationCountry', e.target.value)} className="input-field" required />
            </div>
            <div>
              <label className="label-field">{t('newShipment.destinationCityRequired')}</label>
              <input type="text" value={form.destinationCity} onChange={(e) => updateField('destinationCity', e.target.value)} className="input-field" required />
            </div>
            <div>
              <label className="label-field">{t('newShipment.destinationAddress')}</label>
              <input type="text" value={form.destinationAddress} onChange={(e) => updateField('destinationAddress', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="label-field">{t('newShipment.eta')}</label>
              <input type="datetime-local" value={form.eta} onChange={(e) => updateField('eta', e.target.value)} className="input-field" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">{t('newShipment.cargo')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="label-field">{t('common.description')}</label>
              <input type="text" value={form.cargoDescription} onChange={(e) => updateField('cargoDescription', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="label-field">{t('newShipment.weight')}</label>
              <input type="number" step="0.01" value={form.weightKg} onChange={(e) => updateField('weightKg', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="label-field">{t('newShipment.volume')}</label>
              <input type="number" step="0.01" value={form.volumeCbm} onChange={(e) => updateField('volumeCbm', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="label-field">{t('newShipment.packageCount')}</label>
              <input type="number" value={form.packageCount} onChange={(e) => updateField('packageCount', e.target.value)} className="input-field" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">{t('newShipment.financials')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label-field">{t('newShipment.clientRate')}</label>
              <input type="number" step="0.01" value={form.clientRate} onChange={(e) => updateField('clientRate', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="label-field">{t('newShipment.carrierRate')}</label>
              <input type="number" step="0.01" value={form.carrierRate} onChange={(e) => updateField('carrierRate', e.target.value)} className="input-field" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">{t('newShipment.transportDetails')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(form.transportType === 'road_tir') && (
              <>
                <div>
                  <label className="label-field">{t('newShipment.truckPlate')}</label>
                  <input type="text" value={form.truckPlate} onChange={(e) => updateField('truckPlate', e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="label-field">{t('newShipment.tirNumber')}</label>
                  <input type="text" value={form.tirNumber} onChange={(e) => updateField('tirNumber', e.target.value)} className="input-field" />
                </div>
              </>
            )}
            {(form.transportType === 'sea') && (
              <>
                <div>
                  <label className="label-field">{t('newShipment.containerNumber')}</label>
                  <input type="text" value={form.containerNumber} onChange={(e) => updateField('containerNumber', e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="label-field">{t('newShipment.blNumber')}</label>
                  <input type="text" value={form.blNumber} onChange={(e) => updateField('blNumber', e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="label-field">{t('newShipment.vesselName')}</label>
                  <input type="text" value={form.vesselName} onChange={(e) => updateField('vesselName', e.target.value)} className="input-field" />
                </div>
              </>
            )}
            {(form.transportType === 'air') && (
              <>
                <div>
                  <label className="label-field">{t('newShipment.awbNumber')}</label>
                  <input type="text" value={form.awbNumber} onChange={(e) => updateField('awbNumber', e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="label-field">{t('newShipment.flightNumber')}</label>
                  <input type="text" value={form.flightNumber} onChange={(e) => updateField('flightNumber', e.target.value)} className="input-field" />
                </div>
              </>
            )}
            {(form.transportType === 'rail') && (
              <>
                <div>
                  <label className="label-field">{t('newShipment.wagonNumbers')}</label>
                  <input type="text" value={form.wagonNumbers} onChange={(e) => updateField('wagonNumbers', e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="label-field">{t('newShipment.containerNumber')}</label>
                  <input type="text" value={form.containerNumber} onChange={(e) => updateField('containerNumber', e.target.value)} className="input-field" />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">{t('common.notes')}</h2>
          <textarea value={form.notes} onChange={(e) => updateField('notes', e.target.value)} className="input-field" rows={3} />
        </div>

        <div className="flex gap-4">
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? t('newShipment.creating') : t('newShipment.createShipment')}
          </button>
          <button type="button" onClick={() => router.back()} className="btn-secondary">{t('common.cancel')}</button>
        </div>
      </form>
    </div>
  );
}
