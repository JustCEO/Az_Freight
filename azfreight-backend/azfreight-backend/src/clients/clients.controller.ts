import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto, CreateClientContactDto, CreateAVLEntryDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('clients')
export class ClientsController {
  constructor(private clientsService: ClientsService) {}

  @Get()
  findAll(@CurrentUser() user: JwtPayload, @Query() query: PaginationDto) {
    return this.clientsService.findAll(user.tenantId, query);
  }

  @Post()
  @Roles('admin', 'manager', 'director')
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateClientDto) {
    return this.clientsService.create(user.tenantId, dto);
  }

  @Get(':id')
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.clientsService.findOne(user.tenantId, id);
  }

  @Put(':id')
  @Roles('admin', 'manager', 'director')
  update(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: UpdateClientDto) {
    return this.clientsService.update(user.tenantId, id, dto);
  }

  @Delete(':id')
  @Roles('admin', 'manager', 'director')
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.clientsService.remove(user.tenantId, id);
  }

  // ── Contacts ──

  @Get(':id/contacts')
  listContacts(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.clientsService.listContacts(user.tenantId, id);
  }

  @Post(':id/contacts')
  @Roles('admin', 'manager', 'director')
  createContact(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: CreateClientContactDto) {
    return this.clientsService.createContact(user.tenantId, id, dto);
  }

  @Patch(':id/contacts/:contactId')
  @Roles('admin', 'manager', 'director')
  updateContact(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Param('contactId') contactId: string, @Body() dto: Partial<CreateClientContactDto>) {
    return this.clientsService.updateContact(user.tenantId, id, contactId, dto);
  }

  @Delete(':id/contacts/:contactId')
  @Roles('admin', 'manager', 'director')
  deleteContact(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Param('contactId') contactId: string) {
    return this.clientsService.deleteContact(user.tenantId, id, contactId);
  }

  // ── AVL ──

  @Get(':id/avl')
  listAVL(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.clientsService.listAVL(user.tenantId, id);
  }

  @Post(':id/avl')
  @Roles('admin', 'manager', 'director')
  createAVL(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: CreateAVLEntryDto) {
    return this.clientsService.createAVL(user.tenantId, id, dto);
  }

  @Patch(':id/avl/:avlId')
  @Roles('admin', 'manager', 'director')
  updateAVL(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Param('avlId') avlId: string, @Body() dto: Partial<CreateAVLEntryDto>) {
    return this.clientsService.updateAVL(user.tenantId, id, avlId, dto);
  }

  @Delete(':id/avl/:avlId')
  @Roles('admin', 'manager', 'director')
  deleteAVL(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Param('avlId') avlId: string) {
    return this.clientsService.deleteAVL(user.tenantId, id, avlId);
  }
}
