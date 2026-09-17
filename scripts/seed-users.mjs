import bcrypt from "bcryptjs";
import {
  neon,
} from "@neondatabase/serverless";

const databaseUrl =
  process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is not configured"
  );
}

const sql = neon(databaseUrl);

const users = [
  {
    email:
      process.env.SEED_ADMIN_EMAIL,
    password:
      process.env.SEED_ADMIN_PASSWORD,
    role: "admin",
  },
  {
    email:
      process.env.SEED_OPERATOR_EMAIL,
    password:
      process.env.SEED_OPERATOR_PASSWORD,
    role: "operator",
  },
  {
    email:
      process.env.SEED_VIEWER_EMAIL,
    password:
      process.env.SEED_VIEWER_PASSWORD,
    role: "viewer",
  },
];

for (const user of users) {
  if (
    !user.email ||
    !user.password
  ) {
    throw new Error(
      `Missing seed credentials for ${user.role}`
    );
  }

  const email =
    user.email
      .trim()
      .toLowerCase();

  const passwordHash =
    await bcrypt.hash(
      user.password,
      12
    );

  await sql`
    INSERT INTO users (
      email,
      password_hash,
      role,
      is_active,
      updated_at
    )
    VALUES (
      ${email},
      ${passwordHash},
      ${user.role},
      TRUE,
      NOW()
    )

    ON CONFLICT (email)

    DO UPDATE SET
      password_hash =
        EXCLUDED.password_hash,

      role =
        EXCLUDED.role,

      is_active =
        TRUE,
      
      session_version =
      users.session_version + 1,

      updated_at =
        NOW();
  `;

  console.log(
    `Seeded ${user.role}: ${email}`
  );
}

console.log(
  "User seed completed."
);