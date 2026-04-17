import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

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
    const client = await this.prisma.client.findFirst({ where: { id, tenantId } });
    if (!client) throw new NotFoundException('Client not found');
    return client;
  }

  async create(tenantId: string, dto: CreateClientDto) {
    return this.prisma.client.create({
      data: { tenantId, ...dto },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateClientDto) {
    const result = await this.prisma.client.updateMany({
      where: { id, tenantId },
      data: dto,
    });
    if (result.count === 0) throw new NotFoundException('Client not found');
    return this.prisma.client.findUnique({ where: { id } });
  }

  async remove(tenantId: string, id: string) {
    const result = await this.prisma.client.updateMany({
      where: { id, tenantId },
      data: { isActive: false },
    });
    if (result.count === 0) throw new NotFoundException('Client not found');
    return this.prisma.client.findUnique({ where: { id } });
  }
}
