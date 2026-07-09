import 'dotenv/config';
import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'adminpassword123';

  // Check if admin already exists
  const existingAdmin = await prisma.admin.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log(`Admin user with email ${adminEmail} already exists.`);
    return;
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.admin.create({
    data: {
      email: adminEmail,
      password: hashedPassword,
    },
  });

  console.log(`Admin user seeded successfully with email: ${admin.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
