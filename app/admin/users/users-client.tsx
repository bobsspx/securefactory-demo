"use client";

import {
  useState,
} from "react";

type UserRole =
  | "admin"
  | "operator"
  | "viewer";

type ManagedUser = {
  id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  sessionVersion: number;
};

type Draft = {
  role: UserRole;
  isActive: boolean;
};

type Props = {
  initialUsers:
    ManagedUser[];

  currentUserId:
    string;
};

export default function
UsersClient({
  initialUsers,
  currentUserId,
}: Props) {

  const [users, setUsers] =
    useState(
      initialUsers
    );

  const [drafts, setDrafts] =
    useState<
      Record<string, Draft>
    >(
      Object.fromEntries(
        initialUsers.map(
          (user) => [
            user.id,
            {
              role:
                user.role,

              isActive:
                user.isActive,
            },
          ]
        )
      )
    );

  const [
    savingId,
    setSavingId,
  ] =
    useState<
      string | null
    >(null);

  const [
    message,
    setMessage,
  ] =
    useState("");

  function updateDraft(
    userId: string,
    update:
      Partial<Draft>
  ) {
    setDrafts(
      (current) => ({
        ...current,

        [userId]: {
          ...current[
            userId
          ],

          ...update,
        },
      })
    );
  }

  async function
  saveUser(
    user: ManagedUser
  ) {
    if (
      user.id ===
      currentUserId
    ) {
      return;
    }

    const draft =
      drafts[user.id];

    if (!draft) {
      return;
    }

    const changed =
      draft.role
        !== user.role ||

      draft.isActive
        !== user.isActive;

    if (!changed) {
      setMessage(
        "No changes to save."
      );

      return;
    }

    const action =
      draft.isActive
        ? "update"
        : "disable";

    const confirmed =
      window.confirm(
        `Are you sure you want to ${action} ${user.email}?`
      );

    if (!confirmed) {
      return;
    }

    setSavingId(
      user.id
    );

    setMessage("");

    try {
      const response =
        await fetch(
          `/api/admin/users/${user.id}`,
          {
            method:
              "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                role:
                  draft.role,

                isActive:
                  draft.isActive,
              }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        setMessage(
          data.error ||
          "Unable to update user."
        );

        return;
      }

      const updated =
        data.user;

      setUsers(
        (current) =>
          current.map(
            (item) =>
              item.id ===
              updated.id

                ? {
                    ...item,

                    role:
                      updated.role,

                    isActive:
                      updated.isActive,

                    sessionVersion:
                      updated
                        .sessionVersion,
                  }

                : item
          )
      );

      setDrafts(
        (current) => ({
          ...current,

          [updated.id]: {
            role:
              updated.role,

            isActive:
              updated
                .isActive,
          },
        })
      );

      setMessage(
        `${updated.email} updated successfully.`
      );
    } catch {
      setMessage(
        "Unable to connect to the server."
      );
    } finally {
      setSavingId(
        null
      );
    }
  }

  return (
    <section className="usersSection">

      <div className="usersIntro">
        <div>
          <p>
            USER MANAGEMENT
          </p>

          <h2>
            Access control
          </h2>
        </div>

        <span>
          {users.length}
          {" "}accounts
        </span>
      </div>

      {message && (
        <div className="usersMessage">
          {message}
        </div>
      )}

      <div className="usersTable">

        <div className="
          usersRow
          usersHead
        ">
          <span>USER</span>
          <span>ROLE</span>
          <span>STATUS</span>
          <span>SESSION</span>
          <span>ACTION</span>
        </div>

        {users.map(
          (user) => {

          const isSelf =
            user.id ===
            currentUserId;

          const draft =
            drafts[user.id];

          return (
            <div
              className="usersRow"
              key={user.id}
            >
              <div className="userIdentity">

                <strong>
                  {user.email}
                </strong>

                {isSelf && (
                  <small>
                    YOU
                  </small>
                )}

              </div>

              <select
                value={
                  draft?.role ??
                  user.role
                }

                disabled={
                  isSelf
                }

                onChange={(event) => {
                  const nextRole =
                    event.currentTarget.value;

                  if (
                    nextRole === "admin" ||
                    nextRole === "operator" ||
                    nextRole === "viewer"
                  ) {
                    updateDraft(
                      user.id,
                      {
                        role: nextRole,
                      }
                    );
                  }
                }}
              >
                <option value="admin">
                  Admin
                </option>

                <option value="operator">
                  Operator
                </option>

                <option value="viewer">
                  Viewer
                </option>
              </select>

              <label className="userStatusControl">

                <input
                  type="checkbox"

                  checked={
                    draft
                      ?.isActive
                    ??
                    user.isActive
                  }

                  disabled={
                    isSelf
                  }

                  onChange={
                    (event) =>
                      updateDraft(
                        user.id,
                        {
                          isActive:
                            event
                              .target
                              .checked,
                        }
                      )
                  }
                />

                <span
                  className={
                    (
                      draft
                        ?.isActive
                      ??
                      user.isActive
                    )
                      ? "statusActive"
                      : "statusDisabled"
                  }
                >
                  {
                    (
                      draft
                        ?.isActive
                      ??
                      user.isActive
                    )
                      ? "ACTIVE"
                      : "DISABLED"
                  }
                </span>

              </label>

              <span className="sessionVersion">
                v{
                  user
                    .sessionVersion
                }
              </span>

              <button
                type="button"

                disabled={
                  isSelf ||
                  savingId ===
                    user.id
                }

                onClick={
                  () =>
                    saveUser(
                      user
                    )
                }
              >
                {
                  savingId ===
                  user.id

                    ? "Saving..."

                    : "Save"
                }
              </button>

            </div>
          );
        })}
      </div>

      <p className="usersNote">
        Role or account status
        changes revoke existing
        sessions automatically.
      </p>
    </section>
  );
}