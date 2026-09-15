import { sql } from "./db";

import {
  isUserRole,
  type UserRole,
} from "./rbac";

export type AuthUserRecord = {
  id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
};

export async function
findActiveUserByEmail(
  email: string
): Promise<AuthUserRecord | null> {

  const normalizedEmail =
    email
      .trim()
      .toLowerCase();

  const rows = await sql`
    SELECT
      id::text AS id,
      email,
      password_hash,
      role
    FROM public.users
    WHERE
      LOWER(email) =
        ${normalizedEmail}

      AND is_active = TRUE

    LIMIT 1;
  `;

  const row = rows[0];

  if (!row) {
    return null;
  }

  if (
    !isUserRole(row.role)
  ) {
    return null;
  }

  return {
    id: String(row.id),

    email:
      String(row.email),

    passwordHash:
      String(
        row.password_hash
      ),

    role: row.role,
  };
}