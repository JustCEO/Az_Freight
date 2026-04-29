import { Injectable, UnauthorizedException } from '@nestjs/common';
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

  validate(req: Request, payload: any): JwtPayload {
    // Reject portal tokens on dashboard endpoints
    const path = req.originalUrl || req.url || '';
    if (payload.type === 'portal' && !path.includes('/portal/')) {
      throw new UnauthorizedException('Portal tokens cannot access dashboard endpoints');
    }

    const result: JwtPayload = {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
      tenantId: payload.tenantId,
      tokenType: payload.type === 'portal' ? 'portal' : 'dashboard',
    };

    // SuperAdmin tenant override via header
    if (payload.role === 'superadmin') {
      const headerTenantId = req.headers['x-tenant-id'];
      if (typeof headerTenantId === 'string' && headerTenantId.length > 0) {
        if (!path.includes('/superadmin/')) {
          result.tenantId = headerTenantId;
        }
      }
    }

    return result;
  }
}
