import {
  cookies,
} from "next/headers";

import {
  redirect,
} from "next/navigation";

import Link from "next/link";

import {
  SESSION_COOKIE_NAME,
} from "@/lib/session";

import {
  resolveSessionUser,
} from "@/lib/session-user";

import {
  hasPermission,
} from "@/lib/rbac";

import {
  listProductionRecords,
} from "@/lib/production";

import LogoutButton from "../logout-button";

import ProductionClient from "./production-client";

export default async function
ProductionPage() {
  const cookieStore =
    await cookies();

  const sessionCookie =
    cookieStore.get(
      SESSION_COOKIE_NAME
    );

  if (!sessionCookie) {
    redirect("/login");
  }

  const resolution =
    await resolveSessionUser(
      sessionCookie.value
    );

  if (
    resolution.status !== "valid"
  ) {
    redirect("/login");
  }

  const session =
    resolution.user;

  if (
    !hasPermission(
      session.role,
      "production.read"
    )
  ) {
    redirect("/admin");
  }

  const canWrite =
    hasPermission(
      session.role,
      "production.write"
    );

  const canManageUsers =
    hasPermission(
      session.role,
      "users.read"
    );

  const records =
    await listProductionRecords(
      100
    );

  return (
    <main className="adminLayout">
      <aside className="adminSidebar">
        <div>
          <Link
            href="/"
            className="adminLogo"
          >
            SECURE
            <span>FACTORY</span>
          </Link>

          <p>
            OPERATIONS CONSOLE
          </p>
        </div>

        <nav>
          <Link href="/admin">
            Overview
          </Link>

          <Link
            className="active"
            href="/admin/production"
          >
            Production
          </Link>

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
            <p>
              FACTORY OPERATIONS
            </p>

            <h1>
              Production
            </h1>
          </div>

          <div className="adminUser">
            <span>
              {session.role
                .toUpperCase()}
            </span>

            <strong>
              {session.email}
            </strong>
          </div>
        </header>

        <ProductionClient
          canWrite={canWrite}
          initialRecords={
            records.map(
              (record) => ({
                id:
                  record.id,

                productionDate:
                  record.productionDate,

                lineCode:
                  record.lineCode,

                productName:
                  record.productName,

                plannedUnits:
                  record.plannedUnits,

                producedUnits:
                  record.producedUnits,

                rejectedUnits:
                  record.rejectedUnits,

                status:
                  record.status,
              })
            )
          }
        />
      </section>
    </main>
  );
}