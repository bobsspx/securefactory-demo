import { sql } from "./db";

export type SecurityEvent =
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILURE"
  | "LOGIN_RATE_LIMITED"
  | "LOGOUT"
  | "INVALID_SESSION"
  | "AUTHORIZATION_DENIED"
  | "SESSION_REVOKED";

type SecurityLogData = {
  event: SecurityEvent;
  ip?: string;
  email?: string;
  details?: string;
};

type Severity = "low" | "medium" | "high";

function maskEmail(email?: string) {
  if (!email) {
    return "unknown";
  }

  const [name, domain] = email.split("@");

  if (!domain) {
    return "invalid";
  }

  const visible =
    name.length <= 2
      ? `${name.charAt(0)}***`
      : `${name.slice(0, 2)}***`;

  return `${visible}@${domain}`;
}

function maskIp(ip?: string) {
  if (!ip) {
    return "unknown";
  }

  if (ip === "::1") {
    return "127.0.0.xxx";
  } 

  if (ip.includes(".")) {
    const parts = ip.split(".");

    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.${parts[2]}.xxx`;
    }
  }

  if (ip.includes(":")) {
    return `${ip.split(":").slice(0, 3).join(":")}:****`;
  }

  return "unknown";
}

function getSeverity(event: SecurityEvent): Severity {
  switch (event) {
    case "LOGIN_FAILURE":
    case "AUTHORIZATION_DENIED":
    case "INVALID_SESSION":
    case "SESSION_REVOKED":
      return "medium";

    case "LOGIN_RATE_LIMITED":
      return "high";

    case "LOGIN_SUCCESS":
    case "LOGOUT":
    default:
      return "low";
  }
}

export async function securityLog(data: SecurityLogData) {
  const entry = {
    timestamp: new Date().toISOString(),
    type: "SECURITY_EVENT",
    event: data.event,
    ip: maskIp(data.ip),
    email: maskEmail(data.email),
    details: data.details ?? "",
    severity: getSeverity(data.event),
  };

  console.log(JSON.stringify(entry));

  try {
    await sql`
      INSERT INTO public.security_events (
        event_type,
        email,
        ip_address,
        details,
        severity
      )
      VALUES (
        ${entry.event},
        ${entry.email},
        ${entry.ip},
        ${entry.details},
        ${entry.severity}
      )
    `;
  } catch (error) {
    console.error(
      "Failed to persist security event:",
      error
    );
  }
}