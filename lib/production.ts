import {
  sql,
} from "./db";

import type {
  ProductionRecord,
} from "./production-types";

export async function
listProductionRecords(
  limit = 50
):
Promise<
  ProductionRecord[]
> {
  const safeLimit =
    Math.min(
      Math.max(
        Math.trunc(limit),
        1
      ),
      100
    );

  const rows =
    await sql`
      SELECT
        id::text AS id,
        production_date,
        line_code,
        product_name,
        planned_units,
        produced_units,
        rejected_units,
        status,
        created_at,
        updated_at
      FROM
        production_records
      ORDER BY
        production_date DESC,
        created_at DESC
      LIMIT
        ${safeLimit};
    `;

  return rows.map(
(row) => ({
      id: String(row.id),

      productionDate: String(row.production_date).slice(0, 10),
      lineCode: String(row.line_code),
      productName: String(row.product_name),
      plannedUnits: Number(row.planned_units),
      producedUnits: Number(row.produced_units),
      rejectedUnits:Number(row.rejected_units),
      status: row.status,
      createdAt:row.created_at as string | Date,
      updatedAt:row.updated_at as string | Date,
         })) as ProductionRecord[];
}