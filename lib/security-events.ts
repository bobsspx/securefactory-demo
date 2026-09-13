import { sql } from "./db";

export type StoredSecurityEvent = {
  id: number;
  event_type: string;
  email: string | null;
  ip_address: string | null;
  details: string | null;
  severity: string;
  created_at: string | Date;
};

export async function getRecentSecurityEvents(
  limit = 20
): Promise<StoredSecurityEvent[]> {
  const safeLimit = Math.min(
    Math.max(Math.trunc(limit), 1),
    50
  );

  const rows = await sql`
    SELECT
      id,
      event_type,
      email,
      ip_address,
      details,
      severity,
      created_at
    FROM public.security_events
    ORDER BY created_at DESC
    LIMIT ${safeLimit}
  `;

  return rows as unknown as StoredSecurityEvent[];
}