export const USER_ROLES = [
  "admin",
  "operator",
  "viewer",
] as const;

export type UserRole =
  (typeof USER_ROLES)[number];

export type Permission =
  | "dashboard.read"
  | "production.read"
  | "security.read"
  | "audit.read";

const permissions:
  Record<
    UserRole,
    readonly Permission[]
  > = {

  admin: [
    "dashboard.read",
    "production.read",
    "security.read",
    "audit.read",
  ],

  operator: [
    "dashboard.read",
    "production.read",
    "security.read",
  ],

  viewer: [
    "dashboard.read",
    "production.read",
  ],
};

export function isUserRole(
  value: unknown
): value is UserRole {
  return (
    typeof value === "string" &&
    USER_ROLES.includes(
      value as UserRole
    )
  );
}

export function hasPermission(
  role: UserRole,
  permission: Permission
) {
  return permissions[
    role
  ].includes(permission);
}