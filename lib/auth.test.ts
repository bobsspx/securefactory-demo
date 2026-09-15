import bcrypt from "bcryptjs";

import {
  describe,
  expect,
  it,
} from "vitest";

import {
  verifyCredentials,
} from "./auth";

import type {
  AuthUserRecord,
} from "./users";

describe(
  "database authentication",
  () => {

  it(
    "returns authenticated user with role when password is correct",
    async () => {

      const password =
        "correct-test-password";

      const passwordHash =
        await bcrypt.hash(
          password,
          4
        );

      const user:
        AuthUserRecord = {

        id:
          "11111111-1111-1111-1111-111111111111",

        email:
          "operator@securefactory.demo",

        passwordHash,

        role:
          "operator",
      };

      const result =
        await verifyCredentials(
          user.email,
          password,
          async () => user
        );

      expect(result).toEqual({
        id: user.id,
        email: user.email,
        role: "operator",
      });
    }
  );

  it(
    "rejects an incorrect password",
    async () => {

      const passwordHash =
        await bcrypt.hash(
          "correct-password",
          4
        );

      const user:
        AuthUserRecord = {

        id:
          "22222222-2222-2222-2222-222222222222",

        email:
          "viewer@securefactory.demo",

        passwordHash,

        role:
          "viewer",
      };

      const result =
        await verifyCredentials(
          user.email,
          "wrong-password",
          async () => user
        );

      expect(result)
        .toBeNull();
    }
  );
});