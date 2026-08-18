import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

const TEAMS = [
  'Finance',
  'Human Resources',
  'Engineering and Product',
  'Operations',
  'Admin',
] as const;

const adapter = new PrismaPg({
  connectionString: process.env['DATABASE_URL'],
});

const prisma = new PrismaClient({ adapter });

async function main() {
  for (const name of TEAMS) {
    const existing = await prisma.team.findFirst({ where: { name } });

    if (existing) {
      console.log(`Skipped "${name}" — already exists`);
      continue;
    }

    await prisma.team.create({ data: { name } });
    console.log(`Created team "${name}"`);
  }
}

main()
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
