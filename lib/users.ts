import { sql } from "./db";

import {
  isUserRole,
  type UserRole,
} from "./rbac";

export type SessionUserRecord = {
  id: string;
  email: string;
  role: UserRole;
  sessionVersion: number;
};

export type AuthUserRecord =
  SessionUserRecord & {
    passwordHash: string;
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
      role,
      session_version
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
    id:
      String(row.id),

    email:
      String(row.email),

    passwordHash:
      String(
        row.password_hash
      ),

    role:
      row.role,

    sessionVersion:
      Number(
        row.session_version
      ),
  };
}

export async function
findActiveUserById(
  userId: string
): Promise<
  SessionUserRecord | null
> {
  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (
    !uuidPattern.test(userId)
  ) {
    return null;
  }

  const rows = await sql`
    SELECT
      id::text AS id,
      email,
      role,
      session_version
    FROM public.users
    WHERE
      id = ${userId}::uuid

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
    id:
      String(row.id),

    email:
      String(row.email),

    role:
      row.role,

    sessionVersion:
      Number(
        row.session_version
      ),
  };
}