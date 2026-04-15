// api/report.js  — Vercel Serverless Function (Node.js)
// GET /api/report?id=<uuid>
// Returns report data for a given intake ID

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { id } = req.query
  if (!id) return res.status(400).json({ error: 'Missing id' })

  const { data, error } = await supabase
    .from('finance_intakes')
    .select('id, name, created_at, report_html, report_ready')
    .eq('id', id)
    .single()

  if (error || !data) {
    return res.status(404).json({ error: 'Not found' })
  }

  return res.status(200).json(data)
}
