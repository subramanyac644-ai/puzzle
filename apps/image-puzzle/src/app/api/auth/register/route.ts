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

    const hashedPassword = await bcrypt.hash(password, 8);

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        role: 'user',
      },
    });

    const token = signToken({ userId: user.id, role: user.role });
    
    const response = NextResponse.json({ 
      token, 
      user: { id: user.id, username: user.username, role: user.role } 
    }, { status: 201 });
    
    // Set cookie
    response.cookies.set('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 24 * 60 * 60, // 1 day
      path: '/'
    });

    return response;
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Username already exists' }, { status: 400 });
    }
    console.error('Registration error:', error);
    return NextResponse.json({ 
      error: 'Registration failed', 
      details: process.env.NODE_ENV === 'production' ? error.message : undefined 
    }, { status: 500 });
  }
}
