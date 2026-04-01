import { Controller, Get, Param, Query, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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

  // Публичный трекинг отправления без авторизации
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
      where: {
        tenantId: tenant.id,
        referenceNumber: ref,
      },
      select: {
        id: true,
        referenceNumber: true,
        status: true,
        transportType: true,
        originCity: true,
        originCountry: true,
        destinationCity: true,
        destinationCountry: true,
        customStatusId: true,
        customStatusNote: true,
        eta: true,
        createdAt: true,
        customStatus: {
          select: { id: true, name: true, color: true },
        },
        statusLogs: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            oldStatus: true,
            newStatus: true,
            comment: true,
            createdAt: true,
          },
        },
      },
    });

    if (!shipment) throw new NotFoundException('Shipment not found');

    return shipment;
  }
}
