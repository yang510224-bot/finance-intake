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
      name:              d.name,
      birthday:          d.birthday,
      city:              d.city,
      occupation:        d.occupation,
      income_range:      d.income_range,
      primary_goal:      d.primary_goal,
      retirement_age:    Number(d.retirement_age) || null,
      retirement_monthly:d.retirement_monthly,
      expense_pct:       Number(d.expense_pct) || 0,
      investment_pct:    Number(d.investment_pct) || 0,
      protection_pct:    Number(d.protection_pct) || 0,
      has_property:      !!d.has_property,
      properties:        d.properties || [],
      debt_types:        d.debt_types || [],
      total_debt:        Number(d.total_debt) || null,
      monthly_debt:      Number(d.monthly_debt) || null,
      has_life:          !!d.has_life,
      life_coverage:     Number(d.life_coverage) || null,
      has_medical:       !!d.has_medical,
      medical_daily:     Number(d.medical_daily) || null,
      has_accident:      !!d.has_accident,
      accident_coverage: Number(d.accident_coverage) || null,
      has_critical:      !!d.has_critical,
      critical_coverage: Number(d.critical_coverage) || null,
      monthly_premium:   Number(d.monthly_premium) || null,
      risk_attitude:     d.risk_attitude,
      contact_name:      d.contact_name,
      phone:             d.phone,
      line_id:           d.line_id,
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
