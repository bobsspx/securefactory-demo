import bcrypt from "bcryptjs";

export async function verifyCredentials(
  email: string,
  password: string
) {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

  if (!adminEmail || !adminPasswordHash) {
    return false;
  }

  const emailMatches =
    email.trim().toLowerCase() === adminEmail.trim().toLowerCase();

  // Always perform the bcrypt comparison when auth is configured.
  // This avoids an obvious fast-fail path for an incorrect email.
  const passwordMatches = await bcrypt.compare(
    password,
    adminPasswordHash
  );

  return emailMatches && passwordMatches;
}