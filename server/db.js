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
    await sql`
    CREATE TABLE IF NOT EXISTS wallets (
      id SERIAL PRIMARY KEY,
      address VARCHAR(42) UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
    console.log('✓ Database initialized — wallets table ready');
}
