import "dotenv/config";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { prisma } from "../lib/prisma";

const adminEmailSchema = z
  .email({ error: "ADMIN_EMAIL must be a valid email address." })
  .trim()
  .toLowerCase()
  .endsWith("@umuzi.org", "Administrator emails must end with @umuzi.org.");

async function main() {
  const parsedAdminEmail = adminEmailSchema.safeParse(
    process.env.ADMIN_EMAIL || "admin@umuzi.org",
  );

  if (!parsedAdminEmail.success) {
    throw new Error(parsedAdminEmail.error.issues[0]?.message);
  }

  const adminEmail = parsedAdminEmail.data;
  const adminPassword = process.env.ADMIN_PASSWORD || "adminpassword123";

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
