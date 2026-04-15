import { useState } from 'react'
import { generateAndDownloadPdf } from '../lib/pdfGenerator'

export default function ReportPage() {
  const [data] = useState(() => JSON.parse(sessionStorage.getItem('intake_data') || '{}'))
  const [downloading, setDownloading] = useState(false)

  const handleDownload = async () => {
    setDownloading(true)
    try {
      await generateAndDownloadPdf(data)
    } catch (e) {
      console.error('PDF generation failed:', e)
    }
    setDownloading(false)
  }

  return (
    <div className="report-screen">
      <div className="report-card">
        <div className="report-icon">🎉</div>
        <h1 className="report-title">您的前置準備已完成</h1>
        <p className="report-body">
          請傳送 LINE 訊息給 Howard，告訴他您已完成問卷，我們將一起安排一次 20 分鐘的財務整聊通話。
        </p>
        <a href="https://lin.ee/6PIRaEp" target="_blank" rel="noopener noreferrer" className="btn-line">
          密 LINE@ Howard，預約 20 分鐘通話 →
        </a>
        <button className="btn-download" onClick={handleDownload} disabled={downloading}
          style={{ marginTop: '12px' }}>
          {downloading ? '產生中…' : '⬇ 下載我的前置報告 PDF'}
        </button>
      </div>
    </div>
  )
}
