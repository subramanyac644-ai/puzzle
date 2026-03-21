
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

async function insertScore(username: string, score: number, level: string) {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) throw new Error("User not found");
  
  // Find a random puzzle to attach
  const puzzle = await prisma.puzzle.findFirst({ where: { level } });
  if (!puzzle) throw new Error("No puzzle found for level");

  await prisma.score.create({
    data: {
      userId: user.id,
      puzzleId: puzzle.id,
      score: score,
      level: level
    }
  });
  console.log(`[Inserted] ${username} scored ${score} on ${level}`);
}

async function getLeaderboard(level: string) {
  const rankings = await prisma.$queryRaw<any[]>`
    SELECT username, score
    FROM (
      SELECT u.username, s.score,
             ROW_NUMBER() OVER(PARTITION BY s."userId" ORDER BY s.score DESC, s."completedAt" ASC) as rn
      FROM "User" u
      JOIN "Score" s ON u.id = s."userId"
      WHERE s.level = ${level}
    ) t
    WHERE rn = 1
    ORDER BY score DESC
  `;
  console.log(`[Leaderboard State for ${level}]`);
  console.table(rankings.map(r => ({ username: r.username, displayed_score: Number(r.score) })));
}

async function main() {
  const testUser = 'adminuser2';
  const level = 'easy';

  console.log("=== Simulation Start ===");
  
  await getLeaderboard(level);

  await insertScore(testUser, 940, level);
  await getLeaderboard(level);

  await insertScore(testUser, 970, level);
  await getLeaderboard(level);

  await insertScore(testUser, 800, level);
  await getLeaderboard(level);

}

main()
  .catch(console.error)
  .finally(() => { prisma.$disconnect(); pool.end(); });
