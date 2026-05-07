import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { QuoteStatus, TransportType } from '@prisma/client';

const NOTIFY_ROLES = ['admin', 'manager', 'director'];

@Injectable()
export class QuotesService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  async findAll(tenantId: string, status?: string) {
    const where: Record<string, unknown> = { tenantId };
    if (status) {
      where.status = status as QuoteStatus;
    }

    return this.prisma.quote.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        client: { select: { id: true, companyName: true } },
        createdBy: { select: { id: true, name: true } },
        lines: true,
      },
    });
  }

  async findOne(tenantId: string, id: string) {
    const quote = await this.prisma.quote.findFirst({
      where: { id, tenantId },
      include: {
        client: { select: { id: true, companyName: true } },
        createdBy: { select: { id: true, name: true } },
        lines: true,
      },
    });
    if (!quote) throw new NotFoundException('Quote not found');
    return quote;
  }

  async create(tenantId: string, userId: string, dto: CreateQuoteDto) {
    const quoteNumber = await this.generateQuoteNumber(tenantId);
    const vatRate = dto.vatRate ?? 18;
    const validDays = dto.validDays ?? 14;
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + validDays);

    // Calculate subtotal from lines
    const linesData = dto.lines.map((line) => {
      const quantity = line.quantity ?? 1;
      const total = quantity * line.unitPrice;
      return { ...line, quantity, total };
    });

    const subtotal = linesData.reduce((sum, l) => sum + l.total, 0);
    const vatAmount = subtotal * vatRate / 100;
    const total = subtotal + vatAmount;

    return this.prisma.$transaction(async (tx) => {
      const quote = await tx.quote.create({
        data: {
          tenantId,
          quoteNumber,
          clientId: dto.clientId || null,
          leadId: dto.leadId || null,
          originCountry: dto.originCountry,
          originCity: dto.originCity,
          destCountry: dto.destCountry,
          destCity: dto.destCity,
          transportType: dto.transportType,
          cargoType: dto.cargoType,
          weightKg: dto.weightKg,
          volumeCbm: dto.volumeCbm,
          currency: dto.currency || 'USD',
          subtotal,
          vatRate,
          vatAmount,
          total,
          margin: dto.margin,
          validUntil,
          notes: dto.notes,
          createdById: userId,
          lines: {
            create: linesData.map((l) => ({
              description: l.description,
              quantity: l.quantity,
              unitPrice: l.unitPrice,
              total: l.total,
            })),
          },
        },
        include: {
          client: { select: { id: true, companyName: true } },
          createdBy: { select: { id: true, name: true } },
          lines: true,
        },
      });

      return quote;
    });
  }

  async update(tenantId: string, id: string, dto: UpdateQuoteDto) {
    const quote = await this.prisma.quote.findFirst({
      where: { id, tenantId },
    });
    if (!quote) throw new NotFoundException('Quote not found');

    const data: Record<string, unknown> = {};

    if (dto.clientId !== undefined) data.clientId = dto.clientId || null;
    if (dto.leadId !== undefined) data.leadId = dto.leadId || null;
    if (dto.originCountry !== undefined) data.originCountry = dto.originCountry;
    if (dto.originCity !== undefined) data.originCity = dto.originCity;
    if (dto.destCountry !== undefined) data.destCountry = dto.destCountry;
    if (dto.destCity !== undefined) data.destCity = dto.destCity;
    if (dto.transportType !== undefined) data.transportType = dto.transportType;
    if (dto.cargoType !== undefined) data.cargoType = dto.cargoType;
    if (dto.weightKg !== undefined) data.weightKg = dto.weightKg;
    if (dto.volumeCbm !== undefined) data.volumeCbm = dto.volumeCbm;
    if (dto.currency !== undefined) data.currency = dto.currency;
    if (dto.vatRate !== undefined) data.vatRate = dto.vatRate;
    if (dto.margin !== undefined) data.margin = dto.margin;
    if (dto.notes !== undefined) data.notes = dto.notes;
    if (dto.status !== undefined) {
      data.status = dto.status as QuoteStatus;
      this.notifications.notify(tenantId, 'QUOTE_STATUS', 'Quote updated',
        `Quote ${quote.quoteNumber} was ${dto.status}`, 'quote', id, NOTIFY_ROLES).catch(() => {});
    }

    if (dto.validDays !== undefined) {
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + dto.validDays);
      data.validUntil = validUntil;
    }

    // If lines are provided, recalculate totals
    if (dto.lines) {
      const linesData = dto.lines.map((line) => {
        const quantity = line.quantity ?? 1;
        const total = quantity * line.unitPrice;
        return { ...line, quantity, total };
      });

      const subtotal = linesData.reduce((sum, l) => sum + l.total, 0);
      const vatRate = dto.vatRate ?? Number(quote.vatRate);
      const vatAmount = subtotal * vatRate / 100;
      const total = subtotal + vatAmount;

      data.subtotal = subtotal;
      data.vatAmount = vatAmount;
      data.total = total;

      return this.prisma.$transaction(async (tx) => {
        // Delete old lines and create new ones
        await tx.quoteLine.deleteMany({ where: { quoteId: id } });

        return tx.quote.update({
          where: { id },
          data: {
            ...data,
            lines: {
              create: linesData.map((l) => ({
                description: l.description,
                quantity: l.quantity,
                unitPrice: l.unitPrice,
                total: l.total,
              })),
            },
          },
          include: {
            client: { select: { id: true, companyName: true } },
            createdBy: { select: { id: true, name: true } },
            lines: true,
          },
        });
      });
    }

    return this.prisma.quote.update({
      where: { id },
      data,
      include: {
        client: { select: { id: true, companyName: true } },
        createdBy: { select: { id: true, name: true } },
        lines: true,
      },
    });
  }

  async convertToShipment(tenantId: string, id: string, userId: string) {
    const quote = await this.prisma.quote.findFirst({
      where: { id, tenantId },
      include: { lines: true },
    });
    if (!quote) throw new NotFoundException('Quote not found');

    if (!quote.clientId) {
      throw new BadRequestException('Quote must have a client before converting to shipment');
    }

    // Generate shipment reference number
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
    const referenceNumber = `${prefix}-${seq}`;

    return this.prisma.$transaction(async (tx) => {
      const shipment = await tx.shipment.create({
        data: {
          tenantId,
          referenceNumber,
          transportType: quote.transportType as TransportType,
          clientId: quote.clientId as string,
          originCountry: quote.originCountry,
          originCity: quote.originCity,
          destinationCountry: quote.destCountry,
          destinationCity: quote.destCity,
          cargoDescription: quote.cargoType,
          weightKg: quote.weightKg,
          volumeCbm: quote.volumeCbm,
          clientRate: quote.total,
          currency: quote.currency,
          createdById: userId,
        },
      });

      await tx.quote.update({
        where: { id },
        data: { status: 'accepted' as QuoteStatus },
      });

      return shipment;
    });
  }

  async remove(tenantId: string, id: string) {
    const quote = await this.prisma.quote.findFirst({
      where: { id, tenantId },
    });
    if (!quote) throw new NotFoundException('Quote not found');

    return this.prisma.quote.delete({ where: { id } });
  }

  private async generateQuoteNumber(tenantId: string): Promise<string> {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = `QT-${dateStr}`;

    const count = await this.prisma.quote.count({
      where: {
        tenantId,
        quoteNumber: { startsWith: prefix },
      },
    });

    const seq = String(count + 1).padStart(4, '0');
    return `${prefix}-${seq}`;
  }
}
