import { Controller, Post, Body } from '@nestjs/common';
import { PortalAuthService } from './portal-auth.service';

@Controller('portal/auth')
export class PortalAuthController {
  constructor(private portalAuthService: PortalAuthService) {}

  @Post('request-access')
  requestAccess(@Body() body: { tenantSlug: string; email: string }) {
    return this.portalAuthService.requestAccess(body.tenantSlug, body.email);
  }

  @Post('verify')
  verify(@Body() body: { token: string }) {
    return this.portalAuthService.verify(body.token);
  }
}
