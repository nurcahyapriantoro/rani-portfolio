#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf-8');
const supabaseLine = env
  .split(/\r?\n/)
  .find((l) => l.startsWith('SUPABASE_DB_URL=') || l.startsWith('SUPABASE='));
const original = supabaseLine.replace(/^SUPABASE(_DB_URL)?=/, '');
const match = original.match(/^postgresql:\/\/postgres:(.*?)@(.*?)$/);
const password = match[1];
const projectRef = 'fcjpldfigsovmovbrhdj';
const poolerUrl = `postgresql://postgres.${projectRef}:${password}@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1`;
const vercelTokenLine = env.split(/\r?\n/).find((l) => l.startsWith('TOKEN_VERCEL_SECRET='));
if (!vercelTokenLine) {
  throw new Error('TOKEN_VERCEL_SECRET is required in .env.local');
}
const vercelToken = vercelTokenLine.replace(/^TOKEN_VERCEL_SECRET=/, '');
process.env.SUPABASE_DB_URL = poolerUrl;
process.env.VERCEL_TOKEN = vercelToken;

function run(cmd, input) {
  if (input !== undefined) {
    execSync(cmd, { stdio: ['pipe', 'inherit', 'inherit'], input });
  } else {
    execSync(cmd, { stdio: 'inherit' });
  }
}

try {
  run('vercel env rm SUPABASE_DB_URL production --project rani-portfolio --scope cahyos-projects-f6bc3e17 --token %VERCEL_TOKEN% --yes', null);
  run('npx vercel env add SUPABASE_DB_URL production --project rani-portfolio --scope cahyos-projects-f6bc3e17 --token %VERCEL_TOKEN%', poolerUrl);
  run('vercel deploy --prod --project rani-portfolio --scope cahyos-projects-f6bc3e17 --token %VERCEL_TOKEN% --yes', null);
} catch (err) {
  process.exit(err.status || 1);
}
