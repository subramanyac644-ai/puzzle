import * as jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export interface AuthUser {
  userId: string;
  role: string;
}

export function signToken(user: AuthUser) {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '1d' });
}

export function verifyToken(token: string): AuthUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthUser;
  } catch {
    return null;
  }
}

export async function getAuthUser(req: NextRequest): Promise<AuthUser | null> {
  const authHeader = req.headers.get('authorization');
  const headerToken = authHeader && authHeader.split(' ')[1];
  const cookieToken = req.cookies.get('jwt')?.value;
  
  const token = cookieToken || headerToken;
  if (!token) return null;

  return verifyToken(token);
}
