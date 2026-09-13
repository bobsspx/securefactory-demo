import {
  describe,
  expect,
  it,
  vi,
} from "vitest";

import * as rateLimit from "./login-rate-limit";

type RateLimitCheckResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

type RateLimitModuleForTest = {
  createRateLimitKey?: (...args: string[]) => string;

  checkLoginRateLimit: (
    key: string,
    store: unknown,
    now?: Date
  ) => Promise<RateLimitCheckResult>;

  resetLoginRateLimit: (
    key: string,
    store: unknown
  ) => Promise<void>;
};

const testRateLimit =
  rateLimit as unknown as RateLimitModuleForTest;

describe("persistent login rate limiting", () => {
  it("creates a deterministic HMAC key without exposing raw identifiers", () => {
    const createRateLimitKey =
      testRateLimit.createRateLimitKey;

    expect(typeof createRateLimitKey)
      .toBe("function");

    if (typeof createRateLimitKey !== "function") {
      return;
    }

    const secret =
      "test-secret-for-rate-limit-only";

    const key1 = createRateLimitKey(
      "139.162.113.45",
      "Admin@SecureFactory.demo",
      secret
    );

    const key2 = createRateLimitKey(
      "139.162.113.45",
      "admin@securefactory.demo",
      secret
    );

    expect(key1).toMatch(
      /^[a-f0-9]{64}$/
    );

    expect(key1).toBe(key2);

    expect(key1).not.toContain(
      "139.162.113.45"
    );

    expect(key1).not.toContain(
      "admin"
    );
  });

  it("blocks requests after five attempts using persistent state", async () => {
    const store = {
      consumeAttempt: vi.fn(
        async () => ({
          attempts: 6,
          windowStartedAt:
            new Date(
              Date.now() - 60_000
            ),
        })
      ),

      reset: vi.fn(
        async () => {}
      ),
    };

    const result =
        await testRateLimit.checkLoginRateLimit(
        "test-key",
        store,
        new Date()
    );

    expect(
      store.consumeAttempt
    ).toHaveBeenCalledWith(
      "test-key"
    );

    expect(result.allowed)
      .toBe(false);

    expect(result.remaining)
      .toBe(0);

    expect(
      result.retryAfterSeconds
    ).toBeGreaterThan(0);
  });

  it("clears persistent state after successful login", async () => {
    const store = {
      consumeAttempt: vi.fn(),

      reset: vi.fn(
        async () => {}
      ),
    };

    await testRateLimit.resetLoginRateLimit(
        "test-key",
        store
    );

    expect(
      store.reset
    ).toHaveBeenCalledWith(
      "test-key"
    );
  });
});