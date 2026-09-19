import {
  sql,
} from "./db";

import type {
  ProductionRecord,
} from "./production-types";

import type {
  ProductionStatus,
} from "./production-types";

import type {
  ValidatedProductionInput,
} from "./production-validation";

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

export async function
findProductionRecordById(
  recordId: string
):
Promise<
  ProductionRecord | null
> {
  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (
    !uuidPattern.test(
      recordId
    )
  ) {
    return null;
  }

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
      WHERE
        id =
          ${recordId}::uuid
      LIMIT 1;
    `;

  const row =
    rows[0];

  if (!row) {
    return null;
  }

  return {
    id:String(row.id),
    productionDate:String(row.production_date).slice(0, 10),
    lineCode:String(row.line_code),
    productName:String( row.product_name),
    plannedUnits:Number( row.planned_units),
    producedUnits:Number( row.produced_units ),
    rejectedUnits:Number(row.rejected_units),
    status:row.status as ProductionStatus,
    createdAt:row.created_at as string | Date,
    updatedAt:row.updated_at as string | Date,
  };
}

export async function
createProductionRecord(
  input:
    ValidatedProductionInput,

  userId:
    string
):
Promise<ProductionRecord> {

  const rows =
    await sql`
      INSERT INTO
        production_records (
          production_date,
          line_code,
          product_name,
          planned_units,
          produced_units,
          rejected_units,
          status,
          created_by,
          updated_by
        )
      VALUES (
        ${input.productionDate},
        ${input.lineCode},
        ${input.productName},
        ${input.plannedUnits},
        ${input.producedUnits},
        ${input.rejectedUnits},
        ${input.status},
        ${userId}::uuid,
        ${userId}::uuid
      )
      RETURNING
        id::text AS id,
        production_date,
        line_code,
        product_name,
        planned_units,
        produced_units,
        rejected_units,
        status,
        created_at,
        updated_at;
    `;

  const row =
    rows[0];

  return {
    id:String(row.id),
    productionDate:String(row.production_date).slice(0, 10),
    lineCode:String(row.line_code),
    productName:String(row.product_name ),
    plannedUnits:Number(row.planned_units),
    producedUnits:Number(row.produced_units),
    rejectedUnits:Number( row.rejected_units),
    status:row.status as ProductionStatus,
    createdAt:row.created_at as string | Date,
    updatedAt:row.updated_at as string | Date,
  };
}

export async function
updateProductionRecord(
  recordId:
    string,

  input:
    ValidatedProductionInput,

  userId:
    string
):
Promise<
  ProductionRecord | null
> {

  const existing =
    await findProductionRecordById(
      recordId
    );

  if (!existing) {
    return null;
  }

  const rows =
    await sql`
      UPDATE
        production_records
      SET
        production_date =
          ${input.productionDate},

        line_code =
          ${input.lineCode},

        product_name =
          ${input.productName},

        planned_units =
          ${input.plannedUnits},

        produced_units =
          ${input.producedUnits},

        rejected_units =
          ${input.rejectedUnits},

        status =
          ${input.status},

        updated_by =
          ${userId}::uuid,

        updated_at =
          NOW()

      WHERE
        id =
          ${recordId}::uuid

      RETURNING
        id::text AS id,
        production_date,
        line_code,
        product_name,
        planned_units,
        produced_units,
        rejected_units,
        status,
        created_at,
        updated_at;
    `;

  const row =
    rows[0];

  if (!row) {
    return null;
  }

  return {
    id:String(row.id),
    productionDate:String(row.production_date).slice(0, 10),
    lineCode:String( row.line_code),
    productName:String(row.product_name),
    plannedUnits:Number(row.planned_units),
    producedUnits:Number( row.produced_units),
    rejectedUnits:Number(row.rejected_units),
    status:row.status as ProductionStatus,
    createdAt:row.created_at as string | Date,
    updatedAt:row.updated_at as string | Date,
  };
}