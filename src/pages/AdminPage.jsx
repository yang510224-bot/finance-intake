import { useState, useEffect, Fragment } from 'react'
import { supabase } from '../lib/supabase'
import { downloadPdfFromStorageOrGenerate } from '../lib/pdfGenerator'

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [auth, setAuth] = useState(false)
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedRowId, setExpandedRowId] = useState(null)
  const [downloadingRowId, setDownloadingRowId] = useState(null)

  useEffect(() => {
    if (auth) {
      fetchRecords()
    }
  }, [auth])

  const fetchRecords = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('finance_intakes_v2')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Fetch error:', error)
    } else {
      setRecords(data || [])
    }
    setLoading(false)
  }

  const handleLogin = (e) => {
    e.preventDefault()
    if (password === 'howard2026') {
      setAuth(true)
    } else {
      alert('密碼錯誤')
    }
  }

  const handleDownload = async (record) => {
    setDownloadingRowId(record.id)
    await downloadPdfFromStorageOrGenerate(record)
    setDownloadingRowId(null)
  }

  if (!auth) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '100px' }}>
        <h2 style={{ marginBottom: '20px', color: '#1a1a1a' }}>後台管理登入</h2>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="請輸入密碼"
            style={{ padding: '10px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <button type="submit" style={{ padding: '10px', background: '#D4AF37', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}>
            登入
          </button>
        </form>
      </div>
    )
  }

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1 style={{ marginBottom: '20px', color: '#2C3E30' }}>所有客戶資料 ({records.length} 筆)</h1>
      <button onClick={fetchRecords} style={{ marginBottom: '20px', padding: '8px 16px', cursor: 'pointer' }}>重新整理</button>
      
      {loading ? (
        <p>載入中...</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #ccc' }}>
                <th style={{ padding: '12px' }}>填寫時間</th>
                <th style={{ padding: '12px' }}>姓名</th>
                <th style={{ padding: '12px' }}>居住縣市</th>
                <th style={{ padding: '12px' }}>月收入</th>
                <th style={{ padding: '12px' }}>最優先財務目標</th>
                <th style={{ padding: '12px' }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {records.map(record => {
                const dateStr = new Date(record.created_at).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })
                const isExpanded = expandedRowId === record.id
                
                return (
                  <Fragment key={record.id}>
                    <tr style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px' }}>{dateStr}</td>
                      <td style={{ padding: '12px', fontWeight: 'bold' }}>{record.name || '—'}</td>
                      <td style={{ padding: '12px' }}>{record.city || '—'}</td>
                      <td style={{ padding: '12px' }}>{record.income_range || '—'}</td>
                      <td style={{ padding: '12px' }}>{record.primary_goal || '—'}</td>
                      <td style={{ padding: '12px', display: 'flex', gap: '8px' }}>
                        <button 
                          onClick={() => setExpandedRowId(isExpanded ? null : record.id)}
                          style={{ padding: '6px 12px', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', background: isExpanded ? '#ddd' : '#fff' }}
                        >
                          {isExpanded ? '隱藏完整內容' : '查看完整內容'}
                        </button>
                        <button 
                          onClick={() => handleDownload(record)}
                          disabled={downloadingRowId === record.id}
                          style={{ padding: '6px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer', background: '#D4AF37', color: '#fff' }}
                        >
                          {downloadingRowId === record.id ? '產生/下載中...' : '下載 PDF'}
                        </button>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr style={{ background: '#fafafa' }}>
                        <td colSpan="6" style={{ padding: '20px', borderBottom: '1px solid #ddd' }}>
                          <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontSize: '13px' }}>
                            {JSON.stringify(record, null, 2)}
                          </pre>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
