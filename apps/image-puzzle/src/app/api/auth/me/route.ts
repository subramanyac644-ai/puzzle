import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@core-hubble/prisma';
import { getAuthUser } from '@core-hubble/auth';

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({ 
      where: { id: auth.userId },
      select: { id: true, username: true, role: true }
    });
    
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    
    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}
