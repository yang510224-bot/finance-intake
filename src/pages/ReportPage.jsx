import { useState } from 'react'

export default function ReportPage() {
  const [data] = useState(() => JSON.parse(sessionStorage.getItem('intake_data') || '{}'))
  const [downloading, setDownloading] = useState(false)

  const today = new Date().toLocaleDateString('zh-TW', {
    year: 'numeric', month: '2-digit', day: '2-digit',
  })

  const age = data.birth_year ? new Date().getFullYear() - parseInt(data.birth_year) : '—'

  // ── Build PDF HTML string (no hidden DOM element needed) ──────────────────
  const buildPdfHtml = () => {
    const section = (title, rows) => `
      <div style="margin-bottom:20px;">
        <div style="font-size:14px;font-weight:700;color:#2C3E30;border-left:4px solid #D4AF37;padding-left:10px;margin-bottom:10px;">
          ${title}
        </div>
        <div style="padding-left:14px;font-size:13px;color:#333;line-height:2;">
          ${rows}
        </div>
      </div>`

    const propertyRows = !data.has_property || !data.properties?.length
      ? '房產：無'
      : data.properties.map((p, i) => `
          <div style="margin-bottom:6px;">
            <b>房產 ${i + 1}：${p.city || '—'}</b>
            <div style="padding-left:12px;">
              市值：${p.value ? p.value + ' 萬元' : '—'}<br/>
              貸款：${p.has_loan ? `有，餘額 ${p.loan_balance || '—'} 萬元，每月 ${p.monthly_payment || '—'} 元` : '無'}
            </div>
          </div>`).join('')

    const debtRows = data.debt_types?.includes('無負債')
      ? '無負債'
      : data.debt_types?.length
        ? `負債類型：${data.debt_types.join('、')}<br/>
           總負債金額：${data.total_debt ? data.total_debt + ' 萬元' : '—'}<br/>
           每月總還款：${data.monthly_debt ? data.monthly_debt + ' 元' : '—'}`
        : '未填寫'

    return `
      <div style="width:794px;background:#fff;color:#1a1a1a;font-family:Arial,'Microsoft JhengHei',sans-serif;padding:60px;box-sizing:border-box;font-size:13px;line-height:1.9;">

        <!-- Header -->
        <div style="border-bottom:3px solid #D4AF37;padding-bottom:16px;margin-bottom:28px;text-align:center;">
          <div style="font-size:22px;font-weight:700;color:#2C3E30;margin-bottom:6px;">財務整聊｜前置準備報告</div>
          <div style="font-size:14px;color:#555;">Howard 豪歐 × ${data.name || '—'}</div>
          <div style="font-size:12px;color:#888;margin-top:4px;">生成日期：${today}</div>
        </div>

        ${section('【基本資料】', `
          姓名：${data.name || '—'}<br/>
          生日：${data.birthday || '—'}（${age} 歲）<br/>
          地區：${data.city || '—'}<br/>
          職業：${data.occupation || '—'}<br/>
          月收入：${data.income_range || '—'}
        `)}

        ${section('【財務目標】', `
          最想解決的問題：${data.primary_goal || '—'}<br/>
          希望退休年齡：${data.retirement_age ? data.retirement_age + ' 歲' : '—'}<br/>
          退休後每月生活費：${data.retirement_monthly || '—'}
        `)}

        ${section('【收入分配（理財金三角）】', `
          生活支出：${data.expense_pct ?? '—'}%<br/>
          理財規劃：${data.investment_pct ?? '—'}%<br/>
          風險規劃：${data.protection_pct ?? '—'}%
        `)}

        ${section('【資產狀況】', propertyRows)}

        ${section('【負債狀況】', debtRows)}

        ${section('【保險配置】', `
          壽險：${data.has_life ? `有，保額 ${data.life_coverage ? data.life_coverage + ' 萬元' : '未填'}` : '無'}<br/>
          醫療險：${data.has_medical ? `有，每日住院 ${data.medical_daily ? data.medical_daily + ' 元' : '未填'}` : '無'}<br/>
          意外險：${data.has_accident ? `有，保額 ${data.accident_coverage ? data.accident_coverage + ' 萬元' : '未填'}` : '無'}<br/>
          重大傷病／癌症險：${data.has_critical ? `有，保額 ${data.critical_coverage ? data.critical_coverage + ' 萬元' : '未填'}` : '無'}<br/>
          每月總保費：${data.monthly_premium ? data.monthly_premium + ' 元' : '—'}
        `)}

        ${section('【投資風險偏好】', data.risk_attitude || '—')}

        ${section('【聯絡資料】', `
          姓名：${data.contact_name || data.name || '—'}<br/>
          電話：${data.phone || '—'}<br/>
          LINE ID：${data.line_id || '（未填）'}
        `)}

        <!-- Footer -->
        <div style="border-top:2px solid #D4AF37;padding-top:16px;margin-top:10px;font-size:12px;color:#444;text-align:center;">
          <div style="font-weight:700;margin-bottom:4px;">下一步：Howard 將於 24 小時內主動聯繫您安排通話</div>
          <div>LINE@：https://lin.ee/6PIRaEp</div>
          <div style="margin-top:6px;color:#888;">財務整聊｜Howard 豪歐</div>
        </div>

      </div>`
  }

  // ── PDF Download ───────────────────────────────────────────────────────────
  const handleDownload = async () => {
    setDownloading(true)
    try {
      const html2pdf = (await import('html2pdf.js')).default

      // Create a temporary container appended to body (NOT hidden/off-screen)
      // html2canvas requires the element to be in the normal rendering flow
      const container = document.createElement('div')
      container.innerHTML = buildPdfHtml()
      Object.assign(container.style, {
        position:   'absolute',
        top:        '0',
        left:       '0',
        zIndex:     '-1',
        opacity:    '0.01',   // near-invisible but still rendered by browser
        pointerEvents: 'none',
      })
      document.body.appendChild(container)

      const opt = {
        margin:     [0, 0, 0, 0],
        filename:   `財務整聊前置報告_${data.name || '用戶'}.pdf`,
        image:      { type: 'jpeg', quality: 0.98 },
        html2canvas:{ scale: 2, useCORS: true, logging: false, allowTaint: true },
        jsPDF:      { unit: 'mm', format: 'a4', orientation: 'portrait' },
      }

      await html2pdf().set(opt).from(container.firstElementChild).save()

      // Upload to Supabase storage (best-effort)
      try {
        const blob = await html2pdf().set(opt).from(container.firstElementChild).outputPdf('blob')
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

      document.body.removeChild(container)
    } catch (e) {
      console.error('PDF generation failed:', e)
    }
    setDownloading(false)
  }

  return (
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
          style={{ marginTop: '12px' }}
        >
          加入 Howard 的 LINE@ 保持聯繫
        </a>
      </div>
    </div>
  )
}
