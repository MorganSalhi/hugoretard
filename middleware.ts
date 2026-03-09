import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  });

  // Si pas de session, on redirige vers /login
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/lobby/:path*",
    "/profile/:path*",
    "/leaderboard/:path*",
    "/history/:path*",
    "/shop/:path*",
    "/admin/:path*",
  ],
};