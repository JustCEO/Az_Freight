import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { LeadSource, LeadStatus } from '@prisma/client';

@Injectable()
export class LeadsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, status?: string) {
    const where: Record<string, unknown> = { tenantId };
    if (status) where.status = status;

    return this.prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { requests: true } } },
    });
  }

  async findOne(tenantId: string, id: string) {
    const lead = await this.prisma.lead.findFirst({
      where: { id, tenantId },
      include: {
        requests: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true, requesterName: true, originCity: true, destinationCity: true,
            cargoType: true, status: true, requestStatus: true, createdAt: true,
          },
        },
      },
    });
    if (!lead) throw new NotFoundException('Lead not found');
    return lead;
  }

  async create(tenantId: string, dto: CreateLeadDto) {
    return this.prisma.lead.create({
      data: {
        tenantId,
        contactName: dto.contactName,
        email: dto.email,
        phone: dto.phone,
        companyName: dto.companyName,
        notes: dto.notes,
        source: (dto.source as LeadSource) || 'MANUAL',
      },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateLeadDto) {
    const lead = await this.prisma.lead.findFirst({ where: { id, tenantId } });
    if (!lead) throw new NotFoundException('Lead not found');

    const data: Record<string, unknown> = {};
    if (dto.contactName !== undefined) data.contactName = dto.contactName;
    if (dto.email !== undefined) data.email = dto.email;
    if (dto.phone !== undefined) data.phone = dto.phone;
    if (dto.companyName !== undefined) data.companyName = dto.companyName;
    if (dto.notes !== undefined) data.notes = dto.notes;
    if (dto.status !== undefined) data.status = dto.status as LeadStatus;

    return this.prisma.lead.update({ where: { id }, data });
  }

  async convert(tenantId: string, id: string) {
    const lead = await this.prisma.lead.findFirst({ where: { id, tenantId } });
    if (!lead) throw new NotFoundException('Lead not found');
    if (lead.status === 'CONVERTED') throw new BadRequestException('Lead already converted');

    const client = await this.prisma.client.create({
      data: {
        tenantId,
        companyName: lead.companyName || lead.contactName,
        email: lead.email,
        phone: lead.phone,
      },
    });

    await this.prisma.lead.update({
      where: { id },
      data: { status: 'CONVERTED', convertedToClientId: client.id },
    });

    await this.prisma.shipmentRequest.updateMany({
      where: { leadId: id, clientId: null },
      data: { clientId: client.id },
    });

    return { lead: { id, status: 'CONVERTED' }, client };
  }

  async remove(tenantId: string, id: string) {
    const lead = await this.prisma.lead.findFirst({ where: { id, tenantId } });
    if (!lead) throw new NotFoundException('Lead not found');
    return this.prisma.lead.delete({ where: { id } });
  }
}
