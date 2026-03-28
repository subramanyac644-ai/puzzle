import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@core-hubble/prisma';
import { getAuthUser } from '@core-hubble/auth';

async function ensureAdmin(req: NextRequest) {
  const auth = await getAuthUser(req);
  if (!auth || auth.role !== 'admin') return null;
  return auth;
}

export async function GET(req: NextRequest) {
  const auth = await ensureAdmin(req);
  if (!auth) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
