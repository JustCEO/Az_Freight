import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { JwtPayload } from '../../common/decorators/current-user.decorator';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret') || 'change-me',
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: JwtPayload): JwtPayload {
    const result: JwtPayload = {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
      tenantId: payload.tenantId,
    };

    // SuperAdmin tenant override via header
    if (payload.role === 'superadmin') {
      const headerTenantId = req.headers['x-tenant-id'];
      if (typeof headerTenantId === 'string' && headerTenantId.length > 0) {
        const path = req.originalUrl || req.url || '';
        if (!path.includes('/superadmin/')) {
          result.tenantId = headerTenantId;
        }
      }
    }

    return result;
  }
}
