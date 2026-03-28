import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@core-hubble/shared/prisma';
import { getAuthUser } from '@core-hubble/shared/auth';

// Helper to check for admin
async function ensureAdmin(req: NextRequest) {
  const auth = await getAuthUser(req);
  if (!auth || auth.role !== 'admin') return null;
  return auth;
}

export async function GET(req: NextRequest) {
  const auth = await ensureAdmin(req);
  if (!auth) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const puzzles = await prisma.puzzle.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(puzzles);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch puzzles' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await ensureAdmin(req);
  if (!auth) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const formData = await req.formData();
    const file = formData.get('image') as File;
    const level = formData.get('level') as string;

    if (!file || !level) {
      return NextResponse.json({ error: 'Image file and level required' }, { status: 400 });
    }

    // Convert file to Base64 to match current DB format
    const buffer = await file.arrayBuffer();
    const base64Image = `data:${file.type};base64,${Buffer.from(buffer).toString('base64')}`;

    const puzzle = await prisma.puzzle.create({
      data: {
        imageUrl: base64Image,
        level,
        uploadedBy: auth.userId,
      },
    });
    
    return NextResponse.json(puzzle, { status: 201 });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload puzzle' }, { status: 500 });
  }
}
