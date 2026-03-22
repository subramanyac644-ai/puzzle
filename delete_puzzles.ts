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
    const d1 = await prisma.score.deleteMany();
    const d2 = await prisma.puzzle.deleteMany();
    console.log(`Deleted ${d1.count} scores and ${d2.count} puzzles. DB is clean.`);
  } catch(e) { console.error(e) }
  finally { await prisma.$disconnect(); await pool.end(); }
}
main();
