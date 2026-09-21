import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  requireApiPermission,
} from "@/lib/api-authorization";

import {
  getLatestProductionDashboardMetrics,
} from "@/lib/production";

export async function GET(
  request:
    NextRequest
) {
  const auth =
    await requireApiPermission(
      request,
      "production.read"
    );

  if (!auth.ok) {
    return auth.response;
  }

  const metrics =
    await getLatestProductionDashboardMetrics();

  return NextResponse.json(
    {
      productionDate:
        metrics.productionDate,

      producedUnits:
        metrics.producedUnits,

      plannedUnits:
        metrics.plannedUnits,

      efficiency:
        metrics.efficiency,

      activeLines: {
        active:
          metrics.activeLines,

        total:
          metrics.totalLines,
      },

      rejectedUnits:
        metrics.rejectedUnits,

      rejectRate:
        metrics.rejectRate,
    },
    {
      headers: {
        "Cache-Control":
          "no-store",
      },
    }
  );
}