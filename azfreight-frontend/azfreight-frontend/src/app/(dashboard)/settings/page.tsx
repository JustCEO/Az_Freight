'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { useTranslation, type Locale } from '@/lib/i18n';
import { updatePreferences } from '@/lib/api/users';

const CURRENCIES = ['USD', 'EUR', 'AZN', 'GBP', 'RUB', 'TRY', 'CNY'];
const TIMEZONES = [
  'UTC', 'Europe/London', 'Europe/Berlin', 'Europe/Moscow',
  'Asia/Baku', 'Asia/Istanbul', 'Asia/Dubai', 'Asia/Shanghai',
  'America/New_York', 'America/Los_Angeles',
];

export default function SettingsPage() {
  const { user } = useAuth();
  const { t, locale, setLocale } = useTranslation();
  const [theme, setTheme] = useState(user?.preferredTheme || 'light');
  const [timezone, setTimezone] = useState(user?.preferredTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [currency, setCurrency] = useState(user?.preferredCurrency || 'USD');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user?.preferredTheme) setTheme(user.preferredTheme);
    if (user?.preferredTimezone) setTimezone(user.preferredTimezone);
    if (user?.preferredCurrency) setCurrency(user.preferredCurrency);
  }, [user]);

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

  const isAdmin = user?.role === 'admin' || user?.role === 'director' || user?.role === 'superadmin';

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">{t('settings.title')}</h1>

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

        {/* Save */}
        <div className="flex items-center gap-3 pt-2">
          <button onClick={handleSave} disabled={saving} className="btn-primary disabled:opacity-50">
            {saving ? t('portalSettingsPage.saving') : t('common.save')}
          </button>
          {saved && <span className="text-sm text-emerald-600">{t('portalSettingsPage.saved')}</span>}
        </div>
      </div>

      {/* Admin links */}
      {isAdmin && (
        <div className="mt-6 bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">{t('settings.adminSection')}</h2>
          <div className="flex gap-4">
            <Link href="/settings/portal" className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50">
              {t('nav.portalSettings')}
            </Link>
            <Link href="/shipments/settings/statuses" className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50">
              {t('nav.statusSettings')}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
