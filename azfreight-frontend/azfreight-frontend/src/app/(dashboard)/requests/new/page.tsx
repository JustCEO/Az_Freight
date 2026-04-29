'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createManualRequest, searchContacts } from '@/lib/api/shipment-requests';
import { useTranslation } from '@/lib/i18n';

type ContactMode = 'search' | 'new';
type ContactType = 'client' | 'lead' | 'new';

export default function NewRequestPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Contact section
  const [contactMode, setContactMode] = useState<ContactMode>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{
    clients: { id: string; companyName: string; email: string | null }[];
    leads: { id: string; contactName: string; companyName: string | null; email: string }[];
  }>({ clients: [], leads: [] });
  const [selectedContact, setSelectedContact] = useState<{ type: ContactType; id?: string; name: string; email: string } | null>(null);

  // New contact fields
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactCompany, setContactCompany] = useState('');

  // Request fields
  const [originCountry, setOriginCountry] = useState('');
  const [originCity, setOriginCity] = useState('');
  const [destCountry, setDestCountry] = useState('');
  const [destCity, setDestCity] = useState('');
  const [cargoType, setCargoType] = useState('other');
  const [cargoDescription, setCargoDescription] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [volumeCbm, setVolumeCbm] = useState('');
  const [packageCount, setPackageCount] = useState('');
  const [transportTypes, setTransportTypes] = useState<string[]>(['road_tir']);
  const [isUrgent, setIsUrgent] = useState(false);
  const [notes, setNotes] = useState('');

  const handleSearch = useCallback(async (q: string) => {
    if (q.length < 2) { setSearchResults({ clients: [], leads: [] }); return; }
    try {
      const results = await searchContacts(q);
      setSearchResults(results);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => handleSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery, handleSearch]);

  const handleSelectClient = (client: { id: string; companyName: string; email: string | null }) => {
    setSelectedContact({ type: 'client', id: client.id, name: client.companyName, email: client.email || '' });
    setSearchQuery('');
    setSearchResults({ clients: [], leads: [] });
  };

  const handleSelectLead = (lead: { id: string; contactName: string; email: string }) => {
    setSelectedContact({ type: 'lead', id: lead.id, name: lead.contactName, email: lead.email });
    setSearchQuery('');
    setSearchResults({ clients: [], leads: [] });
  };

  const toggleTransport = (val: string) => {
    setTransportTypes((prev) => prev.includes(val) ? prev.filter((t) => t !== val) : [...prev, val]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const body: Record<string, unknown> = {
      originCountry, originCity, destinationCountry: destCountry, destinationCity: destCity,
      cargoType, cargoDescription, transportTypes,
      isUrgent, notes: notes || undefined,
    };
    if (weightKg) body.weightKg = parseFloat(weightKg);
    if (volumeCbm) body.volumeCbm = parseFloat(volumeCbm);
    if (packageCount) body.packageCount = parseInt(packageCount);

    if (selectedContact?.type === 'client') {
      body.clientId = selectedContact.id;
    } else if (selectedContact?.type === 'lead') {
      body.leadId = selectedContact.id;
    } else if (contactMode === 'new' && contactName && contactEmail) {
      body.contactName = contactName;
      body.contactEmail = contactEmail;
      body.contactPhone = contactPhone || undefined;
      body.contactCompany = contactCompany || undefined;
    } else {
      setError(t('manualRequest.contactRequired'));
      setSubmitting(false);
      return;
    }

    try {
      const result = await createManualRequest(body);
      router.push(`/requests/${result.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    }
    setSubmitting(false);
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">{t('manualRequest.title')}</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>}

        {/* Contact section */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">{t('manualRequest.contact')}</h2>

          {selectedContact ? (
            <div className="flex items-center justify-between bg-blue-50 rounded-lg p-4">
              <div>
                <span className="text-xs text-blue-600 uppercase font-medium">{selectedContact.type === 'client' ? t('manualRequest.existingClient') : t('manualRequest.existingLead')}</span>
                <div className="font-medium text-slate-900">{selectedContact.name}</div>
                <div className="text-sm text-slate-500">{selectedContact.email}</div>
              </div>
              <button type="button" onClick={() => setSelectedContact(null)} className="text-sm text-blue-600 hover:text-blue-800">{t('manualRequest.changeContact')}</button>
            </div>
          ) : (
            <>
              <div className="flex gap-2 mb-4">
                <button type="button" onClick={() => setContactMode('search')} className={`px-4 py-2 text-sm rounded-lg ${contactMode === 'search' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
                  {t('manualRequest.searchExisting')}
                </button>
                <button type="button" onClick={() => setContactMode('new')} className={`px-4 py-2 text-sm rounded-lg ${contactMode === 'new' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
                  {t('manualRequest.newContact')}
                </button>
              </div>

              {contactMode === 'search' ? (
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('manualRequest.searchPlaceholder')}
                    className="input-field w-full"
                  />
                  {(searchResults.clients.length > 0 || searchResults.leads.length > 0) && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {searchResults.clients.map((c) => (
                        <button key={c.id} type="button" onClick={() => handleSelectClient(c)} className="w-full text-left px-4 py-2 hover:bg-blue-50 text-sm">
                          <span className="text-xs text-emerald-600 mr-2">{t('manualRequest.client')}</span>
                          <span className="font-medium">{c.companyName}</span>
                          <span className="text-slate-400 ml-2">{c.email}</span>
                        </button>
                      ))}
                      {searchResults.leads.map((l) => (
                        <button key={l.id} type="button" onClick={() => handleSelectLead(l)} className="w-full text-left px-4 py-2 hover:bg-blue-50 text-sm">
                          <span className="text-xs text-amber-600 mr-2">{t('manualRequest.lead')}</span>
                          <span className="font-medium">{l.contactName}</span>
                          <span className="text-slate-400 ml-2">{l.email}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label-field">{t('common.name')} *</label>
                    <input type="text" value={contactName} onChange={(e) => setContactName(e.target.value)} className="input-field" required={contactMode === 'new'} />
                  </div>
                  <div>
                    <label className="label-field">{t('common.email')} *</label>
                    <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="input-field" required={contactMode === 'new'} />
                  </div>
                  <div>
                    <label className="label-field">{t('common.phone')}</label>
                    <input type="text" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className="input-field" />
                  </div>
                  <div>
                    <label className="label-field">{t('common.company')}</label>
                    <input type="text" value={contactCompany} onChange={(e) => setContactCompany(e.target.value)} className="input-field" />
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Route */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">{t('newShipment.route')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="label-field">{t('requestForm.originCountry')} *</label><input type="text" value={originCountry} onChange={(e) => setOriginCountry(e.target.value)} required className="input-field" /></div>
            <div><label className="label-field">{t('requestForm.originCity')} *</label><input type="text" value={originCity} onChange={(e) => setOriginCity(e.target.value)} required className="input-field" /></div>
            <div><label className="label-field">{t('requestForm.destinationCountry')} *</label><input type="text" value={destCountry} onChange={(e) => setDestCountry(e.target.value)} required className="input-field" /></div>
            <div><label className="label-field">{t('requestForm.destinationCity')} *</label><input type="text" value={destCity} onChange={(e) => setDestCity(e.target.value)} required className="input-field" /></div>
          </div>
        </div>

        {/* Transport */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">{t('requestForm.transportTypes')}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {['road_tir', 'sea', 'air', 'rail'].map((tp) => (
              <label key={tp} className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer ${transportTypes.includes(tp) ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600'}`}>
                <input type="checkbox" checked={transportTypes.includes(tp)} onChange={() => toggleTransport(tp)} className="w-4 h-4 rounded" />
                <span className="text-sm font-medium">{t('transport.' + tp)}</span>
              </label>
            ))}
          </div>
          <label className="flex items-center gap-2 mt-3 cursor-pointer">
            <input type="checkbox" checked={isUrgent} onChange={(e) => setIsUrgent(e.target.checked)} className="w-4 h-4 rounded border-slate-300" />
            <span className="text-sm font-medium text-red-600">{t('requestForm.urgentShipment')}</span>
          </label>
        </div>

        {/* Cargo */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">{t('requestForm.steps.cargo')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label-field">{t('requestForm.cargoType')} *</label>
              <select value={cargoType} onChange={(e) => setCargoType(e.target.value)} className="input-field">
                {['electronics','food_beverage','clothing_textile','chemicals','machinery','pharma','automotive','construction','furniture','oil_gas','alcohol_tobacco','animals','plants','other'].map((ct) => (
                  <option key={ct} value={ct}>{t('cargoTypes.' + ct)}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="label-field">{t('requestForm.cargoDescription')} *</label>
              <textarea value={cargoDescription} onChange={(e) => setCargoDescription(e.target.value)} required className="input-field w-full" rows={2} />
            </div>
            <div><label className="label-field">{t('requestForm.weight')}</label><input type="number" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} className="input-field" /></div>
            <div><label className="label-field">{t('requestForm.volume')}</label><input type="number" value={volumeCbm} onChange={(e) => setVolumeCbm(e.target.value)} className="input-field" /></div>
            <div><label className="label-field">{t('requestForm.packages')}</label><input type="number" value={packageCount} onChange={(e) => setPackageCount(e.target.value)} className="input-field" /></div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <label className="label-field">{t('common.notes')}</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="input-field w-full" rows={2} />
        </div>

        <div className="flex gap-4">
          <button type="submit" disabled={submitting} className="btn-primary">{submitting ? t('common.loading') : t('manualRequest.create')}</button>
          <button type="button" onClick={() => router.back()} className="btn-secondary">{t('common.cancel')}</button>
        </div>
      </form>
    </div>
  );
}
