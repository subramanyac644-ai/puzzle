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
    const puzzles = await prisma.puzzle.findMany({
      orderBy: { createdAt: 'desc' },
      take: 3
    });
    for (const p of puzzles) {
      console.log('ID:', p.id, '| Length:', p.imageUrl.length);
      console.log('Start:', p.imageUrl.substring(0, 50));
      console.log('End:', p.imageUrl.substring(p.imageUrl.length - 20));
      console.log('---');
    }
  } catch(e) { console.error(e) }
  finally { await prisma.$disconnect(); await pool.end(); }
}
main();
