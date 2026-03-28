import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@core-hubble/prisma';
import { getAuthUser } from '@core-hubble/auth';

export const config = {
  api: {
    bodyParser: false,
    responseLimit: '10mb',
  },
};

export async function POST(req: NextRequest) {
  const auth = await getAuthUser(req);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('image') as File;
    const level = formData.get('level') as string;

    if (!file || !level) {
      return NextResponse.json({ error: 'Image file and level required' }, { status: 400 });
    }

    // Convert file to Base64
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
    console.error('User upload error:', error);
    return NextResponse.json({ error: 'Failed to upload puzzle' }, { status: 500 });
  }
}
