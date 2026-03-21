import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

async function main() {
  const puzzles = await prisma.puzzle.findMany({ where: { level: 'medium' } });
  console.log('Medium Puzzles:', JSON.stringify(puzzles, null, 2));
}

main().finally(() => pool.end());
