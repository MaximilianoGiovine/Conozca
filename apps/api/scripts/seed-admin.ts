import "dotenv/config";
import { PrismaService } from "../src/prisma.service";
import { Role } from "@conozca/database";
import * as bcrypt from "bcrypt";

const BCRYPT_ROUNDS = 12;

async function main() {
  const prisma = new PrismaService();
  const email = process.env.ADMIN_EMAIL ?? "admin@conozca.com";
  const password = process.env.ADMIN_PASSWORD ?? "Admin123!";

  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
    console.warn(
      "ADMIN_EMAIL or ADMIN_PASSWORD not set. Using default dev credentials.",
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    console.log(`Admin user already exists: ${email}`);
    await prisma.$disconnect();
    return;
  }

  const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

  await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name: "Admin",
      role: Role.ADMIN,
      isSubscribed: false,
    },
  });

  console.log(`Admin user created: ${email}`);
  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error("Seed failed:", error);
  process.exitCode = 1;
});
