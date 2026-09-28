-- Supabase / Postgres schema for Rani portfolio CMS
-- One row per (locale, section) keyed JSON payload.
--
-- RLS policies that reference `auth.role()` were intentionally removed: that
-- schema is Supabase-specific and trips "schema 'auth' does not exist" on plain
-- Postgres (Neon, Vercel Postgres, self-hosted). The connection used by the
-- app is the table owner (`neondb_owner` / `postgres`), which bypasses RLS, so
-- no extra policy is needed. If you ever wire this to Supabase Auth with a
-- non-owner role, add policies referencing `auth.role()` in a separate
-- migration.

create table if not exists portfolio_content (
  locale text not null,
  section text not null,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (locale, section)
);

create index if not exists portfolio_content_locale_idx
  on portfolio_content (locale);

create table if not exists portfolio_assets (
  id uuid primary key default gen_random_uuid(),
  section text not null,
  filename text not null,
  url text not null,
  content_type text,
  size bigint,
  created_at timestamptz not null default now()
);

create index if not exists portfolio_assets_section_idx
  on portfolio_assets (section, created_at desc);
