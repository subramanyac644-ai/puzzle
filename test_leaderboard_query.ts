
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
  console.log(`--- Dynamic Leaderboard [${level}] ---`);
  
  const rankings = await prisma.$queryRaw<any[]>`
    SELECT username, score, "completedAt" as "bestAt"
    FROM (
      SELECT u.username, s.score, s."completedAt",
             ROW_NUMBER() OVER(PARTITION BY s."userId" ORDER BY s.score DESC, s."completedAt" ASC) as rn
      FROM "User" u
      JOIN "Score" s ON u.id = s."userId"
      WHERE s.level = ${level}
    ) t
    WHERE rn = 1
    ORDER BY score DESC, "bestAt" ASC
    LIMIT 50
  `;
  
  console.table(rankings);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
