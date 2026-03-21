import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });
  try {
    const userCount = await prisma.user.count();
    const puzzleCount = await prisma.puzzle.count();
    const scoreCount = await prisma.score.count();
    console.log(`Users: ${userCount}, Puzzles: ${puzzleCount}, Scores: ${scoreCount}`);
  } catch (e: any) {
    console.log(`Error: ${e.message}`);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
