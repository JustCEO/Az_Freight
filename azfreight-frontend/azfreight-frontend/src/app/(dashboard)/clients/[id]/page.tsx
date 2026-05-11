'use client';

import { useEffect, useState, useCallback, type FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getClient, updateClient } from '@/lib/api/clients';
import { get, post, patch, del } from '@/lib/api-client';
import { listDocuments, uploadDocument, deleteDocument } from '@/lib/api/documents';
import type { Client, Document } from '@/types';
import Loading from '@/components/loading';

// --- Types ---
interface Contact {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: string | null;
}

interface AVLEntry {
  id: string;
  vendorName: string;
  serviceType: string | null;
  status: string;
  reviewDate: string | null;
  notes: string | null;
  rejectedReason: string | null;
}

const TABS = ['General', 'Contacts', 'AVL', 'Documents'] as const;
type Tab = (typeof TABS)[number];

const LOYALTY_BADGE: Record<string, string> = {
  REGULAR: 'bg-gray-100 text-gray-700',
  SILVER: 'bg-slate-200 text-slate-700',
  GOLD: 'bg-amber-100 text-amber-700',
  PLATINUM: 'bg-purple-100 text-purple-700',
};

const PAYMENT_TERMS_OPTIONS = ['CIA', 'COD', 'NET7', 'NET15', 'NET30', 'NET45', 'NET60', 'NET90'];

