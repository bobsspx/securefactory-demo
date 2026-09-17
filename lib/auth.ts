import bcrypt from "bcryptjs";

import {
  findActiveUserByEmail,
  type AuthUserRecord,
} from "./users";

import type {
  UserRole,
} from "./rbac";

export type AuthenticatedUser = {
  id: string;
  email: string;
  role: UserRole;
  sessionVersion: number;
};

type UserLookup =
  (
    email: string
  ) =>
    Promise<
      AuthUserRecord | null
    >;

/*
 * Used only for timing-safe comparison
 * when an account does not exist.
 *
 * It is not associated with
 * any real SecureFactory user.
 */
const DUMMY_PASSWORD_HASH =
  bcrypt.hashSync(
    "securefactory-invalid-user",
    12
  );

export async function
verifyCredentials(
  email: string,
  password: string,
  lookup:
    UserLookup =
      findActiveUserByEmail
): Promise<
  AuthenticatedUser | null
> {

  const normalizedEmail =
    email
      .trim()
      .toLowerCase();

  const user =
    await lookup(
      normalizedEmail
    );

  const hash =
    user?.passwordHash ??
    DUMMY_PASSWORD_HASH;

  const passwordMatches =
    await bcrypt.compare(
      password,
      hash
    );

  if (
    !user ||
    !passwordMatches
  ) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    sessionVersion: user.sessionVersion,
  };
}