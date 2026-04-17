import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { RegisterByInviteDto } from './dto/register-by-invite.dto';
import { canManageRole } from '../common/constants/role-hierarchy';

@Injectable()
export class InvitationsService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, invitedById: string, dto: CreateInvitationDto, inviterRole?: string) {
    if (dto.role === 'superadmin') {
      throw new BadRequestException('Superadmin role cannot be granted via invitations');
    }
    if (inviterRole && !canManageRole(inviterRole, dto.role)) {
      throw new ForbiddenException('You cannot invite a user with a role equal to or above your own');
    }

    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) throw new NotFoundException('Tenant not found');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (dto.expiresInDays || 7));

    const invitation = await this.prisma.invitation.create({
      data: {
        tenantId,
        email: dto.email,
        role: dto.role,
        expiresAt,
        invitedById,
      },
    });

    const inviteUrl = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/portal/${tenant.slug}/register?invite=${invitation.token}`;

    return { ...invitation, inviteUrl };
  }

  async findAll(tenantId: string) {
    return this.prisma.invitation.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      include: { invitedBy: { select: { id: true, name: true } } },
    });
  }

  async remove(tenantId: string, id: string) {
    const invitation = await this.prisma.invitation.findFirst({ where: { id, tenantId } });
    if (!invitation) throw new NotFoundException('Invitation not found');
    return this.prisma.invitation.delete({ where: { id } });
  }

  async registerByInvite(dto: RegisterByInviteDto) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { token: dto.token },
      include: { tenant: true },
    });

    if (!invitation) throw new NotFoundException('Invalid invitation token');
    if (invitation.usedAt) throw new BadRequestException('Invitation already used');
    if (invitation.expiresAt < new Date()) throw new BadRequestException('Invitation expired');

    const existing = await this.prisma.user.findFirst({
      where: { tenantId: invitation.tenantId, email: invitation.email },
    });
    if (existing) throw new ConflictException('User already exists');

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const [user] = await this.prisma.$transaction([
      this.prisma.user.create({
        data: {
          tenantId: invitation.tenantId,
          email: invitation.email,
          passwordHash,
          name: dto.name,
          role: invitation.role,
          phone: dto.phone,
        },
      }),
      this.prisma.invitation.update({
        where: { id: invitation.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return {
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      tenant: { id: invitation.tenant.id, name: invitation.tenant.name, slug: invitation.tenant.slug },
    };
  }
}
