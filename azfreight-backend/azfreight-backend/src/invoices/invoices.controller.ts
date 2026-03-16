import { Controller, Get, Post, Put, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto, UpdateInvoiceStatusDto } from './dto/update-invoice.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('invoices')
export class InvoicesController {
  constructor(private invoicesService: InvoicesService) {}

  @Get()
  findAll(@CurrentUser() user: JwtPayload, @Query() query: PaginationDto) {
    return this.invoicesService.findAll(user.tenantId, query);
  }

  @Post()
  @Roles('admin', 'accountant')
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateInvoiceDto) {
    return this.invoicesService.create(user.tenantId, user.sub, dto);
  }

  @Get(':id')
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.invoicesService.findOne(user.tenantId, id);
  }

  @Put(':id')
  @Roles('admin', 'accountant')
  update(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: UpdateInvoiceDto) {
    return this.invoicesService.update(user.tenantId, id, dto);
  }

  @Patch(':id/status')
  @Roles('admin', 'accountant')
  updateStatus(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateInvoiceStatusDto,
  ) {
    return this.invoicesService.updateStatus(user.tenantId, id, dto);
  }
}
