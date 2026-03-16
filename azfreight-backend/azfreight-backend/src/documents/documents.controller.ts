import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('documents')
export class DocumentsController {
  constructor(private documentsService: DocumentsService) {}

  @Post()
  @Roles('admin', 'manager')
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateDocumentDto) {
    return this.documentsService.create(user.tenantId, user.sub, dto);
  }

  @Get(':id')
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.documentsService.findOne(user.tenantId, id);
  }

  @Get(':id/versions')
  getVersions(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.documentsService.getVersions(user.tenantId, id);
  }

  @Delete(':id')
  @Roles('admin', 'manager')
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.documentsService.remove(user.tenantId, id);
  }
}
