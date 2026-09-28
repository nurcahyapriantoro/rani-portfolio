// One-off migration runner: applies supabase/migrations/0001_init.sql to the Neon
// database referenced by DATABASE_URL. Safe to re-run because the SQL uses
// `create table if not exists` and `drop policy if exists` for idempotency.

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function main() {
  const url = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;
  if (!url) {
    console.error('Missing DATABASE_URL / SUPABASE_DB_URL env var');
    process.exit(1);
  }

  const sqlPath = path.join(__dirname, '..', 'supabase', 'migrations', '0001_init.sql');
  const sql = fs.readFileSync(sqlPath, 'utf-8');

  const client = new Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
    statement_timeout: 15000,
    query_timeout: 15000
  });

  try {
    await client.connect();
    console.log('Connected to Postgres.');
    await client.query(sql);
    console.log('Migration applied successfully.');

    const tables = await client.query(
      "select table_name from information_schema.tables where table_schema = 'public' and table_name in ('portfolio_content', 'portfolio_assets') order by table_name"
    );
    console.log('Tables present:', tables.rows.map((r) => r.table_name).join(', '));
  } catch (e) {
    console.error('Migration failed:', e.message);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

main();
