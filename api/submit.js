// api/submit.js  — Vercel Serverless Function (Node.js)
// POST /api/submit
//
// Flow:
//   1. Insert form data into Supabase → get id
//   2. Return { id } to client IMMEDIATELY (so browser can redirect)
//   3. waitUntil: generate Claude report in background, then update DB
//
// Why waitUntil: Claude takes 30–90s. Vercel functions timeout at 10s (Hobby)
// or 60s (Pro) if we block the response. waitUntil keeps the lambda alive
// after res.end() without blocking the HTTP response.

import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import { waitUntil } from '@vercel/functions'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const SYSTEM_PROMPT = `你是 Howard 的財務整聊 AI 助理，專門為台灣中產階級提供深度財務診斷報告。
你的語氣：專業、溫暖、直白，不說廢話，不過度安慰。
輸出格式：完整的 HTML 片段（不含 <html>/<body> 標籤），使用以下 CSS class：
  .report-section, .report-title, .report-body, .highlight-red, .highlight-gold, .cta-block
報告結構：
1. 財務健康評分（0-100 分，附說明）
2. 三大風險警報（紅色 highlight）
3. 三項立即行動建議（金色 highlight）
4. 結語：預約 Howard 一對一整聊
語言：繁體中文，台灣用語。`

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const body = req.body

  // ── Step 1: Insert form data ──────────────────────────────────────────────
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
    console.error('[submit] Insert error:', insertErr)
    return res.status(500).json({ error: 'DB insert failed', detail: insertErr.message })
  }

  const id = row.id
  console.log('[submit] Row inserted, id =', id)

  // ── Step 2: Kick off Claude in background AFTER response is sent ──────────
  waitUntil(generateReport(id, body))

  // ── Step 3: Return id immediately so browser can redirect ────────────────
  return res.status(200).json({ id })
}

// ── Background: generate report + update DB ────────────────────────────────
async function generateReport(id, body) {
  console.log('[generate] Starting Claude for id =', id)
  try {
    const stream = await anthropic.messages.stream({
      model: 'claude-opus-4-6',
      max_tokens: 4096,
      thinking: { type: 'adaptive' },
      system: [
        {
          type: 'text',
          text: SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [{ role: 'user', content: buildUserMessage(body) }],
    })

    const finalMsg = await stream.finalMessage()
    const reportHtml = finalMsg.content
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('')

    const { error: updateErr } = await supabase
      .from('finance_intakes')
      .update({ report_html: reportHtml, report_ready: true })
      .eq('id', id)

    if (updateErr) {
      console.error('[generate] Update error:', updateErr)
    } else {
      console.log('[generate] Report saved, id =', id)
    }
  } catch (err) {
    console.error('[generate] Claude error for id =', id,
      JSON.stringify({ message: err?.message, status: err?.status, error: err?.error }))
  }
}

function buildUserMessage(d) {
  return `請為以下用戶生成財務診斷報告：

【個人基本資料】
姓名：${d.name || '匿名'}，年齡：${d.age} 歲，健康狀況：${d.health}

【家庭結構】
婚姻：${d.marital}，子女：${d.children} 人，扶養說明：${d.dependents || '無'}

【職業與收入】
職業：${d.occupation}，月收入：${d.income ? Number(d.income).toLocaleString() : '未填'} 元，收入類型：${d.income_type}

【現金流】
每月支出：${d.monthly_expense ? Number(d.monthly_expense).toLocaleString() : '未填'} 元
儲蓄率：${d.savings_rate || 0}%
緊急備用金：${d.emergency_months || 0} 個月

【負債結構】
房貸：${d.has_mortgage ? `是（每月 ${Number(d.mortgage_amt || 0).toLocaleString()} 元）` : '無'}
其他負債：${d.other_debt ? Number(d.other_debt).toLocaleString() + ' 元' : '無'}
備註：${d.debt_notes || '無'}

【保險配置】
壽險：${d.has_life ? '有' : '無'}，醫療險：${d.has_health ? '有' : '無'}，意外險：${d.has_accident ? '有' : '無'}
保障缺口：${d.insurance_gap || '用戶未填寫'}

請生成完整的 HTML 格式財務診斷報告。`
}
