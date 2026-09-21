import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

import {
  SESSION_COOKIE_NAME,
} from "@/lib/session";

import {
  getRecentSecurityEvents,
} from "@/lib/security-events";

import {
  hasPermission,
} from "@/lib/rbac";

import {
  resolveSessionUser,
} from "@/lib/session-user";

import LogoutButton from "./logout-button";

import {
  getLatestProductionDashboardMetrics,
} from "@/lib/production";

export default async function AdminPage() {
  const cookieStore = await cookies();

  const sessionCookie =
    cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie) {
    redirect("/login");
  }

  const resolution =
  await resolveSessionUser(
    sessionCookie.value
  );

  if (
    resolution.status
    !== "valid"
  ) {
  redirect("/login");
  }

const session =
  resolution.user;

  const canViewSecurity =
    hasPermission(
      session.role,
      "security.read"
    );

  const canViewAudit =
    hasPermission(
      session.role,
      "audit.read"
    );

  const canManageUsers =
  hasPermission(
    session.role,
    "users.read"
  );

  const activity =
    canViewAudit
      ? await getRecentSecurityEvents(20)
      : [];
  
  const productionMetrics =
    await getLatestProductionDashboardMetrics();

  return (
    <main className="adminLayout">
      <aside className="adminSidebar">
        <div>
          <Link
            href="/"
            className="adminLogo"
          >
            SECURE<span>FACTORY</span>
          </Link>

          <p>OPERATIONS CONSOLE</p>
        </div>

        <nav>
          <a
            className="active"
            href="/admin"
          >
            Overview
          </a>

          <Link href="/admin/production">
            Production
          </Link>

          {canViewSecurity && (
            <a href="#security">
              Security
            </a>
          )}

          {canViewAudit && (
            <a href="#activity">
              Activity Logs
            </a>
          )}
          
          {canManageUsers && (
            <Link href="/admin/users">
              Users
            </Link>
          )}
        </nav>
      
        <LogoutButton />
      </aside>

      <section className="adminContent">
        <header className="adminHeader">
          <div>
            <p>FACTORY OPERATIONS</p>
            <h1>Overview</h1>
          </div>

          <div className="adminUser">
            <span>
              {session.role.toUpperCase()}
            </span>

            <strong>
              {session.email}
            </strong>
          </div>
        </header>

        <section
          id="production"
          className="adminMetrics"
        >
          <article>
            <span>
              Latest Production
            </span>
              <strong>
                {productionMetrics
                .producedUnits
                .toLocaleString()}
              </strong>
            <small>
              {productionMetrics
              .productionDate
              ? `Production date ${productionMetrics.productionDate}`
              : "No production data"}
            </small>
          </article>

          <article>
            <span>
              Efficiency
            </span>

            <strong>
              {productionMetrics
                .efficiency
                .toFixed(1)}
              %
            </strong>

            <small>
              {productionMetrics
                .producedUnits
                .toLocaleString()}
              {" / "}
              {productionMetrics
                .plannedUnits
                .toLocaleString()}
              {" units"}
            </small>
          </article>

          <article>
            <span>
              Active Lines
            </span>

            <strong>
              {String(
                productionMetrics
                  .activeLines
              ).padStart(2, "0")}

              {" / "}

              {String(
                productionMetrics
                  .totalLines
              ).padStart(2, "0")}
            </strong>

            <small>
              Running / scheduled lines
            </small>
          </article>

          <article>
            <span>
              Reject Rate
            </span>

            <strong>
              {productionMetrics
                .rejectRate
                .toFixed(2)}
              %
            </strong>

            <small>
              {productionMetrics
                .rejectedUnits
                .toLocaleString()}
              {" rejected units"}
            </small>
          </article>
        </section>

        {canViewSecurity && (
          <section
            id="security"
            className="adminSection"
          >
            <div className="adminSectionHeader">
              <div>
                <p>SECURITY</p>

                <h2>
                  Security posture
                </h2>
              </div>

              <span className="statusGood">
                ● OPERATIONAL
              </span>
            </div>

            <div className="securityOverview">
              <div>
                <span>HTTPS</span>
                <strong>Enabled</strong>
              </div>

              <div>
                <span>HSTS</span>
                <strong>Enabled</strong>
              </div>

              <div>
                <span>Session</span>
                <strong>Protected</strong>
              </div>

              <div>
                <span>
                  Admin Access
                </span>

                <strong>
                  Restricted
                </strong>
              </div>
            </div>
          </section>
        )}

        {canViewAudit && (
          <section
            id="activity"
            className="adminSection"
          >
            <div className="adminSectionHeader">
              <div>
                <p>MONITORING</p>

                <h2>
                  Recent activity
                </h2>
              </div>
            </div>

            <div className="activityTable">
              <div className="activityRow activityHead">
                <span>EVENT</span>
                <span>SOURCE</span>
                <span>TIME (UTC)</span>
              </div>

              {activity.length === 0 ? (
                <div className="activityEmpty">
                  No security events recorded yet.
                </div>
              ) : (
                activity.map((item) => (
                  <div
                    className="activityRow"
                    key={item.id}
                  >
                    <div className="activityEvent">
                      <strong>
                        {item.event_type}
                      </strong>

                      <small>
                        {item.details ||
                          "Security event"}
                      </small>
                    </div>

                    <span>
                      {item.email ||
                        "unknown"}
                      <br />
                      {item.ip_address ||
                        "unknown"}
                    </span>

                    <span>
                      {new Intl.DateTimeFormat(
                        "en-GB",
                        {
                          dateStyle:
                            "medium",

                          timeStyle:
                            "medium",

                          timeZone:
                            "UTC",
                        }
                      ).format(
                        new Date(
                          item.created_at
                        )
                      )}
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>
        )}
      </section>
    </main>
  );
}