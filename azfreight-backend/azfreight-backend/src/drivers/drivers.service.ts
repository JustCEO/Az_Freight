import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDriverDto, UpdateDriverDto } from './dto/driver.dto';
import { DriverStatus } from '@prisma/client';

@Injectable()
export class DriversService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, search?: string, status?: string) {
    const where: Record<string, unknown> = { tenantId };
    if (status) where.status = status as DriverStatus;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { licenseNumber: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }
    return this.prisma.driver.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const driver = await this.prisma.driver.findFirst({ where: { id, tenantId } });
    if (!driver) throw new NotFoundException('Driver not found');
    return driver;
  }

  async create(tenantId: string, dto: CreateDriverDto) {
    return this.prisma.driver.create({
      data: {
        tenantId,
        name: dto.name,
        phone: dto.phone,
        email: dto.email,
        licenseNumber: dto.licenseNumber,
        licenseExpiry: dto.licenseExpiry ? new Date(dto.licenseExpiry) : undefined,
        licenseCategories: dto.licenseCategories || [],
        medicalExpiry: dto.medicalExpiry ? new Date(dto.medicalExpiry) : undefined,
        passportNumber: dto.passportNumber,
        passportExpiry: dto.passportExpiry ? new Date(dto.passportExpiry) : undefined,
      },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateDriverDto) {
    const driver = await this.prisma.driver.findFirst({ where: { id, tenantId } });
    if (!driver) throw new NotFoundException('Driver not found');

    const data: Record<string, unknown> = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.phone !== undefined) data.phone = dto.phone;
    if (dto.email !== undefined) data.email = dto.email;
    if (dto.licenseNumber !== undefined) data.licenseNumber = dto.licenseNumber;
    if (dto.licenseExpiry !== undefined) data.licenseExpiry = new Date(dto.licenseExpiry);
    if (dto.licenseCategories !== undefined) data.licenseCategories = dto.licenseCategories;
    if (dto.medicalExpiry !== undefined) data.medicalExpiry = new Date(dto.medicalExpiry);
    if (dto.passportNumber !== undefined) data.passportNumber = dto.passportNumber;
    if (dto.passportExpiry !== undefined) data.passportExpiry = new Date(dto.passportExpiry);
    if (dto.status !== undefined) data.status = dto.status as DriverStatus;

    return this.prisma.driver.update({ where: { id }, data });
  }

  async remove(tenantId: string, id: string) {
    const driver = await this.prisma.driver.findFirst({ where: { id, tenantId } });
    if (!driver) throw new NotFoundException('Driver not found');
    return this.prisma.driver.delete({ where: { id } });
  }

  // ── Trainings ──

  async listTrainings(driverId: string) {
    return this.prisma.driverTraining.findMany({
      where: { driverId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createTraining(driverId: string, data: { title: string; issuedAt?: string; expiresAt?: string; documentUrl?: string }) {
    return this.prisma.driverTraining.create({
      data: {
        driverId,
        title: data.title,
        issuedAt: data.issuedAt ? new Date(data.issuedAt) : undefined,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
        documentUrl: data.documentUrl,
      },
    });
  }

  async deleteTraining(driverId: string, trainingId: string) {
    const t = await this.prisma.driverTraining.findFirst({ where: { id: trainingId, driverId } });
    if (!t) throw new NotFoundException('Training not found');
    return this.prisma.driverTraining.delete({ where: { id: trainingId } });
  }
}
