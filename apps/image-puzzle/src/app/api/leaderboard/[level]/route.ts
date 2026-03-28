import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@core-hubble/shared/prisma';
import { LeaderboardEntry } from '@core-hubble/shared/utils';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ level: string }> }
) {
  const { level } = await params;
  
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
    
    const leaderboard: LeaderboardEntry[] = rankings.map((s, idx) => ({
        rank: idx + 1,
        username: s.username,
        score: Number(s.score)
    }));
    
    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error('Leaderboard error:', error);
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}
