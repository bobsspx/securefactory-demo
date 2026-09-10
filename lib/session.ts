import { randomUUID } from "crypto";
import { SignJWT, jwtVerify } from "jose";

const secretKey = process.env.SESSION_SECRET;

if (!secretKey) {
  throw new Error("SESSION_SECRET is not configured");
}

const encodedKey = new TextEncoder().encode(secretKey);

const ISSUER = "securefactory";
const AUDIENCE = "securefactory-admin";

export const SESSION_COOKIE_NAME =
  process.env.NODE_ENV === "production"
    ? "__Host-securefactory_session"
    : "securefactory_session";

export type SessionPayload = {
  userId: string;
  email: string;
  role: "admin";
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

export async function decrypt(token: string) {
  try {
    const { payload } = await jwtVerify(token, encodedKey, {
      algorithms: ["HS256"],
      issuer: ISSUER,
      audience: AUDIENCE,
    });

    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}