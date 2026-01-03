// Simple in-memory rate limiter for API routes
// Note: This resets on serverless cold starts, but provides basic protection

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

interface RateLimitConfig {
  interval: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

// Default: 100 requests per minute
const defaultConfig: RateLimitConfig = {
  interval: 60 * 1000,
  maxRequests: 100,
};

// Stricter for subscribe: 5 requests per minute
export const subscribeConfig: RateLimitConfig = {
  interval: 60 * 1000,
  maxRequests: 5,
};

// Clean up old entries periodically
function cleanup() {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}

// Run cleanup every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(cleanup, 5 * 60 * 1000);
}

export function rateLimit(
  identifier: string,
  config: RateLimitConfig = defaultConfig
): { success: boolean; remaining: number; reset: number } {
  const now = Date.now();
  const key = identifier;

  let entry = rateLimitMap.get(key);

  // If no entry or window expired, create new entry
  if (!entry || now > entry.resetTime) {
    entry = {
      count: 1,
      resetTime: now + config.interval,
    };
    rateLimitMap.set(key, entry);
    return {
      success: true,
      remaining: config.maxRequests - 1,
      reset: entry.resetTime,
    };
  }

  // Increment count
  entry.count++;

  // Check if over limit
  if (entry.count > config.maxRequests) {
    return {
      success: false,
      remaining: 0,
      reset: entry.resetTime,
    };
  }

  return {
    success: true,
    remaining: config.maxRequests - entry.count,
    reset: entry.resetTime,
  };
}

// Get client identifier from request (IP or forwarded IP)
export function getClientIdentifier(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  if (realIp) {
    return realIp;
  }
  return "unknown";
}
