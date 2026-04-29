import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuid } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class PortalAuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async requestAccess(tenantSlug: string, email: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { slug: tenantSlug } });
    if (!tenant || !tenant.isActive || !tenant.portalEnabled) {
      throw new NotFoundException('Portal not found');
    }

    const client = await this.prisma.client.findFirst({
      where: { tenantId: tenant.id, email, isActive: true },
    });
    if (!client) {
      throw new NotFoundException('No account found with this email');
    }

    const token = uuid();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    await this.prisma.clientPortalSession.create({
      data: {
        email,
        token,
        clientId: client.id,
        tenantId: tenant.id,
        expiresAt,
      },
    });

    const magicLink = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/portal/${tenantSlug}/login?token=${token}`;

    await this.emailService.sendMagicLink(email, magicLink, tenant.name);

    return { message: 'Login link sent to your email', magicLink };
  }

  async verify(token: string) {
    const session = await this.prisma.clientPortalSession.findUnique({
      where: { token },
      include: { client: { select: { id: true, companyName: true, email: true, tenantId: true } } },
    });

    if (!session) throw new NotFoundException('Invalid token');
    if (session.usedAt) throw new BadRequestException('Token already used');
    if (session.expiresAt < new Date()) throw new BadRequestException('Token expired');

    await this.prisma.clientPortalSession.update({
      where: { id: session.id },
      data: { usedAt: new Date() },
    });

    const jwt = await this.jwtService.signAsync({
      sub: session.clientId,
      email: session.email,
      role: 'portal_client',
      tenantId: session.tenantId,
      type: 'portal',
    }, { expiresIn: '24h' });

    return {
      accessToken: jwt,
      client: session.client,
    };
  }
}
