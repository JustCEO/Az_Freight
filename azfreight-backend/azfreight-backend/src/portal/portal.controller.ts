import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
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
}
