import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@core-hubble/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const puzzle = await prisma.puzzle.findUnique({ where: { id } });
    if (!puzzle) return NextResponse.json({ error: 'Puzzle not found' }, { status: 404 });
    return NextResponse.json(puzzle);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch puzzle' }, { status: 500 });
  }
}
