import type {
  UserRole,
} from "./rbac";

export type ManagedUser = {
  id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  sessionVersion: number;
};

export type UserUpdateInput = {
  role: UserRole;
  isActive: boolean;
};

export type UserUpdatePolicyResult =
  | {
      allowed: true;
    }
  | {
      allowed: false;
      reason:
        | "self_modification"
        | "last_active_admin";
    };

export function
validateUserUpdatePolicy(
  actorUserId: string,
  target: ManagedUser,
  desired: UserUpdateInput,
  activeAdminCount: number
): UserUpdatePolicyResult {

  if (
    actorUserId === target.id
  ) {
    return {
      allowed: false,
      reason:
        "self_modification",
    };
  }

  const removingActiveAdmin =
    target.role === "admin" &&
    target.isActive &&
    (
      desired.role !== "admin" ||
      desired.isActive === false
    );

  if (
    removingActiveAdmin &&
    activeAdminCount <= 1
  ) {
    return {
      allowed: false,
      reason:
        "last_active_admin",
    };
  }

  return {
    allowed: true,
  };
}