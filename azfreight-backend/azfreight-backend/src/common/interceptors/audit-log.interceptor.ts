import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;

    if (method === 'GET') {
      return next.handle();
    }

    return next.handle().pipe(
      tap(async (responseBody) => {
        const user = request.user;
        if (!user) return;

        const entityId = responseBody?.id || request.params?.id;
        if (!entityId) return;

        const path = request.route?.path || '';
        const entityType = path.split('/').filter(Boolean).find((s: string) => !s.startsWith(':') && s !== 'api' && s !== 'v1') || 'unknown';

        try {
          await this.prisma.auditLog.create({
            data: {
              tenantId: user.tenantId,
              userId: user.sub,
              action: method.toLowerCase(),
              entityType,
              entityId: String(entityId),
              changes: request.body || {},
              ipAddress: request.ip,
              userAgent: request.headers['user-agent'] || null,
            },
          });
        } catch {
          // Audit logging should not break the request
        }
      }),
    );
  }
}
