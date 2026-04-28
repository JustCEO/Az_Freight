import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { ShipmentStatus, TransportType } from '@prisma/client';

const STATUS_TRANSITIONS: Record<string, string[]> = {
  request: ['confirmed', 'cancelled'],
  confirmed: ['in_transit', 'cancelled'],
  in_transit: ['customs', 'delivered'],
  customs: ['delivered'],
  delivered: [],
  cancelled: [],
};

@Injectable()
export class ShipmentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, query: PaginationDto) {
    const { page = 1, limit = 20, search } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { tenantId };
    if (search) {
      where.OR = [
        { referenceNumber: { contains: search, mode: 'insensitive' } },
        { cargoDescription: { contains: search, mode: 'insensitive' } },
        { originCity: { contains: search, mode: 'insensitive' } },
        { destinationCity: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.shipment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          client: { select: { id: true, companyName: true } },
          carrier: { select: { id: true, companyName: true } },
          assignedTo: { select: { id: true, name: true } },
        },
      }),
      this.prisma.shipment.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findOne(tenantId: string, id: string) {
    const shipment = await this.prisma.shipment.findFirst({
      where: { id, tenantId },
      include: {
        client: { select: { id: true, companyName: true } },
        carrier: { select: { id: true, companyName: true } },
        assignedTo: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true } },
      },
    });
    if (!shipment) {
      throw new NotFoundException('Shipment not found');
    }
    return shipment;
  }

  async findOneForDocument(tenantId: string, id: string) {
    const shipment = await this.prisma.shipment.findFirst({
      where: { id, tenantId },
      include: {
        client: { select: { id: true, companyName: true, taxId: true, address: true, city: true, country: true, phone: true, email: true } },
        carrier: { select: { id: true, companyName: true, taxId: true, country: true, phone: true, email: true } },
        tenant: { select: { name: true } },
      },
    });
    if (!shipment) {
      throw new NotFoundException('Shipment not found');
    }
    return shipment;
  }

  async create(tenantId: string, userId: string, dto: CreateShipmentDto) {
    const referenceNumber = await this.generateReferenceNumber(tenantId);

    let profit: number | undefined;
    if (dto.clientRate != null && dto.carrierRate != null) {
      profit = dto.clientRate - dto.carrierRate;
    }

    return this.prisma.shipment.create({
      data: {
        tenantId,
        referenceNumber,
        transportType: dto.transportType as TransportType,
        clientId: dto.clientId,
        carrierId: dto.carrierId,
        originCountry: dto.originCountry,
        originCity: dto.originCity,
        originAddress: dto.originAddress,
        destinationCountry: dto.destinationCountry,
        destinationCity: dto.destinationCity,
        destinationAddress: dto.destinationAddress,
        cargoDescription: dto.cargoDescription,
        weightKg: dto.weightKg,
        volumeCbm: dto.volumeCbm,
        packageCount: dto.packageCount,
        hsCode: dto.hsCode,
        incoterms: dto.incoterms,
        clientRate: dto.clientRate,
        carrierRate: dto.carrierRate,
        currency: dto.currency || 'USD',
        profit,
        vesselName: dto.vesselName,
        containerNumber: dto.containerNumber,
        awbNumber: dto.awbNumber,
        wagonNumber: dto.wagonNumber,
        tirNumber: dto.tirNumber,
        eta: dto.eta ? new Date(dto.eta) : undefined,
        assignedToId: dto.assignedToId,
        createdById: userId,
        notes: dto.notes,
      },
      include: {
        client: { select: { id: true, companyName: true } },
        carrier: { select: { id: true, companyName: true } },
      },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateShipmentDto) {
    const shipment = await this.prisma.shipment.findFirst({
      where: { id, tenantId },
    });
    if (!shipment) {
      throw new NotFoundException('Shipment not found');
    }

    const data: Record<string, unknown> = { ...dto };

    if (dto.transportType) {
      data.transportType = dto.transportType as TransportType;
    }
    if (dto.eta) data.eta = new Date(dto.eta);
    if (dto.atd) data.atd = new Date(dto.atd);
    if (dto.ata) data.ata = new Date(dto.ata);

    const clientRate = dto.clientRate ?? Number(shipment.clientRate);
    const carrierRate = dto.carrierRate ?? Number(shipment.carrierRate);
    if (clientRate && carrierRate) {
      data.profit = clientRate - carrierRate;
    }

    const result = await this.prisma.shipment.updateMany({
      where: { id, tenantId },
      data,
    });
    if (result.count === 0) throw new NotFoundException('Shipment not found');
    return this.prisma.shipment.findUnique({
      where: { id },
      include: {
        client: { select: { id: true, companyName: true } },
        carrier: { select: { id: true, companyName: true } },
      },
    });
  }

  async updateStatus(tenantId: string, id: string, userId: string, dto: UpdateStatusDto) {
    const shipment = await this.prisma.shipment.findFirst({
      where: { id, tenantId },
    });
    if (!shipment) {
      throw new NotFoundException('Shipment not found');
    }

    const currentStatus = shipment.status;
    const allowedTransitions = STATUS_TRANSITIONS[currentStatus] || [];

    if (!allowedTransitions.includes(dto.status)) {
      throw new BadRequestException(
        `Cannot transition from '${currentStatus}' to '${dto.status}'. Allowed: [${allowedTransitions.join(', ')}]`,
      );
    }

    const [updatedShipment] = await this.prisma.$transaction([
      this.prisma.shipment.update({
        where: { id },
        data: { status: dto.status as ShipmentStatus },
      }),
      this.prisma.shipmentStatusLog.create({
        data: {
          shipmentId: id,
          oldStatus: currentStatus,
          newStatus: dto.status as ShipmentStatus,
          changedById: userId,
          comment: dto.comment,
        },
      }),
    ]);

    return updatedShipment;
  }

  async getTimeline(tenantId: string, id: string) {
    const shipment = await this.prisma.shipment.findFirst({
      where: { id, tenantId },
    });
    if (!shipment) {
      throw new NotFoundException('Shipment not found');
    }

    return this.prisma.shipmentStatusLog.findMany({
      where: { shipmentId: id },
      orderBy: { createdAt: 'asc' },
      include: {
        changedBy: { select: { id: true, name: true } },
      },
    });
  }

  async remove(tenantId: string, id: string) {
    const shipment = await this.prisma.shipment.findFirst({
      where: { id, tenantId },
    });
    if (!shipment) {
      throw new NotFoundException('Shipment not found');
    }

    return this.prisma.shipment.delete({
      where: { id },
    });
  }

  private async generateReferenceNumber(tenantId: string): Promise<string> {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = `SHP-${dateStr}`;

    const count = await this.prisma.shipment.count({
      where: {
        tenantId,
        referenceNumber: { startsWith: prefix },
      },
    });

    const seq = String(count + 1).padStart(4, '0');
    return `${prefix}-${seq}`;
  }
}
