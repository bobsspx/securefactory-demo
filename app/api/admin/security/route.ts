import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  requireApiPermission,
} from "@/lib/api-authorization";

export async function GET(
  request: NextRequest
) {
  const auth =
    await requireApiPermission(
      request,
      "security.read"
    );

  if (!auth.ok) {
    return auth.response;
  }

  return NextResponse.json(
    {
      https:
        "enabled",

      hsts:
        "enabled",

      session:
        "protected",

      adminAccess:
        "restricted",
    },
    {
      headers: {
        "Cache-Control":
          "no-store",
      },
    }
  );
}