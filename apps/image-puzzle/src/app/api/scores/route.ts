import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@core-hubble/prisma';
import { getAuthUser } from '@core-hubble/auth';

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { puzzleId, score, level } = await req.json();
    if (!puzzleId || score === undefined || !level) {
      return NextResponse.json({ error: 'Puzzle ID, score, and level required' }, { status: 400 });
    }

    const newScore = await prisma.score.create({
      data: {
        userId: auth.userId,
        puzzleId: puzzleId,
        score: Number(score),
        level: level,
      },
    });
    
    return NextResponse.json(newScore, { status: 201 });
  } catch (error) {
    console.error('Submit score error:', error);
    return NextResponse.json({ error: 'Failed to save score' }, { status: 500 });
  }
}
