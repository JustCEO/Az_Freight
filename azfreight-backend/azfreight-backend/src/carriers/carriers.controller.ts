import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { CarriersService } from './carriers.service';
import { CreateCarrierDto } from './dto/create-carrier.dto';
import { UpdateCarrierDto } from './dto/update-carrier.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('carriers')
export class CarriersController {
  constructor(private carriersService: CarriersService) {}

  @Get()
  findAll(@CurrentUser() user: JwtPayload, @Query() query: PaginationDto) {
    return this.carriersService.findAll(user.tenantId, query);
  }

  @Post()
  @Roles('admin', 'manager')
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateCarrierDto) {
    return this.carriersService.create(user.tenantId, dto);
  }

  @Get(':id')
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.carriersService.findOne(user.tenantId, id);
  }

  @Put(':id')
  @Roles('admin', 'manager')
  update(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: UpdateCarrierDto) {
    return this.carriersService.update(user.tenantId, id, dto);
  }

  @Delete(':id')
  @Roles('admin', 'manager')
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.carriersService.remove(user.tenantId, id);
  }
}
