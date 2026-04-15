import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import BlurMask from '../components/BlurMask'

const POLL_INTERVAL = 4000   // poll every 4s
const MAX_POLLS     = 45     // up to 3 minutes

export default function ReportPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [report, setReport]       = useState(null)
  const [firstLoad, setFirstLoad] = useState(true)   // spinner before first fetch
  const [pollCount, setPollCount] = useState(0)
  const [timedOut, setTimedOut]   = useState(false)
  const [genError, setGenError]   = useState('')
  const generateCalled = useRef(false)               // call /api/generate only once

  // ── Fetch report from Supabase (via api/report) ───────────────────────────
  useEffect(() => {
    if (!id) { navigate('/'); return }

    fetch(`/api/report?id=${id}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        setReport(data)
        setFirstLoad(false)
      })
      .catch(() => setFirstLoad(false))
  }, [id, pollCount])

  // ── Trigger Claude generation once when report is not yet ready ───────────
  useEffect(() => {
    if (!id || !report || report.report_ready || generateCalled.current) return
    generateCalled.current = true

    console.log('[ReportPage] Triggering /api/generate for id =', id)
    fetch('/api/generate', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ id }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.error) {
          console.error('[ReportPage] generate error:', data.error, data.detail)
          setGenError(data.detail || data.error)
        } else {
          // Force one more poll to pick up the finished report
          setPollCount(c => c + 1)
        }
      })
      .catch(err => {
        console.error('[ReportPage] generate fetch failed:', err)
        setGenError('連線失敗，請重新整理頁面')
      })
  }, [id, report])

  // ── Keep polling until report_ready ──────────────────────────────────────
  useEffect(() => {
    if (report?.report_ready) return
    if (pollCount >= MAX_POLLS) { setTimedOut(true); return }
    const t = setTimeout(() => setPollCount(c => c + 1), POLL_INTERVAL)
    return () => clearTimeout(t)
  }, [report, pollCount])

  // ── First-load spinner ────────────────────────────────────────────────────
  if (firstLoad) {
    return (
      <div className="report-shell">
        <div className="card">
          <div className="loading-shell">
            <div className="spinner" />
            <p className="loading-title">載入中…</p>
          </div>
        </div>
      </div>
    )
  }

  // ── Row not found ─────────────────────────────────────────────────────────
  if (!report) {
    return (
      <div className="report-shell">
        <div className="card" style={{ textAlign: 'center' }}>
          <p style={{ color: '#dc2626' }}>找不到此報告，請確認連結是否正確。</p>
          <button className="btn btn-back" style={{ marginTop: 20 }} onClick={() => navigate('/')}>
            重新填寫
          </button>
        </div>
      </div>
    )
  }

  const name  = report.name || '你'
  const ready = report.report_ready

  const previewHtml = report.report_html || `
    <div class="report-section">
      <h2 class="report-title">財務健康評分</h2>
      <div class="report-body">
        <p>Howard 的 AI 助理正在分析你的財務狀況，通常需要 30–60 秒…</p>
      </div>
    </div>
    <div class="report-section">
      <h2 class="report-title">三大風險警報</h2>
      <div class="report-body">
        <p class="highlight-red">⚠️ 風險一：緊急備用金不足</p>
        <p class="highlight-red">⚠️ 風險二：保障缺口過大</p>
        <p class="highlight-red">⚠️ 風險三：現金流高度依賴單一收入</p>
      </div>
    </div>
    <div class="report-section">
      <h2 class="report-title">三項立即行動建議</h2>
      <div class="report-body">
        <p class="highlight-gold">✅ 行動一：建立 3–6 個月緊急備用金帳戶</p>
        <p class="highlight-gold">✅ 行動二：盤點現有保險保額是否覆蓋家庭支出</p>
        <p class="highlight-gold">✅ 行動三：與 Howard 進行一對一整聊，制定防禦架構</p>
      </div>
    </div>
    <div class="cta-block">
      <p>完整的防禦架構需要根據你的實際狀況量身規劃。</p>
      <a href="https://line.me/R/ti/p/%40fia8315s" target="_blank" rel="noopener noreferrer">
        ☕ 預約 Howard 一對一財務整聊 →
      </a>
    </div>
  `

  return (
    <div className="report-shell">
      <div className="report-card">

        <div className="brand" style={{ marginBottom: 24 }}>
          <div className="brand-title">財務整聊</div>
          <div className="brand-sub">HOWARD · FINANCIAL CONSULTING</div>
        </div>

        <h1 style={{ fontFamily: "'Noto Serif TC', serif", fontSize: '1.4rem', color: '#2C3E30', marginBottom: 6 }}>
          {name} 的財務診斷報告
        </h1>
        <p style={{ fontSize: '0.82rem', color: '#aaa', marginBottom: 16 }}>
          {new Date(report.created_at).toLocaleDateString('zh-TW')} 生成
        </p>

        {/* Status bar: generating */}
        {!ready && !timedOut && !genError && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: '#fffbe8', border: '1px solid #fcd34d',
            borderRadius: 8, padding: '10px 16px', marginBottom: 24,
            fontSize: '0.85rem', color: '#92400e',
          }}>
            <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2, margin: 0, flexShrink: 0 }} />
            AI 報告生成中，頁面每 4 秒自動更新…
          </div>
        )}

        {/* Error from generate */}
        {genError && (
          <div style={{
            background: '#fef2f2', border: '1px solid #f87171',
            borderRadius: 8, padding: '12px 16px', marginBottom: 24,
            fontSize: '0.85rem', color: '#b91c1c',
          }}>
            ⚠️ 報告生成失敗：{genError}。請重新整理頁面重試，或
            <a href="https://line.me/R/ti/p/%40fia8315s" target="_blank" rel="noopener noreferrer"
               style={{ color: '#b91c1c', marginLeft: 4 }}>
              直接聯絡 Howard →
            </a>
          </div>
        )}

        {/* Timed out */}
        {timedOut && !ready && !genError && (
          <div style={{
            background: '#fef2f2', border: '1px solid #f87171',
            borderRadius: 8, padding: '12px 16px', marginBottom: 24,
            fontSize: '0.85rem', color: '#b91c1c',
          }}>
            報告生成時間較長，請
            <button style={{ background: 'none', border: 'none', color: '#b91c1c',
              textDecoration: 'underline', cursor: 'pointer', padding: '0 4px' }}
              onClick={() => { setTimedOut(false); setPollCount(0) }}>
              點此重新整理
            </button>
            繼續等待。
          </div>
        )}

        <BlurMask locked={!ready}>
          <div className="report-content" dangerouslySetInnerHTML={{ __html: previewHtml }} />
        </BlurMask>

        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <button className="btn btn-back" onClick={() => navigate('/')} style={{ fontSize: '0.82rem' }}>
            ← 重新填寫
          </button>
        </div>

      </div>
    </div>
  )
}
