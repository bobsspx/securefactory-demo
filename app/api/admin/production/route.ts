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
      "production.read"
    );

  if (!auth.ok) {
    return auth.response;
  }

  return NextResponse.json(
    {
      productionToday:
        12480,

      efficiency:
        94.8,

      activeLines: {
        active: 8,
        total: 8,
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