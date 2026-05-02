import { NextResponse } from 'next/server';
import { decryptEdge } from '@/lib/session-edge';

const protectedPrefixes = ['/dashboard', '/inbox', '/contacts', '/broadcasts', '/ai-agent', '/templates', '/analytics', '/settings', '/billing', '/webhooks', '/team', '/account', '/onboarding', '/automation', '/integrations'];
const publicRoutes = ['/login', '/register', '/', '/pricing', '/features'];

export default async function middleware(req) {
  const path = req.nextUrl.pathname;

  const isProtected = protectedPrefixes.some((prefix) => path.startsWith(prefix));

  const sessionCookie = req.cookies.get('session')?.value;
  const session = await decryptEdge(sessionCookie);

  if (isProtected && !session?.userId) {
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }

  if ((path === '/login' || path === '/register') && session?.userId) {
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$).*)'],
};
