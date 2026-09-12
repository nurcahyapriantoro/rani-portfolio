#!/usr/bin/env tsx
/* eslint-disable no-console */
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { Pool } from 'pg';
import { config } from 'dotenv';

config({ path: '.env.local' });
config();

interface Schema {
  statements: string[];
}

async function run() {
  const databaseUrl =
    process.env.SUPABASE_DB_URL || process.env.DATABASE_URL || '';
  if (!databaseUrl) {
    throw new Error('SUPABASE_DB_URL is not set');
  }
  const migrationPath = resolve(
    __dirname,
    '..',
    'supabase',
    'migrations',
    '0001_init.sql'
  );
  const raw = readFileSync(migrationPath, 'utf-8');
  const statements = raw
    .split(/;\s*$/m)
    .map((s) => s.trim())
    .filter(Boolean);
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
  });
  for (const statement of statements) {
    console.log(`> ${statement.split('\n')[0]} ...`);
    await pool.query(statement);
  }
  await pool.end();
  console.log(`Applied ${statements.length} statements.`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
