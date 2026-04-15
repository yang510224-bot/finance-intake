const GOAL_LABELS = {
  medical:   '🏥 醫療保障',
  family:    '🏠 家庭保障',
  education: '🎓 子女教育',
  freedom:   '💰 財務自由',
  legacy:    '🏛️ 資產傳承',
}

const WISH_LABELS = {
  house:        '🏠 擁有自己的房子',
  car:          '🚗 換一台夢想中的車',
  travel:       '✈️ 環遊世界／出國長住',
  family_life:  '👨‍👩‍👧 給家人更好的生活',
  edu:          '🎓 孩子的教育無後顧之憂',
  business:     '💼 創業或實現事業夢想',
  early_retire: '🌅 提早退休，不再為錢工作',
  retire_safe:  '👴 退休後生活無虞，不依賴子女',
  legacy:       '💝 留一筆資產給最愛的人',
}

export const generateAndDownloadPdf = async (data) => {
  const today = new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' })
  const age = data.birth_year ? new Date().getFullYear() - parseInt(data.birth_year) : '—'

  const topGoalsText = data.top_goals?.length
    ? data.top_goals
        .slice().sort((a, b) => a.rank - b.rank)
        .map(g => `第 ${g.rank} 優先：${GOAL_LABELS[g.key] || g.key}`)
        .join('<br/>')
    : '—'

  const wishesText = [
    ...(data.wishes?.map(w => WISH_LABELS[w] || w) || []),
    ...(data.wish_other ? [`✍️ ${data.wish_other}`] : []),
  ].join('、') || '—'

  /* ── PDF HTML builder ─────────────────────────────────────────── */
  const section = (title, content) => `
    <div style="margin-bottom:20px;">
      <div style="border-left:4px solid #D4AF37;padding:5px 0 5px 14px;margin-bottom:10px;background:rgba(212,175,55,0.06);">
        <span style="font-size:13px;font-weight:700;color:#2C3E30;letter-spacing:1px;">${title}</span>
      </div>
      <div style="padding-left:18px;font-size:12px;color:#333;line-height:2.2;">${content}</div>
    </div>`

  const header = () => `
    <div style="background:#2C3E30;padding:28px 48px 20px;text-align:center;border-bottom:4px solid #D4AF37;">
      <div style="font-size:19px;font-weight:700;color:#D4AF37;letter-spacing:2px;margin-bottom:6px;">財務整聊｜前置準備報告</div>
      <div style="font-size:13px;color:rgba(255,255,255,0.85);">Howard 豪歐 × ${data.name || '—'}</div>
      <div style="font-size:11px;color:rgba(255,255,255,0.5);margin-top:4px;">生成日期：${today}</div>
    </div>`

  const footer = () => `
    <div style="background:#2C3E30;padding:14px 48px;text-align:center;border-top:3px solid #D4AF37;margin-top:auto;">
      <div style="font-size:11px;color:#D4AF37;font-weight:700;margin-bottom:4px;">請密 LINE@ Howard 告知已完成問卷，預約 20 分鐘財務整聊通話</div>
      <div style="font-size:11px;color:rgba(255,255,255,0.6);">LINE@：https://lin.ee/6PIRaEp</div>
    </div>`

  const page = (content) => `
    <div style="width:794px;background:#fff;font-family:Arial,'Microsoft JhengHei','PingFang TC',sans-serif;box-sizing:border-box;display:flex;flex-direction:column;">
      ${header()}
      <div style="padding:28px 48px 24px;flex:1;">${content}</div>
      ${footer()}
    </div>`

  const buildPages = () => {
    const propRows = !data.has_property || !data.properties?.length
      ? '無'
      : data.properties.map((p, i) => `
          <b>房產 ${i + 1}（${p.city || '—'}）</b>　市值：${p.value ? p.value + ' 萬元' : '—'}　
          貸款：${p.has_loan ? `有，餘額 ${p.loan_balance || '—'} 萬元，每月 ${p.monthly_payment || '—'} 元` : '無'}<br/>`
        ).join('')

    const debtRows = data.debt_types?.includes('無負債')
      ? '無負債'
      : data.debt_types?.length
        ? `類型：${data.debt_types.join('、')}<br/>
           總負債：${data.total_debt ? data.total_debt + ' 萬元' : '—'}　
           每月還款：${data.monthly_debt ? data.monthly_debt + ' 元' : '—'}`
        : '—'

    const insRows = []
    if (data.has_life)     insRows.push(`壽險 ${data.life_coverage || '(未填)'}`)
    if (data.has_accident) insRows.push(`意外險 ${data.accident_coverage || '(未填)'}`)
    if (data.has_ip)       insRows.push(`實支實付 ${data.ip_coverage || '(未填)'}`)
    if (data.has_daily)    insRows.push(`住院日額 ${data.daily_benefit || '(未填)'}`)
    if (data.has_disability) insRows.push(`失能險 ${data.disability_coverage || '(未填)'}`)
    if (data.has_critical)   insRows.push(`重大傷病 ${data.critical_coverage || '(未填)'}`)
    if (data.has_ltc)     insRows.push(`長照險 ${data.ltc_monthly || '(未填)'}`)
    if (data.has_surgery) insRows.push(`手術險 ${data.surgery_coverage || '(未填)'}`)
    const insText = insRows.length
      ? insRows.join('　') + `<br/>每月總保費：${data.monthly_premium ? data.monthly_premium + ' 元' : '—'}`
      : '未配置任何保險'

    const p1 = page(`
      ${section('基本資料', `
        姓名：${data.name || '—'}　性別：${data.gender || '—'}　生日：${data.birthday || '—'}（${age} 歲）<br/>
        居住地：${data.city || '—'}　職業：${data.occupation || '—'}　月收入：${data.income_range || '—'}
      `)}
      ${section('家庭結構', `
        婚姻狀況：${data.marital || '—'}　子女：${data.children || '—'}<br/>
        父母：${data.parents_alive || '—'}　需長期照顧家人：${data.has_dependent || '—'}
      `)}
      ${section('財務目標（前三優先）', topGoalsText)}
      ${section('人生願望清單', wishesText)}
      ${section('退休規劃', `
        希望退休年齡：${data.retirement_age ? data.retirement_age + ' 歲' : '—'}　
        退休後每月生活費：${data.retirement_monthly || '—'}　
        願望實現時程：${data.wish_timeline || '—'}
      `)}
    `)

    const p2 = page(`
      ${section('收入分配（理財金三角）', `
        生活支出：${data.expense_pct ?? '—'}%　
        理財規劃：${data.investment_pct ?? '—'}%　
        風險規劃：${data.protection_pct ?? '—'}%
      `)}
      ${section('資產狀況', `
        存款總額：${data.savings_range || '—'}　股票／基金／ETF：${data.stocks_range || '—'}<br/>
        儲蓄型保單現值：${data.savings_policy || '—'}　其他資產：${data.other_assets || '（未填）'}
      `)}
      ${section('房產狀況', propRows)}
      ${section('負債狀況', debtRows)}
      ${section('保險配置', insText)}
      ${section('投資風險偏好', data.risk_attitude || '—')}
      ${section('聯絡資料', `
        姓名：${data.contact_name || data.name || '—'}　
        電話：${data.phone || '—'}　
        LINE ID：${data.line_id || '（未填）'}
      `)}
    `)

    return [p1, p2]
  }

  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ])

  const A4W = 210
  const SCALE = 2

  const renderPage = async (html) => {
    const el = document.createElement('div')
    el.innerHTML = html
    const node = el.firstElementChild
    Object.assign(node.style, {
      position: 'fixed', left: '-9999px', top: '0', width: '794px',
    })
    document.body.appendChild(node)
    await document.fonts.ready
    const canvas = await html2canvas(node, {
      scale: SCALE, useCORS: true, logging: false, backgroundColor: '#ffffff',
    })
    document.body.removeChild(node)
    return canvas
  }

  const [p1, p2] = buildPages()
  const c1 = await renderPage(p1)
  const c2 = await renderPage(p2)

  const h1mm = A4W * c1.height / c1.width
  const h2mm = A4W * c2.height / c2.width

  const pdf = new jsPDF({ unit: 'mm', format: [A4W, h1mm], orientation: 'portrait' })
  pdf.addImage(c1.toDataURL('image/jpeg', 0.97), 'JPEG', 0, 0, A4W, h1mm)
  pdf.addPage([A4W, h2mm])
  pdf.addImage(c2.toDataURL('image/jpeg', 0.97), 'JPEG', 0, 0, A4W, h2mm)
  pdf.save(`財務整聊前置報告_${data.name || '用戶'}.pdf`)

  // Upload to Supabase Storage (best-effort)
  try {
    const { createClient } = await import('@supabase/supabase-js')
    const sb = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)
    await sb.storage.from('reports').upload(
      `${data.id}/report.pdf`,
      pdf.output('blob'),
      { contentType: 'application/pdf', upsert: true }
    )
  } catch (e) { console.error('Storage upload failed:', e) }
}

export const downloadPdfFromStorageOrGenerate = async (data) => {
  try {
    const { createClient } = await import('@supabase/supabase-js')
    const sb = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)
    const { data: blob, error } = await sb.storage.from('reports').download(`${data.id}/report.pdf`)
    
    if (!error && blob) {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `財務整聊前置報告_${data.name || '用戶'}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } else {
      await generateAndDownloadPdf(data)
    }
  } catch (error) {
    console.error('Download or generation failed:', error)
  }
}
