import { Controller, Get, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('manager')
@Controller('reports')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('overview')
  getOverview(@CurrentUser() user: JwtPayload) {
    return this.reportsService.getOverview(user.tenantId);
  }

  @Get('monthly')
  getMonthlyStats(@CurrentUser() user: JwtPayload) {
    return this.reportsService.getMonthlyStats(user.tenantId);
  }

  @Get('top-routes')
  getTopRoutes(@CurrentUser() user: JwtPayload) {
    return this.reportsService.getTopRoutes(user.tenantId);
  }

  @Get('top-clients')
  getTopClients(@CurrentUser() user: JwtPayload) {
    return this.reportsService.getTopClients(user.tenantId);
  }

  @Get('carriers')
  getCarrierPerformance(@CurrentUser() user: JwtPayload) {
    return this.reportsService.getCarrierPerformance(user.tenantId);
  }
}
