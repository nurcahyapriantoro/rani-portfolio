#!/usr/bin/env tsx
/* eslint-disable no-console */
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { Pool } from 'pg';
import { config } from 'dotenv';

config({ path: '.env.local' });
config();

async function run() {
  const databaseUrl = process.env.SUPABASE_DB_URL || '';
  if (!databaseUrl) {
    throw new Error('SUPABASE_DB_URL is not set');
  }
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
  });
  const result = await pool.query(
    "select section, pg_typeof(data) as data_type from portfolio_content where locale = 'en' order by section"
  );
  console.log(`sections=${result.rows.length}`);
  for (const row of result.rows) {
    console.log(`- ${row.section} (${row.data_type})`);
  }
  await pool.end();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
