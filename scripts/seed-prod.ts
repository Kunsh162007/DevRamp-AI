import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting production database seed...');

  // Create an initial admin user
  const adminPassword = process.env.ADMIN_PASSWORD || 'ChangeMe123!';
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@devramp.ai' },
    update: {},
    create: {
      email: 'admin@devramp.ai',
      name: 'DevRamp Admin',
      password: hashedPassword,
      role: 'ADMIN',
      level: 'EXPERT',
      xp: 1000,
    },
  });

  console.log('Production seed completed. Admin user created:', admin.email);
}

main()
  .catch((e) => {
    console.error('Error during production seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
