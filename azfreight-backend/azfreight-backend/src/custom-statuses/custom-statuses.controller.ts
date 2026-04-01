import { Controller, Get, Post, Put, Delete, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { CustomStatusesService } from './custom-statuses.service';
import { CreateCustomStatusDto } from './dto/create-custom-status.dto';
import { UpdateCustomStatusDto } from './dto/update-custom-status.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class CustomStatusesController {
  constructor(private customStatusesService: CustomStatusesService) {}

  @Get('custom-statuses')
  @Roles('admin', 'manager')
  findAll(@CurrentUser() user: JwtPayload) {
    return this.customStatusesService.findAll(user.tenantId);
  }

  @Post('custom-statuses')
  @Roles('admin')
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateCustomStatusDto) {
    return this.customStatusesService.create(user.tenantId, dto);
  }

  @Put('custom-statuses/:id')
  @Roles('admin')
  update(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: UpdateCustomStatusDto) {
    return this.customStatusesService.update(user.tenantId, id, dto);
  }

  @Delete('custom-statuses/:id')
  @Roles('admin')
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.customStatusesService.remove(user.tenantId, id);
  }

  @Patch('shipments/:id/custom-status')
  @Roles('admin', 'manager')
  assignCustomStatus(@CurrentUser() user: JwtPayload, @Param('id') shipmentId: string, @Body() body: { customStatusId?: string; customStatusNote?: string }) {
    return this.customStatusesService.assignCustomStatus(user.tenantId, shipmentId, body);
  }
}
