import { useState } from 'react'

export default function ReportPage() {
  const [data] = useState(() => JSON.parse(sessionStorage.getItem('intake_data') || '{}'))
  const [downloading, setDownloading] = useState(false)

  const today = new Date().toLocaleDateString('zh-TW', {
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).replace(/\//g, '/')

  const age = data.birth_year ? new Date().getFullYear() - parseInt(data.birth_year) : '—'

  const handleDownload = async () => {
    setDownloading(true)
    const element = document.getElementById('pdf-template')
    const html2pdf = (await import('html2pdf.js')).default
    const opt = {
      margin: 0,
      filename: `財務整聊前置報告_${data.name || '用戶'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    }

    await html2pdf().set(opt).from(element).save()

    try {
      const blob = await html2pdf().set(opt).from(element).outputPdf('blob')
      const { createClient } = await import('@supabase/supabase-js')
      const sb = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY
      )
      await sb.storage.from('reports').upload(
        `${data.id}/report.pdf`,
        blob,
        { contentType: 'application/pdf', upsert: true }
      )
    } catch (e) {
      console.error('Storage upload failed:', e)
    }

    setDownloading(false)
  }

  return (
    <>
      {/* Visible report page */}
      <div className="report-screen">
        <div className="report-card">
          <div className="report-icon">🙏</div>
          <h1 className="report-title">Howard 已收到您的資料</h1>
          <p className="report-body">
            感謝您完成這份前置準備。根據您填寫的內容，Howard 將在 24 小時內主動與您聯繫，安排一對一的財務整聊通話。在通話中，我們會一起討論您的財務目標，並為您規劃最適合的方向。
          </p>
          <button
            className="btn-download"
            onClick={handleDownload}
            disabled={downloading}
          >
            {downloading ? '產生中…' : '⬇ 下載我的前置報告 PDF'}
          </button>
          <a
            href="https://lin.ee/6PIRaEp"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-line"
          >
            加入 Howard 的 LINE@ 保持聯繫
          </a>
        </div>
      </div>

      {/* Hidden PDF template */}
      <div
        className="pdf-template"
        id="pdf-template"
        style={{
          position: 'fixed',
          left: '-9999px',
          top: 0,
          width: '210mm',
          background: '#fff',
          color: '#1a1a1a',
          fontFamily: 'Arial, "Microsoft JhengHei", sans-serif',
          padding: '20mm',
          boxSizing: 'border-box',
          fontSize: '13px',
          lineHeight: 1.8,
        }}
      >
        {/* PDF Header */}
        <div style={{
          borderBottom: '3px solid #D4AF37',
          paddingBottom: '12px',
          marginBottom: '20px',
        }}>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#2C3E30', marginBottom: '4px' }}>
            財務整聊｜前置準備報告
          </div>
          <div style={{ fontSize: '14px', color: '#555' }}>
            Howard 豪歐 × {data.name || '—'}
          </div>
          <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
            生成日期：{today}
          </div>
        </div>

        {/* 基本資料 */}
        <div style={{ marginBottom: '18px' }}>
          <div style={{
            fontSize: '14px', fontWeight: 700,
            color: '#2C3E30', borderLeft: '4px solid #D4AF37',
            paddingLeft: '10px', marginBottom: '8px',
          }}>
            【基本資料】
          </div>
          <div style={{ paddingLeft: '14px' }}>
            <div>姓名：{data.name || '—'}</div>
            <div>生日：{data.birthday || '—'}（{age} 歲）</div>
            <div>地區：{data.city || '—'}</div>
            <div>職業：{data.occupation || '—'}</div>
            <div>月收入：{data.income_range || '—'}</div>
          </div>
        </div>

        {/* 財務目標 */}
        <div style={{ marginBottom: '18px' }}>
          <div style={{
            fontSize: '14px', fontWeight: 700,
            color: '#2C3E30', borderLeft: '4px solid #D4AF37',
            paddingLeft: '10px', marginBottom: '8px',
          }}>
            【財務目標】
          </div>
          <div style={{ paddingLeft: '14px' }}>
            <div>最想解決的問題：{data.primary_goal || '—'}</div>
            <div>希望退休年齡：{data.retirement_age ? `${data.retirement_age} 歲` : '—'}</div>
            <div>退休後每月生活費：{data.retirement_monthly || '—'}</div>
          </div>
        </div>

        {/* 理財金三角 */}
        <div style={{ marginBottom: '18px' }}>
          <div style={{
            fontSize: '14px', fontWeight: 700,
            color: '#2C3E30', borderLeft: '4px solid #D4AF37',
            paddingLeft: '10px', marginBottom: '8px',
          }}>
            【收入分配（理財金三角）】
          </div>
          <div style={{ paddingLeft: '14px' }}>
            <div>生活支出：{data.expense_pct ?? '—'}%</div>
            <div>理財規劃：{data.investment_pct ?? '—'}%</div>
            <div>風險規劃：{data.protection_pct ?? '—'}%</div>
          </div>
        </div>

        {/* 資產狀況 */}
        <div style={{ marginBottom: '18px' }}>
          <div style={{
            fontSize: '14px', fontWeight: 700,
            color: '#2C3E30', borderLeft: '4px solid #D4AF37',
            paddingLeft: '10px', marginBottom: '8px',
          }}>
            【資產狀況】
          </div>
          <div style={{ paddingLeft: '14px' }}>
            {!data.has_property || !data.properties || data.properties.length === 0 ? (
              <div>房產：無</div>
            ) : (
              data.properties.map((prop, idx) => (
                <div key={idx} style={{ marginBottom: '6px' }}>
                  <div style={{ fontWeight: 600 }}>房產 {idx + 1}：{prop.city || '—'}</div>
                  <div style={{ paddingLeft: '12px' }}>
                    <div>市值：{prop.value ? `${prop.value} 萬元` : '—'}</div>
                    <div>
                      貸款：{prop.has_loan
                        ? `有，餘額 ${prop.loan_balance || '—'} 萬元，每月 ${prop.monthly_payment || '—'} 元`
                        : '無'}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 負債狀況 */}
        <div style={{ marginBottom: '18px' }}>
          <div style={{
            fontSize: '14px', fontWeight: 700,
            color: '#2C3E30', borderLeft: '4px solid #D4AF37',
            paddingLeft: '10px', marginBottom: '8px',
          }}>
            【負債狀況】
          </div>
          <div style={{ paddingLeft: '14px' }}>
            {data.debt_types && data.debt_types.includes('無負債') ? (
              <div>無負債</div>
            ) : data.debt_types && data.debt_types.length > 0 ? (
              <>
                <div>負債類型：{data.debt_types.join('、')}</div>
                <div>總負債金額：{data.total_debt ? `${data.total_debt} 萬元` : '—'}</div>
                <div>每月總還款：{data.monthly_debt ? `${data.monthly_debt} 元` : '—'}</div>
              </>
            ) : (
              <div>未填寫</div>
            )}
          </div>
        </div>

        {/* 保險配置 */}
        <div style={{ marginBottom: '18px' }}>
          <div style={{
            fontSize: '14px', fontWeight: 700,
            color: '#2C3E30', borderLeft: '4px solid #D4AF37',
            paddingLeft: '10px', marginBottom: '8px',
          }}>
            【保險配置】
          </div>
          <div style={{ paddingLeft: '14px' }}>
            <div>
              壽險：{data.has_life
                ? `有，保額 ${data.life_coverage ? `${data.life_coverage} 萬元` : '未填'}`
                : '無'}
            </div>
            <div>
              醫療險：{data.has_medical
                ? `有，每日住院給付 ${data.medical_daily ? `${data.medical_daily} 元` : '未填'}`
                : '無'}
            </div>
            <div>
              意外險：{data.has_accident
                ? `有，保額 ${data.accident_coverage ? `${data.accident_coverage} 萬元` : '未填'}`
                : '無'}
            </div>
            <div>
              重大傷病／癌症險：{data.has_critical
                ? `有，保額 ${data.critical_coverage ? `${data.critical_coverage} 萬元` : '未填'}`
                : '無'}
            </div>
            <div>每月總保費：{data.monthly_premium ? `${data.monthly_premium} 元` : '—'}</div>
          </div>
        </div>

        {/* 投資風險偏好 */}
        <div style={{ marginBottom: '18px' }}>
          <div style={{
            fontSize: '14px', fontWeight: 700,
            color: '#2C3E30', borderLeft: '4px solid #D4AF37',
            paddingLeft: '10px', marginBottom: '8px',
          }}>
            【投資風險偏好】
          </div>
          <div style={{ paddingLeft: '14px' }}>
            <div>{data.risk_attitude || '—'}</div>
          </div>
        </div>

        {/* 聯絡資料 */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{
            fontSize: '14px', fontWeight: 700,
            color: '#2C3E30', borderLeft: '4px solid #D4AF37',
            paddingLeft: '10px', marginBottom: '8px',
          }}>
            【聯絡資料】
          </div>
          <div style={{ paddingLeft: '14px' }}>
            <div>姓名：{data.contact_name || data.name || '—'}</div>
            <div>電話：{data.phone || '—'}</div>
            <div>LINE ID：{data.line_id || '（未填）'}</div>
          </div>
        </div>

        {/* PDF Footer */}
        <div style={{
          borderTop: '2px solid #D4AF37',
          paddingTop: '14px',
          marginTop: '10px',
          fontSize: '12px',
          color: '#444',
          textAlign: 'center',
        }}>
          <div style={{ fontWeight: 600, marginBottom: '4px' }}>
            下一步：Howard 將於 24 小時內主動聯繫您安排通話
          </div>
          <div>LINE@：https://lin.ee/6PIRaEp</div>
          <div style={{ marginTop: '6px', color: '#888' }}>財務整聊｜Howard 豪歐</div>
        </div>
      </div>
    </>
  )
}
