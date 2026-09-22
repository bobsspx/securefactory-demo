import { createHmac } from "crypto";

import { sql } from "./db";

import {
  env,
} from "./env";

const WINDOW_MS =
  10 * 60 * 1000;

const MAX_ATTEMPTS = 5;

type RateLimitState = {
  attempts: number;
  windowStartedAt: Date;
};

export type RateLimitStore = {
  consumeAttempt:
    (
      key: string
    ) => Promise<RateLimitState>;

  reset:
    (
      key: string
    ) => Promise<void>;
};

export function createRateLimitKey(
  ip: string,
  email: string,
  secret =
    env.RATE_LIMIT_SECRET
) {

  const normalizedIp =
    ip.trim();

  const normalizedEmail =
    email
      .trim()
      .toLowerCase();

  return createHmac(
    "sha256",
    secret
  )
    .update(
      `${normalizedIp}\0${normalizedEmail}`
    )
    .digest("hex");
}

const postgresRateLimitStore:
  RateLimitStore = {

  async consumeAttempt(key) {
    const rows = await sql`
      INSERT INTO login_rate_limits (
        rate_limit_key,
        attempts,
        window_started_at,
        updated_at
      )
      VALUES (
        ${key},
        1,
        NOW(),
        NOW()
      )

      ON CONFLICT (rate_limit_key)

      DO UPDATE SET

        attempts =
          CASE
            WHEN
              login_rate_limits.window_started_at
              <= NOW() - INTERVAL '10 minutes'
            THEN 1
            ELSE
              login_rate_limits.attempts + 1
          END,

        window_started_at =
          CASE
            WHEN
              login_rate_limits.window_started_at
              <= NOW() - INTERVAL '10 minutes'
            THEN NOW()
            ELSE
              login_rate_limits.window_started_at
          END,

        updated_at = NOW()

      RETURNING
        attempts,
        window_started_at;
    `;

    return {
      attempts:
        Number(
          rows[0].attempts
        ),

      windowStartedAt:
        new Date(
          rows[0]
            .window_started_at as
            string | Date
        ),
    };
  },

  async reset(key) {
    await sql`
      DELETE FROM login_rate_limits
      WHERE rate_limit_key = ${key}
    `;
  },
};

export async function checkLoginRateLimit(
  key: string,
  store:
    RateLimitStore =
      postgresRateLimitStore,
  now = new Date()
) {
  const state =
    await store.consumeAttempt(
      key
    );

  /*
   * Existing policy:
   *
   * Attempts 1-5 = allowed.
   * Attempt 6+ = blocked.
   */
  const allowed =
    state.attempts <=
    MAX_ATTEMPTS;

  const remaining =
    Math.max(
      MAX_ATTEMPTS -
        state.attempts,
      0
    );

  const resetAt =
    state
      .windowStartedAt
      .getTime() +
    WINDOW_MS;

  const retryAfterSeconds =
    allowed
      ? 0
      : Math.max(
          Math.ceil(
            (
              resetAt -
              now.getTime()
            ) /
              1000
          ),
          1
        );

  return {
    allowed,
    remaining,
    retryAfterSeconds,
  };
}

export async function resetLoginRateLimit(
  key: string,
  store:
    RateLimitStore =
      postgresRateLimitStore
) {
  await store.reset(key);
}