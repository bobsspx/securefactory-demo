import {
  describe,
  expect,
  it,
} from "vitest";

import {
  hasPermission,
  isUserRole,
} from "./rbac";

describe("RBAC", () => {
  it("allows admin to view audit logs", () => {
    expect(
      hasPermission(
        "admin",
        "audit.read"
      )
    ).toBe(true);
  });

  it("prevents operator from viewing audit logs", () => {
    expect(
      hasPermission(
        "operator",
        "audit.read"
      )
    ).toBe(false);
  });

  it("allows operator to view security posture", () => {
    expect(
      hasPermission(
        "operator",
        "security.read"
      )
    ).toBe(true);
  });

  it("prevents viewer from viewing security posture", () => {
    expect(
      hasPermission(
        "viewer",
        "security.read"
      )
    ).toBe(false);
  });

  it("allows every role to view production", () => {
    for (
      const role of [
        "admin",
        "operator",
        "viewer",
      ] as const
    ) {
      expect(
        hasPermission(
          role,
          "production.read"
        )
      ).toBe(true);
    }
  });

  it("rejects unknown roles", () => {
    expect(
      isUserRole("superadmin")
    ).toBe(false);
  });
});