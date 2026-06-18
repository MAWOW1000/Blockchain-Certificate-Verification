import "dotenv/config";
import bcrypt from "bcrypt";
import prisma from "../src/utils/prisma.js";

// Seeds the demo admin account. Idempotent — safe to re-run.
async function main() {
  const email = "admin@test.com";
  const password = "admin123";
  const passwordHash = await bcrypt.hash(password, 10);

  // Sepolia test wallet (also the contract deployer / blockchain admin)
  const walletAddress = "0xeB2Df190720fC0edA260604Fb7aA06516FB4d85D";

  const admin = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role: "ADMIN" },
    create: {
      name: "Admin User",
      email,
      passwordHash,
      role: "ADMIN",
      walletAddress,
    },
  });

  console.log(`Seeded admin: ${admin.email} (role: ${admin.role})`);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
