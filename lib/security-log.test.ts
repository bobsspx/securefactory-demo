import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const { sqlMock } = vi.hoisted(() => ({
  sqlMock: vi.fn(async () => []),
}));

vi.mock("./db", () => ({
  sql: sqlMock,
}));

import { securityLog } from "./security-log";

describe("securityLog", () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it("logs LOGIN_FAILURE with masked data", async () => {
    const logSpy = vi
      .spyOn(console, "log")
      .mockImplementation(() => {});

    await securityLog({
      event: "LOGIN_FAILURE",
      email: "admin@securefactory.demo",
      ip: "127.0.0.1",
      details: "Invalid credentials",
    });

    expect(logSpy).toHaveBeenCalledTimes(1);

    const output = logSpy.mock.calls[0][0] as string;
    const entry = JSON.parse(output);

    expect(entry.event).toBe("LOGIN_FAILURE");
    expect(entry.email).toBe(
      "ad***@securefactory.demo"
    );
    expect(entry.ip).toBe("127.0.0.xxx");
    expect(entry.details).toBe(
      "Invalid credentials"
    );
    expect(entry.severity).toBe("medium");
  });

  it("stores the security event in database", async () => {
    vi.spyOn(console, "log").mockImplementation(() => {});

    await securityLog({
      event: "LOGIN_FAILURE",
      email: "admin@securefactory.demo",
      ip: "127.0.0.1",
      details: "Invalid credentials",
    });

    expect(sqlMock).toHaveBeenCalledTimes(1);
  });

  it("uses low severity for LOGIN_SUCCESS", async () => {
    const logSpy = vi
      .spyOn(console, "log")
      .mockImplementation(() => {});

    await securityLog({
      event: "LOGIN_SUCCESS",
      email: "admin@securefactory.demo",
      ip: "127.0.0.1",
      details: "Admin authenticated",
    });

    const output = logSpy.mock.calls[0][0] as string;
    const entry = JSON.parse(output);

    expect(entry.severity).toBe("low");
  });

  it(
  "uses medium severity for authorization denial",
  async () => {
    const logSpy = vi
      .spyOn(console, "log")
      .mockImplementation(() => {});

    await securityLog({
      event: "AUTHORIZATION_DENIED",
      email: "viewer@securefactory.demo",
      ip: "139.162.113.45",
      details: "permission=security.read",
    });

    expect(logSpy).toHaveBeenCalledTimes(1);

    const output =
      logSpy.mock.calls[0][0] as string;

    const entry = JSON.parse(output);

    expect(entry).toMatchObject({
      event: "AUTHORIZATION_DENIED",
      email: "vi***@securefactory.demo",
      ip: "139.162.113.xxx",
      details: "permission=security.read",
      severity: "medium",
    });

    expect(sqlMock).toHaveBeenCalledTimes(1);
  }
);

});