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
  food: {
    required: ['invoice', 'packing_list', 'certificate_of_origin', 'quality_cert'],
    recommended: ['phytosanitary', 'veterinary'],
    notes: 'Perishable goods — specify temperature requirements',
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
  clothing: {
    required: ['invoice', 'packing_list', 'certificate_of_origin'],
    recommended: [],
    notes: 'Material composition required for customs',
  },
  alcohol_tobacco: {
    required: ['invoice', 'packing_list', 'license', 'certificate_of_origin', 'quality_cert'],
    recommended: [],
    excise: true,
    notes: 'Excise goods — import/export license required',
  },
  weapons_ammo: {
    required: ['license'],
    recommended: [],
    restricted: true,
    notes: 'Government license required',
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
  vehicles: {
    required: ['invoice', 'packing_list', 'certificate_of_origin'],
    recommended: ['quality_cert'],
    notes: 'VIN, year, engine volume for customs',
  },
  other: {
    required: ['invoice', 'packing_list'],
    recommended: [],
    notes: '',
  },
};

export const CARGO_TYPE_LABELS: Record<string, string> = {
  electronics: 'Electronics',
  food: 'Food & Perishables',
  chemicals: 'Chemicals',
  pharma: 'Pharmaceuticals',
  machinery: 'Machinery & Equipment',
  clothing: 'Clothing & Textiles',
  alcohol_tobacco: 'Alcohol & Tobacco',
  weapons_ammo: 'Weapons & Ammunition',
  animals: 'Live Animals',
  plants: 'Plants & Seeds',
  vehicles: 'Vehicles',
  other: 'Other',
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
  { value: 'multimodal', label: 'Multimodal' },
];

export const INCOTERMS_OPTIONS = [
  'EXW', 'FCA', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP', 'FAS', 'FOB', 'CFR', 'CIF',
];
