import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomStatusDto } from './dto/create-custom-status.dto';
import { UpdateCustomStatusDto } from './dto/update-custom-status.dto';

@Injectable()
export class CustomStatusesService {
  constructor(private prisma: PrismaService) {}

  /** Получить все кастомные статусы тенанта */
  async findAll(tenantId: string) {
    return this.prisma.customStatus.findMany({
      where: { tenantId },
      orderBy: { order: 'asc' },
    });
  }

  /** Создать новый кастомный статус */
  async create(tenantId: string, dto: CreateCustomStatusDto) {
    // Если новый статус помечен как «по умолчанию», сбрасываем флаг у остальных
    if (dto.isDefault) {
      await this.prisma.customStatus.updateMany({
        where: { tenantId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.customStatus.create({
      data: { tenantId, ...dto },
    });
  }

  /** Обновить кастомный статус */
  async update(tenantId: string, id: string, dto: UpdateCustomStatusDto) {
    const status = await this.prisma.customStatus.findFirst({
      where: { id, tenantId },
    });
    if (!status) throw new NotFoundException('Кастомный статус не найден');

    // Если обновляемый статус становится «по умолчанию», сбрасываем флаг у остальных
    if (dto.isDefault) {
      await this.prisma.customStatus.updateMany({
        where: { tenantId, isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }

    return this.prisma.customStatus.update({
      where: { id },
      data: dto,
    });
  }

  /** Удалить кастомный статус */
  async remove(tenantId: string, id: string) {
    const status = await this.prisma.customStatus.findFirst({
      where: { id, tenantId },
    });
    if (!status) throw new NotFoundException('Кастомный статус не найден');

    // Убираем ссылку на удаляемый статус у всех отправлений
    await this.prisma.shipment.updateMany({
      where: { customStatusId: id },
      data: { customStatusId: null, customStatusNote: null },
    });

    return this.prisma.customStatus.delete({ where: { id } });
  }

  /** Назначить кастомный статус отправлению */
  async assignCustomStatus(
    tenantId: string,
    shipmentId: string,
    data: { customStatusId?: string; customStatusNote?: string },
  ) {
    // Проверяем существование отправления в рамках тенанта
    const shipment = await this.prisma.shipment.findFirst({
      where: { id: shipmentId, tenantId },
    });
    if (!shipment) throw new NotFoundException('Отправление не найдено');

    // Если передан customStatusId, проверяем что статус принадлежит тому же тенанту
    if (data.customStatusId) {
      const status = await this.prisma.customStatus.findFirst({
        where: { id: data.customStatusId, tenantId },
      });
      if (!status) throw new NotFoundException('Кастомный статус не найден');
    }

    return this.prisma.shipment.update({
      where: { id: shipmentId },
      data: {
        customStatusId: data.customStatusId ?? null,
        customStatusNote: data.customStatusNote ?? null,
      },
    });
  }
}
