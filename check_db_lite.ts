
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("--- Users ---");
  const users = await prisma.user.findMany({
    select: { id: true, username: true, role: true }
  });
  console.table(users);

  console.log("\n--- Scores ---");
  const scores = await prisma.score.findMany({
    include: { user: { select: { username: true } } },
    orderBy: { completedAt: 'desc' },
    take: 20
  });
  console.table(scores.map(s => ({
    username: s.user?.username || 'Unknown',
    score: s.score,
    level: s.level,
    at: s.completedAt
  })));
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
