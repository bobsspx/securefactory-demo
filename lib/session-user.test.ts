import {
  describe,
  expect,
  it,
} from "vitest";

import {
  validateSessionSubject,
} from "./session-user";

describe(
  "session subject validation",
  () => {
    const session = {
      userId:
        "11111111-1111-1111-1111-111111111111",

      email:
        "operator@securefactory.demo",

      role:
        "operator" as const,

      sessionVersion: 1,
    };

    const user = {
      id:
        "11111111-1111-1111-1111-111111111111",

      email:
        "operator@securefactory.demo",

      role:
        "operator" as const,

      sessionVersion: 1,
    };

    it(
      "accepts a current active session",
      () => {
        expect(
          validateSessionSubject(
            session,
            user
          )
        ).toEqual({
          userId: user.id,
          email: user.email,
          role: user.role,
          sessionVersion: 1,
        });
      }
    );

    it(
      "rejects a session when the account no longer exists or is inactive",
      () => {
        expect(
          validateSessionSubject(
            session,
            null
          )
        ).toBeNull();
      }
    );

    it(
      "rejects an old session version",
      () => {
        expect(
          validateSessionSubject(
            session,
            {
              ...user,
              sessionVersion: 2,
            }
          )
        ).toBeNull();
      }
    );

    it(
      "rejects a stale role",
      () => {
        expect(
          validateSessionSubject(
            session,
            {
              ...user,
              role: "viewer",
            }
          )
        ).toBeNull();
      }
    );
  }
);