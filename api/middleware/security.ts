import { createErrorResponse } from '../../utils/helpers';
import { logger } from '../../utils/logger';

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number, resetTime: number }>();
const LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 100; // per minute per IP

export const withSecurity = async (request: Request, next: () => Promise<Response>): Promise<Response> => {
  // 1. Rate Limiting
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const now = Date.now();
  
  let rateData = rateLimitMap.get(ip);
  if (!rateData || now > rateData.resetTime) {
    rateData = { count: 0, resetTime: now + LIMIT_WINDOW };
  }
  
  rateData.count++;
  rateLimitMap.set(ip, rateData);

  if (rateData.count > MAX_REQUESTS) {
    logger.warn(`Rate limit exceeded for IP: ${ip}`);
    return createErrorResponse('Too Many Requests', 429);
  }

  // 2. Execute Request
  try {
    const response = await next();
    
    // 3. Add Security Headers
    const newHeaders = new Headers(response.headers);
    newHeaders.set('X-Content-Type-Options', 'nosniff');
    newHeaders.set('X-Frame-Options', 'DENY');
    newHeaders.set('X-XSS-Protection', '1; mode=block');
    newHeaders.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    newHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders
    });
  } catch (error: any) {
    logger.error('Unhandled API Error', { error: error.message, stack: error.stack });
    return createErrorResponse('Internal Server Error', 500);
  }
};