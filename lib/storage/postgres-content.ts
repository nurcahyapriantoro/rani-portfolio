import type { ContentStorage, ContentShape, Locale } from './types';

function isPoolerUrl(url: string): boolean {
  return url.includes('pooler.supabase.com') || url.includes('pgbouncer=true');
}

let poolPromise: Promise<import('pg').Pool> | null = null;

async function getPool(): Promise<import('pg').Pool> {
  if (poolPromise) return poolPromise;
  poolPromise = (async () => {
    const connectionString =
      process.env.SUPABASE_DB_URL || process.env.DATABASE_URL || '';
    if (!connectionString) {
      throw new Error('Supabase Postgres is not configured (missing SUPABASE_DB_URL)');
    }
    const pg = await import('pg');
    const Pool = pg.Pool;
    const pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 1,
      statement_timeout: 5000,
      query_timeout: 5000,
      application_name: isPoolerUrl(connectionString)
        ? 'rani-portfolio-pooler'
        : 'rani-portfolio'
    });
    return pool;
  })();
  return poolPromise;
}

async function query<T = unknown>(sql: string, params: unknown[] = []): Promise<T[]> {
  const pool = await getPool();
  try {
    const res = await pool.query(sql, params);
    return res.rows as T[];
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[postgres] query failed', { sql, message });
    throw err;
  }
}

export class PostgresContentStorage implements ContentStorage {
  async readContent(locale: Locale): Promise<ContentShape> {
    const rows = await query<{ section: string; data: unknown }>(
      'select section, data from portfolio_content where locale = $1 order by section',
      [locale]
    );
    const result: ContentShape = {};
    for (const row of rows) {
      result[row.section] = row.data;
    }
    return result;
  }

  private async healthcheck(): Promise<void> {
    await query('select 1');
  }

  async writeContent(locale: Locale, data: ContentShape): Promise<void> {
    const pool = await getPool();
    const client = await pool.connect();
    try {
      await client.query('begin');
      await client.query('delete from portfolio_content where locale = $1', [locale]);
      for (const [section, value] of Object.entries(data)) {
        await client.query(
          `insert into portfolio_content (locale, section, data)
           values ($1, $2, $3::jsonb)
           on conflict (locale, section)
           do update set data = excluded.data, updated_at = now()`,
          [locale, section, JSON.stringify(value)]
        );
      }
      await client.query('commit');
    } catch (err) {
      await client.query('rollback');
      throw err;
    } finally {
      client.release();
    }
  }

  async updateSection(locale: Locale, key: string, data: unknown): Promise<{ success: true }> {
    await query(
      `insert into portfolio_content (locale, section, data)
       values ($1, $2, $3::jsonb)
       on conflict (locale, section)
       do update set data = excluded.data, updated_at = now()`,
      [locale, key, JSON.stringify(data)]
    );
    return { success: true };
  }
}
