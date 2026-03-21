import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

async function main() {
  const puzzles = await prisma.puzzle.findMany();
  console.log('Total puzzles:', puzzles.length);
  puzzles.forEach(p => {
    console.log(`- ID: ${p.id}, Level: ${p.level}, URL: ${p.imageUrl}`);
  });
  await prisma.$disconnect();
}

main().catch(console.error);
