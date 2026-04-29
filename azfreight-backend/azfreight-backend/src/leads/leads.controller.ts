import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('leads')
export class LeadsController {
  constructor(private leadsService: LeadsService) {}

  @Get()
  findAll(@CurrentUser() user: JwtPayload, @Query('status') status?: string) {
    return this.leadsService.findAll(user.tenantId, status);
  }

  @Get(':id')
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.leadsService.findOne(user.tenantId, id);
  }

  @Post()
  @Roles('manager')
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateLeadDto) {
    return this.leadsService.create(user.tenantId, dto);
  }

  @Patch(':id')
  @Roles('manager')
  update(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: UpdateLeadDto) {
    return this.leadsService.update(user.tenantId, id, dto);
  }

  @Post(':id/convert')
  @Roles('manager')
  convert(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.leadsService.convert(user.tenantId, id);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.leadsService.remove(user.tenantId, id);
  }
}
