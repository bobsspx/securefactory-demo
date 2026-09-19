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
  listManagedUsers,
} from "@/lib/users";

import LogoutButton from "../logout-button";
import UsersClient from "./users-client";

export default async function
UsersPage() {
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
      "users.read"
    )
  ) {
    redirect("/admin");
  }

  const users =
    await listManagedUsers();

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
            href="/admin/users"
          >
            Users
          </Link>
        </nav>

        <LogoutButton />
      </aside>

      <section className="adminContent">
        <header className="adminHeader">
          <div>
            <p>
              ACCESS MANAGEMENT
            </p>

            <h1>
              Users
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

        <UsersClient
          initialUsers={users.map(
            (user) => ({
              id:
                user.id,

              email:
                user.email,

              role:
                user.role,

              isActive:
                user.isActive,

              sessionVersion:
                user.sessionVersion,
            })
          )}

          currentUserId={
            session.userId
          }
        />
      </section>
    </main>
  );
}