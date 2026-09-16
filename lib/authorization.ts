import {
  hasPermission,
  type Permission,
  type UserRole,
} from "./rbac";

type AuthorizationSubject = {
  role: UserRole;
};

export type AuthorizationResult =
  | {
      allowed: true;
    }
  | {
      allowed: false;
      status: 401 | 403;
      reason:
        | "unauthenticated"
        | "forbidden";
    };

export function authorizePermission(
  subject:
    | AuthorizationSubject
    | null,
  permission: Permission
): AuthorizationResult {
  if (!subject) {
    return {
      allowed: false,
      status: 401,
      reason: "unauthenticated",
    };
  }

  if (
    !hasPermission(
      subject.role,
      permission
    )
  ) {
    return {
      allowed: false,
      status: 403,
      reason: "forbidden",
    };
  }

  return {
    allowed: true,
  };
}