function requireEnv(
  name: string
) {
  const value =
    process.env[name];

  if (!value) {
    throw new Error(
      `${name} is not configured`
    );
  }

  return value;
}

function requireSecret(
  name: string
) {
  const value =
    requireEnv(name);

  if (
    value.length < 32
  ) {
    throw new Error(
      `${name} must be at least 32 characters`
    );
  }

  return value;
}

export const env = {
  DATABASE_URL:
    requireEnv(
      "DATABASE_URL"
    ),

  SESSION_SECRET:
    requireSecret(
      "SESSION_SECRET"
    ),

  RATE_LIMIT_SECRET:
    requireSecret(
      "RATE_LIMIT_SECRET"
    ),
};