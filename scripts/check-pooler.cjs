#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf-8');
const supabaseLine = env
  .split(/\r?\n/)
  .find((l) => l.startsWith('SUPABASE_DB_URL=') || l.startsWith('SUPABASE='));
if (!supabaseLine) {
  console.error('SUPABASE_DB_URL line not found');
  process.exit(1);
}
const original = supabaseLine.replace(/^SUPABASE(_DB_URL)?=/, '');
const match = original.match(/^postgresql:\/\/postgres:(.*?)@(.*?)$/);
if (!match) {
  console.error('Cannot parse SUPABASE url');
  process.exit(1);
}
const password = match[1];
const projectRef = 'fcjpldfigsovmovbrhdj';
const poolerUrl = `postgresql://postgres.${projectRef}:${password}@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1`;
process.env.SUPABASE_DB_URL = poolerUrl;
try {
  const out = execSync(
    `npx tsx scripts/check-supabase.ts`,
    { stdio: 'pipe' }
  );
  process.stdout.write(out.toString());
} catch (err) {
  process.stderr.write(err.stderr ? err.stderr.toString() : err.message);
  process.exit(err.status || 1);
}
