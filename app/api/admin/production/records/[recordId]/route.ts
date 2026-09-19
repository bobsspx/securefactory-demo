import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  requireApiPermission,
} from "@/lib/api-authorization";

import {
  findProductionRecordById,
  updateProductionRecord,
} from "@/lib/production";

import {
  validateProductionInput,
} from "@/lib/production-validation";

import {
  hasValidSameOrigin,
} from "@/lib/request-security";

import {
  securityLog,
} from "@/lib/security-log";

export async function PATCH(
  request:
    NextRequest,

  context: {
    params:
      Promise<{
        recordId:
          string;
      }>;
  }
) {
  const auth =
    await requireApiPermission(
      request,
      "production.write"
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

  const {
    recordId,
  } =
    await context.params;

  const existing =
    await findProductionRecordById(
      recordId
    );

  if (!existing) {
    return NextResponse.json(
      {
        error:
          "Production record not found.",
      },
      {
        status: 404,
      }
    );
  }

  let body:
    unknown;

  try {
    body =
      await request.json();
  } catch {
    return NextResponse.json(
      {
        error:
          "Invalid JSON body.",
      },
      {
        status: 400,
      }
    );
  }

  if (
    typeof body !== "object" ||
    body === null
  ) {
    return NextResponse.json(
      {
        error:
          "Invalid production data.",
      },
      {
        status: 400,
      }
    );
  }

  const validation =
    validateProductionInput(
      body as {
        productionDate:
          unknown;

        lineCode:
          unknown;

        productName:
          unknown;

        plannedUnits:
          unknown;

        producedUnits:
          unknown;

        rejectedUnits:
          unknown;

        status:
          unknown;
      }
    );

  if (!validation.ok) {
    return NextResponse.json(
      {
        error:
          validation.error,
      },
      {
        status: 400,
      }
    );
  }

  const updated =
    await updateProductionRecord(
      recordId,
      validation.value,
      auth.session.userId
    );

  if (!updated) {
    return NextResponse.json(
      {
        error:
          "Unable to update production record.",
      },
      {
        status: 500,
      }
    );
  }

  await securityLog({
    event:
      "PRODUCTION_RECORD_UPDATED",

    email:
      auth.session.email,

    details:
      [
        `record=${updated.id}`,
        `line=${updated.lineCode}`,
      ].join(" "),
  });

  return NextResponse.json(
    {
      record:
        updated,
    },
    {
      headers: {
        "Cache-Control":
          "no-store",
      },
    }
  );
}