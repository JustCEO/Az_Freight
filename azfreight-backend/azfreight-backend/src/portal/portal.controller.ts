import { Controller, Get, Param, Query, NotFoundException, UseGuards, Req } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('public')
export class PortalController {
  constructor(private prisma: PrismaService) {}

  @Get(':tenantSlug/info')
  async getTenantInfo(@Param('tenantSlug') tenantSlug: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug: tenantSlug },
      select: {
        id: true,
        name: true,
        slug: true,
        portalEnabled: true,
        portalThemeColor: true,
        portalLogoUrl: true,
        portalWelcomeText: true,
        logoUrl: true,
      },
    });
    if (!tenant) throw new NotFoundException('Tenant not found');
    return tenant;
  }

  @Get(':tenantSlug/track')
  async trackShipment(
    @Param('tenantSlug') tenantSlug: string,
    @Query('ref') ref: string,
  ) {
    if (!ref) throw new NotFoundException('Reference number is required');

    const tenant = await this.prisma.tenant.findUnique({
      where: { slug: tenantSlug },
      select: { id: true },
    });
    if (!tenant) throw new NotFoundException('Tenant not found');

    const shipment = await this.prisma.shipment.findFirst({
      where: { tenantId: tenant.id, referenceNumber: ref },
      select: {
        id: true, referenceNumber: true, status: true, transportType: true,
        originCity: true, originCountry: true, destinationCity: true, destinationCountry: true,
        customStatusId: true, customStatusNote: true, eta: true, createdAt: true,
        customStatus: { select: { id: true, name: true, color: true } },
        statusLogs: { orderBy: { createdAt: 'desc' }, select: { id: true, oldStatus: true, newStatus: true, comment: true, createdAt: true } },
      },
    });
    if (!shipment) throw new NotFoundException('Shipment not found');
    return shipment;
  }

  // Portal client authenticated endpoints
  @UseGuards(JwtAuthGuard)
  @Get('portal/my-shipments')
  async getMyShipments(@Req() req: any) {
    const clientId = req.user.sub;
    const tenantId = req.user.tenantId;

    const shipments = await this.prisma.shipment.findMany({
      where: { tenantId, clientId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, referenceNumber: true, status: true, transportType: true,
        originCity: true, originCountry: true, destinationCity: true, destinationCountry: true,
        cargoDescription: true, eta: true, createdAt: true,
        customStatus: { select: { id: true, name: true, color: true } },
      },
    });
    return shipments;
  }

  @UseGuards(JwtAuthGuard)
  @Get('portal/my-requests')
  async getMyRequests(@Req() req: any) {
    const clientId = req.user.sub;
    const tenantId = req.user.tenantId;

    const email = req.user.email;
    const requests = await this.prisma.shipmentRequest.findMany({
      where: {
        tenantId,
        OR: [{ clientId }, { requesterEmail: email }],
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, requesterName: true, originCity: true, destinationCity: true,
        cargoType: true, status: true, requestStatus: true, isUrgent: true, createdAt: true,
      },
    });
    return requests;
  }

  @UseGuards(JwtAuthGuard)
  @Get('portal/my-shipments/:id')
  async getMyShipmentDetail(@Req() req: any, @Param('id') id: string) {
    const clientId = req.user.sub;
    const tenantId = req.user.tenantId;

    const shipment = await this.prisma.shipment.findFirst({
      where: { id, tenantId, clientId },
      include: {
        customStatus: { select: { id: true, name: true, color: true } },
        statusLogs: { orderBy: { createdAt: 'desc' }, select: { id: true, oldStatus: true, newStatus: true, comment: true, createdAt: true } },
      },
    });
    if (!shipment) throw new NotFoundException('Shipment not found');
    return shipment;
  }
}
