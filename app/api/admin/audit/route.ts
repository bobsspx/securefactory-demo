import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  requireApiPermission,
} from "@/lib/api-authorization";

import {
  getRecentSecurityEvents,
} from "@/lib/security-events";

export async function GET(
  request: NextRequest
) {
  const auth =
    await requireApiPermission(
      request,
      "audit.read"
    );

  if (!auth.ok) {
    return auth.response;
  }

  const events =
    await getRecentSecurityEvents(
      20
    );

  return NextResponse.json(
    {
      events,
    },
    {
      headers: {
        "Cache-Control":
          "no-store",
      },
    }
  );
}