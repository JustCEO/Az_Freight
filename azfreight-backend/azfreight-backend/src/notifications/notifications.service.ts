import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, unreadOnly?: boolean) {
    const where: Record<string, unknown> = { userId };
    if (unreadOnly) {
      where.isRead = false;
    }

    return this.prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUnreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: { userId, isRead: false },
    });
    return { count };
  }

  async markRead(userId: string, id: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id, userId },
    });
    if (!notification) throw new NotFoundException('Notification not found');

    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return { success: true };
  }

  async create(
    tenantId: string,
    userId: string,
    type: string,
    title: string,
    message?: string,
    entityType?: string,
    entityId?: string,
  ) {
    return this.prisma.notification.create({
      data: {
        tenantId,
        userId,
        type,
        title,
        message,
        entityType,
        entityId,
      },
    });
  }

  async notify(
    tenantId: string,
    type: string,
    title: string,
    message?: string,
    entityType?: string,
    entityId?: string,
    roleFilter?: string | string[],
  ) {
    const where: Record<string, unknown> = { tenantId, isActive: true };
    if (roleFilter) {
      where.role = Array.isArray(roleFilter) ? { in: roleFilter } : roleFilter;
    }

    const users = await this.prisma.user.findMany({
      where,
      select: { id: true },
    });

    if (users.length === 0) return [];

    await this.prisma.notification.createMany({
      data: users.map((u) => ({
        tenantId,
        userId: u.id,
        type,
        title,
        message,
        entityType,
        entityId,
      })),
    });

    return { notified: users.length };
  }
}
