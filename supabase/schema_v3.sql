-- ============================================================
-- finance_intakes_v3
-- 在 Supabase SQL Editor 貼上全文執行
-- ============================================================

create table if not exists finance_intakes_v3 (
  id                  uuid primary key default gen_random_uuid(),
  created_at          timestamptz not null default now(),

  -- Block 1: 個人基本資料
  name                text,
  gender              text,
  birthday            text,
  city                text,
  marital_status      text,
  children_count      text,
  parents_alive       text,
  has_caregiver       boolean,
  occupation          text,
  income_range        text,

  -- Block 2: 財務目標與夢想
  -- financial_goals 格式: [{key: text, rank: int}]
  financial_goals     jsonb    default '[]',
  life_wishes         text[]   default '{}',
  life_wishes_other   text,
  wish_timeline       text,
  retirement_age      int,
  retirement_monthly  text,

  -- Block 3: 財務現況
  expense_pct         int,
  investment_pct      int,
  protection_pct      int,

  -- 資產
  savings_range       text,
  stock_range         text,
  savings_policy      text,
  other_assets        text,

  -- 房產
  has_property        boolean  default false,
  -- properties 格式: [{city, value, has_loan, loan_balance, monthly_payment}]
  properties          jsonb    default '[]',

  -- 負債
  debt_types          text[]   default '{}',
  total_debt          int,
  monthly_debt        int,

  -- 保險：壽險與意外險（coverage 用 text 支援填「不知道」）
  has_life            boolean  default false,
  life_coverage       text,
  has_accident        boolean  default false,
  accident_coverage   text,

  -- 保險：醫療相關六項
  has_reimbursement   boolean  default false,
  reimbursement_limit text,
  has_daily_hospital  boolean  default false,
  daily_hospital      text,
  has_disability      boolean  default false,
  disability_coverage text,
  has_critical        boolean  default false,
  critical_coverage   text,
  has_ltc             boolean  default false,
  ltc_monthly         text,
  has_surgery         boolean  default false,
  surgery_coverage    text,
  monthly_premium     int,

  -- 風險偏好
  risk_attitude       text,

  -- Block 4: 聯絡資料
  contact_name        text,
  phone               text,
  line_id             text,

  -- PDF 儲存網址（選用）
  pdf_url             text
);

-- Row-Level Security
alter table finance_intakes_v3 enable row level security;

create policy "anon insert v3"
  on finance_intakes_v3 for insert to anon with check (true);

create policy "service role all v3"
  on finance_intakes_v3 for all to service_role using (true);

create policy "anon select v3"
  on finance_intakes_v3 for select to anon using (true);
