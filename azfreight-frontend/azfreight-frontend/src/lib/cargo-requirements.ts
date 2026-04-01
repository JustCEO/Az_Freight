export interface CargoRequirement {
  required: string[];
  recommended: string[];
  notes: string;
  hazmat?: boolean;
  needsRefrigeration?: boolean;
  excise?: boolean;
  restricted?: boolean;
}

export const CARGO_REQUIREMENTS: Record<string, CargoRequirement> = {
  electronics: {
    required: ['invoice', 'packing_list'],
    recommended: ['certificate_of_origin'],
    notes: 'Export license may be required for certain countries',
  },
  food_beverage: {
    required: ['invoice', 'packing_list', 'certificate_of_origin', 'quality_cert'],
    recommended: ['phytosanitary', 'veterinary'],
    needsRefrigeration: true,
    notes: 'Perishable goods — specify temperature requirements',
  },
  clothing_textile: {
    required: ['invoice', 'packing_list', 'certificate_of_origin'],
    recommended: [],
    notes: 'Material composition required for customs',
  },
  chemicals: {
    required: ['invoice', 'packing_list', 'msds'],
    recommended: ['license', 'certificate_of_origin'],
    hazmat: true,
    notes: 'Chemicals classified by IMDG/ADR/IATA hazard classes',
  },
  pharma: {
    required: ['invoice', 'packing_list', 'quality_cert', 'license'],
    recommended: ['certificate_of_origin', 'msds'],
    needsRefrigeration: true,
    notes: 'GDP certificate, import/export license required',
  },
  machinery: {
    required: ['invoice', 'packing_list'],
    recommended: ['certificate_of_origin', 'quality_cert'],
    notes: 'Used equipment — condition report; dual-use — export license',
  },
  automotive: {
    required: ['invoice', 'packing_list', 'certificate_of_origin'],
    recommended: ['quality_cert'],
    notes: 'VIN, year, engine volume for customs',
  },
  construction: {
    required: ['invoice', 'packing_list'],
    recommended: ['certificate_of_origin', 'quality_cert'],
    notes: 'Heavy loads may require special transport permits',
  },
  furniture: {
    required: ['invoice', 'packing_list'],
    recommended: ['certificate_of_origin'],
    notes: '',
  },
  oil_gas: {
    required: ['invoice', 'packing_list', 'msds', 'license'],
    recommended: ['certificate_of_origin'],
    hazmat: true,
    notes: 'Dangerous goods — special handling required',
  },
  alcohol_tobacco: {
    required: ['invoice', 'packing_list', 'license', 'certificate_of_origin', 'quality_cert'],
    recommended: [],
    excise: true,
    notes: 'Excise goods — import/export license required',
  },
  animals: {
    required: ['veterinary', 'certificate_of_origin'],
    recommended: ['license'],
    notes: 'CITES permit for protected species',
  },
  plants: {
    required: ['phytosanitary', 'certificate_of_origin'],
    recommended: [],
    notes: 'Phytosanitary certificate required for plants and seeds',
  },
  other: {
    required: ['invoice', 'packing_list'],
    recommended: [],
    notes: '',
  },
  // Обратная совместимость
  food: {
    required: ['invoice', 'packing_list', 'certificate_of_origin', 'quality_cert'],
    recommended: ['phytosanitary', 'veterinary'],
    needsRefrigeration: true,
    notes: 'Perishable goods — specify temperature requirements',
  },
  clothing: {
    required: ['invoice', 'packing_list', 'certificate_of_origin'],
    recommended: [],
    notes: 'Material composition required for customs',
  },
  vehicles: {
    required: ['invoice', 'packing_list', 'certificate_of_origin'],
    recommended: ['quality_cert'],
    notes: 'VIN, year, engine volume for customs',
  },
  weapons_ammo: {
    required: ['license'],
    recommended: [],
    restricted: true,
    notes: 'Government license required',
  },
};

export const CARGO_TYPE_LABELS: Record<string, string> = {
  electronics: 'Electronics',
  food_beverage: 'Food & Beverage',
  clothing_textile: 'Clothing & Textile',
  chemicals: 'Chemicals',
  pharma: 'Pharmaceuticals',
  machinery: 'Machinery & Equipment',
  automotive: 'Automotive',
  construction: 'Construction Materials',
  furniture: 'Furniture & Home',
  oil_gas: 'Oil & Gas',
  alcohol_tobacco: 'Alcohol & Tobacco',
  animals: 'Live Animals',
  plants: 'Plants & Seeds',
  other: 'Other',
  // обратная совместимость
  food: 'Food & Perishables',
  clothing: 'Clothing & Textiles',
  vehicles: 'Vehicles',
  weapons_ammo: 'Weapons & Ammunition',
};

export const DOC_TYPE_LABELS: Record<string, string> = {
  invoice: 'Commercial Invoice',
  packing_list: 'Packing List',
  certificate_of_origin: 'Certificate of Origin',
  quality_cert: 'Quality Certificate',
  phytosanitary: 'Phytosanitary Certificate',
  veterinary: 'Veterinary Certificate',
  msds: 'Material Safety Data Sheet (MSDS)',
  license: 'License / Permit',
  other: 'Other Document',
};

export const TRANSPORT_TYPE_OPTIONS = [
  { value: 'road_tir', label: 'Road / TIR' },
  { value: 'sea', label: 'Sea Freight' },
  { value: 'air', label: 'Air Freight' },
  { value: 'rail', label: 'Rail' },
];

export const INCOTERMS_OPTIONS = [
  'EXW', 'FCA', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP', 'FAS', 'FOB', 'CFR', 'CIF',
];
