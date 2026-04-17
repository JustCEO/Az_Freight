/**
 * One-time seed script to create a superadmin user.
 *
 * Usage (on VPS, inside /opt/azfreight):
 *   docker compose exec backend node scripts/create-superadmin.js
 *
 * Idempotent: if the user already exists, only the role/password/active flag
 * will be updated.
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const EMAIL = process.env.SUPERADMIN_EMAIL || 'administrator@azfreight.local';
const PASSWORD = process.env.SUPERADMIN_PASSWORD || '12332122';
const NAME = process.env.SUPERADMIN_NAME || 'Administrator';
const TENANT_SLUG = 'system';
const TENANT_NAME = 'System';

async function main() {
  const prisma = new PrismaClient();

  try {
    let tenant = await prisma.tenant.findUnique({ where: { slug: TENANT_SLUG } });
    if (!tenant) {
      tenant = await prisma.tenant.create({
        data: { name: TENANT_NAME, slug: TENANT_SLUG, plan: 'enterprise' },
      });
      console.log(`Created tenant: ${tenant.slug} (${tenant.id})`);
    } else {
      console.log(`Using existing tenant: ${tenant.slug} (${tenant.id})`);
    }

    const passwordHash = await bcrypt.hash(PASSWORD, 10);

    const existing = await prisma.user.findFirst({
      where: { tenantId: tenant.id, email: EMAIL },
    });

    if (existing) {
      const updated = await prisma.user.update({
        where: { id: existing.id },
        data: { role: 'superadmin', passwordHash, isActive: true, name: NAME },
      });
      console.log(`Updated user: ${updated.email} (role: ${updated.role})`);
    } else {
      const user = await prisma.user.create({
        data: {
          tenantId: tenant.id,
          email: EMAIL,
          passwordHash,
          name: NAME,
          role: 'superadmin',
          isActive: true,
        },
      });
      console.log(`Created user: ${user.email} (role: ${user.role})`);
    }

    console.log('\nLogin credentials:');
    console.log(`  Email:    ${EMAIL}`);
    console.log(`  Password: ${PASSWORD}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
