import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  decrypt,
  SESSION_COOKIE_NAME,
} from "@/lib/session";
import LogoutButton from "./logout-button";
import {
  getRecentSecurityEvents,
} from "@/lib/security-events";

export default async function AdminPage() {
  const cookieStore = await cookies();

  const sessionCookie =
    cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie) {
    redirect("/login");
  }

  const session = await decrypt(sessionCookie.value);

  if (!session || session.role !== "admin") {
    redirect("/login");
  }

  const activity =
  await getRecentSecurityEvents(20).catch(
    () => []
  );

  return (
    <main className="adminLayout">
      <aside className="adminSidebar">
        <div>
          <Link href="/" className="adminLogo">
            SECURE<span>FACTORY</span>
          </Link>

          <p>ADMIN CONSOLE</p>
        </div>

        <nav>
          <a className="active" href="/admin">
            Overview
          </a>

          <a href="#production">
            Production
          </a>

          <a href="#security">
            Security
          </a>

          <a href="#activity">
            Activity Logs
          </a>
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
            <span>ADMIN</span>
            <strong>{session.email}</strong>
          </div>
        </header>

        <section
          id="production"
          className="adminMetrics"
        >
          <article>
            <span>Production Today</span>
            <strong>12,480</strong>
            <small>Units produced</small>
          </article>

          <article>
            <span>Efficiency</span>
            <strong>94.8%</strong>
            <small>+2.4% this week</small>
          </article>

          <article>
            <span>Active Lines</span>
            <strong>08 / 08</strong>
            <small>All systems operational</small>
          </article>

          <article>
            <span>Security Status</span>
            <strong>Normal</strong>
            <small>No active incidents</small>
          </article>
        </section>

        <section
          id="security"
          className="adminSection"
        >
          <div className="adminSectionHeader">
            <div>
              <p>SECURITY</p>
              <h2>Security posture</h2>
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
              <span>Admin Access</span>
              <strong>Restricted</strong>
            </div>
          </div>
        </section>

        <section
          id="activity"
          className="adminSection"
        >
          <div className="adminSectionHeader">
            <div>
              <p>MONITORING</p>
              <h2>Recent activity</h2>
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
                    <strong>{item.event_type}</strong>

                    <small>
                      {item.details || "Security event"}
                    </small>
                  </div>

                  <span>
                    {item.email || "unknown"}
                    <br />
                    {item.ip_address || "unknown"}
                  </span>

                  <span>
                    {new Intl.DateTimeFormat(
                      "en-GB",
                      {
                        dateStyle: "medium",
                        timeStyle: "medium",
                        timeZone: "UTC",
                      }
                    ).format(
                      new Date(item.created_at)
                    )}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </section>
    </main>
  );
}