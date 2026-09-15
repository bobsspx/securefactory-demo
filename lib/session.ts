import { randomUUID } from "crypto";
import { SignJWT, jwtVerify } from "jose";
import {
  isUserRole,
  type UserRole,
} from "./rbac";

const secretKey = process.env.SESSION_SECRET;

if (!secretKey) {
  throw new Error("SESSION_SECRET is not configured");
}

const encodedKey = new TextEncoder().encode(secretKey);

const ISSUER = "securefactory";
const AUDIENCE = "securefactory-console";

export const SESSION_COOKIE_NAME =
  process.env.NODE_ENV === "production"
    ? "__Host-securefactory_session"
    : "securefactory_session";


export type SessionPayload = {
  userId: string;
  email: string;
  role: UserRole;
};

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({
      alg: "HS256",
      typ: "JWT",
    })
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setJti(randomUUID())
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(encodedKey);
}

export async function decrypt(
  token: string
) {
  try {
    const { payload } =
      await jwtVerify(
        token,
        encodedKey,
        {
          algorithms:
            ["HS256"],

          issuer:
            ISSUER,

          audience:
            AUDIENCE,
        }
      );

    if (
      typeof payload.userId
        !== "string" ||

      typeof payload.email
        !== "string" ||

      !isUserRole(
        payload.role
      )
    ) {
      return null;
    }

    return {
      userId:
        payload.userId,

      email:
        payload.email,

      role:
        payload.role,
    };
  } catch {
    return null;
  }
}