import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { TenantPlan, UserRole } from '@prisma/client';

@Injectable()
export class SuperAdminService {
  constructor(private prisma: PrismaService) {}

  // Создание тенанта вместе с администратором
  async createTenant(dto: CreateTenantDto) {
    // Проверяем уникальность slug
    const existing = await this.prisma.tenant.findUnique({
      where: { slug: dto.slug },
    });
    if (existing) {
      throw new ConflictException('Тенант с таким slug уже существует');
    }

    const passwordHash = await bcrypt.hash(dto.adminPassword, 10);

    // Создаём тенант и пользователя-администратора в одной транзакции
    const tenant = await this.prisma.$transaction(async (tx) => {
      const newTenant = await tx.tenant.create({
        data: {
          name: dto.name,
          slug: dto.slug,
          plan: (dto.plan as TenantPlan) || 'starter',
        },
      });

      await tx.user.create({
        data: {
          tenantId: newTenant.id,
          email: dto.adminEmail,
          passwordHash,
          name: dto.adminName,
          role: 'director',
        },
      });

      return newTenant;
    });

    return tenant;
  }

  // Получение списка всех тенантов со статистикой
  async listTenants() {
    return this.prisma.tenant.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            users: true,
            shipmentRequests: true,
          },
        },
      },
    });
  }

  // Обновление данных тенанта
  async updateTenant(id: string, dto: UpdateTenantDto) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id } });
    if (!tenant) {
      throw new NotFoundException('Тенант не найден');
    }

    return this.prisma.tenant.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.plan !== undefined && { plan: dto.plan as TenantPlan }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        ...(dto.maxUsers !== undefined && { maxUsers: dto.maxUsers }),
        ...(dto.maxShipmentsMonth !== undefined && { maxShipmentsMonth: dto.maxShipmentsMonth }),
      },
    });
  }

  // Деактивация тенанта (мягкое удаление)
  async deactivateTenant(id: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id } });
    if (!tenant) {
      throw new NotFoundException('Тенант не найден');
    }

    return this.prisma.tenant.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // Получение списка пользователей конкретного тенанта
  async getTenantUsers(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) {
      throw new NotFoundException('Тенант не найден');
    }

    return this.prisma.user.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
      },
    });
  }

  // Все пользователи платформы, сгруппированные по тенанту
  async getAllUsers() {
    return this.prisma.user.findMany({
      orderBy: [{ tenant: { name: 'asc' } }, { createdAt: 'desc' }],
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        tenantId: true,
        tenant: { select: { id: true, name: true, slug: true } },
      },
    });
  }

  // Создание приглашения для тенанта
  async inviteToTenant(
    tenantId: string,
    invitedById: string,
    dto: { email: string; role: string; expiresInDays?: number },
  ) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) {
      throw new NotFoundException('Тенант не найден');
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (dto.expiresInDays || 7));

    const invitation = await this.prisma.invitation.create({
      data: {
        tenantId,
        email: dto.email,
        role: dto.role as UserRole,
        expiresAt,
        invitedById,
      },
    });

    const inviteUrl = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/portal/${tenant.slug}/register?invite=${invitation.token}`;

    return { ...invitation, inviteUrl };
  }

  // Привязка существующего пользователя или создание нового для тенанта
  async assignUserToTenant(
    tenantId: string,
    body: { userId?: string; email?: string; name?: string; role?: string; password?: string },
  ) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) {
      throw new NotFoundException('Тенант не найден');
    }

    // Если передан userId — переносим существующего пользователя в тенант
    if (body.userId) {
      const user = await this.prisma.user.findUnique({ where: { id: body.userId } });
      if (!user) {
        throw new NotFoundException('Пользователь не найден');
      }

      return this.prisma.user.update({
        where: { id: body.userId },
        data: { tenantId },
      });
    }

    // Иначе создаём нового пользователя в тенанте
    if (!body.email || !body.name || !body.role) {
      throw new ConflictException('Для создания пользователя нужны email, name и role');
    }

    // Проверяем, нет ли уже пользователя с таким email в этом тенанте
    const existing = await this.prisma.user.findFirst({
      where: { tenantId, email: body.email },
    });
    if (existing) {
      throw new ConflictException('Пользователь с таким email уже существует в этом тенанте');
    }

    const passwordHash = await bcrypt.hash(body.password || 'changeme123', 10);

    return this.prisma.user.create({
      data: {
        tenantId,
        email: body.email,
        name: body.name,
        role: body.role as UserRole,
        passwordHash,
      },
    });
  }

  // Получение общей статистики платформы
  async getStats() {
    const [totalTenants, totalUsers, totalRequests, totalShipments] =
      await Promise.all([
        this.prisma.tenant.count(),
        this.prisma.user.count(),
        this.prisma.shipmentRequest.count(),
        this.prisma.shipment.count(),
      ]);

    // Активные тенанты
    const activeTenants = await this.prisma.tenant.count({
      where: { isActive: true },
    });

    return {
      totalTenants,
      activeTenants,
      totalUsers,
      totalRequests,
      totalShipments,
    };
  }
}
