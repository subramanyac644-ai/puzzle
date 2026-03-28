import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@core-hubble/shared/prisma';
import { getAuthUser } from '@core-hubble/shared/auth';

async function ensureAdmin(req: NextRequest) {
  const auth = await getAuthUser(req);
  if (!auth || auth.role !== 'admin') return null;
  return auth;
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await ensureAdmin(req);
  if (!auth) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;

  try {
    const puzzle = await prisma.puzzle.findUnique({ where: { id } });
    if (!puzzle) return NextResponse.json({ error: 'Puzzle not found' }, { status: 404 });

    // Handle legacy filesystem images (though most should be Base64 now)
    // In Next.js App Router, dealing with local file deletion requires fs.
    // However, since the goal is a clean Docker/Cloud-ready app, 
    // we'll keep the logic but note that Base64 is preferred.
    if (puzzle.imageUrl.startsWith('/uploads/')) {
        // Skipping local file delete for now as it's a "clean" migration 
        // and we are moving towards Base64/DB storage.
    }

    await prisma.score.deleteMany({ where: { puzzleId: id } });
    await prisma.puzzle.delete({ where: { id } });
    
    return NextResponse.json({ message: 'Puzzle deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Failed to delete puzzle' }, { status: 500 });
  }
}
