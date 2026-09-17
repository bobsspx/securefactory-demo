import {
  decrypt,
  type SessionPayload,
} from "./session";

import {
  findActiveUserById,
  type SessionUserRecord,
} from "./users";

import type {
  UserRole,
} from "./rbac";

export type CurrentSessionUser = {
  userId: string;
  email: string;
  role: UserRole;
  sessionVersion: number;
};

type UserLookup =
  (
    userId: string
  ) =>
    Promise<
      SessionUserRecord | null
    >;

export function
validateSessionSubject(
  session: SessionPayload,
  user:
    SessionUserRecord | null
): CurrentSessionUser | null {

  if (!user) {
    return null;
  }

  const emailMatches =
    session.email
      .trim()
      .toLowerCase()
      ===
    user.email
      .trim()
      .toLowerCase();

  if (
    session.userId
      !== user.id ||

    session.sessionVersion
      !== user.sessionVersion ||

    session.role
      !== user.role ||

    !emailMatches
  ) {
    return null;
  }

  return {
    userId:
      user.id,

    email:
      user.email,

    role:
      user.role,

    sessionVersion:
      user.sessionVersion,
  };
}

export type SessionResolution =
  | {
      status: "valid";
      user:
        CurrentSessionUser;
    }

  | {
      status: "invalid";
    }

  | {
      status: "revoked";
      reason:
        | "inactive_or_missing"
        | "session_stale";

      session:
        SessionPayload;
    };

export async function
resolveSessionUser(
  token: string,
  lookup:
    UserLookup =
      findActiveUserById
): Promise<SessionResolution> {

  const session =
    await decrypt(token);

  if (!session) {
    return {
      status:
        "invalid",
    };
  }

  const user =
    await lookup(
      session.userId
    );

  if (!user) {
    return {
      status:
        "revoked",

      reason:
        "inactive_or_missing",

      session,
    };
  }

  const currentUser =
    validateSessionSubject(
      session,
      user
    );

  if (!currentUser) {
    return {
      status:
        "revoked",

      reason:
        "session_stale",

      session,
    };
  }

  return {
    status:
      "valid",

    user:
      currentUser,
  };
}