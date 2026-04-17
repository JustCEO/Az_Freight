import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCarrierDto } from './dto/create-carrier.dto';
import { UpdateCarrierDto } from './dto/update-carrier.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class CarriersService {
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
      this.prisma.carrier.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.carrier.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findOne(tenantId: string, id: string) {
    const carrier = await this.prisma.carrier.findFirst({ where: { id, tenantId } });
    if (!carrier) throw new NotFoundException('Carrier not found');
    return carrier;
  }

  async create(tenantId: string, dto: CreateCarrierDto) {
    return this.prisma.carrier.create({
      data: { tenantId, ...dto },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateCarrierDto) {
    const result = await this.prisma.carrier.updateMany({
      where: { id, tenantId },
      data: dto,
    });
    if (result.count === 0) throw new NotFoundException('Carrier not found');
    return this.prisma.carrier.findUnique({ where: { id } });
  }

  async remove(tenantId: string, id: string) {
    const result = await this.prisma.carrier.updateMany({
      where: { id, tenantId },
      data: { isActive: false },
    });
    if (result.count === 0) throw new NotFoundException('Carrier not found');
    return this.prisma.carrier.findUnique({ where: { id } });
  }
}
