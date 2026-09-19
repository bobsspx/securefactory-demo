import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  requireApiPermission,
} from "@/lib/api-authorization";

import {
  createProductionRecord,
  listProductionRecords,
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

  const records =
    await listProductionRecords(
      100
    );

  return NextResponse.json(
    {
      records,
    },
    {
      headers: {
        "Cache-Control":
          "no-store",
      },
    }
  );
}

export async function POST(
  request: NextRequest
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

  const record =
    await createProductionRecord(
      validation.value,
      auth.session.userId
    );

  await securityLog({
    event:
      "PRODUCTION_RECORD_CREATED",

    email:
      auth.session.email,

    details:
      [
        `record=${record.id}`,
        `line=${record.lineCode}`,
      ].join(" "),
  });

  return NextResponse.json(
    {
      record,
    },
    {
      status: 201,

      headers: {
        "Cache-Control":
          "no-store",
      },
    }
  );
}