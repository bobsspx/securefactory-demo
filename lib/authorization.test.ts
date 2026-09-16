import {
  describe,
  expect,
  it,
} from "vitest";

import {
  authorizePermission,
} from "./authorization";

describe(
  "route authorization",
  () => {
    it(
      "returns 401 when there is no authenticated subject",
      () => {
        const result =
          authorizePermission(
            null,
            "production.read"
          );

        expect(result).toEqual({
          allowed: false,
          status: 401,
          reason: "unauthenticated",
        });
      }
    );

    it(
      "allows viewer to read production",
      () => {
        const result =
          authorizePermission(
            {
              role: "viewer",
            },
            "production.read"
          );

        expect(result).toEqual({
          allowed: true,
        });
      }
    );

    it(
      "denies viewer access to security",
      () => {
        const result =
          authorizePermission(
            {
              role: "viewer",
            },
            "security.read"
          );

        expect(result).toEqual({
          allowed: false,
          status: 403,
          reason: "forbidden",
        });
      }
    );

    it(
      "allows operator to read security",
      () => {
        const result =
          authorizePermission(
            {
              role: "operator",
            },
            "security.read"
          );

        expect(result).toEqual({
          allowed: true,
        });
      }
    );

    it(
      "denies operator access to audit logs",
      () => {
        const result =
          authorizePermission(
            {
              role: "operator",
            },
            "audit.read"
          );

        expect(result).toEqual({
          allowed: false,
          status: 403,
          reason: "forbidden",
        });
      }
    );

    it(
      "allows admin to read audit logs",
      () => {
        const result =
          authorizePermission(
            {
              role: "admin",
            },
            "audit.read"
          );

        expect(result).toEqual({
          allowed: true,
        });
      }
    );
  }
);