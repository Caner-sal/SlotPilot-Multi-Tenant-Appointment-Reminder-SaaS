export class RateLimiter {
  private limits = new Map<string, { count: number; resetTime: number }>();

  /**
   * Check if a request from the given IP is allowed.
   * @param ip The IP address to rate limit
   * @param maxRequests Maximum number of requests allowed in the window
   * @param windowMs Time window in milliseconds
   * @returns true if allowed, false if rate limited
   */
  public isAllowed(ip: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const record = this.limits.get(ip);

    if (!record) {
      this.limits.set(ip, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (now > record.resetTime) {
      // Reset window
      this.limits.set(ip, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (record.count >= maxRequests) {
      return false; // Rate limited
    }

    // Increment count
    record.count += 1;
    return true;
  }
}

// Global instance to share state across requests in local dev
export const globalRateLimiter = new RateLimiter();
