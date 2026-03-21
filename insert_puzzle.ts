import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

async function main() {
  const admin = await prisma.user.findFirst({ where: { role: 'admin' } });
  if (!admin) {
    console.error('No admin user found');
    return;
  }

  // Check if a puzzle already exists to avoid duplicates if needed, 
  // but for now we just want one shown.
  const puzzle = await prisma.puzzle.create({
    data: {
      imageUrl: '/uploads/panda.webp', 
      level: 'easy',
      uploadedBy: admin.id,
    },
  });

  console.log('Created puzzle:', puzzle.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
