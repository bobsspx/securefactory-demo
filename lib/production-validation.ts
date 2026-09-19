import {
  PRODUCTION_STATUSES,
  type ProductionStatus,
} from "./production-types";

type ProductionInput = {
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
};

export type ValidatedProductionInput = {
  productionDate:
    string;

  lineCode:
    string;

  productName:
    string;

  plannedUnits:
    number;

  producedUnits:
    number;

  rejectedUnits:
    number;

  status:
    ProductionStatus;
};

export type ProductionValidationResult =
  | {
      ok: true;

      value:
        ValidatedProductionInput;
    }
  | {
      ok: false;

      error:
        string;
    };

function isInteger(
  value: unknown
): value is number {
  return (
    typeof value
      === "number" &&

    Number.isInteger(
      value
    )
  );
}

export function
validateProductionInput(
  input:
    ProductionInput
): ProductionValidationResult {

  if (
    typeof input.productionDate
      !== "string" ||

    !/^\d{4}-\d{2}-\d{2}$/
      .test(
        input.productionDate
      )
  ) {
    return {
      ok: false,

      error:
        "Invalid production date.",
    };
  }

  const lineCode =
    typeof input.lineCode
      === "string"
      ? input.lineCode.trim()
      : "";

  if (
    lineCode.length < 1 ||
    lineCode.length > 30
  ) {
    return {
      ok: false,

      error:
        "Invalid line code.",
    };
  }

  const productName =
    typeof input.productName
      === "string"
      ? input.productName.trim()
      : "";

  if (
    productName.length < 1 ||
    productName.length > 150
  ) {
    return {
      ok: false,

      error:
        "Invalid product name.",
    };
  }

  if (
    !isInteger(
      input.plannedUnits
    ) ||

    input.plannedUnits <= 0
  ) {
    return {
      ok: false,

      error:
        "Planned units must be greater than zero.",
    };
  }

  if (
    !isInteger(
      input.producedUnits
    ) ||

    input.producedUnits < 0
  ) {
    return {
      ok: false,

      error:
        "Produced units cannot be negative.",
    };
  }

  if (
    !isInteger(
      input.rejectedUnits
    ) ||

    input.rejectedUnits < 0
  ) {
    return {
      ok: false,

      error:
        "Rejected units cannot be negative.",
    };
  }

  if (
    input.rejectedUnits >
      input.producedUnits
  ) {
    return {
      ok: false,

      error:
        "Rejected units cannot exceed produced units.",
    };
  }

if (
  typeof input.status !== "string" ||
  !PRODUCTION_STATUSES.includes(
    input.status as ProductionStatus
  )
) {
    return {
      ok: false,

      error:
        "Invalid production status.",
    };
  }

  return {
    ok: true,

    value: {
      productionDate:
        input.productionDate,

      lineCode,

      productName,

      plannedUnits:
        input.plannedUnits,

      producedUnits:
        input.producedUnits,

      rejectedUnits:
        input.rejectedUnits,

      status:
        input.status as ProductionStatus,
    },
  };
}