const AVL_STATUS_BADGE: Record<string, string> = {
  IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-red-100 text-red-700',
};

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('General');
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // General form
  const [form, setForm] = useState({
    companyName: '', taxId: '', voen: '', division: '', address: '', country: '', city: '',
    loyaltyStatus: 'REGULAR', ogLicense: '', creditTermDays: '', insuranceLimit: '',
    contractNumber: '', contractStart: '', contractEnd: '', contractDetails: '', paymentTerms: '',
    isBlacklisted: false, blacklistReason: '',
    phone: '', email: '', website: '', notes: '', creditLimit: '', paymentTermsDays: '',
  });

  // Contacts
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', role: '' });
  const [showContactForm, setShowContactForm] = useState(false);
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [contactLoading, setContactLoading] = useState(false);

  // AVL
  const [avlEntries, setAvlEntries] = useState<AVLEntry[]>([]);
  const [avlForm, setAvlForm] = useState({ vendorName: '', serviceType: '', status: 'IN_PROGRESS', reviewDate: '', notes: '', rejectedReason: '' });
  const [showAvlForm, setShowAvlForm] = useState(false);
  const [editingAvlId, setEditingAvlId] = useState<string | null>(null);
  const [avlLoading, setAvlLoading] = useState(false);

  // Documents
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [docType, setDocType] = useState('other');

  const loadClient = useCallback(async () => {
    try {
      const c = await getClient(id);
      setClient(c);
      const rec = c as unknown as Record<string, unknown>;
      setForm({
        companyName: c.companyName || '',
        taxId: c.taxId || '',
        voen: c.voen || '',
        division: (rec.division as string) || '',
        address: c.address || '',
        country: c.country || '',
        city: c.city || '',
        loyaltyStatus: (rec.loyaltyStatus as string) || 'REGULAR',
        ogLicense: (rec.ogLicense as string) || '',
        creditTermDays: rec.creditTermDays != null ? String(rec.creditTermDays) : '',
        insuranceLimit: rec.insuranceLimit != null ? String(rec.insuranceLimit) : '',
        contractNumber: (rec.contractNumber as string) || '',
        contractStart: rec.contractStart ? String(rec.contractStart).slice(0, 10) : '',
        contractEnd: rec.contractEnd ? String(rec.contractEnd).slice(0, 10) : '',
        contractDetails: (rec.contractDetails as string) || '',
        paymentTerms: (rec.paymentTerms as string) || '',
        isBlacklisted: !!rec.isBlacklisted,
        blacklistReason: (rec.blacklistReason as string) || '',
        phone: c.phone || '',
        email: c.email || '',
        website: (rec.website as string) || '',
        notes: c.notes || '',
        creditLimit: c.creditLimit != null ? String(c.creditLimit) : '',
        paymentTermsDays: c.paymentTermsDays != null ? String(c.paymentTermsDays) : '',
      });
    } catch {
      router.push('/clients');
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  const loadContacts = useCallback(async () => {
    try {
      const data = await get<Contact[]>(`/clients/${id}/contacts`);
      setContacts(Array.isArray(data) ? data : []);
    } catch { setContacts([]); }
  }, [id]);

  const loadAvl = useCallback(async () => {
    try {
      const data = await get<AVLEntry[]>(`/clients/${id}/avl`);
      setAvlEntries(Array.isArray(data) ? data : []);
    } catch { setAvlEntries([]); }
  }, [id]);

  const loadDocuments = useCallback(async () => {
    try {
      const docs = await listDocuments('client', id);
      setDocuments(docs);
    } catch { setDocuments([]); }
  }, [id]);

  useEffect(() => { loadClient(); }, [loadClient]);

  useEffect(() => {
    if (activeTab === 'Contacts') loadContacts();
    if (activeTab === 'AVL') loadAvl();
    if (activeTab === 'Documents') loadDocuments();
  }, [activeTab, loadContacts, loadAvl, loadDocuments]);

  function updateField(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const body: Record<string, unknown> = { companyName: form.companyName };
      if (form.taxId) body.taxId = form.taxId;
      if (form.voen) body.voen = form.voen;
      if (form.division) body.division = form.division;
      if (form.address) body.address = form.address;
      if (form.country) body.country = form.country;
      if (form.city) body.city = form.city;
      if (form.phone) body.phone = form.phone;
      if (form.email) body.email = form.email;
      if (form.website) body.website = form.website;
      body.loyaltyStatus = form.loyaltyStatus;
      if (form.ogLicense) body.ogLicense = form.ogLicense;
      if (form.creditTermDays) body.creditTermDays = parseInt(form.creditTermDays);
      if (form.insuranceLimit) body.insuranceLimit = parseFloat(form.insuranceLimit);
      if (form.contractNumber) body.contractNumber = form.contractNumber;
      if (form.contractStart) body.contractStart = form.contractStart;
      if (form.contractEnd) body.contractEnd = form.contractEnd;
      if (form.contractDetails) body.contractDetails = form.contractDetails;
      if (form.paymentTerms) body.paymentTerms = form.paymentTerms;
      body.isBlacklisted = form.isBlacklisted;
      if (form.isBlacklisted && form.blacklistReason) body.blacklistReason = form.blacklistReason;
      if (form.paymentTermsDays) body.paymentTermsDays = parseInt(form.paymentTermsDays);
      if (form.creditLimit) body.creditLimit = parseFloat(form.creditLimit);
      if (form.notes) body.notes = form.notes;
      const updated = await updateClient(id, body);
      setClient(updated);
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update');
    } finally {
      setSubmitting(false);
    }
  }

  // Contact CRUD
  async function handleContactSave() {
    if (!contactForm.name.trim()) return;
    setContactLoading(true);
    try {
      const body: Record<string, unknown> = { name: contactForm.name };
      if (contactForm.email) body.email = contactForm.email;
      if (contactForm.phone) body.phone = contactForm.phone;
      if (contactForm.role) body.role = contactForm.role;
      if (editingContactId) {
        await patch(`/clients/${id}/contacts/${editingContactId}`, body);
      } else {
        await post(`/clients/${id}/contacts`, body);
      }
      setShowContactForm(false);
      setEditingContactId(null);
      setContactForm({ name: '', email: '', phone: '', role: '' });
      await loadContacts();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error saving contact');
    } finally {
      setContactLoading(false);
    }
  }

  async function handleContactDelete(contactId: string) {
    if (!confirm('Delete this contact?')) return;
    try {
      await del(`/clients/${id}/contacts/${contactId}`);
      await loadContacts();
    } catch { /* ignore */ }
  }

  function startEditContact(contact: Contact) {
    setEditingContactId(contact.id);
    setContactForm({ name: contact.name, email: contact.email || '', phone: contact.phone || '', role: contact.role || '' });
    setShowContactForm(true);
  }

  // AVL CRUD
  async function handleAvlSave() {
    if (!avlForm.vendorName.trim()) return;
    setAvlLoading(true);
    try {
      const body: Record<string, unknown> = { vendorName: avlForm.vendorName, status: avlForm.status };
      if (avlForm.serviceType) body.serviceType = avlForm.serviceType;
      if (avlForm.reviewDate) body.reviewDate = avlForm.reviewDate;
      if (avlForm.notes) body.notes = avlForm.notes;
      if (avlForm.status === 'REJECTED' && avlForm.rejectedReason) body.rejectedReason = avlForm.rejectedReason;
      if (editingAvlId) {
        await patch(`/clients/${id}/avl/${editingAvlId}`, body);
      } else {
        await post(`/clients/${id}/avl`, body);
      }
      setShowAvlForm(false);
      setEditingAvlId(null);
      setAvlForm({ vendorName: '', serviceType: '', status: 'IN_PROGRESS', reviewDate: '', notes: '', rejectedReason: '' });
      await loadAvl();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error saving AVL entry');
    } finally {
      setAvlLoading(false);
    }
  }

  async function handleAvlDelete(avlId: string) {
    if (!confirm('Delete this AVL entry?')) return;
    try {
      await del(`/clients/${id}/avl/${avlId}`);
      await loadAvl();
    } catch { /* ignore */ }
  }

  function startEditAvl(entry: AVLEntry) {
    setEditingAvlId(entry.id);
    setAvlForm({
      vendorName: entry.vendorName, serviceType: entry.serviceType || '',
      status: entry.status, reviewDate: entry.reviewDate ? entry.reviewDate.slice(0, 10) : '',
      notes: entry.notes || '', rejectedReason: entry.rejectedReason || '',
    });
    setShowAvlForm(true);
  }

  if (loading || !client) return <Loading />;

  const rec = client as unknown as Record<string, unknown>;

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-slate-900">{client.companyName}</h2>
              {rec.loyaltyStatus ? (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${LOYALTY_BADGE[rec.loyaltyStatus as string] || LOYALTY_BADGE.REGULAR}`}>
                  {String(rec.loyaltyStatus)}
                </span>
              ) : null}
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${client.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                {client.isActive ? 'Active' : 'Inactive'}
              </span>
              {rec.isBlacklisted ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-600 text-white">Blacklisted</span>
              ) : null}
            </div>
          </div>
          <button onClick={() => router.push('/clients')} className="btn-secondary text-sm">Back</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab: General */}
      {activeTab === 'General' && (
        <>
          {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg mb-4">{error}</div>}

          {!editing ? (
            <div className="space-y-6">
              {/* Company Info */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Company Info</h3>
                  <button onClick={() => setEditing(true)} className="btn-primary text-sm">Edit</button>
                </div>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div><dt className="text-slate-500">Company Name</dt><dd className="font-medium">{client.companyName}</dd></div>
                  <div><dt className="text-slate-500">Tax ID / VOEN</dt><dd className="font-medium">{client.taxId || client.voen || '—'}</dd></div>
                  <div><dt className="text-slate-500">Division</dt><dd className="font-medium">{String(rec.division || '—')}</dd></div>
                  <div className="md:col-span-2"><dt className="text-slate-500">Address</dt><dd className="font-medium">{client.address || '—'}</dd></div>
                  <div><dt className="text-slate-500">Country</dt><dd className="font-medium">{client.country || '—'}</dd></div>
                  <div><dt className="text-slate-500">City</dt><dd className="font-medium">{client.city || '—'}</dd></div>
                  <div>
                    <dt className="text-slate-500">Loyalty Status</dt>
                    <dd>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${LOYALTY_BADGE[rec.loyaltyStatus as string] || LOYALTY_BADGE.REGULAR}`}>
                        {String(rec.loyaltyStatus || 'REGULAR')}
                      </span>
                    </dd>
                  </div>
                  <div><dt className="text-slate-500">OG License</dt><dd className="font-medium">{String(rec.ogLicense || '—')}</dd></div>
                  <div><dt className="text-slate-500">Credit Term Days</dt><dd className="font-medium">{rec.creditTermDays != null ? String(rec.creditTermDays) : '—'}</dd></div>
                  <div><dt className="text-slate-500">Insurance Limit</dt><dd className="font-medium">{rec.insuranceLimit != null ? String(rec.insuranceLimit) : '—'}</dd></div>
                  <div><dt className="text-slate-500">Email</dt><dd className="font-medium">{client.email || '—'}</dd></div>
                  <div><dt className="text-slate-500">Phone</dt><dd className="font-medium">{client.phone || '—'}</dd></div>
                </dl>
              </div>

              {/* Contract */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Contract</h3>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div><dt className="text-slate-500">Contract Number</dt><dd className="font-medium">{String(rec.contractNumber || '—')}</dd></div>
                  <div><dt className="text-slate-500">Contract Start</dt><dd className="font-medium">{rec.contractStart ? new Date(String(rec.contractStart)).toLocaleDateString() : '—'}</dd></div>
                  <div><dt className="text-slate-500">Contract End</dt><dd className="font-medium">{rec.contractEnd ? new Date(String(rec.contractEnd)).toLocaleDateString() : '—'}</dd></div>
                  <div><dt className="text-slate-500">Payment Terms</dt><dd className="font-medium">{String(rec.paymentTerms || '—')}</dd></div>
                  <div className="md:col-span-2"><dt className="text-slate-500">Contract Details</dt><dd className="font-medium whitespace-pre-wrap">{String(rec.contractDetails || '—')}</dd></div>
                </dl>
              </div>

              {/* Activity */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Activity</h3>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div><dt className="text-slate-500">Job Quantity</dt><dd className="font-medium">{rec.jobQuantity != null ? String(rec.jobQuantity) : '0'}</dd></div>
                  <div>
                    <dt className="text-slate-500">Blacklisted</dt>
                    <dd>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${rec.isBlacklisted ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {rec.isBlacklisted ? 'Yes' : 'No'}
                      </span>
                    </dd>
                  </div>
                  {rec.isBlacklisted && rec.blacklistReason ? (
                    <div className="md:col-span-2"><dt className="text-slate-500">Blacklist Reason</dt><dd className="font-medium">{String(rec.blacklistReason)}</dd></div>
                  ) : null}
                </dl>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Company Info Edit */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Company Info</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2"><label className="label-field">Company Name *</label><input type="text" value={form.companyName} onChange={(e) => updateField('companyName', e.target.value)} className="input-field" required /></div>
                  <div><label className="label-field">Tax ID</label><input type="text" value={form.taxId} onChange={(e) => updateField('taxId', e.target.value)} className="input-field" /></div>
                  <div><label className="label-field">VOEN</label><input type="text" value={form.voen} onChange={(e) => updateField('voen', e.target.value)} className="input-field" maxLength={10} /></div>
                  <div><label className="label-field">Division</label><input type="text" value={form.division} onChange={(e) => updateField('division', e.target.value)} className="input-field" /></div>
                  <div className="md:col-span-2"><label className="label-field">Address</label><input type="text" value={form.address} onChange={(e) => updateField('address', e.target.value)} className="input-field" /></div>
                  <div><label className="label-field">Country</label><input type="text" value={form.country} onChange={(e) => updateField('country', e.target.value)} className="input-field" /></div>
                  <div><label className="label-field">City</label><input type="text" value={form.city} onChange={(e) => updateField('city', e.target.value)} className="input-field" /></div>
                  <div>
                    <label className="label-field">Loyalty Status</label>
                    <select value={form.loyaltyStatus} onChange={(e) => updateField('loyaltyStatus', e.target.value)} className="input-field">
                      {Object.keys(LOYALTY_BADGE).map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div><label className="label-field">OG License</label><input type="text" value={form.ogLicense} onChange={(e) => updateField('ogLicense', e.target.value)} className="input-field" /></div>
                  <div><label className="label-field">Credit Term Days</label><input type="number" value={form.creditTermDays} onChange={(e) => updateField('creditTermDays', e.target.value)} className="input-field" /></div>
                  <div><label className="label-field">Insurance Limit</label><input type="number" step="0.01" value={form.insuranceLimit} onChange={(e) => updateField('insuranceLimit', e.target.value)} className="input-field" /></div>
                  <div><label className="label-field">Email</label><input type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} className="input-field" /></div>
                  <div><label className="label-field">Phone</label><input type="text" value={form.phone} onChange={(e) => updateField('phone', e.target.value)} className="input-field" /></div>
                </div>
              </div>

              {/* Contract Edit */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Contract</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="label-field">Contract Number</label><input type="text" value={form.contractNumber} onChange={(e) => updateField('contractNumber', e.target.value)} className="input-field" /></div>
                  <div><label className="label-field">Contract Start</label><input type="date" value={form.contractStart} onChange={(e) => updateField('contractStart', e.target.value)} className="input-field" /></div>
                  <div><label className="label-field">Contract End</label><input type="date" value={form.contractEnd} onChange={(e) => updateField('contractEnd', e.target.value)} className="input-field" /></div>
                  <div>
                    <label className="label-field">Payment Terms</label>
                    <select value={form.paymentTerms} onChange={(e) => updateField('paymentTerms', e.target.value)} className="input-field">
                      <option value="">Select...</option>
                      {PAYMENT_TERMS_OPTIONS.map((pt) => <option key={pt} value={pt}>{pt}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-2"><label className="label-field">Contract Details</label><textarea value={form.contractDetails} onChange={(e) => updateField('contractDetails', e.target.value)} className="input-field" rows={3} /></div>
                </div>
              </div>

              {/* Activity Edit */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Activity</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label-field">Job Quantity (read-only)</label>
                    <input type="number" value={rec.jobQuantity != null ? String(rec.jobQuantity) : '0'} className="input-field bg-slate-50" readOnly />
                  </div>
                  <div className="flex items-center gap-3 pt-5">
                    <label className="label-field mb-0">Blacklisted</label>
                    <button
                      type="button"
                      onClick={() => updateField('isBlacklisted', !form.isBlacklisted)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.isBlacklisted ? 'bg-red-600' : 'bg-slate-300'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.isBlacklisted ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                  {form.isBlacklisted && (
                    <div className="md:col-span-2"><label className="label-field">Blacklist Reason</label><textarea value={form.blacklistReason} onChange={(e) => updateField('blacklistReason', e.target.value)} className="input-field" rows={2} /></div>
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <button type="submit" disabled={submitting} className="btn-primary">{submitting ? 'Saving...' : 'Save Changes'}</button>
                <button type="button" onClick={() => setEditing(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          )}
        </>
      )}

      {/* Tab: Contacts */}
      {activeTab === 'Contacts' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Contacts</h3>
            <button
              onClick={() => { setShowContactForm(true); setEditingContactId(null); setContactForm({ name: '', email: '', phone: '', role: '' }); }}
              className="btn-primary text-sm"
            >
              + Add Contact
            </button>
          </div>

          {showContactForm && (
            <div className="border border-slate-200 rounded-lg p-4 mb-4 bg-slate-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div><label className="label-field">Name *</label><input type="text" value={contactForm.name} onChange={(e) => setContactForm((p) => ({ ...p, name: e.target.value }))} className="input-field" required /></div>
                <div><label className="label-field">Email</label><input type="email" value={contactForm.email} onChange={(e) => setContactForm((p) => ({ ...p, email: e.target.value }))} className="input-field" /></div>
                <div><label className="label-field">Phone</label><input type="text" value={contactForm.phone} onChange={(e) => setContactForm((p) => ({ ...p, phone: e.target.value }))} className="input-field" /></div>
                <div><label className="label-field">Role</label><input type="text" value={contactForm.role} onChange={(e) => setContactForm((p) => ({ ...p, role: e.target.value }))} className="input-field" /></div>
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={handleContactSave} disabled={contactLoading} className="btn-primary text-sm">{contactLoading ? 'Saving...' : editingContactId ? 'Update' : 'Save'}</button>
                <button onClick={() => { setShowContactForm(false); setEditingContactId(null); }} className="btn-secondary text-sm">Cancel</button>
              </div>
            </div>
          )}

          {contacts.length === 0 ? (
            <p className="text-sm text-slate-500">No contacts yet</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 font-medium text-slate-600">Name</th>
                  <th className="text-left py-2 font-medium text-slate-600">Email</th>
                  <th className="text-left py-2 font-medium text-slate-600">Phone</th>
                  <th className="text-left py-2 font-medium text-slate-600">Role</th>
                  <th className="text-right py-2 font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((contact) => (
                  <tr key={contact.id} className="border-b border-slate-100">
                    <td className="py-3 text-slate-900">{contact.name}</td>
                    <td className="py-3 text-slate-600">{contact.email || '—'}</td>
                    <td className="py-3 text-slate-600">{contact.phone || '—'}</td>
                    <td className="py-3 text-slate-600">{contact.role || '—'}</td>
                    <td className="py-3 text-right">
                      <button onClick={() => startEditContact(contact)} className="text-blue-600 hover:text-blue-700 text-xs font-medium mr-3">Edit</button>
                      <button onClick={() => handleContactDelete(contact.id)} className="text-red-500 hover:text-red-700 text-xs font-medium">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Tab: AVL */}
      {activeTab === 'AVL' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Approved Vendor List</h3>
            <button
              onClick={() => { setShowAvlForm(true); setEditingAvlId(null); setAvlForm({ vendorName: '', serviceType: '', status: 'IN_PROGRESS', reviewDate: '', notes: '', rejectedReason: '' }); }}
              className="btn-primary text-sm"
            >
              + Add Entry
            </button>
          </div>

          {showAvlForm && (
            <div className="border border-slate-200 rounded-lg p-4 mb-4 bg-slate-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div><label className="label-field">Vendor Name *</label><input type="text" value={avlForm.vendorName} onChange={(e) => setAvlForm((p) => ({ ...p, vendorName: e.target.value }))} className="input-field" required /></div>
                <div><label className="label-field">Service Type</label><input type="text" value={avlForm.serviceType} onChange={(e) => setAvlForm((p) => ({ ...p, serviceType: e.target.value }))} className="input-field" /></div>
                <div>
                  <label className="label-field">Status</label>
                  <select value={avlForm.status} onChange={(e) => setAvlForm((p) => ({ ...p, status: e.target.value }))} className="input-field">
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
                <div><label className="label-field">Review Date</label><input type="date" value={avlForm.reviewDate} onChange={(e) => setAvlForm((p) => ({ ...p, reviewDate: e.target.value }))} className="input-field" /></div>
                <div className="md:col-span-2"><label className="label-field">Notes</label><textarea value={avlForm.notes} onChange={(e) => setAvlForm((p) => ({ ...p, notes: e.target.value }))} className="input-field" rows={2} /></div>
                {avlForm.status === 'REJECTED' && (
                  <div className="md:col-span-2"><label className="label-field">Rejected Reason</label><textarea value={avlForm.rejectedReason} onChange={(e) => setAvlForm((p) => ({ ...p, rejectedReason: e.target.value }))} className="input-field" rows={2} /></div>
                )}
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={handleAvlSave} disabled={avlLoading} className="btn-primary text-sm">{avlLoading ? 'Saving...' : editingAvlId ? 'Update' : 'Save'}</button>
                <button onClick={() => { setShowAvlForm(false); setEditingAvlId(null); }} className="btn-secondary text-sm">Cancel</button>
              </div>
            </div>
          )}

          {avlEntries.length === 0 ? (
            <p className="text-sm text-slate-500">No AVL entries yet</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 font-medium text-slate-600">Vendor Name</th>
                  <th className="text-left py-2 font-medium text-slate-600">Service Type</th>
                  <th className="text-left py-2 font-medium text-slate-600">Status</th>
                  <th className="text-left py-2 font-medium text-slate-600">Review Date</th>
                  <th className="text-left py-2 font-medium text-slate-600">Notes</th>
                  <th className="text-right py-2 font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {avlEntries.map((entry) => (
                  <tr key={entry.id} className="border-b border-slate-100">
                    <td className="py-3 text-slate-900">{entry.vendorName}</td>
                    <td className="py-3 text-slate-600">{entry.serviceType || '—'}</td>
                    <td className="py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${AVL_STATUS_BADGE[entry.status] || 'bg-slate-100 text-slate-700'}`}>
                        {entry.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 text-slate-600">{entry.reviewDate ? new Date(entry.reviewDate).toLocaleDateString() : '—'}</td>
                    <td className="py-3 text-slate-600 max-w-[200px] truncate">{entry.notes || '—'}</td>
                    <td className="py-3 text-right">
                      <button onClick={() => startEditAvl(entry)} className="text-blue-600 hover:text-blue-700 text-xs font-medium mr-3">Edit</button>
                      <button onClick={() => handleAvlDelete(entry.id)} className="text-red-500 hover:text-red-700 text-xs font-medium">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Tab: Documents */}
      {activeTab === 'Documents' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Documents</h3>
            <div className="flex items-center gap-2">
              <select className="input-field w-40 text-xs" value={docType} onChange={(e) => setDocType(e.target.value)}>
                {['contract', 'certificate', 'invoice', 'declaration', 'other'].map((dt) => (
                  <option key={dt} value={dt}>{dt.replace('_', ' ').toUpperCase()}</option>
                ))}
              </select>
              <label className={`btn-secondary text-xs cursor-pointer ${uploadingDoc ? 'opacity-50 pointer-events-none' : ''}`}>
                {uploadingDoc ? 'Uploading...' : '+ Upload'}
                <input type="file" className="hidden" disabled={uploadingDoc} onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setUploadingDoc(true);
                  try {
                    await uploadDocument(file, docType, 'client', id);
                    await loadDocuments();
                  } catch { /* ignore */ }
                  setUploadingDoc(false);
                  e.target.value = '';
                }} />
              </label>
            </div>
          </div>
          {documents.length === 0 ? (
            <p className="text-sm text-slate-500">No documents uploaded</p>
          ) : (
            <div className="space-y-2">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">{doc.docType}</span>
                    <span className="text-sm text-slate-900 truncate">{doc.originalName}</span>
                    <span className="text-xs text-slate-400">{new Date(doc.createdAt).toLocaleDateString()}</span>
                  </div>
                  <button onClick={async () => {
                    if (!confirm('Delete this document?')) return;
                    try {
                      await deleteDocument(doc.id);
                      setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
                    } catch { /* ignore */ }
                  }} className="text-red-500 hover:text-red-700 text-xs font-medium shrink-0 ml-2">Delete</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
