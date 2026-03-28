import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@core-hubble/auth';

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('jwt')?.value;
  
  // Example: Protect /admin and /dashboard routes at the edge
  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (!token) {
        return NextResponse.redirect(new URL('/login', req.url));
    }
    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  if (req.nextUrl.pathname.startsWith('/dashboard')) {
    if (!token) {
        return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*'],
};
