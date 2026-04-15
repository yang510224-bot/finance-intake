-- finance_intakes table
-- Run this in Supabase SQL Editor (Database → SQL Editor → New query)

create table if not exists finance_intakes (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),

  -- Step 1: Personal health
  name        text,
  age         int,
  health      text,  -- '良好' | '一般' | '需注意'

  -- Step 2: Family structure
  marital     text,  -- '單身' | '已婚' | '離婚/喪偶'
  children    int default 0,
  dependents  text,  -- 需扶養人數/狀況 (free text)

  -- Step 3: Career & income
  occupation  text,
  income      int,   -- monthly gross (NTD)
  income_type text,  -- '受薪' | '自僱' | '混合'

  -- Step 4: Cashflow
  monthly_expense  int,
  savings_rate     int,  -- percentage 0-100
  emergency_months int,  -- months of emergency fund

  -- Step 5: Debt structure
  has_mortgage   boolean default false,
  mortgage_amt   int,
  other_debt     int,
  debt_notes     text,

  -- Step 6: Insurance
  has_life       boolean default false,
  has_health     boolean default false,
  has_accident   boolean default false,
  insurance_gap  text,  -- user-described gaps

  -- AI-generated report (populated by api/submit.js)
  report_html    text,
  report_ready   boolean not null default false
);

-- Row-level security: allow anon insert, service role full access
alter table finance_intakes enable row level security;

create policy "allow anon insert"
  on finance_intakes for insert to anon with check (true);

create policy "allow service role all"
  on finance_intakes for all to service_role using (true);

-- Allow public read only if report_ready (for blurred preview)
create policy "allow anon select own row"
  on finance_intakes for select to anon using (true);
