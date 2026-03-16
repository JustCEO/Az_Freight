import { Controller, Get, Post, Put, Delete, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ShipmentsService } from './shipments.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('shipments')
export class ShipmentsController {
  constructor(private shipmentsService: ShipmentsService) {}

  @Get()
  findAll(@CurrentUser() user: JwtPayload, @Query() query: PaginationDto) {
    return this.shipmentsService.findAll(user.tenantId, query);
  }

  @Post()
  @Roles('admin', 'manager')
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateShipmentDto) {
    return this.shipmentsService.create(user.tenantId, user.sub, dto);
  }

  @Get(':id')
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.shipmentsService.findOne(user.tenantId, id);
  }

  @Put(':id')
  @Roles('admin', 'manager')
  update(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: UpdateShipmentDto) {
    return this.shipmentsService.update(user.tenantId, id, dto);
  }

  @Patch(':id/status')
  @Roles('admin', 'manager')
  updateStatus(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.shipmentsService.updateStatus(user.tenantId, id, user.sub, dto);
  }

  @Get(':id/timeline')
  getTimeline(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.shipmentsService.getTimeline(user.tenantId, id);
  }

  @Delete(':id')
  @Roles('admin', 'manager')
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.shipmentsService.remove(user.tenantId, id);
  }
}
