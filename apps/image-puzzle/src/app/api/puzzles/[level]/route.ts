import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@core-hubble/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ level: string }> }
) {
  const { level } = await params;
  try {
    const puzzles = await prisma.puzzle.findMany({ where: { level } });
    return NextResponse.json(puzzles);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch puzzles' }, { status: 500 });
  }
}
