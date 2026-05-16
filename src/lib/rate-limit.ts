export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfterSeconds: number;
}

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const rateLimitStore = new Map<string, RateLimitEntry>();

export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  const cloudflareIp = headers.get("cf-connecting-ip");
  if (cloudflareIp) return cloudflareIp.trim();
  return "unknown";
}

export function consumeRateLimit(params: {
  key: string;
  limit: number;
  windowMs: number;
  nowMs?: number;
}): RateLimitResult {
  const now = params.nowMs ?? Date.now();
  const existing = rateLimitStore.get(params.key);

  if (!existing || now > existing.resetAt) {
    const next: RateLimitEntry = { count: 1, resetAt: now + params.windowMs };
    rateLimitStore.set(params.key, next);
    return {
      allowed: true,
      limit: params.limit,
      remaining: Math.max(0, params.limit - 1),
      resetAt: next.resetAt,
      retryAfterSeconds: Math.ceil(params.windowMs / 1000),
    };
  }

  if (existing.count >= params.limit) {
    return {
      allowed: false,
      limit: params.limit,
      remaining: 0,
      resetAt: existing.resetAt,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }

  existing.count += 1;
  rateLimitStore.set(params.key, existing);
  return {
    allowed: true,
    limit: params.limit,
    remaining: Math.max(0, params.limit - existing.count),
    resetAt: existing.resetAt,
    retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
  };
}

export function rateLimitHeaders(result: RateLimitResult): HeadersInit {
  return {
    "x-ratelimit-limit": String(result.limit),
    "x-ratelimit-remaining": String(result.remaining),
    "x-ratelimit-reset": String(result.resetAt),
    "retry-after": String(result.retryAfterSeconds),
  };
}

export function resetRateLimitStore(): void {
  rateLimitStore.clear();
}
