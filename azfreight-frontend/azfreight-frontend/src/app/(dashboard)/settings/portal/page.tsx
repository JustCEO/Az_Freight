'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { get, patch } from '@/lib/api-client';
import Loading from '@/components/loading';
import { useTranslation } from '@/lib/i18n';

interface TenantSettings {
  id: string;
  name: string;
  slug: string;
  portalEnabled: boolean;
  portalThemeColor: string | null;
  portalLogoUrl: string | null;
  portalWelcomeText: string | null;
}

export default function PortalSettingsPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [portalEnabled, setPortalEnabled] = useState(true);
  const [themeColor, setThemeColor] = useState('#2563EB');
  const [welcomeText, setWelcomeText] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [tenantSlug, setTenantSlug] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    get<TenantSettings>('/tenants/me')
      .then((t) => {
        setPortalEnabled(t.portalEnabled);
        setThemeColor(t.portalThemeColor || '#2563EB');
        setWelcomeText(t.portalWelcomeText || '');
        setLogoUrl(t.portalLogoUrl || '');
        setTenantSlug(t.slug);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await patch('/tenants/me', {
        portalEnabled,
        portalThemeColor: themeColor,
        portalWelcomeText: welcomeText || null,
        portalLogoUrl: logoUrl || null,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch { /* ignore */ }
    setSaving(false);
  };

  if (loading) return <Loading />;

  const portalUrl = tenantSlug ? `${window.location.origin}/portal/${tenantSlug}` : '';

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">{t('portalSettingsPage.title')}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">{t('portalSettingsPage.configuration')}</h2>
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-sm text-slate-600">{t('portalSettingsPage.portalActive')}</span>
              <input
                type="checkbox"
                checked={portalEnabled}
                onChange={(e) => setPortalEnabled(e.target.checked)}
                className="w-4 h-4"
              />
            </label>
          </div>

          {portalUrl && (
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs text-slate-500 mb-1">{t('portalSettingsPage.portalUrl')}</p>
              <a href={portalUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline break-all">
                {portalUrl}
              </a>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('portalSettingsPage.brandColor')}</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={themeColor}
                onChange={(e) => setThemeColor(e.target.value)}
                className="w-10 h-10 rounded border border-slate-200 cursor-pointer"
              />
              <input
                type="text"
                value={themeColor}
                onChange={(e) => setThemeColor(e.target.value)}
                className="input-field w-32"
                maxLength={7}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('portalSettingsPage.logoUrl')}</label>
            <input
              type="text"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              className="input-field w-full"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('portalSettingsPage.welcomeText')}</label>
            <textarea
              value={welcomeText}
              onChange={(e) => setWelcomeText(e.target.value)}
              rows={3}
              className="input-field w-full"
              placeholder={t('portalSettingsPage.welcomePlaceholder')}
            />
          </div>

          <div className="flex items-center gap-3">
            <button onClick={handleSave} disabled={saving} className="btn-primary disabled:opacity-50">
              {saving ? t('portalSettingsPage.saving') : t('portalSettingsPage.saveSettings')}
            </button>
            {saved && <span className="text-sm text-green-600">{t('portalSettingsPage.saved')}</span>}
          </div>
        </div>

        {/* Preview */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">{t('portalSettingsPage.preview')}</h2>
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-2">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="h-6 w-auto" />
              ) : (
                <div className="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: themeColor }}>
                  A
                </div>
              )}
              <span className="text-sm font-semibold">{t('portalSettingsPage.yourCompany')}</span>
            </div>
            <div className="p-6 text-center bg-slate-50">
              <p className="text-sm text-slate-600 mb-4">
                {welcomeText || t('portalSettingsPage.defaultWelcome')}
              </p>
              <div
                className="inline-block px-4 py-2 rounded-lg text-white text-sm font-medium"
                style={{ backgroundColor: themeColor }}
              >
                {t('portal.submitRequest')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
