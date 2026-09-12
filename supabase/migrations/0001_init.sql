-- Supabase / Postgres schema for Rani portfolio CMS
-- One row per (locale, section) keyed JSON payload.

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

alter table portfolio_content enable row level security;
alter table portfolio_assets enable row level security;

drop policy if exists "service_role_all" on portfolio_content;
drop policy if exists "service_role_all" on portfolio_assets;

create policy "service_role_all" on portfolio_content
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

create policy "service_role_all" on portfolio_assets
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
