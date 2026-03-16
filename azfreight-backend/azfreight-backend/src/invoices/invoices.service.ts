import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto, UpdateInvoiceStatusDto } from './dto/update-invoice.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { InvoiceStatus } from '@prisma/client';

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, query: PaginationDto) {
    const { page = 1, limit = 20, search } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { tenantId };
    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          client: { select: { id: true, companyName: true } },
          shipment: { select: { id: true, referenceNumber: true } },
        },
      }),
      this.prisma.invoice.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findOne(tenantId: string, id: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, tenantId },
      include: {
        client: { select: { id: true, companyName: true } },
        shipment: { select: { id: true, referenceNumber: true } },
        createdBy: { select: { id: true, name: true } },
      },
    });
    if (!invoice) throw new NotFoundException('Invoice not found');
    return invoice;
  }

  async create(tenantId: string, userId: string, dto: CreateInvoiceDto) {
    return this.prisma.invoice.create({
      data: {
        tenantId,
        invoiceNumber: dto.invoiceNumber,
        clientId: dto.clientId,
        shipmentId: dto.shipmentId,
        amount: dto.amount,
        currency: dto.currency || 'USD',
        issuedDate: new Date(dto.issuedDate),
        dueDate: new Date(dto.dueDate),
        lineItems: dto.lineItems as object || undefined,
        notes: dto.notes,
        createdById: userId,
      },
      include: {
        client: { select: { id: true, companyName: true } },
      },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateInvoiceDto) {
    const invoice = await this.prisma.invoice.findFirst({ where: { id, tenantId } });
    if (!invoice) throw new NotFoundException('Invoice not found');

    const data: Record<string, unknown> = { ...dto };
    if (dto.issuedDate) data.issuedDate = new Date(dto.issuedDate);
    if (dto.dueDate) data.dueDate = new Date(dto.dueDate);
    if (dto.paidDate) data.paidDate = new Date(dto.paidDate);

    return this.prisma.invoice.update({
      where: { id },
      data,
      include: {
        client: { select: { id: true, companyName: true } },
      },
    });
  }

  async updateStatus(tenantId: string, id: string, dto: UpdateInvoiceStatusDto) {
    const invoice = await this.prisma.invoice.findFirst({ where: { id, tenantId } });
    if (!invoice) throw new NotFoundException('Invoice not found');

    return this.prisma.invoice.update({
      where: { id },
      data: { status: dto.status as InvoiceStatus },
    });
  }
}
