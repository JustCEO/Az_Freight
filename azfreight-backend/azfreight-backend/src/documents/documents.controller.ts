import {
  Controller, Get, Post, Delete, Body, Param, Query, UseGuards,
  UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import { StorageService } from '../storage/storage.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';
import { v4 as uuid } from 'uuid';
import * as path from 'path';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('documents')
export class DocumentsController {
  constructor(
    private documentsService: DocumentsService,
    private storageService: StorageService,
  ) {}

  @Post()
  @Roles('admin', 'manager', 'director')
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateDocumentDto) {
    return this.documentsService.create(user.tenantId, user.sub, dto);
  }

  @Post('upload')
  @Roles('admin', 'manager', 'director')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @CurrentUser() user: JwtPayload,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { docType: string; linkedEntityType: string; linkedEntityId: string; description?: string },
  ) {
    const ext = path.extname(file.originalname);
    const fileKey = `${user.tenantId}/documents/${body.linkedEntityType}/${body.linkedEntityId}/${uuid()}${ext}`;
    await this.storageService.uploadFile(file.buffer, fileKey, file.mimetype);

    return this.documentsService.create(user.tenantId, user.sub, {
      fileKey,
      originalName: file.originalname,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      docType: body.docType,
      linkedEntityType: body.linkedEntityType,
      linkedEntityId: body.linkedEntityId,
      description: body.description,
    });
  }

  @Get()
  findByEntity(
    @CurrentUser() user: JwtPayload,
    @Query('entityType') entityType: string,
    @Query('entityId') entityId: string,
  ) {
    return this.documentsService.findByEntity(user.tenantId, entityType, entityId);
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
  @Roles('admin', 'manager', 'director')
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.documentsService.remove(user.tenantId, id);
  }
}
