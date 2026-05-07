import { Injectable, NotFoundException, ConflictException, BadRequestException, ForbiddenException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { UserRole } from '@prisma/client';
import { canManageRole } from '../common/constants/role-hierarchy';

const USER_SELECT = {
  id: true,
  email: true,
  name: true,
  role: true,
  phone: true,
  isActive: true,
  lastLogin: true,
  createdAt: true,
  preferredLocale: true,
  preferredTheme: true,
  preferredTimezone: true,
  preferredCurrency: true,
};

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, query: PaginationDto) {
    const { page = 1, limit = 20, search } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { tenantId };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' }, select: USER_SELECT }),
      this.prisma.user.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findOne(tenantId: string, id: string) {
    const user = await this.prisma.user.findFirst({ where: { id, tenantId }, select: USER_SELECT });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async create(tenantId: string, dto: CreateUserDto, callerRole?: string) {
    if (callerRole && !canManageRole(callerRole, dto.role)) {
      throw new ForbiddenException('You cannot assign a role equal to or above your own');
    }

    const existing = await this.prisma.user.findUnique({
      where: { tenantId_email: { tenantId, email: dto.email } },
    });
    if (existing) throw new ConflictException('Email already exists in this tenant');

    const passwordHash = dto.sendInvitation
      ? await bcrypt.hash(uuidv4(), 10)
      : await bcrypt.hash(dto.password!, 10);

    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          tenantId,
          email: dto.email,
          passwordHash,
          name: dto.name,
          role: dto.role as UserRole,
          phone: dto.phone,
        },
        select: USER_SELECT,
      });

      let inviteUrl: string | undefined;
      const tenant = await tx.tenant.findUnique({ where: { id: tenantId } });
      if (dto.sendInvitation) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + (dto.invitationExpiresInDays || 7));

        const invitation = await tx.invitation.create({
          data: {
            tenantId,
            email: dto.email,
            role: dto.role as UserRole,
            expiresAt,
            invitedById: user.id,
          },
        });

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
        inviteUrl = `${frontendUrl}/portal/${tenant?.slug}/register?invite=${invitation.token}`;
      }

      return { ...user, inviteUrl };
    });

    return result;
  }

  async update(tenantId: string, id: string, dto: UpdateUserDto, callerRole?: string) {
    const user = await this.prisma.user.findFirst({ where: { id, tenantId } });
    if (!user) throw new NotFoundException('User not found');

    if (dto.role && callerRole) {
      if (!canManageRole(callerRole, user.role)) {
        throw new ForbiddenException('You cannot modify a user with a role equal to or above your own');
      }
      if (!canManageRole(callerRole, dto.role)) {
        throw new ForbiddenException('You cannot assign a role equal to or above your own');
      }
    }

    const data: Record<string, unknown> = {};
    if (dto.name) data.name = dto.name;
    if (dto.email) data.email = dto.email;
    if (dto.role) data.role = dto.role;
    if (dto.phone !== undefined) data.phone = dto.phone;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;
    if (dto.password) {
      data.passwordHash = await bcrypt.hash(dto.password, 10);
    }

    return this.prisma.user.update({ where: { id }, data, select: USER_SELECT });
  }

  async toggleActive(tenantId: string, currentUserId: string, targetId: string, isActive: boolean) {
    if (currentUserId === targetId) {
      throw new BadRequestException('Cannot change your own active status');
    }
    const user = await this.prisma.user.findFirst({ where: { id: targetId, tenantId } });
    if (!user) throw new NotFoundException('User not found');

    return this.prisma.user.update({
      where: { id: targetId },
      data: { isActive },
      select: USER_SELECT,
    });
  }

  async remove(tenantId: string, id: string) {
    const user = await this.prisma.user.findFirst({ where: { id, tenantId } });
    if (!user) throw new NotFoundException('User not found');

    return this.prisma.user.update({
      where: { id },
      data: { isActive: false },
      select: { id: true, email: true, name: true, isActive: true },
    });
  }

  async deletePermanently(tenantId: string, id: string) {
    const user = await this.prisma.user.findFirst({ where: { id, tenantId } });
    if (!user) throw new NotFoundException('User not found');

    await this.prisma.$transaction(async (tx) => {
      await tx.notification.deleteMany({ where: { userId: id } });
      await tx.invitation.deleteMany({ where: { invitedById: id } });
      await tx.user.delete({ where: { id } });
    });

    return { deleted: true, name: user.name };
  }

  async getPreferences(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { preferredLocale: true, preferredTheme: true, preferredTimezone: true, preferredCurrency: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updatePreferences(userId: string, dto: UpdatePreferencesDto) {
    const data: Record<string, unknown> = {};
    if (dto.locale !== undefined) data.preferredLocale = dto.locale;
    if (dto.theme !== undefined) data.preferredTheme = dto.theme;
    if (dto.timezone !== undefined) data.preferredTimezone = dto.timezone;
    if (dto.currency !== undefined) data.preferredCurrency = dto.currency;

    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: { preferredLocale: true, preferredTheme: true, preferredTimezone: true, preferredCurrency: true },
    });
  }
}
