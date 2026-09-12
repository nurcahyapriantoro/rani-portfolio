#!/usr/bin/env tsx
/* eslint-disable no-console */
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { Pool } from 'pg';
import { config } from 'dotenv';

config({ path: '.env.local' });
config();

async function run() {
  const databaseUrl =
    process.env.SUPABASE_DB_URL || process.env.DATABASE_URL || '';
  if (!databaseUrl) {
    throw new Error('SUPABASE_DB_URL is not set');
  }
  const contentPath = resolve(__dirname, '..', 'content', 'en.json');
  const json = JSON.parse(readFileSync(contentPath, 'utf-8')) as Record<
    string,
    unknown
  >;

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
  });
  const client = await pool.connect();
  try {
    await client.query('begin');
    await client.query('delete from portfolio_content where locale = $1', [
      'en'
    ]);
    for (const [section, data] of Object.entries(json)) {
      await client.query(
        `insert into portfolio_content (locale, section, data)
         values ($1, $2, $3::jsonb)`,
        ['en', section, JSON.stringify(data)]
      );
      console.log(`seeded en/${section}`);
    }
    await client.query('commit');
  } catch (err) {
    await client.query('rollback');
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
