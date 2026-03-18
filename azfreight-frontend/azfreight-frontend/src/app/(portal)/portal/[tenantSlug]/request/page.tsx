'use client';

import { useState, useCallback, type DragEvent, type ChangeEvent } from 'react';
import { useParams } from 'next/navigation';
import { submitShipmentRequest } from '@/lib/api/portal';
import {
  CARGO_REQUIREMENTS,
  CARGO_TYPE_LABELS,
  DOC_TYPE_LABELS,
  TRANSPORT_TYPE_OPTIONS,
  INCOTERMS_OPTIONS,
} from '@/lib/cargo-requirements';

interface FileWithType {
  file: File;
  docType: string;
}

const STEPS = ['Contact Info', 'Route & Transport', 'Cargo', 'Documents', 'Confirmation'];

export default function ShipmentRequestPage() {
  const params = useParams();
  const tenantSlug = params.tenantSlug as string;
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [error, setError] = useState('');

  // Step 1
  const [requesterName, setRequesterName] = useState('');
  const [requesterEmail, setRequesterEmail] = useState('');
  const [requesterPhone, setRequesterPhone] = useState('');
  const [companyName, setCompanyName] = useState('');

  // Step 2
  const [originCountry, setOriginCountry] = useState('');
  const [originCity, setOriginCity] = useState('');
  const [destinationCountry, setDestinationCountry] = useState('');
  const [destinationCity, setDestinationCity] = useState('');
  const [transportType, setTransportType] = useState('road_tir');
  const [preferredDate, setPreferredDate] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);

  // Step 3
  const [cargoType, setCargoType] = useState('other');
  const [cargoDescription, setCargoDescription] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [volumeCbm, setVolumeCbm] = useState('');
  const [packageCount, setPackageCount] = useState('');
  const [declaredValue, setDeclaredValue] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [incoterms, setIncoterms] = useState('');
  const [hsCode, setHsCode] = useState('');
  const [isHazmat, setIsHazmat] = useState(false);
  const [needsRefrigeration, setNeedsRefrigeration] = useState(false);
  const [isFragile, setIsFragile] = useState(false);
  const [needsCustomsClearance, setNeedsCustomsClearance] = useState(false);

  // Step 4
  const [files, setFiles] = useState<FileWithType[]>([]);
  const [dragOver, setDragOver] = useState(false);

  // Step 5
  const [agreed, setAgreed] = useState(false);

  const cargoReqs = CARGO_REQUIREMENTS[cargoType] || CARGO_REQUIREMENTS.other;
  const allDocTypes = Array.from(new Set([...cargoReqs.required, ...cargoReqs.recommended]));
  const uploadedDocTypes = files.map((f) => f.docType);

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...dropped.map((f) => ({ file: f, docType: 'other' }))]);
  }, []);

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selected = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...selected.map((f) => ({ file: f, docType: 'other' }))]);
    e.target.value = '';
  };

  const removeFile = (idx: number) => setFiles((prev) => prev.filter((_, i) => i !== idx));
  const setFileDocType = (idx: number, docType: string) =>
    setFiles((prev) => prev.map((f, i) => (i === idx ? { ...f, docType } : f)));

  const canNext = (): boolean => {
    if (step === 0) return !!(requesterName && requesterEmail);
    if (step === 1) return !!(originCountry && originCity && destinationCountry && destinationCity);
    if (step === 2) return !!(cargoType && cargoDescription);
    if (step === 4) return agreed;
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('requesterName', requesterName);
      formData.append('requesterEmail', requesterEmail);
      if (requesterPhone) formData.append('requesterPhone', requesterPhone);
      if (companyName) formData.append('companyName', companyName);
      formData.append('originCountry', originCountry);
      formData.append('originCity', originCity);
      formData.append('destinationCountry', destinationCountry);
      formData.append('destinationCity', destinationCity);
      formData.append('cargoType', cargoType);
      formData.append('cargoDescription', cargoDescription);
      if (weightKg) formData.append('weightKg', weightKg);
      if (volumeCbm) formData.append('volumeCbm', volumeCbm);
      if (packageCount) formData.append('packageCount', packageCount);
      if (declaredValue) formData.append('declaredValue', declaredValue);
      formData.append('currency', currency);
      if (incoterms) formData.append('incoterms', incoterms);
      if (hsCode) formData.append('hsCode', hsCode);
      formData.append('transportType', transportType);
      if (preferredDate) formData.append('preferredDate', preferredDate);
      formData.append('isUrgent', String(isUrgent));
      const fileDocTypes = files.map((f) => f.docType);
      formData.append(
        'specialRequirements',
        JSON.stringify({
          isHazmat,
          needsRefrigeration,
          isFragile,
          needsCustomsClearance,
          fileDocTypes,
        }),
      );

      files.forEach((f) => {
        formData.append('files', f.file);
      });

      const res = await submitShipmentRequest(tenantSlug, formData);
      setSubmitted(res.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to submit');
    }
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto text-center py-16">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Request Submitted!</h1>
        <p className="text-slate-600 mb-4">Your request ID: <span className="font-mono font-semibold">{submitted.slice(0, 8)}</span></p>
        <p className="text-slate-500">We will contact you within 24 hours.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Shipment Request</h1>

      {/* Stepper */}
      <div className="flex items-center mb-8 gap-1">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center flex-1">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold shrink-0 ${
              i < step ? 'bg-green-500 text-white' : i === step ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'
            }`}>
              {i < step ? '\u2713' : i + 1}
            </div>
            <span className={`ml-2 text-xs hidden sm:inline ${i === step ? 'font-semibold text-slate-900' : 'text-slate-400'}`}>{s}</span>
            {i < STEPS.length - 1 && <div className="flex-1 h-px bg-slate-200 mx-2" />}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        {/* Step 1: Contact */}
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                <input type="text" value={requesterName} onChange={(e) => setRequesterName(e.target.value)} className="input-field w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                <input type="email" value={requesterEmail} onChange={(e) => setRequesterEmail(e.target.value)} className="input-field w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                <input type="tel" value={requesterPhone} onChange={(e) => setRequesterPhone(e.target.value)} className="input-field w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
                <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="input-field w-full" />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Route */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-4">Route & Transport</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Origin Country *</label>
                <input type="text" value={originCountry} onChange={(e) => setOriginCountry(e.target.value)} className="input-field w-full" placeholder="e.g. China" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Origin City *</label>
                <input type="text" value={originCity} onChange={(e) => setOriginCity(e.target.value)} className="input-field w-full" placeholder="e.g. Shanghai" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Destination Country *</label>
                <input type="text" value={destinationCountry} onChange={(e) => setDestinationCountry(e.target.value)} className="input-field w-full" placeholder="e.g. Azerbaijan" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Destination City *</label>
                <input type="text" value={destinationCity} onChange={(e) => setDestinationCity(e.target.value)} className="input-field w-full" placeholder="e.g. Baku" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Transport Type *</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {TRANSPORT_TYPE_OPTIONS.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setTransportType(t.value)}
                    className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      transportType === t.value ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Preferred Date</label>
                <input type="date" value={preferredDate} onChange={(e) => setPreferredDate(e.target.value)} className="input-field w-full" />
              </div>
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={isUrgent} onChange={(e) => setIsUrgent(e.target.checked)} className="w-4 h-4 rounded border-slate-300" />
                  <span className="text-sm font-medium text-red-600">Urgent Shipment</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Cargo */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-4">Cargo Details</h2>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Cargo Type *</label>
              <select value={cargoType} onChange={(e) => setCargoType(e.target.value)} className="input-field w-full">
                {Object.keys(CARGO_TYPE_LABELS).map((k) => (
                  <option key={k} value={k}>{CARGO_TYPE_LABELS[k]}</option>
                ))}
              </select>
            </div>
            {cargoReqs.notes && (
              <div className={`p-3 rounded-lg text-sm ${cargoReqs.hazmat || cargoReqs.restricted ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                {cargoReqs.notes}
              </div>
            )}
            <div className="flex flex-wrap gap-3">
              {cargoReqs.hazmat && (
                <label className="flex items-center gap-2"><input type="checkbox" checked={isHazmat} onChange={(e) => setIsHazmat(e.target.checked)} className="w-4 h-4" /><span className="text-sm text-slate-700">Hazardous (ADR/IMDG)</span></label>
              )}
              {cargoReqs.needsRefrigeration && (
                <label className="flex items-center gap-2"><input type="checkbox" checked={needsRefrigeration} onChange={(e) => setNeedsRefrigeration(e.target.checked)} className="w-4 h-4" /><span className="text-sm text-slate-700">Needs Refrigeration</span></label>
              )}
              <label className="flex items-center gap-2"><input type="checkbox" checked={isFragile} onChange={(e) => setIsFragile(e.target.checked)} className="w-4 h-4" /><span className="text-sm text-slate-700">Fragile</span></label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={needsCustomsClearance} onChange={(e) => setNeedsCustomsClearance(e.target.checked)} className="w-4 h-4" /><span className="text-sm text-slate-700">Customs Clearance</span></label>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description *</label>
              <textarea value={cargoDescription} onChange={(e) => setCargoDescription(e.target.value)} rows={3} className="input-field w-full" placeholder="Describe the cargo..." />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Weight (kg)</label>
                <input type="number" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} className="input-field w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Volume (CBM)</label>
                <input type="number" value={volumeCbm} onChange={(e) => setVolumeCbm(e.target.value)} className="input-field w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Packages</label>
                <input type="number" value={packageCount} onChange={(e) => setPackageCount(e.target.value)} className="input-field w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">HS Code</label>
                <input type="text" value={hsCode} onChange={(e) => setHsCode(e.target.value)} className="input-field w-full" placeholder="e.g. 8471.30" />
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Declared Value</label>
                <input type="number" value={declaredValue} onChange={(e) => setDeclaredValue(e.target.value)} className="input-field w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Currency</label>
                <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="input-field w-full">
                  {['USD', 'EUR', 'GBP', 'AZN', 'TRY', 'CNY', 'RUB'].map((c) => (<option key={c} value={c}>{c}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Incoterms</label>
                <select value={incoterms} onChange={(e) => setIncoterms(e.target.value)} className="input-field w-full">
                  <option value="">Select...</option>
                  {INCOTERMS_OPTIONS.map((i) => (<option key={i} value={i}>{i}</option>))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Documents */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-4">Documents</h2>
            <div className="space-y-2 mb-4">
              {allDocTypes.map((dt) => {
                const isRequired = cargoReqs.required.includes(dt);
                const isUploaded = uploadedDocTypes.includes(dt);
                return (
                  <div key={dt} className="flex items-center gap-2 text-sm">
                    {isUploaded ? (
                      <span className="text-green-600 font-bold">&#10003;</span>
                    ) : isRequired ? (
                      <span className="text-red-500 font-bold">&#10007;</span>
                    ) : (
                      <span className="text-amber-500">&#9888;</span>
                    )}
                    <span className={isRequired ? 'font-medium' : 'text-slate-500'}>
                      {DOC_TYPE_LABELS[dt] || dt}
                      {isRequired ? ' (required)' : ' (recommended)'}
                    </span>
                  </div>
                );
              })}
            </div>

            <div
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                dragOver ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-slate-400'
              }`}
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <p className="text-sm text-slate-600">Drag & drop files here, or click to browse</p>
              <p className="text-xs text-slate-400 mt-1">PDF, JPG, PNG — max 20MB per file, up to 10 files</p>
              <input
                id="file-input"
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileInput}
                className="hidden"
              />
            </div>

            {files.length > 0 && (
              <div className="space-y-2">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center gap-3 bg-slate-50 rounded-lg px-4 py-2">
                    <span className="text-sm text-slate-700 flex-1 truncate">{f.file.name}</span>
                    <span className="text-xs text-slate-400">{(f.file.size / 1024).toFixed(0)} KB</span>
                    <select
                      value={f.docType}
                      onChange={(e) => setFileDocType(i, e.target.value)}
                      className="text-xs border border-slate-200 rounded px-2 py-1"
                    >
                      {Object.keys(DOC_TYPE_LABELS).map((dt) => (
                        <option key={dt} value={dt}>{DOC_TYPE_LABELS[dt]}</option>
                      ))}
                    </select>
                    <button onClick={() => removeFile(i)} className="text-red-400 hover:text-red-600 text-sm">&#10007;</button>
                  </div>
                ))}
              </div>
            )}

            {files.length === 0 && (
              <p className="text-sm text-amber-600">You can submit without documents, but processing may take longer.</p>
            )}
          </div>
        )}

        {/* Step 5: Confirmation */}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-4">Review & Submit</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="font-medium text-slate-900 mb-2">Contact</h3>
                <p>{requesterName}</p>
                <p className="text-slate-500">{requesterEmail}</p>
                {requesterPhone && <p className="text-slate-500">{requesterPhone}</p>}
                {companyName && <p className="text-slate-500">{companyName}</p>}
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="font-medium text-slate-900 mb-2">Route</h3>
                <p>{originCity}, {originCountry} &rarr; {destinationCity}, {destinationCountry}</p>
                <p className="text-slate-500">{TRANSPORT_TYPE_OPTIONS.find((t) => t.value === transportType)?.label}</p>
                {preferredDate && <p className="text-slate-500">Date: {preferredDate}</p>}
                {isUrgent && <p className="text-red-600 font-medium">URGENT</p>}
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="font-medium text-slate-900 mb-2">Cargo</h3>
                <p>{CARGO_TYPE_LABELS[cargoType]}</p>
                <p className="text-slate-500">{cargoDescription}</p>
                {weightKg && <p className="text-slate-500">{weightKg} kg</p>}
                {volumeCbm && <p className="text-slate-500">{volumeCbm} CBM</p>}
                {packageCount && <p className="text-slate-500">{packageCount} packages</p>}
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="font-medium text-slate-900 mb-2">Documents</h3>
                <p>{files.length} file(s) attached</p>
                {files.map((f, i) => (
                  <p key={i} className="text-slate-500 truncate">{f.file.name} ({DOC_TYPE_LABELS[f.docType]})</p>
                ))}
              </div>
            </div>
            <label className="flex items-start gap-2 mt-4 cursor-pointer">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="w-4 h-4 mt-0.5" />
              <span className="text-sm text-slate-600">I agree to the processing of my personal data for the purpose of handling this shipment request.</span>
            </label>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-6 pt-4 border-t border-slate-100">
          <button
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 disabled:opacity-30"
          >
            Back
          </button>
          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canNext()}
              className="btn-primary disabled:opacity-50"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!agreed || submitting}
              className="btn-primary disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
