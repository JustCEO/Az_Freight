import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { CreateShipmentRequestDto } from './dto/create-shipment-request.dto';
import { UpdateRequestStatusDto } from './dto/update-request-status.dto';
import { FilterRequestsDto } from './dto/filter-requests.dto';
import { CARGO_REQUIREMENTS } from './cargo-requirements';
import { v4 as uuid } from 'uuid';
import * as path from 'path';

@Injectable()
export class ShipmentRequestsService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
  ) {}

  async createPublic(
    tenantSlug: string,
    dto: CreateShipmentRequestDto,
    files?: Express.Multer.File[],
    docTypes?: string[],
  ) {
    const tenant = await this.prisma.tenant.findUnique({ where: { slug: tenantSlug } });
    if (!tenant) throw new NotFoundException('Tenant not found');
    if (!tenant.portalEnabled) throw new BadRequestException('Portal is disabled');

    const request = await this.prisma.shipmentRequest.create({
      data: {
        tenantId: tenant.id,
        requesterName: dto.requesterName,
        requesterEmail: dto.requesterEmail,
        requesterPhone: dto.requesterPhone,
        companyName: dto.companyName,
        originCountry: dto.originCountry,
        originCity: dto.originCity,
        destinationCountry: dto.destinationCountry,
        destinationCity: dto.destinationCity,
        cargoType: dto.cargoType,
        cargoDescription: dto.cargoDescription,
        weightKg: dto.weightKg,
        volumeCbm: dto.volumeCbm,
        packageCount: dto.packageCount,
        declaredValue: dto.declaredValue,
        currency: dto.currency || 'USD',
        incoterms: dto.incoterms,
        hsCode: dto.hsCode,
        transportType: dto.transportType,
        preferredDate: dto.preferredDate ? new Date(dto.preferredDate) : undefined,
        isUrgent: dto.isUrgent || false,
        specialRequirements: dto.specialRequirements ? JSON.parse(JSON.stringify(dto.specialRequirements)) : undefined,
      },
    });

    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = path.extname(file.originalname);
        const fileKey = `${tenant.id}/requests/${request.id}/${uuid()}${ext}`;
        await this.storage.uploadFile(file.buffer, fileKey, file.mimetype);
        await this.prisma.shipmentRequestDocument.create({
          data: {
            requestId: request.id,
            fileKey,
            originalName: file.originalname,
            mimeType: file.mimetype,
            sizeBytes: file.size,
            docType: docTypes?.[i] || 'other',
          },
        });
      }
    }

    // TODO: Send email/WhatsApp notification to tenant managers

    return { id: request.id, message: 'Request submitted successfully' };
  }

  async findAll(tenantId: string, query: FilterRequestsDto) {
    const { page = 1, limit = 20, search, status, cargoType, transportType, dateFrom, dateTo } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { tenantId };
    if (status) where.status = status;
    if (cargoType) where.cargoType = cargoType;
    if (transportType) where.transportType = transportType;
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) (where.createdAt as Record<string, unknown>).gte = new Date(dateFrom);
      if (dateTo) (where.createdAt as Record<string, unknown>).lte = new Date(dateTo);
    }
    if (search) {
      where.OR = [
        { requesterName: { contains: search, mode: 'insensitive' } },
        { requesterEmail: { contains: search, mode: 'insensitive' } },
        { companyName: { contains: search, mode: 'insensitive' } },
        { cargoDescription: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.shipmentRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          assignedTo: { select: { id: true, name: true } },
          _count: { select: { documents: true } },
        },
      }),
      this.prisma.shipmentRequest.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findOne(tenantId: string, id: string) {
    const request = await this.prisma.shipmentRequest.findFirst({
      where: { id, tenantId },
      include: {
        assignedTo: { select: { id: true, name: true } },
        client: { select: { id: true, companyName: true } },
        documents: true,
      },
    });
    if (!request) throw new NotFoundException('Request not found');
    return request;
  }

  async updateStatus(tenantId: string, id: string, dto: UpdateRequestStatusDto) {
    const request = await this.prisma.shipmentRequest.findFirst({ where: { id, tenantId } });
    if (!request) throw new NotFoundException('Request not found');

    return this.prisma.shipmentRequest.update({
      where: { id },
      data: {
        status: dto.status,
        assignedToId: dto.assignedToId,
        notes: dto.notes,
        rejectionReason: dto.rejectionReason,
      },
    });
  }

  async convert(tenantId: string, id: string, userId: string) {
    const request = await this.prisma.shipmentRequest.findFirst({
      where: { id, tenantId },
    });
    if (!request) throw new NotFoundException('Request not found');
    if (request.status === 'converted') throw new BadRequestException('Already converted');

    let client = request.clientId
      ? await this.prisma.client.findUnique({ where: { id: request.clientId } })
      : null;

    if (!client && request.companyName) {
      client = await this.prisma.client.create({
        data: {
          tenantId,
          companyName: request.companyName,
          email: request.requesterEmail,
          phone: request.requesterPhone,
        },
      });
    }

    if (!client) {
      client = await this.prisma.client.create({
        data: {
          tenantId,
          companyName: request.requesterName,
          email: request.requesterEmail,
          phone: request.requesterPhone,
        },
      });
    }

    const refNumber = await this.generateReferenceNumber(tenantId);

    const transportMap: Record<string, string> = {
      road_tir: 'road_tir',
      sea: 'sea',
      air: 'air',
      rail: 'rail',
      multimodal: 'road_tir',
    };

    const shipment = await this.prisma.shipment.create({
      data: {
        tenantId,
        referenceNumber: refNumber,
        transportType: (transportMap[request.transportType] || 'road_tir') as 'road_tir' | 'sea' | 'air' | 'rail',
        clientId: client.id,
        originCountry: request.originCountry.slice(0, 3),
        originCity: request.originCity,
        destinationCountry: request.destinationCountry.slice(0, 3),
        destinationCity: request.destinationCity,
        cargoDescription: request.cargoDescription,
        weightKg: request.weightKg,
        volumeCbm: request.volumeCbm,
        packageCount: request.packageCount,
        incoterms: request.incoterms,
        hsCode: request.hsCode,
        currency: request.currency,
        createdById: userId,
        notes: request.notes,
      },
    });

    await this.prisma.shipmentRequest.update({
      where: { id },
      data: { status: 'converted', clientId: client.id, shipmentId: shipment.id },
    });

    return { shipment, client };
  }

  async getNewCount(tenantId: string): Promise<number> {
    return this.prisma.shipmentRequest.count({
      where: { tenantId, status: 'new' },
    });
  }

  getCargoRequirements() {
    return CARGO_REQUIREMENTS;
  }

  private async generateReferenceNumber(tenantId: string): Promise<string> {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = `SHP-${dateStr}`;
    const count = await this.prisma.shipment.count({
      where: { tenantId, referenceNumber: { startsWith: prefix } },
    });
    const seq = String(count + 1).padStart(4, '0');
    return `${prefix}-${seq}`;
  }
}
