import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    const result = await sql`
      SELECT
        NOW() AS database_time,
        current_database() AS database_name
    `;

    return NextResponse.json({
      status: "ok",
      database: "connected",
      time: result[0].database_time,
    });
  } catch {
    return NextResponse.json(
      {
        status: "error",
        database: "unavailable",
      },
      {
        status: 500,
      }
    );
  }
}