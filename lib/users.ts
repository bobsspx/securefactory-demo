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

export type ManagedUserRecord = {
  id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  sessionVersion: number;
  createdAt: string | Date;
  updatedAt: string | Date;
};

export async function
listManagedUsers():
Promise<ManagedUserRecord[]> {

  const rows = await sql`
    SELECT
      id::text AS id,
      email,
      role,
      is_active,
      session_version,
      created_at,
      updated_at
    FROM public.users
    ORDER BY
      created_at ASC;
  `;

  return rows.map(
    (row) => ({
      id:
        String(row.id),

      email:
        String(row.email),

      role:
        row.role as UserRole,

      isActive:
        Boolean(row.is_active),

      sessionVersion:
        Number(
          row.session_version
        ),

      createdAt:
        row.created_at as
          string | Date,

      updatedAt:
        row.updated_at as
          string | Date,
    })
  );
}

export async function
findManagedUserById(
  userId: string
):
Promise<ManagedUserRecord | null> {

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
      is_active,
      session_version,
      created_at,
      updated_at
    FROM public.users
    WHERE
      id = ${userId}::uuid
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

    isActive:
      Boolean(row.is_active),

    sessionVersion:
      Number(
        row.session_version
      ),

    createdAt:
      row.created_at as
        string | Date,

    updatedAt:
      row.updated_at as
        string | Date,
  };
}

export async function
countActiveAdmins() {
  const rows = await sql`
    SELECT
      COUNT(*)::integer
        AS count
    FROM public.users
    WHERE
      role = 'admin'
      AND is_active = TRUE;
  `;

  return Number(
    rows[0]?.count ?? 0
  );
}

export async function
updateManagedUser(
  userId: string,
  role: UserRole,
  isActive: boolean
) {
  const rows = await sql`
    UPDATE public.users
    SET
      role =
        ${role},

      is_active =
        ${isActive},

      session_version =
        CASE
          WHEN
            role IS DISTINCT FROM
              ${role}
            OR
            is_active IS DISTINCT FROM
              ${isActive}
          THEN
            session_version + 1
          ELSE
            session_version
        END,

      updated_at =
        NOW()

    WHERE
      id = ${userId}::uuid

    RETURNING
      id::text AS id,
      email,
      role,
      is_active,
      session_version,
      updated_at;
  `;

  return rows[0] ?? null;
}