'use client';

import { useState, useCallback, useEffect, type DragEvent, type ChangeEvent } from 'react';
import { useParams } from 'next/navigation';
import { submitShipmentRequest } from '@/lib/api/portal';
import { CARGO_REQUIREMENTS, DOC_TYPE_LABELS, INCOTERMS_OPTIONS } from '@/lib/cargo-requirements';
import { COUNTRIES, type CountryData } from '@/lib/countries-cities';
import { useTranslation } from '@/lib/i18n';

interface FileWithType { file: File; docType: string; }

const STEP_KEYS = ['requestForm.steps.contact', 'requestForm.steps.route', 'requestForm.steps.cargo', 'requestForm.steps.documents', 'requestForm.steps.confirmation'];
const TRANSPORT_OPT_KEYS = ['road_tir', 'sea', 'air', 'rail'];

// Двухуровневые типы груза
const CARGO_TYPES: Record<string, { label: string; subcategories: string[] }> = {
  electronics: { label: 'Electronics / Электроника', subcategories: ['Computers & Laptops', 'Smartphones & Tablets', 'Computer Accessories', 'TV & Audio', 'Industrial Electronics', 'Semiconductors', 'Other Electronics'] },
  food_beverage: { label: 'Food & Beverage / Продукты питания', subcategories: ['Fresh Fruits & Vegetables', 'Frozen Food', 'Dry Food & Grains', 'Beverages', 'Dairy Products', 'Meat & Seafood', 'Confectionery', 'Other Food'] },
  clothing_textile: { label: 'Clothing & Textile / Одежда и ткани', subcategories: ["Men's Clothing", "Women's Clothing", "Children's Clothing", 'Footwear', 'Fabrics & Textile', 'Accessories', 'Other Clothing'] },
  chemicals: { label: 'Chemicals / Химикаты', subcategories: ['Industrial Chemicals', 'Cleaning Products', 'Fertilizers', 'Paints & Coatings', 'Adhesives', 'Other Chemicals'] },
  machinery: { label: 'Machinery & Equipment / Оборудование', subcategories: ['Construction Equipment', 'Agricultural Machinery', 'Industrial Equipment', 'Medical Equipment', 'HVAC Equipment', 'Power Tools', 'Other Machinery'] },
  pharma: { label: 'Pharmaceuticals / Фармацевтика', subcategories: ['Medicines', 'Medical Devices', 'Supplements', 'Veterinary Products', 'Other Pharma'] },
  automotive: { label: 'Automotive / Автомобили и запчасти', subcategories: ['Passenger Cars', 'Commercial Vehicles', 'Motorcycles', 'Spare Parts', 'Tires', 'Other Automotive'] },
  construction: { label: 'Construction Materials / Стройматериалы', subcategories: ['Steel & Metal', 'Cement & Concrete', 'Wood & Timber', 'Glass', 'Tiles & Ceramics', 'Insulation', 'Other Construction'] },
  furniture: { label: 'Furniture & Home / Мебель', subcategories: ['Office Furniture', 'Home Furniture', 'Kitchen Equipment', 'Lighting', 'Decor', 'Other Furniture'] },
  oil_gas: { label: 'Oil & Gas / Нефть и газ', subcategories: ['Crude Oil', 'Petroleum Products', 'LPG', 'Pipeline Equipment', 'Other Oil & Gas'] },
  alcohol_tobacco: { label: 'Alcohol & Tobacco / Алкоголь и табак', subcategories: ['Wine & Spirits', 'Beer', 'Tobacco Products', 'Other'] },
  animals: { label: 'Live Animals / Живые животные', subcategories: ['Livestock', 'Pets', 'Poultry', 'Other Animals'] },
  plants: { label: 'Plants & Seeds / Растения', subcategories: ['Flowers', 'Seeds', 'Seedlings', 'Other Plants'] },
  other: { label: 'Other / Прочее', subcategories: ['Mixed Cargo', 'Personal Effects', 'Other'] },
};

