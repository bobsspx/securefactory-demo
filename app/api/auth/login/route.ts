import { NextResponse } from "next/server";

import { verifyCredentials } from "@/lib/auth";
import {
  encrypt,
  SESSION_COOKIE_NAME,
} from "@/lib/session";

import {
  checkLoginRateLimit,
  recordFailedLogin,
  resetLoginRateLimit,
} from "@/lib/login-rate-limit";

import { securityLog } from "@/lib/security-log";

function getClientIp(request: Request) {
  const forwardedFor =
    request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  return (
    request.headers.get("x-real-ip") ??
    "local"
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    if (!email || !password) {
      return NextResponse.json(
        {
          message:
            "Email and password are required.",
        },
        {
          status: 400,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    const ip = getClientIp(request);

    const rateLimitKey = `${ip}:${email}`;

    const limit =
      checkLoginRateLimit(rateLimitKey);

    if (!limit.allowed) {
      securityLog({
        event: "LOGIN_RATE_LIMITED",
        ip,
        email,
        details: "Login attempt blocked",
      });

      return NextResponse.json(
        {
          message:
            "Too many login attempts. Please try again later.",
        },
        {
          status: 429,
          headers: {
            "Retry-After":
              String(limit.retryAfterSeconds),

            "Cache-Control": "no-store",
          },
        }
      );
    }

    const valid =
      await verifyCredentials(email, password);

    if (!valid) {
      recordFailedLogin(rateLimitKey);

      securityLog({
        event: "LOGIN_FAILURE",
        ip,
        email,
        details: "Invalid credentials",
      });

      return NextResponse.json(
        {
          message:
            "Invalid email or password.",
        },
        {
          status: 401,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    resetLoginRateLimit(rateLimitKey);

    const session = await encrypt({
      userId: "securefactory-admin",
      email,
      role: "admin",
    });

    const response = NextResponse.json(
      {
        success: true,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: session,

      httpOnly: true,

      secure:
        process.env.NODE_ENV === "production",

      sameSite: "lax",

      path: "/",

      maxAge: 60 * 60 * 2,
    });

    securityLog({
      event: "LOGIN_SUCCESS",
      ip,
      email,
      details: "Admin authenticated",
    });

    return response;
  } catch {
    return NextResponse.json(
      {
        message:
          "Unable to process login.",
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}