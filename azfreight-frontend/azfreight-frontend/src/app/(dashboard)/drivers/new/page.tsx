'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createDriver } from '@/lib/api/drivers';
import { useTranslation } from '@/lib/i18n';

const LICENSE_TYPES = ['B', 'C', 'CE', 'D', 'DE'];

export default function NewDriverPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '', phone: '', email: '', licenseNumber: '', licenseExpiry: '',
    licenseCategories: [] as string[], medicalExpiry: '', passportNumber: '', passportExpiry: '',
  });

  const toggleCategory = (cat: string) => {
    setForm((p) => ({
      ...p,
      licenseCategories: p.licenseCategories.includes(cat)
        ? p.licenseCategories.filter((c) => c !== cat)
        : [...p.licenseCategories, cat],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data: Record<string, unknown> = { name: form.name };
      if (form.phone) data.phone = form.phone;
      if (form.email) data.email = form.email;
      if (form.licenseNumber) data.licenseNumber = form.licenseNumber;
      if (form.licenseExpiry) data.licenseExpiry = form.licenseExpiry;
      if (form.licenseCategories.length) data.licenseCategories = form.licenseCategories;
      if (form.medicalExpiry) data.medicalExpiry = form.medicalExpiry;
      if (form.passportNumber) data.passportNumber = form.passportNumber;
      if (form.passportExpiry) data.passportExpiry = form.passportExpiry;
      const driver = await createDriver(data);
      router.push(`/drivers/${driver.id}`);
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
      <Link href="/drivers" className="text-sm text-blue-600 hover:text-blue-700 mb-4 inline-block">← {t('drivers.title')}</Link>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">New Driver</h1>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><label className={lc}>Full Name *</label><input className={ic} value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required /></div>
          <div><label className={lc}>Phone</label><input className={ic} value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} /></div>
          <div><label className={lc}>Email</label><input type="email" className={ic} value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} /></div>
          <div><label className={lc}>License Number</label><input className={ic} value={form.licenseNumber} onChange={(e) => setForm((p) => ({ ...p, licenseNumber: e.target.value }))} /></div>
          <div><label className={lc}>License Expiry</label><input type="date" className={ic} value={form.licenseExpiry} onChange={(e) => setForm((p) => ({ ...p, licenseExpiry: e.target.value }))} /></div>
          <div><label className={lc}>Medical Expiry</label><input type="date" className={ic} value={form.medicalExpiry} onChange={(e) => setForm((p) => ({ ...p, medicalExpiry: e.target.value }))} /></div>
          <div><label className={lc}>Passport Number</label><input className={ic} value={form.passportNumber} onChange={(e) => setForm((p) => ({ ...p, passportNumber: e.target.value }))} /></div>
          <div><label className={lc}>Passport Expiry</label><input type="date" className={ic} value={form.passportExpiry} onChange={(e) => setForm((p) => ({ ...p, passportExpiry: e.target.value }))} /></div>
        </div>
        <div>
          <label className={lc}>License Categories</label>
          <div className="flex gap-2">
            {LICENSE_TYPES.map((cat) => (
              <button key={cat} type="button" onClick={() => toggleCategory(cat)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors ${
                  form.licenseCategories.includes(cat) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}>
                {cat}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">{loading ? 'Creating...' : 'Create Driver'}</button>
          <Link href="/drivers" className="btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
