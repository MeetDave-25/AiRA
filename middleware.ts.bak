import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Basic in-memory store for rate limiting
// Note: In a distributed edge environment, this state is per-isolate. 
// For production scale with strict global limits, a Redis solution like Upstash should be used.
const rateLimitMap = new Map<string, { count: number, resetTime: number }>();

const WINDOW_SIZE_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 100; // 100 requests per minute for API routes

export function middleware(request: NextRequest) {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'anonymous';
    const now = Date.now();
    
    // Apply rate limiting primarily to API routes
    if (request.nextUrl.pathname.startsWith('/api/')) {
        const rateLimitInfo = rateLimitMap.get(ip) || { count: 0, resetTime: now + WINDOW_SIZE_MS };
        
        if (now > rateLimitInfo.resetTime) {
            // Reset the window
            rateLimitInfo.count = 1;
            rateLimitInfo.resetTime = now + WINDOW_SIZE_MS;
        } else {
            rateLimitInfo.count++;
        }
        
        rateLimitMap.set(ip, rateLimitInfo);
        
        if (rateLimitInfo.count > MAX_REQUESTS_PER_WINDOW) {
            return new NextResponse(JSON.stringify({ error: 'Too Many Requests' }), {
                status: 429,
                headers: {
                    'Content-Type': 'application/json',
                    'X-RateLimit-Limit': MAX_REQUESTS_PER_WINDOW.toString(),
                    'X-RateLimit-Remaining': '0',
                    'Retry-After': Math.ceil((rateLimitInfo.resetTime - now) / 1000).toString(),
                }
            });
        }
    }
    
    // Forward the request and attach dynamic security headers
    const response = NextResponse.next();
    
    // Legacy XSS protection (though CSP in next.config.js is more modern)
    response.headers.set('X-XSS-Protection', '1; mode=block');
    
    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder files
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
