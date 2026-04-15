-- ============================================================
-- finance_intakes_v2  (v3 schema — drop & recreate or ALTER)
-- Run in Supabase SQL Editor → Database → SQL Editor
-- ============================================================

-- Option A: Fresh setup (uncomment to drop existing table)
-- DROP TABLE IF EXISTS finance_intakes_v2;

CREATE TABLE IF NOT EXISTS finance_intakes_v2 (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at   timestamptz NOT NULL    DEFAULT now(),

  -- ── Block 1: Basic Info ────────────────────────────────
  name           text,
  gender         text,                  -- 男 / 女 / 其他
  birthday       text,                  -- YYYY/MM/DD
  city           text,
  marital        text,                  -- 單身 / 已婚 / 離婚或喪偶
  children       text,                  -- 無 / 1位 / 2位 / 3位以上
  parents_alive  text,                  -- 都健在 / 一位健在 / 都不在了
  has_dependent  text,                  -- 有 / 沒有
  occupation     text,
  income_range   text,

  -- ── Block 2: Goals & Wishes ───────────────────────────
  top_goals      jsonb        DEFAULT '[]',  -- [{key, rank}] sorted by rank
  wishes         text[]       DEFAULT '{}',
  wish_other     text,
  wish_timeline  text,                  -- 3年內 / 5年內 / 10年內 / 慢慢來沒關係

  -- ── Retirement ────────────────────────────────────────
  retirement_age     int,
  retirement_monthly text,

  -- ── Block 3: Financial Status ─────────────────────────
  -- Triangle
  expense_pct    int,
  investment_pct int,
  protection_pct int,

  -- Assets
  savings_range  text,         -- 50萬以下 / 50–100萬 / 100–300萬 / 300萬以上
  stocks_range   text,         -- 沒有 / 50萬以下 / 50–100萬 / 100萬以上
  savings_policy text,         -- free text or 不知道
  other_assets   text,

  -- Property
  has_property   boolean      DEFAULT false,
  properties     jsonb        DEFAULT '[]',  -- [{city, value, has_loan, loan_balance, monthly_payment}]

  -- Debt
  debt_types     text[]       DEFAULT '{}',
  total_debt     int,
  monthly_debt   int,

  -- Insurance (壽險 & 意外險)
  has_life           boolean  DEFAULT false,
  life_coverage      text,
  has_accident       boolean  DEFAULT false,
  accident_coverage  text,

  -- Insurance (醫療)
  has_ip             boolean  DEFAULT false,
  ip_coverage        text,
  has_daily          boolean  DEFAULT false,
  daily_benefit      text,
  has_disability     boolean  DEFAULT false,
  disability_coverage text,
  has_critical       boolean  DEFAULT false,
  critical_coverage  text,
  has_ltc            boolean  DEFAULT false,
  ltc_monthly        text,
  has_surgery        boolean  DEFAULT false,
  surgery_coverage   text,
  monthly_premium    int,

  -- Risk
  risk_attitude  text,

  -- ── Block 4: Contact ──────────────────────────────────
  contact_name   text,
  phone          text,
  line_id        text,

  -- Misc
  pdf_url        text
);

-- ── Row Level Security ────────────────────────────────────────
ALTER TABLE finance_intakes_v2 ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "anon insert v2"
    ON finance_intakes_v2 FOR INSERT TO anon WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "service role all v2"
    ON finance_intakes_v2 FOR ALL TO service_role USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "anon select v2"
    ON finance_intakes_v2 FOR SELECT TO anon USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── If upgrading from old v2 schema, run these ALTER statements ──
-- ALTER TABLE finance_intakes_v2 ADD COLUMN IF NOT EXISTS gender text;
-- ALTER TABLE finance_intakes_v2 ADD COLUMN IF NOT EXISTS marital text;
-- ALTER TABLE finance_intakes_v2 ADD COLUMN IF NOT EXISTS children text;
-- ALTER TABLE finance_intakes_v2 ADD COLUMN IF NOT EXISTS parents_alive text;
-- ALTER TABLE finance_intakes_v2 ADD COLUMN IF NOT EXISTS has_dependent text;
-- ALTER TABLE finance_intakes_v2 ADD COLUMN IF NOT EXISTS top_goals jsonb DEFAULT '[]';
-- ALTER TABLE finance_intakes_v2 ADD COLUMN IF NOT EXISTS wishes text[] DEFAULT '{}';
-- ALTER TABLE finance_intakes_v2 ADD COLUMN IF NOT EXISTS wish_other text;
-- ALTER TABLE finance_intakes_v2 ADD COLUMN IF NOT EXISTS wish_timeline text;
-- ALTER TABLE finance_intakes_v2 ADD COLUMN IF NOT EXISTS savings_range text;
-- ALTER TABLE finance_intakes_v2 ADD COLUMN IF NOT EXISTS stocks_range text;
-- ALTER TABLE finance_intakes_v2 ADD COLUMN IF NOT EXISTS savings_policy text;
-- ALTER TABLE finance_intakes_v2 ADD COLUMN IF NOT EXISTS other_assets text;
-- ALTER TABLE finance_intakes_v2 ADD COLUMN IF NOT EXISTS has_ip boolean DEFAULT false;
-- ALTER TABLE finance_intakes_v2 ADD COLUMN IF NOT EXISTS ip_coverage text;
-- ALTER TABLE finance_intakes_v2 ADD COLUMN IF NOT EXISTS has_daily boolean DEFAULT false;
-- ALTER TABLE finance_intakes_v2 ADD COLUMN IF NOT EXISTS daily_benefit text;
-- ALTER TABLE finance_intakes_v2 ADD COLUMN IF NOT EXISTS has_disability boolean DEFAULT false;
-- ALTER TABLE finance_intakes_v2 ADD COLUMN IF NOT EXISTS disability_coverage text;
-- ALTER TABLE finance_intakes_v2 ADD COLUMN IF NOT EXISTS has_ltc boolean DEFAULT false;
-- ALTER TABLE finance_intakes_v2 ADD COLUMN IF NOT EXISTS ltc_monthly text;
-- ALTER TABLE finance_intakes_v2 ADD COLUMN IF NOT EXISTS has_surgery boolean DEFAULT false;
-- ALTER TABLE finance_intakes_v2 ADD COLUMN IF NOT EXISTS surgery_coverage text;
-- ALTER TABLE finance_intakes_v2 ALTER COLUMN life_coverage TYPE text;
-- ALTER TABLE finance_intakes_v2 ALTER COLUMN accident_coverage TYPE text;
-- ALTER TABLE finance_intakes_v2 ALTER COLUMN critical_coverage TYPE text;

-- ── Supabase Storage (run once after creating 'reports' bucket) ──
-- create policy "anon upload reports"
--   on storage.objects for insert to anon
--   with check (bucket_id = 'reports');
-- create policy "service role all reports"
--   on storage.objects for all to service_role
--   using (bucket_id = 'reports');
