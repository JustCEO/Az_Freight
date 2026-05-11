import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto, CreateClientContactDto, CreateAVLEntryDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { ClientLoyalty, PaymentTerms, AVLStatus } from '@prisma/client';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, query: PaginationDto) {
    const { page = 1, limit = 20, search } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { tenantId, isActive: true };
    if (search) {
      where.OR = [
        { companyName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.client.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.client.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findOne(tenantId: string, id: string) {
    const client = await this.prisma.client.findFirst({
      where: { id, tenantId },
      include: { contacts: true, avlEntries: { orderBy: { createdAt: 'desc' } } },
    });
    if (!client) throw new NotFoundException('Client not found');
    return client;
  }

  async create(tenantId: string, dto: CreateClientDto) {
    const data: Record<string, unknown> = { tenantId, ...dto };
    if (dto.contractStart) data.contractStart = new Date(dto.contractStart);
    if (dto.contractEnd) data.contractEnd = new Date(dto.contractEnd);
    if (dto.loyaltyStatus) data.loyaltyStatus = dto.loyaltyStatus as ClientLoyalty;
    if (dto.paymentTerms) data.paymentTerms = dto.paymentTerms as PaymentTerms;
    return this.prisma.client.create({ data: data as never });
  }

  async update(tenantId: string, id: string, dto: UpdateClientDto) {
    const client = await this.prisma.client.findFirst({ where: { id, tenantId } });
    if (!client) throw new NotFoundException('Client not found');

    const data: Record<string, unknown> = { ...dto };
    if (dto.contractStart) data.contractStart = new Date(dto.contractStart);
    if (dto.contractEnd) data.contractEnd = new Date(dto.contractEnd);
    if (dto.loyaltyStatus) data.loyaltyStatus = dto.loyaltyStatus as ClientLoyalty;
    if (dto.paymentTerms) data.paymentTerms = dto.paymentTerms as PaymentTerms;

    return this.prisma.client.update({ where: { id }, data: data as never });
  }

  async remove(tenantId: string, id: string) {
    const result = await this.prisma.client.updateMany({
      where: { id, tenantId },
      data: { isActive: false },
    });
    if (result.count === 0) throw new NotFoundException('Client not found');
    return this.prisma.client.findUnique({ where: { id } });
  }

  // ── Contacts ──

  async listContacts(tenantId: string, clientId: string) {
    return this.prisma.clientContact.findMany({
      where: { clientId, tenantId },
    });
  }

  async createContact(tenantId: string, clientId: string, dto: CreateClientContactDto) {
    return this.prisma.clientContact.create({
      data: { tenantId, clientId, ...dto },
    });
  }

  async updateContact(tenantId: string, clientId: string, contactId: string, dto: Partial<CreateClientContactDto>) {
    const contact = await this.prisma.clientContact.findFirst({ where: { id: contactId, clientId, tenantId } });
    if (!contact) throw new NotFoundException('Contact not found');
    return this.prisma.clientContact.update({ where: { id: contactId }, data: dto });
  }

  async deleteContact(tenantId: string, clientId: string, contactId: string) {
    const contact = await this.prisma.clientContact.findFirst({ where: { id: contactId, clientId, tenantId } });
    if (!contact) throw new NotFoundException('Contact not found');
    return this.prisma.clientContact.delete({ where: { id: contactId } });
  }

  // ── AVL ──

  async listAVL(tenantId: string, clientId: string) {
    return this.prisma.aVLEntry.findMany({
      where: { clientId, tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createAVL(tenantId: string, clientId: string, dto: CreateAVLEntryDto) {
    const data: Record<string, unknown> = { tenantId, clientId, vendorName: dto.vendorName };
    if (dto.serviceType) data.serviceType = dto.serviceType;
    if (dto.status) data.status = dto.status as AVLStatus;
    if (dto.rejectedReason) data.rejectedReason = dto.rejectedReason;
    if (dto.reviewDate) data.reviewDate = new Date(dto.reviewDate);
    if (dto.documentUrl) data.documentUrl = dto.documentUrl;
    if (dto.notes) data.notes = dto.notes;
    return this.prisma.aVLEntry.create({ data: data as never });
  }

  async updateAVL(tenantId: string, clientId: string, avlId: string, dto: Partial<CreateAVLEntryDto>) {
    const entry = await this.prisma.aVLEntry.findFirst({ where: { id: avlId, clientId, tenantId } });
    if (!entry) throw new NotFoundException('AVL entry not found');
    const data: Record<string, unknown> = { ...dto };
    if (dto.reviewDate) data.reviewDate = new Date(dto.reviewDate);
    if (dto.status) data.status = dto.status as AVLStatus;
    return this.prisma.aVLEntry.update({ where: { id: avlId }, data: data as never });
  }

  async deleteAVL(tenantId: string, clientId: string, avlId: string) {
    const entry = await this.prisma.aVLEntry.findFirst({ where: { id: avlId, clientId, tenantId } });
    if (!entry) throw new NotFoundException('AVL entry not found');
    return this.prisma.aVLEntry.delete({ where: { id: avlId } });
  }
}
