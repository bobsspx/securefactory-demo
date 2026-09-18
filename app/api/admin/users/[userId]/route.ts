import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  requireApiPermission,
} from "@/lib/api-authorization";

import {
  countActiveAdmins,
  findManagedUserById,
  updateManagedUser,
} from "@/lib/users";

import {
  isUserRole,
} from "@/lib/rbac";

import {
  validateUserUpdatePolicy,
} from "@/lib/user-management";

import {
  hasValidSameOrigin,
} from "@/lib/request-security";

import {
  securityLog,
} from "@/lib/security-log";

export async function PATCH(
  request: NextRequest,
  context: {
    params:
      Promise<{
        userId: string;
      }>;
  }
) {
  const auth =
    await requireApiPermission(
      request,
      "users.manage"
    );

  if (!auth.ok) {
    return auth.response;
  }

  if (
    !hasValidSameOrigin(
      request
    )
  ) {
    return NextResponse.json(
      {
        error:
          "Invalid request origin.",
      },
      {
        status: 403,
      }
    );
  }

  const { userId } =
    await context.params;

  const target =
    await findManagedUserById(
      userId
    );

  if (!target) {
    return NextResponse.json(
      {
        error:
          "User not found.",
      },
      {
        status: 404,
      }
    );
  }

  const body =
    await request.json();

  const role =
    body?.role;

  const isActive =
    body?.isActive;

  if (
    !isUserRole(role) ||
    typeof isActive
      !== "boolean"
  ) {
    return NextResponse.json(
      {
        error:
          "Invalid user update.",
      },
      {
        status: 400,
      }
    );
  }

  const adminCount =
    await countActiveAdmins();

  const policy =
    validateUserUpdatePolicy(
      auth.session.userId,
      target,
      {
        role,
        isActive,
      },
      adminCount
    );

  if (!policy.allowed) {
    return NextResponse.json(
      {
        error:
          policy.reason,
      },
      {
        status: 409,
      }
    );
  }

  const updated =
    await updateManagedUser(
      target.id,
      role,
      isActive
    );

  if (!updated) {
    return NextResponse.json(
      {
        error:
          "Unable to update user.",
      },
      {
        status: 500,
      }
    );
  }

  if (
    target.role !== role
  ) {
    await securityLog({
      event:
        "USER_ROLE_CHANGED",

      email:
        auth.session.email,

      details:
        [
          `target=${target.id}`,
          `from=${target.role}`,
          `to=${role}`,
        ].join(" "),
    });
  }

  if (
    target.isActive
      !== isActive
  ) {
    await securityLog({
      event:
        isActive
          ? "USER_ENABLED"
          : "USER_DISABLED",

      email:
        auth.session.email,

      details:
        `target=${target.id}`,
    });
  }

  return NextResponse.json(
    {
      success: true,

      user: {
        id:
          String(updated.id),

        email:
          String(updated.email),

        role:
          updated.role,

        isActive:
          Boolean(
            updated.is_active
          ),

        sessionVersion:
          Number(
            updated.session_version
          ),
      },
    },
    {
      headers: {
        "Cache-Control":
          "no-store",
      },
    }
  );
}