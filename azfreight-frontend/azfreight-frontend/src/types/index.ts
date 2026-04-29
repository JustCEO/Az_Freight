export type UserRole = 'superadmin' | 'director' | 'admin' | 'hr' | 'manager' | 'logistics_agent' | 'dispatcher' | 'warehouse_manager' | 'accountant' | 'client';
export type ShipmentStatus = 'request' | 'confirmed' | 'in_transit' | 'customs' | 'delivered' | 'cancelled';
export type TransportType = 'road_tir' | 'sea' | 'air' | 'rail';
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'partially_paid' | 'overdue' | 'cancelled';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  plan: string;
  settings: Record<string, unknown> | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone: string | null;
  tenantId: string;
  tenant?: { name: string; slug: string } | null;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
  preferredLocale?: string | null;
  preferredTheme?: string | null;
  preferredTimezone?: string | null;
  preferredCurrency?: string | null;
}

export interface Client {
  id: string;
  companyName: string;
  taxId: string | null;
  voen: string | null;
  address: string | null;
  country: string | null;
  city: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  paymentTermsDays: number | null;
  creditLimit: number | null;
  notes: string | null;
  isActive: boolean;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Carrier {
  id: string;
  companyName: string;
  transportTypes: string[];
  taxId: string | null;
  country: string | null;
  city: string | null;
  phone: string | null;
  email: string | null;
  rating: number | null;
  totalShipments: number;
  notes: string | null;
  isActive: boolean;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomStatus {
  id: string;
  name: string;
  color: string;
  order: number;
  isDefault: boolean;
  parentStatus: string | null;
  tenantId: string;
  createdAt: string;
}

export interface UserPreferences {
  preferredLocale: string | null;
  preferredTheme: string | null;
  preferredTimezone: string | null;
  preferredCurrency: string | null;
}

export interface Shipment {
  id: string;
  referenceNumber: string;
  transportType: TransportType;
  status: ShipmentStatus;
  clientId: string;
  client: { id: string; companyName: string };
  carrierId: string | null;
  carrier: { id: string; companyName: string } | null;
  assignedToId: string | null;
  assignedTo: { id: string; name: string } | null;
  createdById: string;
  createdBy?: { id: string; name: string };
  originCountry: string;
  originCity: string;
  originAddress: string | null;
  destinationCountry: string;
  destinationCity: string;
  destinationAddress: string | null;
  cargoDescription: string | null;
  cargoWeight: number | null;
  cargoVolume: number | null;
  packageCount: number | null;
  clientRate: number | null;
  carrierRate: number | null;
  profit: number | null;
  currency: string;
  customStatusId: string | null;
  customStatusNote: string | null;
  customStatus: CustomStatus | null;
  eta: string | null;
  atd: string | null;
  ata: string | null;
  containerNumber: string | null;
  blNumber: string | null;
  vesselName: string | null;
  awbNumber: string | null;
  flightNumber: string | null;
  truckPlate: string | null;
  tirNumber: string | null;
  wagonNumbers: string | null;
  notes: string | null;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShipmentStatusLog {
  id: string;
  shipmentId: string;
  oldStatus: ShipmentStatus;
  newStatus: ShipmentStatus;
  comment: string | null;
  changedById: string;
  changedBy: { id: string; name: string };
  createdAt: string;
}

export interface Document {
  id: string;
  fileKey: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  docType: string;
  linkedEntityType: string;
  linkedEntityId: string;
  version: number;
  parentDocumentId: string | null;
  description: string | null;
  uploadedById: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  client?: { id: string; companyName: string };
  shipmentId: string | null;
  shipment?: { id: string; referenceNumber: string } | null;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  issuedDate: string;
  dueDate: string;
  paidAmount: number;
  paidDate: string | null;
  lineItems: unknown[] | null;
  notes: string | null;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RegisterResponse {
  user: User;
  tenant: Tenant;
  accessToken: string;
  refreshToken: string;
}
