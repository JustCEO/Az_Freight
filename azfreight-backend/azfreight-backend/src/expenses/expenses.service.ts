import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { ExpenseCategory } from '@prisma/client';

@Injectable()
export class ExpensesService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, shipmentId?: string) {
    const where: Record<string, unknown> = { tenantId };
    if (shipmentId) {
      where.shipmentId = shipmentId;
    }

    return this.prisma.expense.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        shipment: { select: { id: true, referenceNumber: true } },
        createdBy: { select: { id: true, name: true } },
      },
    });
  }

  async findOne(tenantId: string, id: string) {
    const expense = await this.prisma.expense.findFirst({
      where: { id, tenantId },
      include: {
        shipment: { select: { id: true, referenceNumber: true } },
        createdBy: { select: { id: true, name: true } },
      },
    });
    if (!expense) throw new NotFoundException('Expense not found');
    return expense;
  }

  async create(tenantId: string, userId: string, dto: CreateExpenseDto) {
    const vatRate = dto.vatRate ?? 18;
    const vatAmount = dto.amount * vatRate / 100;

    return this.prisma.expense.create({
      data: {
        tenantId,
        shipmentId: dto.shipmentId,
        category: dto.category as ExpenseCategory,
        description: dto.description,
        amount: dto.amount,
        currency: dto.currency || 'USD',
        vatRate,
        vatAmount,
        date: dto.date ? new Date(dto.date) : new Date(),
        createdById: userId,
      },
      include: {
        shipment: { select: { id: true, referenceNumber: true } },
        createdBy: { select: { id: true, name: true } },
      },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateExpenseDto) {
    const expense = await this.prisma.expense.findFirst({
      where: { id, tenantId },
    });
    if (!expense) throw new NotFoundException('Expense not found');

    const data: Record<string, unknown> = {};

    if (dto.category !== undefined) data.category = dto.category as ExpenseCategory;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.amount !== undefined) data.amount = dto.amount;
    if (dto.currency !== undefined) data.currency = dto.currency;
    if (dto.vatRate !== undefined) data.vatRate = dto.vatRate;
    if (dto.date !== undefined) data.date = new Date(dto.date);

    // Recalculate vatAmount if amount or vatRate changed
    const amount = dto.amount ?? Number(expense.amount);
    const vatRate = dto.vatRate ?? (expense.vatRate != null ? Number(expense.vatRate) : 18);
    if (dto.amount !== undefined || dto.vatRate !== undefined) {
      data.vatAmount = amount * vatRate / 100;
    }

    return this.prisma.expense.update({
      where: { id },
      data,
      include: {
        shipment: { select: { id: true, referenceNumber: true } },
        createdBy: { select: { id: true, name: true } },
      },
    });
  }

  async remove(tenantId: string, id: string) {
    const expense = await this.prisma.expense.findFirst({
      where: { id, tenantId },
    });
    if (!expense) throw new NotFoundException('Expense not found');

    return this.prisma.expense.delete({ where: { id } });
  }

  async getShipmentPL(tenantId: string, shipmentId: string) {
    const shipment = await this.prisma.shipment.findFirst({
      where: { id: shipmentId, tenantId },
    });
    if (!shipment) throw new NotFoundException('Shipment not found');

    const expenses = await this.prisma.expense.findMany({
      where: { shipmentId, tenantId },
    });

    const expenseBreakdown = expenses.map((e) => ({
      category: e.category,
      amount: Number(e.amount),
    }));

    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const vatTotal = expenses.reduce((sum, e) => sum + Number(e.vatAmount || 0), 0);

    const clientRate = Number(shipment.clientRate || 0);
    const carrierRate = Number(shipment.carrierRate || 0);
    const grossProfit = clientRate - carrierRate;
    const netProfit = grossProfit - totalExpenses;

    return {
      clientRate,
      carrierRate,
      expenses: expenseBreakdown,
      totalExpenses,
      vatTotal,
      grossProfit,
      netProfit,
    };
  }
}
