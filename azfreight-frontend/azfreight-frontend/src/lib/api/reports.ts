import { get } from '@/lib/api-client';

export interface ReportOverview {
  totalShipments: number;
  activeShipments: number;
  totalClients: number;
  totalInvoices: number;
  revenue: { totalClientRate: number; totalCarrierRate: number; totalProfit: number };
  shipmentsByStatus: { status: string; count: number }[];
  recentShipments: { id: string; referenceNumber: string; status: string; createdAt: string; clientRate: number; profit: number; currency: string }[];
}

export interface MonthlyStats {
  month: string;
  shipments: number;
  revenue: number;
  cost: number;
  profit: number;
}

export interface TopRoute {
  route: string;
  count: number;
  revenue: number;
}

export interface TopClient {
  clientId: string;
  companyName: string;
  shipments: number;
  revenue: number;
  profit: number;
}

export interface CarrierPerformance {
  carrierId: string;
  companyName: string;
  rating: number | null;
  shipments: number;
  totalCost: number;
}

export const getOverview = () => get<ReportOverview>('/reports/overview');
export const getMonthlyStats = () => get<MonthlyStats[]>('/reports/monthly');
export const getTopRoutes = () => get<TopRoute[]>('/reports/top-routes');
export const getTopClients = () => get<TopClient[]>('/reports/top-clients');
export const getCarrierPerformance = () => get<CarrierPerformance[]>('/reports/carriers');
