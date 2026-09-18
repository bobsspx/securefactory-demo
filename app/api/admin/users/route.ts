import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  requireApiPermission,
} from "@/lib/api-authorization";

import {
  listManagedUsers,
} from "@/lib/users";

export async function GET(
  request: NextRequest
) {
  const auth =
    await requireApiPermission(
      request,
      "users.read"
    );

  if (!auth.ok) {
    return auth.response;
  }

  const users =
    await listManagedUsers();

  return NextResponse.json(
    {
      users,
    },
    {
      headers: {
        "Cache-Control":
          "no-store",
      },
    }
  );
}