import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getOverview(tenantId: string) {
    const [
      totalShipments,
      activeShipments,
      totalClients,
      totalInvoices,
      shipmentsByStatus,
      recentShipments,
    ] = await Promise.all([
      this.prisma.shipment.count({ where: { tenantId } }),
      this.prisma.shipment.count({ where: { tenantId, status: { in: ['confirmed', 'in_transit', 'customs'] } } }),
      this.prisma.client.count({ where: { tenantId, isActive: true } }),
      this.prisma.invoice.count({ where: { tenantId } }),
      this.prisma.shipment.groupBy({
        by: ['status'],
        where: { tenantId },
        _count: true,
      }),
      this.prisma.shipment.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, referenceNumber: true, status: true, createdAt: true, clientRate: true, carrierRate: true, profit: true, currency: true },
      }),
    ]);

    const revenue = await this.prisma.shipment.aggregate({
      where: { tenantId },
      _sum: { clientRate: true, carrierRate: true, profit: true },
    });

    return {
      totalShipments,
      activeShipments,
      totalClients,
      totalInvoices,
      revenue: {
        totalClientRate: Number(revenue._sum.clientRate) || 0,
        totalCarrierRate: Number(revenue._sum.carrierRate) || 0,
        totalProfit: Number(revenue._sum.profit) || 0,
      },
      shipmentsByStatus: shipmentsByStatus.map((s) => ({ status: s.status, count: s._count })),
      recentShipments,
    };
  }

  async getMonthlyStats(tenantId: string) {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const shipments = await this.prisma.shipment.findMany({
      where: { tenantId, createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true, clientRate: true, carrierRate: true, profit: true, currency: true },
    });

    const monthly: Record<string, { month: string; shipments: number; revenue: number; cost: number; profit: number }> = {};
    shipments.forEach((s) => {
      const key = s.createdAt.toISOString().slice(0, 7);
      if (!monthly[key]) monthly[key] = { month: key, shipments: 0, revenue: 0, cost: 0, profit: 0 };
      monthly[key].shipments++;
      monthly[key].revenue += Number(s.clientRate) || 0;
      monthly[key].cost += Number(s.carrierRate) || 0;
      monthly[key].profit += Number(s.profit) || 0;
    });

    return Object.values(monthly).sort((a, b) => a.month.localeCompare(b.month));
  }

  async getTopRoutes(tenantId: string) {
    const shipments = await this.prisma.shipment.findMany({
      where: { tenantId },
      select: { originCity: true, originCountry: true, destinationCity: true, destinationCountry: true, clientRate: true },
    });

    const routes: Record<string, { route: string; count: number; revenue: number }> = {};
    shipments.forEach((s) => {
      const key = `${s.originCity} → ${s.destinationCity}`;
      if (!routes[key]) routes[key] = { route: key, count: 0, revenue: 0 };
      routes[key].count++;
      routes[key].revenue += Number(s.clientRate) || 0;
    });

    return Object.values(routes).sort((a, b) => b.count - a.count).slice(0, 10);
  }

  async getTopClients(tenantId: string) {
    const clients = await this.prisma.shipment.groupBy({
      by: ['clientId'],
      where: { tenantId },
      _count: true,
      _sum: { clientRate: true, profit: true },
    });

    const clientDetails = await this.prisma.client.findMany({
      where: { tenantId, id: { in: clients.map((c) => c.clientId) } },
      select: { id: true, companyName: true },
    });

    const nameMap = new Map(clientDetails.map((c) => [c.id, c.companyName]));

    return clients
      .map((c) => ({
        clientId: c.clientId,
        companyName: nameMap.get(c.clientId) || 'Unknown',
        shipments: c._count,
        revenue: Number(c._sum.clientRate) || 0,
        profit: Number(c._sum.profit) || 0,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }

  async getCarrierPerformance(tenantId: string) {
    const carriers = await this.prisma.shipment.groupBy({
      by: ['carrierId'],
      where: { tenantId, carrierId: { not: null } },
      _count: true,
      _sum: { carrierRate: true },
    });

    const carrierDetails = await this.prisma.carrier.findMany({
      where: { tenantId, id: { in: carriers.map((c) => c.carrierId!).filter(Boolean) } },
      select: { id: true, companyName: true, rating: true },
    });

    const detailMap = new Map(carrierDetails.map((c) => [c.id, c]));

    return carriers
      .filter((c) => c.carrierId)
      .map((c) => ({
        carrierId: c.carrierId,
        companyName: detailMap.get(c.carrierId!)?.companyName || 'Unknown',
        rating: detailMap.get(c.carrierId!)?.rating,
        shipments: c._count,
        totalCost: Number(c._sum.carrierRate) || 0,
      }))
      .sort((a, b) => b.shipments - a.shipments)
      .slice(0, 10);
  }
}
