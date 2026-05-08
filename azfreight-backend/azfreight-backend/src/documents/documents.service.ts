import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { DocType } from '@prisma/client';

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, userId: string, dto: CreateDocumentDto) {
    let version = 1;
    if (dto.parentDocumentId) {
      const parent = await this.prisma.document.findFirst({
        where: { id: dto.parentDocumentId, tenantId },
      });
      if (!parent) throw new NotFoundException('Parent document not found');
      version = parent.version + 1;
    }

    return this.prisma.document.create({
      data: {
        tenantId,
        fileKey: dto.fileKey,
        originalName: dto.originalName,
        mimeType: dto.mimeType,
        sizeBytes: BigInt(dto.sizeBytes),
        docType: dto.docType as DocType,
        version,
        parentDocumentId: dto.parentDocumentId,
        linkedEntityType: dto.linkedEntityType,
        linkedEntityId: dto.linkedEntityId,
        uploadedById: userId,
        description: dto.description,
      },
    });
  }

  async findByEntity(tenantId: string, entityType: string, entityId: string) {
    return this.prisma.document.findMany({
      where: { tenantId, linkedEntityType: entityType, linkedEntityId: entityId },
      orderBy: { createdAt: 'desc' },
      include: { uploadedBy: { select: { id: true, name: true } } },
    });
  }

  async findOne(tenantId: string, id: string) {
    const doc = await this.prisma.document.findFirst({
      where: { id, tenantId },
      include: {
        uploadedBy: { select: { id: true, name: true } },
      },
    });
    if (!doc) throw new NotFoundException('Document not found');
    return doc;
  }

  async getVersions(tenantId: string, id: string) {
    const doc = await this.prisma.document.findFirst({
      where: { id, tenantId },
    });
    if (!doc) throw new NotFoundException('Document not found');

    const rootId = doc.parentDocumentId || doc.id;

    return this.prisma.document.findMany({
      where: {
        tenantId,
        OR: [
          { id: rootId },
          { parentDocumentId: rootId },
        ],
      },
      orderBy: { version: 'asc' },
    });
  }

  async remove(tenantId: string, id: string) {
    const doc = await this.prisma.document.findFirst({
      where: { id, tenantId },
    });
    if (!doc) throw new NotFoundException('Document not found');

    return this.prisma.document.delete({ where: { id } });
  }
}
