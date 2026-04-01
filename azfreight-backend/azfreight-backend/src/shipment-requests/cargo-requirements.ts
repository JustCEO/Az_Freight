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
  // Новые типы для обратной совместимости
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
};
