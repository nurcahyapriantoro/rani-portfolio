// One-off seed: copies content/en.json into Postgres so the live site has
// data to render after switching from the filesystem backend.
//
// Idempotent: every row is upserted with `on conflict (locale, section) do update`.

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function main() {
  const url = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;
  if (!url) {
    console.error('Missing DATABASE_URL / SUPABASE_DB_URL env var');
    process.exit(1);
  }

  const enPath = path.join(__dirname, '..', 'content', 'en.json');
  const en = JSON.parse(fs.readFileSync(enPath, 'utf-8'));

  const client = new Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
    statement_timeout: 15000,
    query_timeout: 15000
  });

  try {
    await client.connect();
    console.log('Connected to Postgres.');

    let count = 0;
    for (const [section, data] of Object.entries(en)) {
      await client.query(
        `insert into portfolio_content (locale, section, data)
         values ($1, $2, $3::jsonb)
         on conflict (locale, section)
         do update set data = excluded.data, updated_at = now()`,
        ['en', section, JSON.stringify(data)]
      );
      count++;
      console.log(`  upserted: ${section}`);
    }

    console.log(`Seed complete: ${count} sections written to portfolio_content for locale "en".`);

    const verify = await client.query(
      "select section from portfolio_content where locale = $1 order by section",
      ['en']
    );
    console.log('Sections now in DB:', verify.rows.map((r) => r.section).join(', '));
  } catch (e) {
    console.error('Seed failed:', e.message);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

main();
