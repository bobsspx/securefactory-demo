export type SecurityEvent =
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILURE"
  | "LOGIN_RATE_LIMITED"
  | "LOGOUT"
  | "INVALID_SESSION";

type SecurityLogData = {
  event: SecurityEvent;
  ip?: string;
  email?: string;
  details?: string;
};

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

export function securityLog(data: SecurityLogData) {
  const entry = {
    timestamp: new Date().toISOString(),
    type: "SECURITY_EVENT",
    event: data.event,
    ip: maskIp(data.ip),
    email: maskEmail(data.email),
    details: data.details ?? "",
  };

  console.log(JSON.stringify(entry));
}