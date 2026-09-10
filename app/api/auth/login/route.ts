import { NextResponse } from "next/server";
import { verifyCredentials } from "@/lib/auth";
import { encrypt } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email =
      typeof body.email === "string" ? body.email.trim() : "";

    const password =
      typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required." },
        { status: 400 }
      );
    }

    const valid = await verifyCredentials(email, password);

    if (!valid) {
      return NextResponse.json(
        { message: "Invalid email or password." },
        { status: 401 }
      );
    }

    const session = await encrypt({
      userId: "securefactory-admin",
      email,
      role: "admin",
    });

    const response = NextResponse.json({
      success: true,
    });

    response.cookies.set({
      name: "securefactory_session",
      value: session,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 2,
    });

    return response;
  } catch {
    return NextResponse.json(
      { message: "Unable to process login." },
      { status: 500 }
    );
  }
}