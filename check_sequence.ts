
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

async function main() {
  const level = 'easy';
  const puzzles = await prisma.puzzle.findMany({ where: { level } });
  
  // Sort by createdAt just like the frontend
  const sorted = puzzles.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  
  if (sorted.length >= 2) {
    console.log("Found sequence:");
    console.log(`1. ${sorted[0].id}`);
    console.log(`2. ${sorted[1].id}`);
    process.exit(0);
  } else {
    console.log(`Not enough puzzles for level ${level} to test sequence.`);
    process.exit(1);
  }
}

main().catch(console.error).finally(() => { prisma.$disconnect(); pool.end(); });
