type AttemptRecord = {
  attempts: number;
  resetAt: number;
};

const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

const globalForRateLimit = globalThis as typeof globalThis & {
  secureFactoryLoginAttempts?: Map<string, AttemptRecord>;
};

const attempts =
  globalForRateLimit.secureFactoryLoginAttempts ??
  new Map<string, AttemptRecord>();

globalForRateLimit.secureFactoryLoginAttempts = attempts;

function cleanupExpired() {
  const now = Date.now();

  for (const [key, value] of attempts.entries()) {
    if (value.resetAt <= now) {
      attempts.delete(key);
    }
  }
}

export function checkLoginRateLimit(key: string) {
  cleanupExpired();

  const now = Date.now();
  const record = attempts.get(key);

  if (!record) {
    return {
      allowed: true,
      remaining: MAX_ATTEMPTS,
      retryAfterSeconds: 0,
    };
  }

  if (record.resetAt <= now) {
    attempts.delete(key);

    return {
      allowed: true,
      remaining: MAX_ATTEMPTS,
      retryAfterSeconds: 0,
    };
  }

  const allowed = record.attempts < MAX_ATTEMPTS;

  return {
    allowed,
    remaining: Math.max(
      MAX_ATTEMPTS - record.attempts,
      0
    ),
    retryAfterSeconds: allowed
      ? 0
      : Math.ceil((record.resetAt - now) / 1000),
  };
}

export function recordFailedLogin(key: string) {
  const now = Date.now();
  const existing = attempts.get(key);

  if (!existing || existing.resetAt <= now) {
    attempts.set(key, {
      attempts: 1,
      resetAt: now + WINDOW_MS,
    });

    return;
  }

  existing.attempts += 1;

  attempts.set(key, existing);
}

export function resetLoginRateLimit(key: string) {
  attempts.delete(key);
}