// CBM коэффициенты
const CBM_DIVISORS: Record<string, number> = { cm: 1000000, mm: 1000000000, m: 1, inch: 61023.7, ft: 35.3147 };

export default function ShipmentRequestPage() {
  const params = useParams();
  const tenantSlug = params.tenantSlug as string;
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [error, setError] = useState('');
  const { t, locale } = useTranslation();

  // Step 1: Contact
  const [requesterName, setRequesterName] = useState('');
  const [requesterEmail, setRequesterEmail] = useState('');
  const [requesterPhone, setRequesterPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [voen, setVoen] = useState('');

  // Step 2: Route — автодополнение
  const [originCountry, setOriginCountry] = useState('');
  const [originCity, setOriginCity] = useState('');
  const [destCountry, setDestCountry] = useState('');
  const [destCity, setDestCity] = useState('');
  const [showOriginCountries, setShowOriginCountries] = useState(false);
  const [showOriginCities, setShowOriginCities] = useState(false);
  const [showDestCountries, setShowDestCountries] = useState(false);
  const [showDestCities, setShowDestCities] = useState(false);
  const [selectedOriginCountry, setSelectedOriginCountry] = useState<CountryData | null>(null);
  const [selectedDestCountry, setSelectedDestCountry] = useState<CountryData | null>(null);

  // Step 2: Мультимодальная доставка
  const [transportTypes, setTransportTypes] = useState<string[]>(['road_tir']);
  const [transportOrder, setTransportOrder] = useState<string[]>(['road_tir']);
  const [preferredDate, setPreferredDate] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  // Step 3: Cargo
  const [cargoType, setCargoType] = useState('other');
  const [cargoSubtype, setCargoSubtype] = useState('');
  const [cargoDescription, setCargoDescription] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [packageCount, setPackageCount] = useState('');
  const [dimLength, setDimLength] = useState('');
  const [dimWidth, setDimWidth] = useState('');
  const [dimHeight, setDimHeight] = useState('');
  const [dimUnit, setDimUnit] = useState('cm');
  const [isHazmat, setIsHazmat] = useState(false);
  const [needsRefrigeration, setNeedsRefrigeration] = useState(false);
  const [isFragile, setIsFragile] = useState(false);
  const [needsCustomsClearance, setNeedsCustomsClearance] = useState(false);
  const [isGroupage, setIsGroupage] = useState(false);
  const [isStackable, setIsStackable] = useState(false);
  const [customsOpen, setCustomsOpen] = useState(false);
  const [declaredValue, setDeclaredValue] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [incoterms, setIncoterms] = useState('');
  const [hsCode, setHsCode] = useState('');

  // Step 4: Documents
  const [files, setFiles] = useState<FileWithType[]>([]);
  const [dragOver, setDragOver] = useState(false);

  // Step 5
  const [agreed, setAgreed] = useState(false);

  // CBM расчёт
  const calcCbm = (): number => {
    const l = parseFloat(dimLength); const w = parseFloat(dimWidth); const h = parseFloat(dimHeight);
    if (!l || !w || !h) return 0;
    return (l * w * h) / CBM_DIVISORS[dimUnit];
  };
  const cbmValue = calcCbm();

  // Автодополнение: фильтр стран по вводу
  const filterCountries = (query: string): CountryData[] => {
    if (query.length < 2) return [];
    const q = query.toLowerCase();
    return COUNTRIES.filter((c) =>
      c.name.en.toLowerCase().includes(q) || c.name.ru.toLowerCase().includes(q) || c.name.az.toLowerCase().includes(q)
    ).slice(0, 8);
  };

  const filterCities = (country: CountryData | null, query: string) => {
    if (!country || query.length < 1) return [];
    const q = query.toLowerCase();
    return country.cities.filter((c) =>
      c.name.en.toLowerCase().includes(q) || c.name.ru.toLowerCase().includes(q) || c.name.az.toLowerCase().includes(q)
    ).slice(0, 8);
  };

  const getCountryName = (c: CountryData) => c.name[locale] || c.name.en;
  const getCityName = (c: { name: Record<string, string> }) => c.name[locale] || c.name.en;

  // Мультимодальная: toggle транспорта
  const toggleTransport = (val: string) => {
    setTransportTypes((prev) => {
      const next = prev.includes(val) ? prev.filter((t) => t !== val) : [...prev, val];
      setTransportOrder((ord) => {
        const newOrd = ord.filter((t) => next.includes(t));
        next.forEach((t) => { if (!newOrd.includes(t)) newOrd.push(t); });
        return newOrd;
      });
      return next;
    });
  };

  // Drag-and-drop порядок этапов
  const handleOrderDragStart = (idx: number) => setDragIdx(idx);
  const handleOrderDrop = (targetIdx: number) => {
    if (dragIdx === null) return;
    setTransportOrder((prev) => {
      const arr = [...prev];
      const [moved] = arr.splice(dragIdx, 1);
      arr.splice(targetIdx, 0, moved);
      return arr;
    });
    setDragIdx(null);
  };

  // Автооткрытие customs секции
  useEffect(() => { if (needsCustomsClearance) setCustomsOpen(true); }, [needsCustomsClearance]);

  const cargoReqs = CARGO_REQUIREMENTS[cargoType] || CARGO_REQUIREMENTS.other;
  const allDocTypes = Array.from(new Set([...cargoReqs.required, ...cargoReqs.recommended]));
  const uploadedDocTypes = files.map((f) => f.docType);

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault(); setDragOver(false);
    setFiles((prev) => [...prev, ...Array.from(e.dataTransfer.files).map((f) => ({ file: f, docType: 'other' }))]);
  }, []);

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setFiles((prev) => [...prev, ...Array.from(e.target.files!).map((f) => ({ file: f, docType: 'other' }))]);
    e.target.value = '';
  };

  const removeFile = (idx: number) => setFiles((prev) => prev.filter((_, i) => i !== idx));
  const setFileDocType = (idx: number, docType: string) =>
    setFiles((prev) => prev.map((f, i) => (i === idx ? { ...f, docType } : f)));

  const canNext = (): boolean => {
    if (step === 0) return !!(requesterName && requesterEmail);
    if (step === 1) return !!(originCountry && originCity && destCountry && destCity && transportTypes.length > 0);
    if (step === 2) return !!(cargoType && cargoDescription);
    if (step === 4) return agreed;
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true); setError('');
    try {
      const formData = new FormData();
      formData.append('requesterName', requesterName);
      formData.append('requesterEmail', requesterEmail);
      if (requesterPhone) formData.append('requesterPhone', requesterPhone);
      if (companyName) formData.append('companyName', companyName);
      if (voen) formData.append('voen', voen);
      formData.append('originCountry', originCountry);
      formData.append('originCity', originCity);
      formData.append('destinationCountry', destCountry);
      formData.append('destinationCity', destCity);
      formData.append('cargoType', cargoType);
      if (cargoSubtype) formData.append('cargoSubtype', cargoSubtype);
      formData.append('cargoDescription', cargoDescription);
      if (weightKg) formData.append('weightKg', weightKg);
      if (cbmValue > 0) formData.append('volumeCbm', cbmValue.toFixed(3));
      if (packageCount) formData.append('packageCount', packageCount);
      formData.append('transportTypes', JSON.stringify(transportTypes));
      formData.append('transportOrder', JSON.stringify(transportOrder));
      if (preferredDate) formData.append('preferredDate', preferredDate);
      formData.append('isUrgent', String(isUrgent));
      if (needsCustomsClearance) {
        if (declaredValue) formData.append('declaredValue', declaredValue);
        formData.append('currency', currency);
        if (incoterms) formData.append('incoterms', incoterms);
        if (hsCode) formData.append('hsCode', hsCode);
      }
      formData.append('specialRequirements', JSON.stringify({
        isHazmat, needsRefrigeration, isFragile, needsCustomsClearance, isGroupage, isStackable,
        fileDocTypes: files.map((f) => f.docType),
      }));
      files.forEach((f) => formData.append('files', f.file));
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
        <h1 className="text-2xl font-bold text-slate-900 mb-2">{t('requestForm.requestSubmitted')}</h1>
        <p className="text-slate-600 mb-4">{t('requestForm.requestId')}: <span className="font-mono font-semibold">{submitted.slice(0, 8)}</span></p>
        <p className="text-slate-500">{t('requestForm.willContact')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">{t('requestForm.title')}</h1>

      {/* Stepper */}
      <div className="flex items-center mb-8 gap-1">
        {STEP_KEYS.map((s, i) => (
          <div key={s} className="flex items-center flex-1">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold shrink-0 ${
              i < step ? 'bg-green-500 text-white' : i === step ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'
            }`}>
              {i < step ? '\u2713' : i + 1}
            </div>
            <span className={`ml-2 text-xs hidden sm:inline ${i === step ? 'font-semibold text-slate-900' : 'text-slate-400'}`}>{t(s)}</span>
            {i < STEP_KEYS.length - 1 && <div className="flex-1 h-px bg-slate-200 mx-2" />}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm transition-all duration-300">
        {/* Step 1: Contact */}
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-4">{t('requestForm.steps.contact')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-slate-700 mb-1">{t('requestForm.fullName')} *</label>
                <input type="text" value={requesterName} onChange={(e) => setRequesterName(e.target.value)} className="input-field w-full" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">{t('requestForm.emailAddress')} *</label>
                <input type="email" value={requesterEmail} onChange={(e) => setRequesterEmail(e.target.value)} className="input-field w-full" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">{t('requestForm.phoneNumber')}</label>
                <input type="tel" value={requesterPhone} onChange={(e) => setRequesterPhone(e.target.value)} className="input-field w-full" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">{t('requestForm.companyName')}</label>
                <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="input-field w-full" /></div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('requestForm.voen')}</label>
                <input type="text" value={voen} onChange={(e) => setVoen(e.target.value.replace(/\D/g, '').slice(0, 10))} className="input-field w-full sm:w-1/2" placeholder="1234567890" maxLength={10} />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Route & Transport */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-4">{t('requestForm.steps.route')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Origin Country с автодополнением */}
              <div className="relative">
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('requestForm.originCountry')} *</label>
                <input type="text" value={originCountry} onChange={(e) => { setOriginCountry(e.target.value); setShowOriginCountries(true); setSelectedOriginCountry(null); }} onFocus={() => originCountry.length >= 2 && setShowOriginCountries(true)} onBlur={() => setTimeout(() => setShowOriginCountries(false), 200)} className="input-field w-full" placeholder="Start typing..." />
                {showOriginCountries && filterCountries(originCountry).length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {filterCountries(originCountry).map((c, i) => (
                      <button key={i} type="button" className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 transition-colors" onMouseDown={() => { setOriginCountry(getCountryName(c)); setSelectedOriginCountry(c); setShowOriginCountries(false); setOriginCity(''); }}>
                        {getCountryName(c)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {/* Origin City */}
              <div className="relative">
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('requestForm.originCity')} *</label>
                <input type="text" value={originCity} onChange={(e) => { setOriginCity(e.target.value); setShowOriginCities(true); }} onFocus={() => setShowOriginCities(true)} onBlur={() => setTimeout(() => setShowOriginCities(false), 200)} className="input-field w-full" placeholder="Start typing..." />
                {showOriginCities && selectedOriginCountry && filterCities(selectedOriginCountry, originCity).length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {filterCities(selectedOriginCountry, originCity).map((c, i) => (
                      <button key={i} type="button" className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50" onMouseDown={() => { setOriginCity(getCityName(c)); setShowOriginCities(false); }}>
                        {getCityName(c)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {/* Destination Country */}
              <div className="relative">
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('requestForm.destinationCountry')} *</label>
                <input type="text" value={destCountry} onChange={(e) => { setDestCountry(e.target.value); setShowDestCountries(true); setSelectedDestCountry(null); }} onFocus={() => destCountry.length >= 2 && setShowDestCountries(true)} onBlur={() => setTimeout(() => setShowDestCountries(false), 200)} className="input-field w-full" placeholder="Start typing..." />
                {showDestCountries && filterCountries(destCountry).length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {filterCountries(destCountry).map((c, i) => (
                      <button key={i} type="button" className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50" onMouseDown={() => { setDestCountry(getCountryName(c)); setSelectedDestCountry(c); setShowDestCountries(false); setDestCity(''); }}>
                        {getCountryName(c)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {/* Destination City */}
              <div className="relative">
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('requestForm.destinationCity')} *</label>
                <input type="text" value={destCity} onChange={(e) => { setDestCity(e.target.value); setShowDestCities(true); }} onFocus={() => setShowDestCities(true)} onBlur={() => setTimeout(() => setShowDestCities(false), 200)} className="input-field w-full" placeholder="Start typing..." />
                {showDestCities && selectedDestCountry && filterCities(selectedDestCountry, destCity).length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {filterCities(selectedDestCountry, destCity).map((c, i) => (
                      <button key={i} type="button" className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50" onMouseDown={() => { setDestCity(getCityName(c)); setShowDestCities(false); }}>
                        {getCityName(c)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {/* Мультимодальная доставка — чекбоксы */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">{t('requestForm.transportTypes')} *</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {TRANSPORT_OPT_KEYS.map((val) => (
                  <label key={val} className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${transportTypes.includes(val) ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                    <input type="checkbox" checked={transportTypes.includes(val)} onChange={() => toggleTransport(val)} className="w-4 h-4 rounded" />
                    <span className="text-sm font-medium">{t('transport.' + val)}</span>
                  </label>
                ))}
              </div>
            </div>
            {/* Порядок следования этапов (drag-and-drop) */}
            {transportTypes.length > 1 && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">{t('requestForm.transportOrder')}</label>
                <div className="flex flex-wrap gap-2">
                  {transportOrder.map((tp, idx) => (
                    <div key={tp} draggable onDragStart={() => handleOrderDragStart(idx)} onDragOver={(e) => e.preventDefault()} onDrop={() => handleOrderDrop(idx)}
                      className="flex items-center gap-1 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg cursor-grab active:cursor-grabbing text-sm font-medium text-blue-700">
                      <span className="text-blue-400 mr-1">{idx + 1}.</span>
                      {t('transport.' + tp)}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-slate-700 mb-1">{t('requestForm.preferredDate')}</label>
                <input type="date" value={preferredDate} onChange={(e) => setPreferredDate(e.target.value)} className="input-field w-full" /></div>
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={isUrgent} onChange={(e) => setIsUrgent(e.target.checked)} className="w-4 h-4 rounded border-slate-300" />
                  <span className="text-sm font-medium text-red-600">{t('requestForm.urgentShipment')}</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Cargo */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-4">{t('requestForm.steps.cargo')}</h2>
            {/* Двухуровневый выбор типа */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('requestForm.cargoType')} *</label>
                <select value={cargoType} onChange={(e) => { setCargoType(e.target.value); setCargoSubtype(''); }} className="input-field w-full">
                  {Object.entries(CARGO_TYPES).map(([k, v]) => (<option key={k} value={k}>{v.label}</option>))}
                </select>
              </div>
              {CARGO_TYPES[cargoType]?.subcategories.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('requestForm.cargoSubtype')}</label>
                  <select value={cargoSubtype} onChange={(e) => setCargoSubtype(e.target.value)} className="input-field w-full">
                    <option value="">Select...</option>
                    {CARGO_TYPES[cargoType].subcategories.map((s) => (<option key={s} value={s}>{s}</option>))}
                  </select>
                </div>
              )}
            </div>
            {cargoReqs.notes && (
              <div className={`p-3 rounded-lg text-sm ${cargoReqs.hazmat || cargoReqs.restricted ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                {cargoReqs.notes}
              </div>
            )}
            {/* Special Requirements */}
            <div className="flex flex-wrap gap-3">
              {cargoReqs.hazmat && (
                <label className="flex items-center gap-2"><input type="checkbox" checked={isHazmat} onChange={(e) => setIsHazmat(e.target.checked)} className="w-4 h-4" /><span className="text-sm text-slate-700">{t('requestForm.hazardous')}</span></label>
              )}
              {cargoReqs.needsRefrigeration && (
                <label className="flex items-center gap-2"><input type="checkbox" checked={needsRefrigeration} onChange={(e) => setNeedsRefrigeration(e.target.checked)} className="w-4 h-4" /><span className="text-sm text-slate-700">{t('requestForm.refrigeration')}</span></label>
              )}
              <label className="flex items-center gap-2"><input type="checkbox" checked={isFragile} onChange={(e) => setIsFragile(e.target.checked)} className="w-4 h-4" /><span className="text-sm text-slate-700">{t('requestForm.fragile')}</span></label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={needsCustomsClearance} onChange={(e) => setNeedsCustomsClearance(e.target.checked)} className="w-4 h-4" /><span className="text-sm text-slate-700">{t('requestForm.customsClearance')}</span></label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={isGroupage} onChange={(e) => setIsGroupage(e.target.checked)} className="w-4 h-4" /><span className="text-sm text-slate-700">{t('requestForm.groupageLcl')}</span></label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={isStackable} onChange={(e) => setIsStackable(e.target.checked)} className="w-4 h-4" /><span className="text-sm text-slate-700">{t('requestForm.stackable')}</span></label>
            </div>
            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('requestForm.cargoDescription')} *</label>
              <textarea value={cargoDescription} onChange={(e) => setCargoDescription(e.target.value)} rows={3} className="input-field w-full" />
            </div>
            {/* Weight & Packages */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div><label className="block text-sm font-medium text-slate-700 mb-1">{t('requestForm.weight')}</label>
                <input type="number" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} className="input-field w-full" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">{t('requestForm.packages')}</label>
                <input type="number" value={packageCount} onChange={(e) => setPackageCount(e.target.value)} className="input-field w-full" /></div>
            </div>
            {/* CBM Calculator */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">{t('requestForm.volume')}</label>
              <div className="grid grid-cols-4 gap-2">
                <div><input type="number" value={dimLength} onChange={(e) => setDimLength(e.target.value)} className="input-field w-full" placeholder="L" /></div>
                <div><input type="number" value={dimWidth} onChange={(e) => setDimWidth(e.target.value)} className="input-field w-full" placeholder="W" /></div>
                <div><input type="number" value={dimHeight} onChange={(e) => setDimHeight(e.target.value)} className="input-field w-full" placeholder="H" /></div>
                <div>
                  <select value={dimUnit} onChange={(e) => setDimUnit(e.target.value)} className="input-field w-full">
                    {Object.keys(CBM_DIVISORS).map((u) => (<option key={u} value={u}>{u}</option>))}
                  </select>
                </div>
              </div>
              {cbmValue > 0 && <p className="text-sm text-slate-500 mt-1">{cbmValue.toFixed(3)} CBM</p>}
            </div>
            {/* Customs & Financial — collapsible */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <button type="button" onClick={() => setCustomsOpen(!customsOpen)} className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 transition-colors">
                <span>{t('requestForm.customsFinancialDetails')}</span>
                <svg className={`w-4 h-4 transition-transform ${customsOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </button>
              <div style={{ maxHeight: customsOpen ? '300px' : '0', overflow: 'hidden', transition: 'max-height 0.3s ease' }}>
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">{t('requestForm.declaredValue')}</label>
                      <input type="number" value={declaredValue} onChange={(e) => setDeclaredValue(e.target.value)} className="input-field w-full" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">{t('requestForm.currency')}</label>
                      <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="input-field w-full">
                        {['USD', 'EUR', 'GBP', 'AZN', 'TRY', 'CNY', 'RUB'].map((c) => (<option key={c} value={c}>{c}</option>))}
                      </select></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">{t('requestForm.hsCode')}</label>
                      <input type="text" value={hsCode} onChange={(e) => setHsCode(e.target.value)} className="input-field w-full" placeholder="e.g. 8471.30" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">{t('requestForm.incoterms')}</label>
                      <select value={incoterms} onChange={(e) => setIncoterms(e.target.value)} className="input-field w-full">
                        <option value="">Select...</option>
                        {INCOTERMS_OPTIONS.map((i) => (<option key={i} value={i}>{i}</option>))}
                      </select></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Documents */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-4">{t('requestForm.documentsTitle')}</h2>
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
              <p className="text-sm text-slate-600">{t('requestForm.dragDropFiles')}</p>
              <p className="text-xs text-slate-400 mt-1">{t('requestForm.fileHint')}</p>
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
              <p className="text-sm text-amber-600">{t('requestForm.noDocumentsWarning')}</p>
            )}
          </div>
        )}

        {/* Step 5: Confirmation */}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-4">{t('requestForm.reviewSubmit')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="font-medium text-slate-900 mb-2">{t('requestForm.steps.contact')}</h3>
                <p>{requesterName}</p>
                <p className="text-slate-500">{requesterEmail}</p>
                {requesterPhone && <p className="text-slate-500">{requesterPhone}</p>}
                {companyName && <p className="text-slate-500">{companyName}</p>}
                {voen && <p className="text-slate-500">VOEN: {voen}</p>}
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="font-medium text-slate-900 mb-2">{t('requestForm.steps.route')}</h3>
                <p>{originCity}, {originCountry} &rarr; {destCity}, {destCountry}</p>
                <p className="text-slate-500">
                  {transportOrder.map((tp, i) => `${i + 1}. ${t('transport.' + tp)}`).join(' \u2192 ')}
                </p>
                {preferredDate && <p className="text-slate-500">Date: {preferredDate}</p>}
                {isUrgent && <p className="text-red-600 font-medium">URGENT</p>}
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="font-medium text-slate-900 mb-2">{t('requestForm.steps.cargo')}</h3>
                <p>{CARGO_TYPES[cargoType]?.label || cargoType}</p>
                {cargoSubtype && <p className="text-slate-500">{cargoSubtype}</p>}
                <p className="text-slate-500">{cargoDescription}</p>
                {weightKg && <p className="text-slate-500">{weightKg} kg</p>}
                {cbmValue > 0 && <p className="text-slate-500">{cbmValue.toFixed(3)} CBM</p>}
                {packageCount && <p className="text-slate-500">{packageCount} packages</p>}
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="font-medium text-slate-900 mb-2">{t('requestForm.documentsTitle')}</h3>
                <p>{files.length} file(s) attached</p>
                {files.map((f, i) => (
                  <p key={i} className="text-slate-500 truncate">{f.file.name} ({DOC_TYPE_LABELS[f.docType]})</p>
                ))}
              </div>
            </div>
            <label className="flex items-start gap-2 mt-4 cursor-pointer">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="w-4 h-4 mt-0.5" />
              <span className="text-sm text-slate-600">{t('requestForm.agreeText')}</span>
            </label>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-6 pt-4 border-t border-slate-100">
          <button
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
            className="px-6 py-3 text-sm font-medium text-slate-600 hover:text-slate-900 disabled:opacity-30 rounded-lg hover:bg-slate-50 transition-colors"
          >
            &larr; {t('common.back')}
          </button>
          {step < STEP_KEYS.length - 1 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canNext()}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {t('common.next')} &rarr;
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!agreed || submitting}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {submitting ? t('requestForm.submitting') : t('requestForm.submitRequest')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
