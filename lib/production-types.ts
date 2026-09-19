export const
PRODUCTION_STATUSES = [
  "planned",
  "running",
  "paused",
  "completed",
] as const;

export type ProductionStatus =
  (
    typeof
    PRODUCTION_STATUSES
  )[number];

export type ProductionRecord = {
  id: string;

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

  createdAt:
    string | Date;

  updatedAt:
    string | Date;
};