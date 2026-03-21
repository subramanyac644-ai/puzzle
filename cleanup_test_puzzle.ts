import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

async function main() {
  const idToDelete = '13306d82-d755-4cf9-9a83-cf761220221c';
  await prisma.score.deleteMany({ where: { puzzleId: idToDelete } });
  await prisma.puzzle.delete({ where: { id: idToDelete } });
  console.log(`Deleted test puzzle: ${idToDelete}`);
}

main().finally(() => pool.end());
