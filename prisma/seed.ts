import "dotenv/config";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Role } from "@prisma/client";
import bcryptjs from "bcryptjs";
import { envVars, requireEnvVariables } from "../src/config/env.js";

const connectionString = envVars.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

async function main() {
  requireEnvVariables(["ADMIN_EMAIL", "ADMIN_PASSWORD"]);

  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: envVars.ADMIN_EMAIL as string },
  });

  if (!existingAdmin) {
    console.log("Seeding admin user...");

    const hashedPassword = await bcryptjs.hash(envVars.ADMIN_PASSWORD as string, 12);

    await prisma.user.create({
      data: {
        name: "Super Admin",
        email: envVars.ADMIN_EMAIL as string,
        password: hashedPassword,
        role: Role.ADMIN,
        emailVerified: true,
        needPasswordChange: false,
        rememberMe: false,
      },
    });

    console.log("Admin user created successfully!");
  } else {
    console.log("Admin user already exists. Skipping seed.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
