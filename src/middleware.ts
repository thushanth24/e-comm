import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { RateLimiterMemory } from 'rate-limiter-flexible';

// Create a rate limiter
const rateLimiter = new RateLimiterMemory({
  points: 100, // Number of points
  duration: 15 * 60, // 15 minutes
});

export async function middleware(request: NextRequest) {
  // Get the IP address from headers
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || request.headers.get('x-client-ip') || 'unknown';
  
  // Apply rate limiting to API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    try {
      await rateLimiter.consume(ip);
      return NextResponse.next();
    } catch (err) {
      return NextResponse.json(
        { error: 'Too many requests from this IP, please try again later.' },
        { status: 429 }
      );
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*', '/admin/:path*'],
};
