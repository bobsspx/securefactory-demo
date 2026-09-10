import { NextResponse } from "next/server";

import {
  SESSION_COOKIE_NAME,
} from "@/lib/session";

import { securityLog } from "@/lib/security-log";

export async function POST() {
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
    value: "",

    httpOnly: true,

    secure:
      process.env.NODE_ENV === "production",

    sameSite: "lax",

    path: "/",

    expires: new Date(0),
  });

  securityLog({
    event: "LOGOUT",
    details: "Admin session terminated",
  });

  return response;
}