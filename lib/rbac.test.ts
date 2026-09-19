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

  it(
  "allows admin to read and manage users",
  () => {
    expect(
      hasPermission(
        "admin",
        "users.read"
      )
    ).toBe(true);

    expect(
      hasPermission(
        "admin",
        "users.manage"
      )
    ).toBe(true);
  }
);

it(
  "prevents operator and viewer from managing users",
  () => {
    expect(
      hasPermission(
        "operator",
        "users.manage"
      )
    ).toBe(false);

    expect(
      hasPermission(
        "viewer",
        "users.manage"
      )
    ).toBe(false);
  }
);

it(
  "allows admin and operator to write production data",
  () => {
    expect(
      hasPermission(
        "admin",
        "production.write"
      )
    ).toBe(true);

    expect(
      hasPermission(
        "operator",
        "production.write"
      )
    ).toBe(true);
  }
);

it(
  "prevents viewer from writing production data",
  () => {
    expect(
      hasPermission(
        "viewer",
        "production.write"
      )
    ).toBe(false);
  }
);

});