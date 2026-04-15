-- finance_intakes_v2
-- Run in Supabase SQL Editor

create table if not exists finance_intakes_v2 (
  id                 uuid primary key default gen_random_uuid(),
  created_at         timestamptz not null default now(),

  -- Basic info
  name               text,
  birthday           text,
  city               text,
  occupation         text,
  income_range       text,

  -- Goals
  primary_goal       text,
  retirement_age     int,
  retirement_monthly text,

  -- Triangle
  expense_pct        int,
  investment_pct     int,
  protection_pct     int,

  -- Property
  has_property       boolean default false,
  properties         jsonb default '[]',

  -- Debt
  debt_types         text[] default '{}',
  total_debt         int,
  monthly_debt       int,

  -- Insurance
  has_life           boolean default false,
  life_coverage      int,
  has_medical        boolean default false,
  medical_daily      int,
  has_accident       boolean default false,
  accident_coverage  int,
  has_critical       boolean default false,
  critical_coverage  int,
  monthly_premium    int,

  -- Risk
  risk_attitude      text,

  -- Contact
  contact_name       text,
  phone              text,
  line_id            text,

  -- PDF
  pdf_url            text
);

alter table finance_intakes_v2 enable row level security;

create policy "anon insert v2"
  on finance_intakes_v2 for insert to anon with check (true);

create policy "service role all v2"
  on finance_intakes_v2 for all to service_role using (true);

create policy "anon select v2"
  on finance_intakes_v2 for select to anon using (true);

-- ── Supabase Storage setup ──────────────────────────────────────────────────
-- 1. Go to Supabase Dashboard → Storage → New Bucket
-- 2. Name: "reports", Public: OFF
-- 3. Run these policies:

-- (After creating bucket, run in SQL Editor:)
-- create policy "anon upload reports"
--   on storage.objects for insert to anon
--   with check (bucket_id = 'reports');
--
-- create policy "service role all reports"
--   on storage.objects for all to service_role
--   using (bucket_id = 'reports');
