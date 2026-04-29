'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { useTranslation, type Locale } from '@/lib/i18n';
import { updatePreferences } from '@/lib/api/users';
import { listTenants, createTenant, type TenantWithStats } from '@/lib/api/superadmin';

const CURRENCIES = ['USD', 'EUR', 'AZN', 'GBP', 'RUB', 'TRY', 'CNY'];
const TIMEZONES = [
  'UTC', 'Europe/London', 'Europe/Berlin', 'Europe/Moscow',
  'Asia/Baku', 'Asia/Istanbul', 'Asia/Dubai', 'Asia/Shanghai',
  'America/New_York', 'America/Los_Angeles',
];

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { t, locale, setLocale } = useTranslation();
  const [theme, setTheme] = useState(user?.preferredTheme || 'light');
  const [timezone, setTimezone] = useState(user?.preferredTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [currency, setCurrency] = useState(user?.preferredCurrency || 'USD');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const isSuperAdmin = user?.role === 'superadmin';
  const [tenants, setTenants] = useState<TenantWithStats[]>([]);
  const [showCreateTenant, setShowCreateTenant] = useState(false);
  const [newTenant, setNewTenant] = useState({
    name: '', slug: '', plan: 'starter',
    adminName: '', adminEmail: '', adminPassword: '',
  });
  const [tenantError, setTenantError] = useState('');
  const [tenantSaving, setTenantSaving] = useState(false);

  useEffect(() => {
    if (user?.preferredTheme) setTheme(user.preferredTheme);
    if (user?.preferredTimezone) setTimezone(user.preferredTimezone);
    if (user?.preferredCurrency) setCurrency(user.preferredCurrency);
  }, [user]);

  useEffect(() => {
    if (isSuperAdmin) {
      listTenants().then(setTenants).catch(() => {});
    }
  }, [isSuperAdmin]);

  const handleLocaleChange = async (newLocale: Locale) => {
    setLocale(newLocale);
    try { await updatePreferences({ locale: newLocale }); } catch { /* ignore */ }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updatePreferences({ theme, timezone, currency });
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch { /* ignore */ }
    setSaving(false);
  };

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    setTenantError('');
    setTenantSaving(true);
    try {
      await createTenant(newTenant);
      const refreshed = await listTenants();
      setTenants(refreshed);
      setNewTenant({ name: '', slug: '', plan: 'starter', adminName: '', adminEmail: '', adminPassword: '' });
      setShowCreateTenant(false);
    } catch (err) {
      setTenantError(err instanceof Error ? err.message : 'Failed');
    }
    setTenantSaving(false);
  };

  const updateTenantForm = (field: string, value: string) => {
    setNewTenant((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'name') {
        next.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      }
      return next;
    });
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">{t('settings.title')}</h1>

      {/* Company info */}
      {user?.tenant && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white text-lg font-bold">
            {user.tenant.name.charAt(0)}
          </div>
          <div>
            <div className="text-lg font-semibold text-slate-900">{user.tenant.name}</div>
            <div className="text-sm text-slate-500">{t(`roles.${user.role}`)} · {user.email}</div>
            <div className="text-xs text-slate-400">{t('settings.portalLink')}: /portal/{user.tenant.slug}</div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
        {/* Language */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">{t('settings.language')}</label>
          <div className="flex gap-2">
            {(['en', 'ru', 'az'] as const).map((l) => (
              <button
                key={l}
                onClick={() => handleLocaleChange(l)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  locale === l ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {l === 'en' ? 'English' : l === 'ru' ? 'Русский' : 'Azərbaycan'}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-1">{t('settings.languageHint')}</p>
        </div>

        {/* Theme */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">{t('settings.theme')}</label>
          <div className="flex gap-2">
            {(['light', 'dark', 'system'] as const).map((th) => (
              <button
                key={th}
                onClick={() => setTheme(th)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  theme === th ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {t('settings.' + th)}
              </button>
            ))}
          </div>
        </div>

        {/* Timezone */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">{t('settings.timezone')}</label>
          <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className="input-field w-72">
            {TIMEZONES.map((tz) => (<option key={tz} value={tz}>{tz}</option>))}
          </select>
        </div>

        {/* Currency */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">{t('settings.currency')}</label>
          <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="input-field w-40">
            {CURRENCIES.map((c) => (<option key={c} value={c}>{c}</option>))}
          </select>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button onClick={handleSave} disabled={saving} className="btn-primary disabled:opacity-50">
            {saving ? t('portalSettingsPage.saving') : t('common.save')}
          </button>
          {saved && <span className="text-sm text-emerald-600">{t('portalSettingsPage.saved')}</span>}
        </div>
      </div>

      {/* SuperAdmin: Tenants management */}
      {isSuperAdmin && (
        <div className="mt-6 bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">{t('superadmin.tenants')}</h2>
            <button
              onClick={() => setShowCreateTenant(!showCreateTenant)}
              className="btn-primary text-sm"
            >
              + {t('superadmin.createTenant')}
            </button>
          </div>

          {showCreateTenant && (
            <form onSubmit={handleCreateTenant} className="mb-4 p-4 bg-slate-50 rounded-lg space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">{t('superadmin.tenantName')} *</label>
                  <input type="text" value={newTenant.name} onChange={(e) => updateTenantForm('name', e.target.value)} required className="input-field w-full text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">{t('superadmin.tenantSlug')} *</label>
                  <input type="text" value={newTenant.slug} onChange={(e) => updateTenantForm('slug', e.target.value)} required className="input-field w-full text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">{t('superadmin.plan')}</label>
                  <select value={newTenant.plan} onChange={(e) => updateTenantForm('plan', e.target.value)} className="input-field w-full text-sm">
                    <option value="starter">Starter</option>
                    <option value="business">Business</option>
                    <option value="pro">Pro</option>
                    <option value="corporate">Corporate</option>
                  </select>
                </div>
              </div>
              <div className="border-t border-slate-200 pt-3">
                <p className="text-xs text-slate-500 mb-2">{t('superadmin.firstDirector')}</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">{t('common.name')} *</label>
                    <input type="text" value={newTenant.adminName} onChange={(e) => updateTenantForm('adminName', e.target.value)} required className="input-field w-full text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">{t('common.email')} *</label>
                    <input type="email" value={newTenant.adminEmail} onChange={(e) => updateTenantForm('adminEmail', e.target.value)} required className="input-field w-full text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">{t('auth.password')} *</label>
                    <input type="password" minLength={8} value={newTenant.adminPassword} onChange={(e) => updateTenantForm('adminPassword', e.target.value)} required className="input-field w-full text-sm" />
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={tenantSaving} className="btn-primary text-sm">
                  {tenantSaving ? t('common.loading') : t('superadmin.createTenant')}
                </button>
                <button type="button" onClick={() => setShowCreateTenant(false)} className="btn-secondary text-sm">{t('common.cancel')}</button>
              </div>
              {tenantError && <p className="text-sm text-red-600">{tenantError}</p>}
            </form>
          )}

          <div className="divide-y divide-slate-200">
            {tenants.map((tenant) => (
              <div
                key={tenant.id}
                onClick={() => router.push(`/superadmin/tenants/${tenant.id}`)}
                className="flex items-center justify-between py-3 cursor-pointer hover:bg-slate-50 -mx-6 px-6"
              >
                <div>
                  <div className="font-medium text-slate-900">{tenant.name}</div>
                  <div className="text-xs text-slate-500">{tenant.slug} · {tenant.plan} · {tenant._count?.users ?? 0} users</div>
                </div>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${tenant.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                  {tenant.isActive ? t('clientsList.active') : t('clientsList.inactive')}
                </span>
              </div>
            ))}
            {tenants.length === 0 && (
              <div className="py-6 text-center text-sm text-slate-500">{t('superadmin.noTenants')}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
