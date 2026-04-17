import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { VehicleStatus } from '@prisma/client';

@Injectable()
export class VehiclesService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, query: PaginationDto) {
    const { page = 1, limit = 20, search } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { tenantId };
    if (search) {
      where.OR = [
        { plateNumber: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.vehicle.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.vehicle.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findOne(tenantId: string, id: string) {
    const vehicle = await this.prisma.vehicle.findFirst({ where: { id, tenantId } });
    if (!vehicle) throw new NotFoundException('Vehicle not found');
    return vehicle;
  }

  async create(tenantId: string, dto: CreateVehicleDto) {
    const data: Record<string, unknown> = { tenantId, ...dto };
    if (dto.insuranceExpiry) data.insuranceExpiry = new Date(dto.insuranceExpiry);
    if (dto.inspectionExpiry) data.inspectionExpiry = new Date(dto.inspectionExpiry);
    if (dto.tirCarnetExpiry) data.tirCarnetExpiry = new Date(dto.tirCarnetExpiry);

    return this.prisma.vehicle.create({ data: data as Parameters<typeof this.prisma.vehicle.create>[0]['data'] });
  }

  async update(tenantId: string, id: string, dto: UpdateVehicleDto) {
    const data: Record<string, unknown> = { ...dto };
    if (dto.status) data.status = dto.status as VehicleStatus;
    if (dto.insuranceExpiry) data.insuranceExpiry = new Date(dto.insuranceExpiry);
    if (dto.inspectionExpiry) data.inspectionExpiry = new Date(dto.inspectionExpiry);
    if (dto.tirCarnetExpiry) data.tirCarnetExpiry = new Date(dto.tirCarnetExpiry);

    const result = await this.prisma.vehicle.updateMany({
      where: { id, tenantId },
      data,
    });
    if (result.count === 0) throw new NotFoundException('Vehicle not found');
    return this.prisma.vehicle.findUnique({ where: { id } });
  }

  async remove(tenantId: string, id: string) {
    const result = await this.prisma.vehicle.deleteMany({
      where: { id, tenantId },
    });
    if (result.count === 0) throw new NotFoundException('Vehicle not found');
    return { success: true };
  }
}
