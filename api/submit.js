// api/submit.js — Vercel Serverless Function (Node.js)
// POST /api/submit
// Inserts form data into Supabase and returns { id }.
// Claude report generation is triggered separately by api/generate.js.

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const body = req.body

  const { data: row, error: insertErr } = await supabase
    .from('finance_intakes')
    .insert({
      name:             body.name,
      age:              Number(body.age) || null,
      health:           body.health,
      marital:          body.marital,
      children:         Number(body.children) || 0,
      dependents:       body.dependents,
      occupation:       body.occupation,
      income:           Number(body.income) || null,
      income_type:      body.income_type,
      monthly_expense:  Number(body.monthly_expense) || null,
      savings_rate:     Number(body.savings_rate) || null,
      emergency_months: Number(body.emergency_months) || null,
      has_mortgage:     !!body.has_mortgage,
      mortgage_amt:     Number(body.mortgage_amt) || null,
      other_debt:       Number(body.other_debt) || null,
      debt_notes:       body.debt_notes,
      has_life:         !!body.has_life,
      has_health:       !!body.has_health,
      has_accident:     !!body.has_accident,
      insurance_gap:    body.insurance_gap,
      report_ready:     false,
    })
    .select('id')
    .single()

  if (insertErr) {
    console.error('[submit] Insert error:', insertErr.message)
    return res.status(500).json({ error: 'DB insert failed', detail: insertErr.message })
  }

  console.log('[submit] Row inserted, id =', row.id)
  return res.status(200).json({ id: row.id })
}
