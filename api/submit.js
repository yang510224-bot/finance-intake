// api/submit.js — Vercel Serverless Function
// POST /api/submit — saves form data to Supabase, returns { id }

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const d = req.body

  const { data: row, error } = await supabase
    .from('finance_intakes_v2')
    .insert({
      // Basic info
      name:            d.name,
      gender:          d.gender,
      birthday:        d.birthday,
      city:            d.city,
      marital:         d.marital,
      children:        d.children,
      parents_alive:   d.parents_alive,
      has_dependent:   d.has_dependent,
      occupation:      d.occupation,
      income_range:    d.income_range,

      // Goals & Wishes
      top_goals:       d.top_goals  || [],
      wishes:          d.wishes     || [],
      wish_other:      d.wish_other || null,
      wish_timeline:   d.wish_timeline,

      // Retirement
      retirement_age:     Number(d.retirement_age)  || null,
      retirement_monthly: d.retirement_monthly,

      // Triangle
      expense_pct:    Number(d.expense_pct)    || 0,
      investment_pct: Number(d.investment_pct) || 0,
      protection_pct: Number(d.protection_pct) || 0,

      // Assets
      savings_range:  d.savings_range,
      stocks_range:   d.stocks_range,
      savings_policy: d.savings_policy || null,
      other_assets:   d.other_assets   || null,

      // Property
      has_property: !!d.has_property,
      properties:   d.properties || [],

      // Debt
      debt_types:   d.debt_types  || [],
      total_debt:   Number(d.total_debt)   || null,
      monthly_debt: Number(d.monthly_debt) || null,

      // Insurance
      has_life:          !!d.has_life,
      life_coverage:     d.life_coverage     || null,
      has_accident:      !!d.has_accident,
      accident_coverage: d.accident_coverage || null,
      has_ip:            !!d.has_ip,
      ip_coverage:       d.ip_coverage       || null,
      has_daily:         !!d.has_daily,
      daily_benefit:     d.daily_benefit     || null,
      has_disability:    !!d.has_disability,
      disability_coverage: d.disability_coverage || null,
      has_critical:      !!d.has_critical,
      critical_coverage: d.critical_coverage || null,
      has_ltc:           !!d.has_ltc,
      ltc_monthly:       d.ltc_monthly       || null,
      has_surgery:       !!d.has_surgery,
      surgery_coverage:  d.surgery_coverage  || null,
      monthly_premium:   Number(d.monthly_premium) || null,

      // Risk
      risk_attitude: d.risk_attitude,

      // Contact
      contact_name: d.contact_name,
      phone:        d.phone,
      line_id:      d.line_id || null,
    })
    .select('id')
    .single()

  if (error) {
    console.error('[submit] error:', error.message)
    return res.status(500).json({ error: error.message })
  }

  console.log('[submit] saved id =', row.id)
  return res.status(200).json({ id: row.id })
}
