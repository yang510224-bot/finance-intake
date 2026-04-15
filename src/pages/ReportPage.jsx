import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import BlurMask from '../components/BlurMask'

export default function ReportPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [poll, setPoll] = useState(0)

  useEffect(() => {
    if (!id) return navigate('/')

    const fetchReport = async () => {
      try {
        const res = await fetch(`/api/report?id=${id}`)
        if (!res.ok) { setLoading(false); return }
        const data = await res.json()
        setReport(data)
        setLoading(false)
      } catch {
        setLoading(false)
      }
    }

    fetchReport()
  }, [id, poll])

  // Poll every 5s until report is ready (max 12 retries = 60s)
  useEffect(() => {
    if (report?.report_ready) return
    if (poll >= 12) return
    const timer = setTimeout(() => setPoll(p => p + 1), 5000)
    return () => clearTimeout(timer)
  }, [report, poll])

  if (loading) {
    return (
      <div className="report-shell">
        <div className="card">
          <div className="loading-shell">
            <div className="spinner" />
            <p className="loading-title">報告生成中…</p>
            <p className="loading-sub">通常需要 20–40 秒，請稍候</p>
          </div>
        </div>
      </div>
    )
  }

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

  const name = report.name || '你'
  const ready = report.report_ready

  // Fallback placeholder while still generating
  const previewHtml = report.report_html || `
    <div class="report-section">
      <h2 class="report-title">財務健康評分</h2>
      <div class="report-body">
        <p>根據你填寫的資料，Howard 的 AI 助理正在計算你的財務健康評分…</p>
        <p>你的月收入、支出比例、保障配置與負債結構都已列入考量。</p>
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
      <p>這份報告只是診斷的開始。完整的防禦架構需要根據你的實際狀況量身規劃。</p>
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

        <h1 style={{
          fontFamily: "'Noto Serif TC', serif",
          fontSize: '1.4rem',
          color: '#2C3E30',
          marginBottom: 6,
        }}>
          {name} 的財務診斷報告
        </h1>
        <p style={{ fontSize: '0.82rem', color: '#aaa', marginBottom: 32 }}>
          {new Date(report.created_at).toLocaleDateString('zh-TW')} 生成
          {!ready && ' · 報告仍在生成中，頁面將自動更新…'}
        </p>

        <BlurMask locked={!ready}>
          <div
            className="report-content"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        </BlurMask>

        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <button
            className="btn btn-back"
            onClick={() => navigate('/')}
            style={{ fontSize: '0.82rem' }}
          >
            ← 重新填寫
          </button>
        </div>
      </div>
    </div>
  )
}
