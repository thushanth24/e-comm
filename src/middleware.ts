import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// In-memory rate limiting for development
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX = 100;

// Try to use Upstash Redis if available
let ratelimit: {
  limit: (identifier: string) => Promise<{
    success: boolean;
    limit: number;
    remaining: number;
    reset: number;
  }>;
};

try {
  const { Ratelimit } = require('@upstash/ratelimit');
  const { Redis } = require('@upstash/redis');
  
  ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(RATE_LIMIT_MAX, '15 m'),
    analytics: true,
    prefix: 'ratelimit:middleware',
  });
} catch (error) {
  console.warn('Failed to initialize Upstash Redis, falling back to in-memory rate limiting');
  
  // Fallback in-memory rate limiter
  ratelimit = {
    async limit(identifier: string) {
      const now = Date.now();
      const resetAt = now + RATE_LIMIT_WINDOW_MS;
      
      // Clean up old entries
      Array.from(rateLimitMap.entries()).forEach(([key, value]) => {
        if (value.resetAt < now) {
          rateLimitMap.delete(key);
        }
      });
      
      const entry = rateLimitMap.get(identifier) || { count: 0, resetAt };
      
      // Reset the counter if the window has passed
      if (entry.resetAt < now) {
        entry.count = 0;
        entry.resetAt = resetAt;
      }
      
      entry.count += 1;
      rateLimitMap.set(identifier, entry);
      
      const remaining = Math.max(0, RATE_LIMIT_MAX - entry.count);
      
      return {
        success: entry.count <= RATE_LIMIT_MAX,
        limit: RATE_LIMIT_MAX,
        remaining,
        reset: Math.floor(entry.resetAt / 1000), // Convert to seconds for consistency
      };
    },
  };
}

export async function middleware(request: NextRequest) {
  // Skip rate limiting in development
  if (process.env.NODE_ENV === 'development') {
    return NextResponse.next();
  }

  // Get the IP address from headers
  const ip = request.headers.get('x-forwarded-for') || 
            request.headers.get('x-real-ip') || 
            'anonymous';
  
  // Apply rate limiting to API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    try {
      const { success, limit, remaining, reset } = await ratelimit.limit(ip);
      
      const response = success 
        ? NextResponse.next()
        : NextResponse.json(
            { error: 'Too many requests from this IP, please try again later.' },
            { status: 429 }
          );
      
      // Add rate limit headers
      response.headers.set('X-RateLimit-Limit', limit.toString());
      response.headers.set('X-RateLimit-Remaining', remaining.toString());
      response.headers.set('X-RateLimit-Reset', reset.toString());
      
      return response;
    } catch (error) {
      console.error('Rate limiting error:', error);
      // Allow the request to proceed if rate limiting fails
      return NextResponse.next();
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*', '/admin/:path*'],
};
