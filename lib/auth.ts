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

  if (email.toLowerCase() !== adminEmail.toLowerCase()) {
    return false;
  }

  return bcrypt.compare(password, adminPasswordHash);
}