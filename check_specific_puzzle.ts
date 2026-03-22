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
    const puzzle = await prisma.puzzle.findUnique({
      where: { id: '66ee5925-2ec4-48fe-9300-88033cf53544' }
    });
    console.log(puzzle);
  } catch(e) { console.error(e) }
  finally { await prisma.$disconnect(); await pool.end(); }
}
main();
