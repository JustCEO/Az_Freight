import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tenants')
export class TenantsController {
  constructor(private tenantsService: TenantsService) {}

  @Get('current')
  getCurrent(@CurrentUser() user: JwtPayload) {
    return this.tenantsService.findOne(user.tenantId);
  }

  @Put('current')
  @Roles('admin')
  updateCurrent(@CurrentUser() user: JwtPayload, @Body() dto: UpdateTenantDto) {
    return this.tenantsService.update(user.tenantId, dto);
  }
}
