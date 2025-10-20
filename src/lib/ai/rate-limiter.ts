/**
 * Rate Limiting & Security
 * IP-based rate limiting for AI proxy endpoints
 */

import type { AIProvider } from './types';
import { AIProxyException } from './error-handler';

// ============================================================================
// IN-MEMORY RATE LIMITER (Edge-compatible)
// ============================================================================

interface RateLimitEntry {
  requests: number[];
  lastReset: number;
}

// Store rate limit data in memory (resets on deployment/restart)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Configuration
const RATE_LIMITS = {
  // Per IP address
  requestsPerMinute: 20,
  requestsPerHour: 100,

  // Cleanup interval
  cleanupIntervalMs: 5 * 60 * 1000, // 5 minutes
};

// ============================================================================
// RATE LIMITING FUNCTIONS
// ============================================================================

/**
 * Get client IP address from request
 */
export function getClientIP(request: Request): string {
  // Cloudflare Workers provides CF-Connecting-IP header
  const cfIP = request.headers.get('CF-Connecting-IP');
  if (cfIP) return cfIP;

  // Fallback to X-Forwarded-For
  const forwardedFor = request.headers.get('X-Forwarded-For');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  // Fallback to X-Real-IP
  const realIP = request.headers.get('X-Real-IP');
  if (realIP) return realIP;

  // Default for development
  return 'unknown';
}

/**
 * Check if IP is rate limited
 */
export function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(ip) || { requests: [], lastReset: now };

  // Filter out requests older than 1 hour
  const recentRequests = entry.requests.filter((timestamp) => now - timestamp < 60 * 60 * 1000);

  // Check hourly limit
  if (recentRequests.length >= RATE_LIMITS.requestsPerHour) {
    const oldestRequest = Math.min(...recentRequests);
    const retryAfter = Math.ceil((oldestRequest + 60 * 60 * 1000 - now) / 1000);
    return { allowed: false, retryAfter };
  }

  // Check per-minute limit
  const requestsInLastMinute = recentRequests.filter((timestamp) => now - timestamp < 60 * 1000);
  if (requestsInLastMinute.length >= RATE_LIMITS.requestsPerMinute) {
    const oldestRequest = Math.min(...requestsInLastMinute);
    const retryAfter = Math.ceil((oldestRequest + 60 * 1000 - now) / 1000);
    return { allowed: false, retryAfter };
  }

  // Update entry
  recentRequests.push(now);
  rateLimitStore.set(ip, { requests: recentRequests, lastReset: now });

  return { allowed: true };
}

/**
 * Enforce rate limit and throw error if exceeded
 */
export function enforceRateLimit(request: Request): void {
  const ip = getClientIP(request);
  const { allowed, retryAfter } = checkRateLimit(ip);

  if (!allowed) {
    throw new AIProxyException(
      'RATE_LIMIT_EXCEEDED',
      `Rate limit exceeded. Please try again in ${retryAfter} seconds.`,
      429,
      undefined,
      `Retry-After: ${retryAfter}s`
    );
  }
}

/**
 * Cleanup old rate limit entries
 */
export function cleanupRateLimitStore(): void {
  const now = Date.now();
  const cutoff = now - 60 * 60 * 1000; // 1 hour ago

  for (const [ip, entry] of rateLimitStore.entries()) {
    // Remove IPs with no recent requests
    if (entry.requests.every((timestamp) => timestamp < cutoff)) {
      rateLimitStore.delete(ip);
    }
  }
}

// Schedule periodic cleanup (run every 5 minutes)
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimitStore, RATE_LIMITS.cleanupIntervalMs);
}

// ============================================================================
// SECURITY HEADERS
// ============================================================================

/**
 * Add security headers to response
 */
export function addSecurityHeaders(response: Response): Response {
  const headers = new Headers(response.headers);

  // Security headers
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'DENY');
  headers.set('X-XSS-Protection', '1; mode=block');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // CORS headers (allow configured origins)
  headers.set('Access-Control-Allow-Origin', '*'); // Configure based on your needs
  headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  headers.set('Access-Control-Max-Age', '86400');

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

// ============================================================================
// REQUEST VALIDATION
// ============================================================================

/**
 * Validate request method
 */
export function validateRequestMethod(request: Request, allowedMethods: string[] = ['POST']): void {
  if (!allowedMethods.includes(request.method)) {
    throw new AIProxyException(
      'INVALID_REQUEST',
      `Method ${request.method} not allowed. Allowed methods: ${allowedMethods.join(', ')}`,
      405
    );
  }
}

/**
 * Validate request size
 */
export async function validateRequestSize(request: Request, maxSizeBytes: number = 1024 * 1024): Promise<void> {
  const contentLength = request.headers.get('Content-Length');

  if (contentLength) {
    const size = parseInt(contentLength, 10);
    if (size > maxSizeBytes) {
      throw new AIProxyException(
        'INVALID_REQUEST',
        `Request too large. Maximum size: ${maxSizeBytes / 1024}KB`,
        413
      );
    }
  }
}

/**
 * Validate content type
 */
export function validateContentType(request: Request): void {
  const contentType = request.headers.get('Content-Type');

  if (!contentType || !contentType.includes('application/json')) {
    throw new AIProxyException('INVALID_REQUEST', 'Content-Type must be application/json', 415);
  }
}

// ============================================================================
// COMPREHENSIVE SECURITY CHECK
// ============================================================================

/**
 * Perform comprehensive security checks on request
 */
export async function performSecurityChecks(request: Request): Promise<void> {
  // 1. Validate request method
  validateRequestMethod(request, ['POST']);

  // 2. Validate content type
  validateContentType(request);

  // 3. Validate request size
  await validateRequestSize(request);

  // 4. Enforce rate limiting
  enforceRateLimit(request);
}

// ============================================================================
// ALLOWED ORIGINS CONFIGURATION
// ============================================================================

/**
 * Check if origin is allowed
 */
export function isOriginAllowed(request: Request): boolean {
  const origin = request.headers.get('Origin');

  // In development, allow all origins
  if (process.env.NODE_ENV === 'development') {
    return true;
  }

  // Get allowed origins from environment or use defaults
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean);

  // If no origins configured, allow same-origin only
  if (allowedOrigins.length === 0) {
    return !origin; // null origin means same-origin request
  }

  if (!origin) return false;

  // Check if origin is in allowed list
  return allowedOrigins.some((allowed) => {
    if (allowed === '*') return true;
    if (allowed.includes('*')) {
      const pattern = new RegExp('^' + allowed.replace(/\*/g, '.*') + '$');
      return pattern.test(origin);
    }
    return allowed === origin;
  });
}
