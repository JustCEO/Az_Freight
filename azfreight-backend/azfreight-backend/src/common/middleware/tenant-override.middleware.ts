import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TenantOverrideMiddleware implements NestMiddleware {
  constructor(private prisma: PrismaService) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    const user = (req as any).user as { role?: string; tenantId?: string } | undefined;
    const headerTenantId = req.headers['x-tenant-id'] as string | undefined;

    if (user?.role === 'superadmin' && headerTenantId && !req.path.startsWith('/superadmin')) {
      const tenant = await this.prisma.tenant.findFirst({
        where: { id: headerTenantId, isActive: true },
        select: { id: true },
      });
      if (tenant) {
        user.tenantId = tenant.id;
      }
    }

    next();
  }
}
