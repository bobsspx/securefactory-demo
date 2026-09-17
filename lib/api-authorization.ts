import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  SESSION_COOKIE_NAME,
} from "./session";

import {
  authorizePermission,
} from "./authorization";

import type {
  Permission,
} from "./rbac";

import {
  securityLog,
} from "./security-log";

import {
  resolveSessionUser,
  type CurrentSessionUser,
} from "./session-user";

type ApiAuthorizationSuccess = {
  ok: true;
  session: CurrentSessionUser;
};

type ApiAuthorizationFailure = {
  ok: false;
  response: NextResponse;
};

export type ApiAuthorizationResult =
  | ApiAuthorizationSuccess
  | ApiAuthorizationFailure;

function getClientIp(
  request: NextRequest
) {
  const forwardedFor =
    request.headers.get(
      "x-forwarded-for"
    );

  if (forwardedFor) {
    return forwardedFor
      .split(",")[0]
      .trim();
  }

  return (
    request.headers.get(
      "x-real-ip"
    ) ?? "unknown"
  );
}

export async function
requireApiPermission(
  request: NextRequest,
  permission: Permission
): Promise<ApiAuthorizationResult> {

  const cookie =
    request.cookies.get(
      SESSION_COOKIE_NAME
    );

  if (!cookie) {
    return {
      ok: false,

      response:
        NextResponse.json(
          {
            error:
              "Authentication required.",
          },
          {
            status: 401,

            headers: {
              "Cache-Control":
                "no-store",
            },
          }
        ),
    };
  }

  const resolution =
  await resolveSessionUser(
    cookie.value
  );

if (
  resolution.status
    === "invalid"
) {
  await securityLog({
    event:
      "INVALID_SESSION",

    ip:
      getClientIp(request),

    details:
      `path=${request.nextUrl.pathname}`,
  });

  const response =
    NextResponse.json(
      {
        error:
          "Invalid session.",
      },
      {
        status: 401,

        headers: {
          "Cache-Control":
            "no-store",
        },
      }
    );

  response.cookies.set({
    name:
      SESSION_COOKIE_NAME,

    value: "",

    httpOnly: true,

    secure:
      process.env.NODE_ENV
        === "production",

    sameSite: "lax",

    path: "/",

    expires:
      new Date(0),
  });

  return {
    ok: false,
    response,
  };
}

if (
  resolution.status
    === "revoked"
) {
  await securityLog({
    event:
      "SESSION_REVOKED",

    ip:
      getClientIp(request),

    email:
      resolution
        .session
        .email,

    details:
      [
        `reason=${resolution.reason}`,
        `path=${request.nextUrl.pathname}`,
      ].join(" "),
  });

  const response =
    NextResponse.json(
      {
        error:
          "Session revoked.",
      },
      {
        status: 401,

        headers: {
          "Cache-Control":
            "no-store",
        },
      }
    );

  response.cookies.set({
    name:
      SESSION_COOKIE_NAME,

    value: "",

    httpOnly: true,

    secure:
      process.env.NODE_ENV
        === "production",

    sameSite: "lax",

    path: "/",

    expires:
      new Date(0),
  });

  return {
    ok: false,
    response,
  };
}

const session =
  resolution.user;

  const authorization =
    authorizePermission(
      {
        role:
          session.role,
      },
      permission
    );

  if (
    !authorization.allowed
  ) {
    await securityLog({
      event:
        "AUTHORIZATION_DENIED",

      ip:
        getClientIp(request),

      email:
        session.email,

      details:
        [
          `role=${session.role}`,
          `permission=${permission}`,
          `path=${request.nextUrl.pathname}`,
        ].join(" "),
    });

    return {
      ok: false,

      response:
        NextResponse.json(
          {
            error:
              "Insufficient permissions.",
          },
          {
            status: 403,

            headers: {
              "Cache-Control":
                "no-store",
            },
          }
        ),
    };
  }

  return {
    ok: true,
    session,
  };
}