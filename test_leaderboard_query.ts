import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

async function test() {
  const level = 'easy';
  try {
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
    console.log('Rankings for easy:', rankings);
  } catch (err) {
    console.error('Query failed:', err);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

test();
