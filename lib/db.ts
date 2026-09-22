import {
  neon,
} from "@neondatabase/serverless";

import {
  env,
} from "./env";

export const sql =
  neon(
    env.DATABASE_URL
  );