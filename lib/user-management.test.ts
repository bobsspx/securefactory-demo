import {
  describe,
  expect,
  it,
} from "vitest";

import {
  validateUserUpdatePolicy,
} from "./user-management";

const admin = {
  id: "11111111-1111-4111-8111-111111111111",
  email: "admin@securefactory.demo",
  role: "admin" as const,
  isActive: true,
  sessionVersion: 1,
};

describe(
  "user management policy",
  () => {

    it(
      "rejects modifying your own account",
      () => {
        expect(
          validateUserUpdatePolicy(
            admin.id,
            admin,
            {
              role: "viewer",
              isActive: true,
            },
            2
          )
        ).toEqual({
          allowed: false,
          reason:
            "self_modification",
        });
      }
    );

    it(
      "protects the last active admin",
      () => {
        expect(
          validateUserUpdatePolicy(
            "different-admin-id",
            admin,
            {
              role: "viewer",
              isActive: true,
            },
            1
          )
        ).toEqual({
          allowed: false,
          reason:
            "last_active_admin",
        });
      }
    );

    it(
      "allows changing an operator",
      () => {
        const operator = {
          ...admin,
          id:
            "22222222-2222-4222-8222-222222222222",
          role:
            "operator" as const,
        };

        expect(
          validateUserUpdatePolicy(
            admin.id,
            operator,
            {
              role: "viewer",
              isActive: true,
            },
            1
          )
        ).toEqual({
          allowed: true,
        });
      }
    );
  }
);