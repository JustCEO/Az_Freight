'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getDriver, updateDriver, deleteDriver, type Driver } from '@/lib/api/drivers';
import { get, post, del } from '@/lib/api-client';
import { useTranslation } from '@/lib/i18n';
import Loading from '@/components/loading';

const STATUSES = ['available', 'on_route', 'on_leave', 'inactive'];
const LICENSE_TYPES = ['B', 'C', 'CE', 'D', 'DE'];

interface Training {
  id: string;
  title: string;
  issuedAt: string | null;
  expiresAt: string | null;
}

export default function DriverDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useTranslation();
  const id = params.id as string;
  const [driver, setDriver] = useState<Driver | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Record<string, unknown>>({});

  // Trainings state
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [showTrainingForm, setShowTrainingForm] = useState(false);
  const [trainingForm, setTrainingForm] = useState({ title: '', issuedAt: '', expiresAt: '' });
  const [trainingLoading, setTrainingLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      const d = await getDriver(id);
      setDriver(d);
      setForm({
        name: d.name, phone: d.phone || '', email: d.email || '',
        licenseNumber: d.licenseNumber || '', licenseExpiry: d.licenseExpiry?.slice(0, 10) || '',
        licenseCategories: d.licenseCategories || [],
        medicalExpiry: d.medicalExpiry?.slice(0, 10) || '',
        passportNumber: d.passportNumber || '', passportExpiry: d.passportExpiry?.slice(0, 10) || '',
        status: d.status,
      });
    } catch { router.push('/drivers'); }
    finally { setLoading(false); }
  }, [id, router]);

  const loadTrainings = useCallback(async () => {
    try {
      const data = await get<Training[]>(`/drivers/${id}/trainings`);
      setTrainings(Array.isArray(data) ? data : []);
    } catch { setTrainings([]); }
  }, [id]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { loadTrainings(); }, [loadTrainings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const data: Record<string, unknown> = { name: form.name, status: form.status };
      if (form.phone) data.phone = form.phone;
      if (form.email) data.email = form.email;
      if (form.licenseNumber) data.licenseNumber = form.licenseNumber;
      if (form.licenseExpiry) data.licenseExpiry = form.licenseExpiry;
      if ((form.licenseCategories as string[]).length) data.licenseCategories = form.licenseCategories;
      if (form.medicalExpiry) data.medicalExpiry = form.medicalExpiry;
      if (form.passportNumber) data.passportNumber = form.passportNumber;
      if (form.passportExpiry) data.passportExpiry = form.passportExpiry;
      await updateDriver(id, data);
      setEditing(false);
      await load();
    } catch (err: unknown) { alert(err instanceof Error ? err.message : 'Error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this driver?')) return;
    await deleteDriver(id);
    router.push('/drivers');
  };

  const toggleCategory = (cat: string) => {
    const cats = form.licenseCategories as string[];
    setForm((p) => ({
      ...p,
      licenseCategories: cats.includes(cat) ? cats.filter((c) => c !== cat) : [...cats, cat],
    }));
  };

  // Training CRUD
  const handleTrainingSave = async () => {
    if (!trainingForm.title.trim()) return;
    setTrainingLoading(true);
    try {
      const body: Record<string, unknown> = { title: trainingForm.title };
      if (trainingForm.issuedAt) body.issuedAt = trainingForm.issuedAt;
      if (trainingForm.expiresAt) body.expiresAt = trainingForm.expiresAt;
      await post(`/drivers/${id}/trainings`, body);
      setShowTrainingForm(false);
      setTrainingForm({ title: '', issuedAt: '', expiresAt: '' });
      await loadTrainings();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error saving training');
    } finally {
      setTrainingLoading(false);
    }
  };

  const handleTrainingDelete = async (trainingId: string) => {
    if (!confirm('Delete this training/certification?')) return;
    try {
      await del(`/drivers/${id}/trainings/${trainingId}`);
      await loadTrainings();
    } catch { /* ignore */ }
  };

  if (loading) return <Loading />;
  if (!driver) return null;

  const ic = 'w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm';

  const licenseExpiry = driver.licenseExpiry ? new Date(driver.licenseExpiry) : null;
  const now = new Date();
  const isExpired = licenseExpiry && licenseExpiry < now;
  const isExpiringSoon = licenseExpiry && !isExpired && (licenseExpiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24) <= 30;

  // Training expiry helpers
  const getTrainingStatus = (t: Training) => {
    if (!t.expiresAt) return 'valid';
    const exp = new Date(t.expiresAt);
    if (exp < now) return 'expired';
    if ((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24) <= 30) return 'expiring';
    return 'valid';
  };

  const expiringSoonCount = trainings.filter((tr) => getTrainingStatus(tr) === 'expiring').length;
  const expiredCount = trainings.filter((tr) => getTrainingStatus(tr) === 'expired').length;

  const trainingCountLabel = () => {
    const parts = [`${trainings.length} certification${trainings.length !== 1 ? 's' : ''}`];
    if (expiringSoonCount > 0) parts.push(`${expiringSoonCount} expiring soon`);
    if (expiredCount > 0) parts.push(`${expiredCount} expired`);
    return parts.join(' (') + (parts.length > 1 ? ')' : '');
  };

  return (
    <div className="max-w-2xl">
      <Link href="/drivers" className="text-sm text-blue-600 hover:text-blue-700 mb-4 inline-block">← {t('drivers.title')}</Link>

      {(isExpired || isExpiringSoon) && (
        <div className={`${isExpired ? 'bg-red-50 border-red-200 text-red-700' : 'bg-amber-50 border-amber-200 text-amber-700'} border px-4 py-3 rounded-lg mb-4 text-sm`}>
          {isExpired ? 'License EXPIRED' : 'License expiring within 30 days'} — {licenseExpiry?.toLocaleDateString()}
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{driver.name}</h1>
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
          {([
            ['Name', 'name'], ['Phone', 'phone'], ['Email', 'email'],
            ['License Number', 'licenseNumber'], ['License Expiry', 'licenseExpiry'],
            ['Medical Expiry', 'medicalExpiry'], ['Passport Number', 'passportNumber'],
            ['Passport Expiry', 'passportExpiry'],
          ] as [string, string][]).map(([label, key]) => (
            <div key={key}>
              <p className="text-sm text-slate-500">{label}</p>
              {editing ? (
                key.includes('Expiry') || key.includes('expiry')
                  ? <input type="date" className={ic} value={String(form[key] || '')} onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))} />
                  : <input className={ic} value={String(form[key] || '')} onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))} />
              ) : (
                <p className="font-medium text-slate-900">
                  {key.includes('xpiry') && (driver as unknown as Record<string, unknown>)[key]
                    ? new Date(String((driver as unknown as Record<string, unknown>)[key])).toLocaleDateString()
                    : String((driver as unknown as Record<string, unknown>)[key] || '—')}
                </p>
              )}
            </div>
          ))}
          <div>
            <p className="text-sm text-slate-500">Status</p>
            {editing ? (
              <select className={ic} value={String(form.status)} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}>
                {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            ) : (
              <p className="font-medium text-slate-900">{driver.status.replace('_', ' ')}</p>
            )}
          </div>
          <div>
            <p className="text-sm text-slate-500">License Categories</p>
            {editing ? (
              <div className="flex gap-1 mt-1">
                {LICENSE_TYPES.map((cat) => (
                  <button key={cat} type="button" onClick={() => toggleCategory(cat)}
                    className={`px-2 py-1 text-xs font-medium rounded border ${
                      (form.licenseCategories as string[]).includes(cat) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-300'
                    }`}>
                    {cat}
                  </button>
                ))}
              </div>
            ) : (
              <p className="font-medium text-slate-900">{driver.licenseCategories.join(', ') || '—'}</p>
            )}
          </div>
        </div>
      </div>

      {/* Trainings & Certifications */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Trainings & Certifications</h3>
            <p className="text-xs text-slate-500 mt-1">{trainingCountLabel()}</p>
          </div>
          <button
            onClick={() => { setShowTrainingForm(true); setTrainingForm({ title: '', issuedAt: '', expiresAt: '' }); }}
            className="btn-primary text-sm"
          >
            + Add Training
          </button>
        </div>

        {showTrainingForm && (
          <div className="border border-slate-200 rounded-lg p-4 mb-4 bg-slate-50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Title *</label><input type="text" value={trainingForm.title} onChange={(e) => setTrainingForm((p) => ({ ...p, title: e.target.value }))} className={ic} required /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Issued Date</label><input type="date" value={trainingForm.issuedAt} onChange={(e) => setTrainingForm((p) => ({ ...p, issuedAt: e.target.value }))} className={ic} /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Expires Date</label><input type="date" value={trainingForm.expiresAt} onChange={(e) => setTrainingForm((p) => ({ ...p, expiresAt: e.target.value }))} className={ic} /></div>
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={handleTrainingSave} disabled={trainingLoading} className="btn-primary text-sm">{trainingLoading ? 'Saving...' : 'Save'}</button>
              <button onClick={() => setShowTrainingForm(false)} className="btn-secondary text-sm">Cancel</button>
            </div>
          </div>
        )}

        {trainings.length === 0 ? (
          <p className="text-sm text-slate-500">No trainings or certifications yet</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 font-medium text-slate-600">Title</th>
                <th className="text-left py-2 font-medium text-slate-600">Issued Date</th>
                <th className="text-left py-2 font-medium text-slate-600">Expires Date</th>
                <th className="text-right py-2 font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {trainings.map((tr) => {
                const status = getTrainingStatus(tr);
                return (
                  <tr key={tr.id} className="border-b border-slate-100">
                    <td className="py-3 text-slate-900">
                      <div className="flex items-center gap-2">
                        {tr.title}
                        {status === 'expiring' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">Expiring Soon</span>
                        )}
                        {status === 'expired' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">Expired</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 text-slate-600">{tr.issuedAt ? new Date(tr.issuedAt).toLocaleDateString() : '—'}</td>
                    <td className="py-3 text-slate-600">{tr.expiresAt ? new Date(tr.expiresAt).toLocaleDateString() : '—'}</td>
                    <td className="py-3 text-right">
                      <button onClick={() => handleTrainingDelete(tr.id)} className="text-red-500 hover:text-red-700 text-xs font-medium">Delete</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="text-xs text-slate-400 mt-4">Created {new Date(driver.createdAt).toLocaleString()}</div>
    </div>
  );
}
