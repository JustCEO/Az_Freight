'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createQuote } from '@/lib/api/quotes';
import { useTranslation } from '@/lib/i18n';

interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

const LOAD_SUBCATEGORIES: Record<string, string[]> = {
  GENERAL: ['Pallets', 'Boxes', 'Bags', 'Drums', 'Mixed'],
  HAZARDOUS: ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9'],
  PERISHABLE: ['Chilled', 'Frozen', 'Deep Frozen', 'Ambient'],
  OVERSIZED: ['Heavy Lift', 'Out of Gauge', 'Project Cargo'],
  BULK: ['Dry Bulk', 'Wet Bulk', 'Grain'],
  LIQUID: ['Tanker', 'IBC', 'Flexibag'],
  VALUABLE: [],
};

export default function NewQuotePage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [termsOpen, setTermsOpen] = useState(false);

  const [form, setForm] = useState({
    originCountry: '', originCity: '', destCountry: '', destCity: '',
    transportType: 'road_tir', cargoType: '', weightKg: '', volumeCbm: '',
    currency: 'USD', vatRate: 18, validDays: 14, notes: '', margin: '',
    clientId: '', leadId: '',
    // New fields
    routeType: '', loadType: '', loadSubCategory: '', termsConditions: '',
  });

  const [lines, setLines] = useState<LineItem[]>([
    { description: '', quantity: 1, unitPrice: 0 },
  ]);

  const subtotal = lines.reduce((sum, l) => sum + l.quantity * l.unitPrice, 0);
  const vatAmount = subtotal * form.vatRate / 100;
  const total = subtotal + vatAmount;

  const updateLine = (idx: number, field: keyof LineItem, value: string | number) => {
    setLines((prev) => prev.map((l, i) => i === idx ? { ...l, [field]: value } : l));
  };

  const addLine = () => setLines((prev) => [...prev, { description: '', quantity: 1, unitPrice: 0 }]);
  const removeLine = (idx: number) => setLines((prev) => prev.filter((_, i) => i !== idx));

  const subCategories = LOAD_SUBCATEGORIES[form.loadType] || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lines.length === 0 || lines.some((l) => !l.description || l.unitPrice <= 0)) {
      setError('Please fill in all line items');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data: Record<string, unknown> = {
        originCountry: form.originCountry, originCity: form.originCity,
        destCountry: form.destCountry, destCity: form.destCity,
        transportType: form.transportType, currency: form.currency,
        vatRate: form.vatRate, validDays: form.validDays,
        lines: lines.map((l) => ({ description: l.description, quantity: l.quantity, unitPrice: l.unitPrice })),
      };
      if (form.cargoType) data.cargoType = form.cargoType;
      if (form.weightKg) data.weightKg = Number(form.weightKg);
      if (form.volumeCbm) data.volumeCbm = Number(form.volumeCbm);
      if (form.notes) data.notes = form.notes;
      if (form.margin) data.margin = Number(form.margin);
      if (form.clientId) data.clientId = form.clientId;
      if (form.leadId) data.leadId = form.leadId;
      // New fields
      if (form.routeType) data.routeType = form.routeType;
      if (form.loadType) data.loadType = form.loadType;
      if (form.loadSubCategory) data.loadSubCategory = form.loadSubCategory;
      if (form.termsConditions) data.termsConditions = form.termsConditions;

      const quote = await createQuote(data);
      router.push(`/quotes/${quote.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create quote');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm';
  const labelCls = 'block text-sm font-medium text-slate-700 mb-1';

  return (
    <div className="max-w-4xl">
      <Link href="/quotes" className="text-sm text-blue-600 hover:text-blue-700 mb-4 inline-block">
        ← {t('quotes.title')}
      </Link>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">{t('quotes.new') === 'quotes.new' ? 'New Quote' : t('quotes.new')}</h1>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Route */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Route & Cargo</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Origin Country</label>
              <input className={inputCls} value={form.originCountry} onChange={(e) => setForm((p) => ({ ...p, originCountry: e.target.value }))} required />
            </div>
            <div>
              <label className={labelCls}>Origin City</label>
              <input className={inputCls} value={form.originCity} onChange={(e) => setForm((p) => ({ ...p, originCity: e.target.value }))} required />
            </div>
            <div>
              <label className={labelCls}>Destination Country</label>
              <input className={inputCls} value={form.destCountry} onChange={(e) => setForm((p) => ({ ...p, destCountry: e.target.value }))} required />
            </div>
            <div>
              <label className={labelCls}>Destination City</label>
              <input className={inputCls} value={form.destCity} onChange={(e) => setForm((p) => ({ ...p, destCity: e.target.value }))} required />
            </div>
            <div>
              <label className={labelCls}>Transport Type</label>
              <select className={inputCls} value={form.transportType} onChange={(e) => setForm((p) => ({ ...p, transportType: e.target.value }))}>
                <option value="road_tir">Road / TIR</option>
                <option value="sea">Sea</option>
                <option value="air">Air</option>
                <option value="rail">Rail</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Route Type</label>
              <select className={inputCls} value={form.routeType} onChange={(e) => setForm((p) => ({ ...p, routeType: e.target.value }))}>
                <option value="">Select...</option>
                <option value="DIRECT">Direct</option>
                <option value="TRANSIT">Transit</option>
                <option value="MULTIMODAL">Multimodal</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Cargo Type</label>
              <input className={inputCls} value={form.cargoType} onChange={(e) => setForm((p) => ({ ...p, cargoType: e.target.value }))} />
            </div>
            <div>
              <label className={labelCls}>Load Type</label>
              <select className={inputCls} value={form.loadType} onChange={(e) => setForm((p) => ({ ...p, loadType: e.target.value, loadSubCategory: '' }))}>
                <option value="">Select...</option>
                <option value="GENERAL">General</option>
                <option value="HAZARDOUS">Hazardous</option>
                <option value="PERISHABLE">Perishable</option>
                <option value="OVERSIZED">Oversized</option>
                <option value="VALUABLE">Valuable</option>
                <option value="BULK">Bulk</option>
                <option value="LIQUID">Liquid</option>
              </select>
            </div>
            {subCategories.length > 0 && (
              <div>
                <label className={labelCls}>Load Sub-Category</label>
                <select className={inputCls} value={form.loadSubCategory} onChange={(e) => setForm((p) => ({ ...p, loadSubCategory: e.target.value }))}>
                  <option value="">Select...</option>
                  {subCategories.map((sc) => <option key={sc} value={sc}>{sc}</option>)}
                </select>
              </div>
            )}
            <div>
              <label className={labelCls}>Weight (kg)</label>
              <input type="number" className={inputCls} value={form.weightKg} onChange={(e) => setForm((p) => ({ ...p, weightKg: e.target.value }))} />
            </div>
            <div>
              <label className={labelCls}>Volume (cbm)</label>
              <input type="number" step="0.001" className={inputCls} value={form.volumeCbm} onChange={(e) => setForm((p) => ({ ...p, volumeCbm: e.target.value }))} />
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-900">Line Items</h2>
            <button type="button" onClick={addLine} className="text-sm text-blue-600 hover:text-blue-700 font-medium">+ Add Row</button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 font-medium text-slate-600">Description</th>
                <th className="text-right py-2 font-medium text-slate-600 w-24">Qty</th>
                <th className="text-right py-2 font-medium text-slate-600 w-32">Unit Price</th>
                <th className="text-right py-2 font-medium text-slate-600 w-32">Total</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line, idx) => (
                <tr key={idx} className="border-b border-slate-100">
                  <td className="py-2 pr-2">
                    <input className={inputCls} placeholder="Service description" value={line.description}
                      onChange={(e) => updateLine(idx, 'description', e.target.value)} required />
                  </td>
                  <td className="py-2 px-1">
                    <input type="number" min={1} className={`${inputCls} text-right`} value={line.quantity}
                      onChange={(e) => updateLine(idx, 'quantity', Number(e.target.value))} />
                  </td>
                  <td className="py-2 px-1">
                    <input type="number" min={0} step="0.01" className={`${inputCls} text-right`} value={line.unitPrice}
                      onChange={(e) => updateLine(idx, 'unitPrice', Number(e.target.value))} />
                  </td>
                  <td className="py-2 pl-2 text-right font-medium text-slate-900">
                    {(line.quantity * line.unitPrice).toFixed(2)}
                  </td>
                  <td className="py-2 pl-1">
                    {lines.length > 1 && (
                      <button type="button" onClick={() => removeLine(idx)} className="text-red-500 hover:text-red-700 text-lg">×</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary & Settings */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Summary</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Currency</label>
              <select className={inputCls} value={form.currency} onChange={(e) => setForm((p) => ({ ...p, currency: e.target.value }))}>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="AZN">AZN</option>
                <option value="TRY">TRY</option>
                <option value="RUB">RUB</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Valid for (days)</label>
              <input type="number" min={1} className={inputCls} value={form.validDays}
                onChange={(e) => setForm((p) => ({ ...p, validDays: Number(e.target.value) }))} />
            </div>
            <div>
              <label className={labelCls}>VAT %</label>
              <input type="number" min={0} max={100} className={inputCls} value={form.vatRate}
                onChange={(e) => setForm((p) => ({ ...p, vatRate: Number(e.target.value) }))} />
            </div>
            <div>
              <label className={labelCls}>Margin %</label>
              <input type="number" min={0} step="0.1" className={inputCls} value={form.margin}
                onChange={(e) => setForm((p) => ({ ...p, margin: e.target.value }))} />
            </div>
          </div>

          <div className="mt-4 border-t border-slate-200 pt-4 space-y-2 text-right">
            <div className="text-sm text-slate-600">Subtotal: <span className="font-semibold text-slate-900">{subtotal.toFixed(2)} {form.currency}</span></div>
            <div className="text-sm text-slate-600">VAT ({form.vatRate}%): <span className="font-semibold text-slate-900">{vatAmount.toFixed(2)} {form.currency}</span></div>
            <div className="text-lg font-bold text-slate-900">Total: {total.toFixed(2)} {form.currency}</div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <label className={labelCls}>Notes</label>
          <textarea className={inputCls} rows={3} value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} />
        </div>

        {/* Terms & Conditions (collapsible) */}
        <div className="bg-white rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setTermsOpen(!termsOpen)}
            className="w-full flex items-center justify-between p-6 text-left"
          >
            <h2 className="text-sm font-semibold text-slate-900">Terms & Conditions</h2>
            <svg
              className={`w-5 h-5 text-slate-400 transition-transform ${termsOpen ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {termsOpen && (
            <div className="px-6 pb-6">
              <textarea
                className={inputCls}
                rows={6}
                value={form.termsConditions}
                onChange={(e) => setForm((p) => ({ ...p, termsConditions: e.target.value }))}
                placeholder="Enter terms and conditions..."
              />
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
            {loading ? 'Creating...' : 'Create Quote'}
          </button>
          <Link href="/quotes" className="btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
