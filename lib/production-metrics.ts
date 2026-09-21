import type {
  ProductionStatus,
} from "./production-types";

export type ProductionMetricRecord = {
  lineCode:string;
  plannedUnits:number;
  producedUnits:number;
  rejectedUnits: number;
  status:ProductionStatus;
};

export type ProductionDashboardMetrics = {
  productionDate: string | null;
    producedUnits: number;
    plannedUnits: number;
    efficiency:number;
    activeLines:number;
    totalLines:number;
    rejectedUnits:number;
    rejectRate: number;
};

function round(
  value: number,
  digits: number
) {
  const multiplier =
    10 ** digits;

  return (
    Math.round(
      value *
      multiplier
    ) /
    multiplier
  );
}

export function
calculateProductionMetrics(
  productionDate:
    string | null,

  records:
    ProductionMetricRecord[]
):
ProductionDashboardMetrics {

  const producedUnits =
    records.reduce(
      (
        total,
        record
      ) =>
        total +
        record.producedUnits,
      0
    );

  const plannedUnits =
    records.reduce(
      (
        total,
        record
      ) =>
        total +
        record.plannedUnits,
      0
    );

  const rejectedUnits =
    records.reduce(
      (
        total,
        record
      ) =>
        total +
        record.rejectedUnits,
      0
    );

  const allLines =
    new Set(
      records.map(
        (record) =>
          record.lineCode
      )
    );

  const runningLines =
    new Set(
      records
        .filter(
          (record) =>
            record.status ===
            "running"
        )
        .map(
          (record) =>
            record.lineCode
        )
    );

  const efficiency =
    plannedUnits > 0
      ? round(
          (
            producedUnits /
            plannedUnits
          ) * 100,
          1
        )
      : 0;

  const rejectRate =
    producedUnits > 0
      ? round(
          (
            rejectedUnits /
            producedUnits
          ) * 100,
          2
        )
      : 0;

  return {
    productionDate,

    producedUnits,

    plannedUnits,

    efficiency,

    activeLines:
      runningLines.size,

    totalLines:
      allLines.size,

    rejectedUnits,

    rejectRate,
  };
}