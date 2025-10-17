/**
 * Next.js Middleware
 *
 * Runs before routes are matched
 * - Skip static files and API routes
 * - Pass through to client-side auth protection
 *
 * Note: Authentication is handled client-side using withAuth HOC
 * because we store tokens in localStorage (not cookies)
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') // files with extensions (images, etc)
  ) {
    return NextResponse.next();
  }

  // Log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('🔐 Middleware:', {
      pathname,
      timestamp: new Date().toISOString(),
    });
  }

  // Allow all routes through - auth is handled client-side
  return NextResponse.next();
}

// Configure which routes use this middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
