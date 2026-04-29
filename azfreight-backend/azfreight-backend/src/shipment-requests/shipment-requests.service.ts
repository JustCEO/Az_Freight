import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { CreateShipmentRequestDto } from './dto/create-shipment-request.dto';
import { CreateManualRequestDto } from './dto/create-manual-request.dto';
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

    // Поддержка мультимодальной доставки
    const transportTypes = dto.transportTypes || (dto as unknown as Record<string, unknown>).transportType
      ? [String((dto as unknown as Record<string, unknown>).transportType)]
      : ['road_tir'];
    const transportOrder = dto.transportOrder || transportTypes;

    // Check if existing client, otherwise create a Lead
    let clientId: string | undefined;
    let leadId: string | undefined;

    const existingClient = await this.prisma.client.findFirst({
      where: { tenantId: tenant.id, email: dto.requesterEmail, isActive: true },
    });

    if (existingClient) {
      clientId = existingClient.id;
    } else {
      const lead = await this.prisma.lead.create({
        data: {
          tenantId: tenant.id,
          contactName: dto.requesterName,
          email: dto.requesterEmail,
          phone: dto.requesterPhone,
          companyName: dto.companyName,
          source: 'PORTAL',
        },
      });
      leadId = lead.id;
    }

    const request = await this.prisma.shipmentRequest.create({
      data: {
        tenantId: tenant.id,
        requesterName: dto.requesterName,
        requesterEmail: dto.requesterEmail,
        requesterPhone: dto.requesterPhone,
        companyName: dto.companyName,
        voen: dto.voen,
        originCountry: dto.originCountry,
        originCity: dto.originCity,
        destinationCountry: dto.destinationCountry,
        destinationCity: dto.destinationCity,
        cargoType: dto.cargoType,
        cargoSubtype: dto.cargoSubtype,
        cargoDescription: dto.cargoDescription,
        weightKg: dto.weightKg,
        volumeCbm: dto.volumeCbm,
        packageCount: dto.packageCount,
        declaredValue: dto.declaredValue,
        currency: dto.currency || 'USD',
        incoterms: dto.incoterms,
        hsCode: dto.hsCode,
        transportTypes,
        transportOrder,
        preferredDate: dto.preferredDate ? new Date(dto.preferredDate) : undefined,
        isUrgent: dto.isUrgent || false,
        specialRequirements: dto.specialRequirements ? JSON.parse(JSON.stringify(dto.specialRequirements)) : undefined,
        clientId,
        leadId,
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

    return { id: request.id, message: 'Request submitted successfully' };
  }

  async createManual(tenantId: string, createdById: string, dto: CreateManualRequestDto) {
    let clientId: string | undefined;
    let leadId: string | undefined;
    let requesterName = '';
    let requesterEmail = '';
    let requesterPhone: string | undefined;
    let companyName: string | undefined;

    if (dto.clientId) {
      const client = await this.prisma.client.findFirst({ where: { id: dto.clientId, tenantId } });
      if (!client) throw new NotFoundException('Client not found');
      clientId = client.id;
      requesterName = client.companyName;
      requesterEmail = client.email || '';
      requesterPhone = client.phone || undefined;
      companyName = client.companyName;
    } else if (dto.leadId) {
      const lead = await this.prisma.lead.findFirst({ where: { id: dto.leadId, tenantId } });
      if (!lead) throw new NotFoundException('Lead not found');
      leadId = lead.id;
      requesterName = lead.contactName;
      requesterEmail = lead.email;
      requesterPhone = lead.phone || undefined;
      companyName = lead.companyName || undefined;
    } else if (dto.contactName && dto.contactEmail) {
      const existingClient = await this.prisma.client.findFirst({
        where: { tenantId, email: dto.contactEmail, isActive: true },
      });
      if (existingClient) {
        clientId = existingClient.id;
      } else {
        const existingLead = await this.prisma.lead.findFirst({
          where: { tenantId, email: dto.contactEmail },
        });
        if (existingLead) {
          leadId = existingLead.id;
        } else {
          const lead = await this.prisma.lead.create({
            data: {
              tenantId,
              contactName: dto.contactName,
              email: dto.contactEmail,
              phone: dto.contactPhone,
              companyName: dto.contactCompany,
              source: 'MANUAL',
            },
          });
          leadId = lead.id;
        }
      }
      requesterName = dto.contactName;
      requesterEmail = dto.contactEmail;
      requesterPhone = dto.contactPhone;
      companyName = dto.contactCompany;
    } else {
      throw new BadRequestException('Provide clientId, leadId, or contact details (contactName + contactEmail)');
    }

    const transportTypes = dto.transportTypes || ['road_tir'];
    const transportOrder = dto.transportOrder || transportTypes;

    const request = await this.prisma.shipmentRequest.create({
      data: {
        tenantId,
        requesterName,
        requesterEmail,
        requesterPhone,
        companyName,
        originCountry: dto.originCountry,
        originCity: dto.originCity,
        destinationCountry: dto.destinationCountry,
        destinationCity: dto.destinationCity,
        cargoType: dto.cargoType,
        cargoSubtype: dto.cargoSubtype,
        cargoDescription: dto.cargoDescription,
        weightKg: dto.weightKg,
        volumeCbm: dto.volumeCbm,
        packageCount: dto.packageCount,
        declaredValue: dto.declaredValue,
        currency: dto.currency || 'USD',
        incoterms: dto.incoterms,
        hsCode: dto.hsCode,
        transportTypes,
        transportOrder,
        preferredDate: dto.preferredDate ? new Date(dto.preferredDate) : undefined,
        isUrgent: dto.isUrgent || false,
        notes: dto.notes,
        clientId,
        leadId,
      },
      include: {
        client: { select: { id: true, companyName: true } },
        lead: { select: { id: true, contactName: true } },
      },
    });

    return request;
  }

  async searchContacts(tenantId: string, query: string) {
    if (query.length < 2) return { clients: [], leads: [] };

    const [clients, leads] = await Promise.all([
      this.prisma.client.findMany({
        where: {
          tenantId, isActive: true,
          OR: [
            { companyName: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 5,
        select: { id: true, companyName: true, email: true, phone: true },
      }),
      this.prisma.lead.findMany({
        where: {
          tenantId, status: { not: 'LOST' },
          OR: [
            { contactName: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
            { companyName: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 5,
        select: { id: true, contactName: true, companyName: true, email: true, phone: true, status: true },
      }),
    ]);

    return { clients, leads };
  }

  async findAll(tenantId: string, query: FilterRequestsDto) {
    const { page = 1, limit = 20, search, status, cargoType, transportType, dateFrom, dateTo } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { tenantId };
    if (status) where.status = status;
    if (cargoType) where.cargoType = cargoType;
    if (transportType) where.transportTypes = { has: transportType };
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
          carrier: { select: { id: true, companyName: true } },
          lead: { select: { id: true, contactName: true, status: true } },
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
        carrier: { select: { id: true, companyName: true } },
        lead: { select: { id: true, contactName: true, status: true } },
        documents: true,
      },
    });
    if (!request) throw new NotFoundException('Request not found');
    return request;
  }

  async updateStatus(tenantId: string, id: string, dto: UpdateRequestStatusDto) {
    const request = await this.prisma.shipmentRequest.findFirst({ where: { id, tenantId } });
    if (!request) throw new NotFoundException('Request not found');

    const data: Record<string, unknown> = {};
    if (dto.status) data.status = dto.status;
    if (dto.requestStatus) data.requestStatus = dto.requestStatus;
    if (dto.assignedToId !== undefined) data.assignedToId = dto.assignedToId;
    if (dto.notes !== undefined) data.notes = dto.notes;
    if (dto.rejectionReason !== undefined) data.rejectionReason = dto.rejectionReason;

    return this.prisma.shipmentRequest.update({ where: { id }, data });
  }

  // Назначить перевозчика на запрос
  async assignCarrier(tenantId: string, id: string, carrierId: string) {
    const request = await this.prisma.shipmentRequest.findFirst({ where: { id, tenantId } });
    if (!request) throw new NotFoundException('Request not found');

    const carrier = await this.prisma.carrier.findFirst({ where: { id: carrierId, tenantId, isActive: true } });
    if (!carrier) throw new NotFoundException('Carrier not found');

    return this.prisma.shipmentRequest.update({
      where: { id },
      data: { carrierId },
      include: {
        carrier: { select: { id: true, companyName: true } },
        assignedTo: { select: { id: true, name: true } },
        client: { select: { id: true, companyName: true } },
        documents: true,
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
          voen: request.voen,
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
          voen: request.voen,
        },
      });
    }

    const refNumber = await this.generateReferenceNumber(tenantId);

    // Определяем основной тип транспорта из мультимодального списка
    const mainTransport = request.transportTypes?.[0] || 'road_tir';
    const transportMap: Record<string, string> = {
      road_tir: 'road_tir',
      sea: 'sea',
      air: 'air',
      rail: 'rail',
    };

    const shipment = await this.prisma.shipment.create({
      data: {
        tenantId,
        referenceNumber: refNumber,
        transportType: (transportMap[mainTransport] || 'road_tir') as 'road_tir' | 'sea' | 'air' | 'rail',
        clientId: client.id,
        carrierId: request.carrierId,
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
