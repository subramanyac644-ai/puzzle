import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@core-hubble/prisma';
import bcrypt from 'bcryptjs';
import { signToken } from '@core-hubble/auth';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    
    if (!username || !password) {
        return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { username } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    const token = signToken({ userId: user.id, role: user.role });
    
    const response = NextResponse.json({ 
      token, 
      user: { id: user.id, username: user.username, role: user.role } 
    });

    // Set cookie
    response.cookies.set('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 24 * 60 * 60, // 1 day in seconds
      path: '/'
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
