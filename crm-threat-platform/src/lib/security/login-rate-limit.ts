type RateLimitState = {
  count: number;
  firstAttemptAt: number;
  lockedUntil?: number;
};

export const rateLimitConfig = {
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000,
  lockoutMs: 15 * 60 * 1000,
};

const ipAttempts = new Map<string, RateLimitState>();
const emailAttempts = new Map<string, RateLimitState>();

const normalizeKey = (key?: string | null) => key?.trim().toLowerCase();

const getState = (store: Map<string, RateLimitState>, key: string) => {
  const now = Date.now();
  const existing = store.get(key);

  if (!existing) {
    const freshState = { count: 0, firstAttemptAt: now };
    store.set(key, freshState);
    return freshState;
  }

  if (existing.lockedUntil && existing.lockedUntil <= now) {
    existing.lockedUntil = undefined;
    existing.count = 0;
    existing.firstAttemptAt = now;
  } else if (now - existing.firstAttemptAt > rateLimitConfig.windowMs) {
    existing.count = 0;
    existing.firstAttemptAt = now;
  }

  return existing;
};

const evaluateState = (state: RateLimitState) => {
  const now = Date.now();
  const locked = Boolean(state.lockedUntil && state.lockedUntil > now);
  const remaining = Math.max(rateLimitConfig.maxAttempts - state.count, 0);
  return { locked, remaining, lockedUntil: state.lockedUntil };
};

export type RateLimitStatus = {
  locked: boolean;
  remaining: number;
  lockedUntil?: number;
  reason?: 'ip' | 'email';
};

export const loginRateLimiter = {
  checkStatus({ ip, email }: { ip?: string | null; email?: string | null }): RateLimitStatus {
    const normalizedIp = normalizeKey(ip);
    const normalizedEmail = normalizeKey(email);

    if (normalizedIp) {
      const ipState = getState(ipAttempts, normalizedIp);
      const ipStatus = evaluateState(ipState);
      if (ipStatus.locked) {
        return { locked: true, remaining: ipStatus.remaining, lockedUntil: ipStatus.lockedUntil, reason: 'ip' };
      }
    }

    if (normalizedEmail) {
      const emailState = getState(emailAttempts, normalizedEmail);
      const emailStatus = evaluateState(emailState);
      if (emailStatus.locked) {
        return { locked: true, remaining: emailStatus.remaining, lockedUntil: emailStatus.lockedUntil, reason: 'email' };
      }
      return { locked: false, remaining: emailStatus.remaining };
    }

    return { locked: false, remaining: rateLimitConfig.maxAttempts };
  },
  recordFailure({ ip, email }: { ip?: string | null; email?: string | null }): RateLimitStatus {
    const normalizedIp = normalizeKey(ip);
    const normalizedEmail = normalizeKey(email);
    let status: RateLimitStatus = { locked: false, remaining: rateLimitConfig.maxAttempts };

    const bump = (state: RateLimitState) => {
      state.count += 1;
      if (state.count >= rateLimitConfig.maxAttempts) {
        state.lockedUntil = Date.now() + rateLimitConfig.lockoutMs;
      }
      return evaluateState(state);
    };

    if (normalizedIp) {
      const ipState = getState(ipAttempts, normalizedIp);
      const ipStatus = bump(ipState);
      if (ipStatus.locked) {
        status = { locked: true, remaining: ipStatus.remaining, lockedUntil: ipStatus.lockedUntil, reason: 'ip' };
      } else {
        status = { locked: false, remaining: ipStatus.remaining };
      }
    }

    if (normalizedEmail) {
      const emailState = getState(emailAttempts, normalizedEmail);
      const emailStatus = bump(emailState);
      if (emailStatus.locked) {
        status = { locked: true, remaining: emailStatus.remaining, lockedUntil: emailStatus.lockedUntil, reason: 'email' };
      } else if (!status.locked) {
        status = { locked: false, remaining: emailStatus.remaining };
      }
    }

    return status;
  },
  recordSuccess({ ip, email }: { ip?: string | null; email?: string | null }) {
    const normalizedIp = normalizeKey(ip);
    const normalizedEmail = normalizeKey(email);

    if (normalizedIp) {
      ipAttempts.delete(normalizedIp);
    }

    if (normalizedEmail) {
      emailAttempts.delete(normalizedEmail);
    }
  },
};
