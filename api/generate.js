// api/generate.js — Vercel Serverless Function (Node.js)
// POST /api/generate   body: { id }
//
// Called by ReportPage on mount when report_ready=false.
// Runs Claude synchronously (up to 300s), then updates Supabase.
// maxDuration tells Vercel to keep this lambda alive long enough.

import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

export const maxDuration = 300   // Vercel: allow up to 5 minutes

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const supabase  = createClient(
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

  const { id } = req.body
  if (!id) return res.status(400).json({ error: 'Missing id' })

  // ── Fetch the intake row ───────────────────────────────────────────────────
  const { data: row, error: fetchErr } = await supabase
    .from('finance_intakes')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchErr || !row) {
    console.error('[generate] Row not found:', id, fetchErr?.message)
    return res.status(404).json({ error: 'Row not found' })
  }

  // ── Already done — return early ───────────────────────────────────────────
  if (row.report_ready) {
    console.log('[generate] Already ready, skip:', id)
    return res.status(200).json({ ok: true, already: true })
  }

  // ── Call Claude ────────────────────────────────────────────────────────────
  console.log('[generate] Calling Claude for id =', id)
  try {
    const response = await anthropic.messages.create({
      model:      'claude-opus-4-6',
      max_tokens: 4096,
      system:     SYSTEM_PROMPT,
      messages:   [{ role: 'user', content: buildUserMessage(row) }],
    })

    const reportHtml = response.content
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('')

    console.log('[generate] Claude done, tokens =', response.usage?.output_tokens)

    // ── Save report to Supabase ───────────────────────────────────────────────
    const { error: updateErr } = await supabase
      .from('finance_intakes')
      .update({ report_html: reportHtml, report_ready: true })
      .eq('id', id)

    if (updateErr) {
      console.error('[generate] Update error:', updateErr.message)
      return res.status(500).json({ error: 'DB update failed' })
    }

    console.log('[generate] Report saved for id =', id)
    return res.status(200).json({ ok: true })

  } catch (err) {
    console.error('[generate] Claude error:', JSON.stringify({
      message: err?.message,
      status:  err?.status,
      error:   err?.error,
    }))
    return res.status(500).json({ error: 'Claude failed', detail: err?.message })
  }
}

// ── Build prompt from DB row ───────────────────────────────────────────────
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
