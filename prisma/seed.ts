import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const pool = new Pool({
  connectionString: process.env.DIRECT_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const sections = [
  { key: "company", title: "Company Information" },
  { key: "billing", title: "Billing Setup" },
  { key: "team", title: "Team Members" },
  { key: "security", title: "Security Settings" },
];

async function main() {
  console.log("Seeding database...");

  for (const section of sections) {
    await prisma.onboardingSection.upsert({
      where: { key: section.key },
      update: { title: section.title },
      create: section,
    });
    console.log(`  - ${section.key}: ${section.title}`);
  }

  console.log("Seeding completed.");
}

try {
  await main();
} catch (e) {
  console.error(e);
  process.exit(1);
} finally {
  await prisma.$disconnect();
  await pool.end();
}
