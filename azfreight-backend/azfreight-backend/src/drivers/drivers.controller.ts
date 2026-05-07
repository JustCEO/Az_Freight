import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';
import { DriversService } from './drivers.service';
import { CreateDriverDto, UpdateDriverDto } from './dto/driver.dto';

@Controller('drivers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Get()
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.driversService.findAll(user.tenantId, search, status);
  }

  @Get(':id')
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.driversService.findOne(user.tenantId, id);
  }

  @Post()
  @Roles('admin', 'manager', 'director')
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateDriverDto) {
    return this.driversService.create(user.tenantId, dto);
  }

  @Put(':id')
  @Roles('admin', 'manager', 'director')
  update(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: UpdateDriverDto) {
    return this.driversService.update(user.tenantId, id, dto);
  }

  @Delete(':id')
  @Roles('admin', 'manager', 'director')
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.driversService.remove(user.tenantId, id);
  }
}
