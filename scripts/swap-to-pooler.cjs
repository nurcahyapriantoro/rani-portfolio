const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf-8');
const supabaseLine = env.split(/\r?\n/).find((l) => l.startsWith('SUPABASE_DB_URL='));
const original = supabaseLine.replace(/^SUPABASE_DB_URL=/, '');
const match = original.match(/^postgresql:\/\/postgres:(.+)@([^:\/]+):(\d+)\/([^?]+)/);
if (!match) { console.error('Could not parse URL:', original); process.exit(1); }
const password = match[1];
const projectRef = 'fcjpldfigsovmovbrhdj';
const poolerUrl = `postgresql://postgres.${projectRef}:${password}@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1`;
const newEnv = env.replace(supabaseLine, 'SUPABASE_DB_URL=' + poolerUrl);
fs.writeFileSync('.env.local', newEnv);
console.log('OK pooler written (length ' + poolerUrl.length + ')');
