// ══════════════════════════════════════════════
// PIXORB — NeonDB Connection
// ══════════════════════════════════════════════

import { neon } from '@neondatabase/serverless';

let sql;

export function getDb() {
  if (!sql) {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    sql = neon(dbUrl);
  }
  return sql;
}

export async function initDb() {
  const sql = getDb();

  // Create wallets table with handle column
  await sql`
    CREATE TABLE IF NOT EXISTS wallets (
      id SERIAL PRIMARY KEY,
      address VARCHAR(42) UNIQUE NOT NULL,
      handle VARCHAR(100),
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  // Add handle column if table already exists without it
  try {
    await sql`
      ALTER TABLE wallets ADD COLUMN IF NOT EXISTS handle VARCHAR(100)
    `;
  } catch (err) {
    // Column might already exist, that's fine
  }

  // Create submissions table for all new registrations
  await sql`
    CREATE TABLE IF NOT EXISTS submissions (
      id SERIAL PRIMARY KEY,
      address VARCHAR(42) NOT NULL,
      handle VARCHAR(100),
      quote_url TEXT,
      submitted_at TIMESTAMP DEFAULT NOW()
    )
  `;

  console.log('✓ Database initialized — wallets & submissions tables ready');
}
