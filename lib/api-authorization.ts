import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  decrypt,
  SESSION_COOKIE_NAME,
  type SessionPayload,
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

type ApiAuthorizationSuccess = {
  ok: true;
  session: SessionPayload;
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

  const session =
    await decrypt(
      cookie.value
    );

  if (!session) {
    await securityLog({
      event:
        "INVALID_SESSION",

      ip:
        getClientIp(request),

      details:
        `path=${request.nextUrl.pathname}`,
    });

    return {
      ok: false,

      response:
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
        ),
    };
  }

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