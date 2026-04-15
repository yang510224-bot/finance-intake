import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ProgressBar from '../components/ProgressBar'

const TAIWAN_CITIES = [
  '台北市','新北市','基隆市','桃園市','新竹市','新竹縣','苗栗縣',
  '台中市','彰化縣','南投縣','雲林縣','嘉義市','嘉義縣','台南市',
  '高雄市','屏東縣','宜蘭縣','花蓮縣','台東縣','澎湖縣','金門縣',
  '連江縣','海外',
]

const INITIAL_DATA = {
  name: '', birth_year: '', birth_month: '', birth_day: '',
  city: '', occupation: '', income_range: '', primary_goal: '',
  retirement_age: '', retirement_monthly: '',
  expense_pct: 50, investment_pct: 30, protection_pct: 20,
  has_property: null, properties: [],
  debt_types: [], total_debt: '', monthly_debt: '',
  has_life: false, life_coverage: '',
  has_medical: false, medical_daily: '',
  has_accident: false, accident_coverage: '',
  has_critical: false, critical_coverage: '',
  monthly_premium: '',
  risk_attitude: '',
  contact_name: '', phone: '', line_id: '',
}

const INITIAL_PROPERTY = { city: '', value: '', has_loan: false, loan_balance: '', monthly_payment: '' }

export default function QuizPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [data, setData] = useState(INITIAL_DATA)
  const [submitting, setSubmitting] = useState(false)

  const set = (key, val) => setData(prev => ({ ...prev, [key]: val }))

  const autoAdvance = (key, val) => {
    setData(prev => ({ ...prev, [key]: val }))
    setTimeout(() => setStep(s => s + 1), 300)
  }

  const handleBack = () => {
    if (step === 1) navigate('/')
    else setStep(s => s - 1)
  }

  const handleSlider = (key, newVal) => {
    const keys = ['expense_pct', 'investment_pct', 'protection_pct']
    const others = keys.filter(k => k !== key)
    const remaining = 100 - newVal
    const otherTotal = others.reduce((s, k) => s + data[k], 0)
    if (otherTotal === 0) {
      const half = Math.floor(remaining / 2)
      setData(prev => ({ ...prev, [key]: newVal, [others[0]]: half, [others[1]]: remaining - half }))
    } else {
      const a = Math.round(remaining * data[others[0]] / otherTotal)
      const b = remaining - a
      setData(prev => ({ ...prev, [key]: newVal, [others[0]]: a, [others[1]]: b }))
    }
  }

  const toggleDebt = (val) => {
    setData(prev => {
      if (val === '無負債') {
        const already = prev.debt_types.includes('無負債')
        return { ...prev, debt_types: already ? [] : ['無負債'] }
      }
      const without = prev.debt_types.filter(d => d !== '無負債' && d !== val)
      const has = prev.debt_types.includes(val)
      return { ...prev, debt_types: has ? without : [...without, val] }
    })
  }

  const addProperty = () => {
    setData(prev => ({ ...prev, properties: [...prev.properties, { ...INITIAL_PROPERTY }] }))
  }

  const removeProperty = (idx) => {
    setData(prev => ({ ...prev, properties: prev.properties.filter((_, i) => i !== idx) }))
  }

  const updateProperty = (idx, key, val) => {
    setData(prev => {
      const props = prev.properties.map((p, i) => i === idx ? { ...p, [key]: val } : p)
      return { ...prev, properties: props }
    })
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    const birthday = `${data.birth_year}/${data.birth_month}/${data.birth_day}`
    const payload = { ...data, birthday }
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const { id } = await res.json()
      sessionStorage.setItem('intake_data', JSON.stringify({ ...payload, id }))
      navigate(`/report/${id}`)
    } catch (e) {
      console.error('Submit failed:', e)
      // fallback: save locally and navigate with a temp id
      const id = `local_${Date.now()}`
      sessionStorage.setItem('intake_data', JSON.stringify({ ...payload, id }))
      navigate(`/report/${id}`)
    }
  }

  const sliderTotal = data.expense_pct + data.investment_pct + data.protection_pct

  const hasDebtDetail = data.debt_types.length > 0 && !(data.debt_types.length === 1 && data.debt_types[0] === '無負債')

  return (
    <div className="screen">
      <ProgressBar current={step} total={14} />
      {step > 1 && (
        <button className="btn-back" onClick={handleBack}>← 返回</button>
      )}

      {/* Q1: 姓名 */}
      {step === 1 && (
        <div className="q-card" key={1}>
          <div className="q-label">QUESTION 1 OF 14</div>
          <div className="q-title">請問您的姓名是？</div>
          <input
            className="q-input"
            type="text"
            placeholder="您的姓名或暱稱"
            value={data.name}
            onChange={e => set('name', e.target.value)}
          />
          <button
            className="btn-next"
            disabled={data.name.trim() === ''}
            onClick={() => setStep(2)}
          >
            下一題 →
          </button>
        </div>
      )}

      {/* Q2: 生日 */}
      {step === 2 && (
        <div className="q-card" key={2}>
          <div className="q-label">QUESTION 2 OF 14</div>
          <div className="q-title">您的生日是？</div>
          <div className="birthday-row">
            <select
              className="q-select"
              value={data.birth_year}
              onChange={e => set('birth_year', e.target.value)}
            >
              <option value="">年</option>
              {Array.from({ length: 2005 - 1950 + 1 }, (_, i) => 2005 - i).map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <select
              className="q-select"
              value={data.birth_month}
              onChange={e => set('birth_month', e.target.value)}
            >
              <option value="">月</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <select
              className="q-select"
              value={data.birth_day}
              onChange={e => set('birth_day', e.target.value)}
            >
              <option value="">日</option>
              {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <button
            className="btn-next"
            disabled={!data.birth_year || !data.birth_month || !data.birth_day}
            onClick={() => setStep(3)}
          >
            下一題 →
          </button>
        </div>
      )}

      {/* Q3: 縣市 */}
      {step === 3 && (
        <div className="q-card" key={3}>
          <div className="q-label">QUESTION 3 OF 14</div>
          <div className="q-title">您目前居住在哪裡？</div>
          <select
            className="q-select"
            value={data.city}
            onChange={e => {
              const val = e.target.value
              setData(prev => ({ ...prev, city: val }))
              if (val) setTimeout(() => setStep(4), 300)
            }}
          >
            <option value="">請選擇縣市</option>
            {TAIWAN_CITIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      )}

      {/* Q4: 職業 */}
      {step === 4 && (
        <div className="q-card" key={4}>
          <div className="q-label">QUESTION 4 OF 14</div>
          <div className="q-title">您的職業類別是？</div>
          <div className="choices">
            {['受薪族', '自營業主', '自由工作者', '退休', '其他'].map(opt => (
              <button
                key={opt}
                className={`choice-btn${data.occupation === opt ? ' selected' : ''}`}
                onClick={() => autoAdvance('occupation', opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Q5: 月收入 */}
      {step === 5 && (
        <div className="q-card" key={5}>
          <div className="q-label">QUESTION 5 OF 14</div>
          <div className="q-title">您的每月收入範圍大約是？</div>
          <div className="choices">
            {['3萬以下', '3–5萬', '5–8萬', '8–12萬', '12萬以上'].map(opt => (
              <button
                key={opt}
                className={`choice-btn${data.income_range === opt ? ' selected' : ''}`}
                onClick={() => autoAdvance('income_range', opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Q6: 財務目標 */}
      {step === 6 && (
        <div className="q-card" key={6}>
          <div className="q-label">QUESTION 6 OF 14</div>
          <div className="q-title">您目前最想解決的財務問題是？</div>
          <div className="choices" style={{ flexDirection: 'column' }}>
            {[
              '每個月錢不夠用，存不到錢',
              '手邊有錢但不知道怎麼放',
              '擔心退休準備不足',
              '想保障家人，萬一我不在了',
              '資產傳承與稅務規劃',
            ].map(opt => (
              <button
                key={opt}
                className={`choice-btn${data.primary_goal === opt ? ' selected' : ''}`}
                onClick={() => autoAdvance('primary_goal', opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Q7: 退休年齡 */}
      {step === 7 && (
        <div className="q-card" key={7}>
          <div className="q-label">QUESTION 7 OF 14</div>
          <div className="q-title">您希望幾歲退休？</div>
          <input
            className="q-input"
            type="number"
            placeholder="例：55"
            min={30}
            max={80}
            value={data.retirement_age}
            onChange={e => set('retirement_age', e.target.value)}
          />
          <button
            className="btn-next"
            disabled={!data.retirement_age}
            onClick={() => setStep(8)}
          >
            下一題 →
          </button>
        </div>
      )}

      {/* Q8: 退休生活費 */}
      {step === 8 && (
        <div className="q-card" key={8}>
          <div className="q-label">QUESTION 8 OF 14</div>
          <div className="q-title">退休後，您希望每月有多少生活費？</div>
          <div className="choices">
            {['2萬', '3萬', '5萬', '8萬', '10萬以上'].map(opt => (
              <button
                key={opt}
                className={`choice-btn${data.retirement_monthly === opt ? ' selected' : ''}`}
                onClick={() => autoAdvance('retirement_monthly', opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Q9: 理財金三角 */}
      {step === 9 && (
        <div className="q-card" key={9}>
          <div className="q-label">QUESTION 9 OF 14</div>
          <div className="q-title">您希望每月收入如何分配？</div>
          <div className="q-label" style={{ marginBottom: '1rem' }}>
            三個滑桿合計 100%，拖動調整比例
          </div>
          <div className="slider-group">
            <div className="slider-item">
              <div className="slider-header">
                <span className="slider-label">生活支出（食衣住行育樂）</span>
                <span className="slider-val">{data.expense_pct}%</span>
              </div>
              <input
                type="range" min={0} max={100} step={1}
                value={data.expense_pct}
                onChange={e => handleSlider('expense_pct', parseInt(e.target.value))}
              />
            </div>
            <div className="slider-item">
              <div className="slider-header">
                <span className="slider-label">理財規劃（投資、儲蓄、退休）</span>
                <span className="slider-val">{data.investment_pct}%</span>
              </div>
              <input
                type="range" min={0} max={100} step={1}
                value={data.investment_pct}
                onChange={e => handleSlider('investment_pct', parseInt(e.target.value))}
              />
            </div>
            <div className="slider-item">
              <div className="slider-header">
                <span className="slider-label">風險規劃（保險）</span>
                <span className="slider-val">{data.protection_pct}%</span>
              </div>
              <input
                type="range" min={0} max={100} step={1}
                value={data.protection_pct}
                onChange={e => handleSlider('protection_pct', parseInt(e.target.value))}
              />
            </div>
          </div>
          <div className={`slider-total${sliderTotal === 100 ? ' ok' : ''}`}
            style={{ color: sliderTotal === 100 ? '#4caf50' : '#e74c3c', marginTop: '0.5rem', fontWeight: 600 }}>
            合計：{sliderTotal}%
          </div>
          <button className="btn-next" onClick={() => setStep(10)}>
            下一題 →
          </button>
        </div>
      )}

      {/* Q10: 房產 */}
      {step === 10 && (
        <div className="q-card" key={10}>
          <div className="q-label">QUESTION 10 OF 14</div>
          <div className="q-title">您目前有房產嗎？</div>
          <div className="yn-row">
            <button
              className={`yn-btn${data.has_property === true ? ' active' : ''}`}
              onClick={() => {
                setData(prev => ({
                  ...prev,
                  has_property: true,
                  properties: prev.properties.length === 0 ? [{ ...INITIAL_PROPERTY }] : prev.properties,
                }))
              }}
            >
              有
            </button>
            <button
              className={`yn-btn${data.has_property === false ? ' active' : ''}`}
              onClick={() => {
                setData(prev => ({ ...prev, has_property: false, properties: [] }))
                setTimeout(() => setStep(11), 300)
              }}
            >
              無
            </button>
          </div>

          {data.has_property === true && (
            <>
              <div className="property-list">
                {data.properties.map((prop, idx) => (
                  <div className="property-item" key={idx}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ color: '#D4AF37', fontWeight: 600 }}>房產 {idx + 1}</span>
                      <button className="remove-btn" onClick={() => removeProperty(idx)}>×</button>
                    </div>
                    <div className="field-row">
                      <label className="field-label">所在縣市</label>
                      <select
                        className="q-select"
                        value={prop.city}
                        onChange={e => updateProperty(idx, 'city', e.target.value)}
                      >
                        <option value="">請選擇</option>
                        {TAIWAN_CITIES.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div className="field-row">
                      <label className="field-label">目前市值</label>
                      <input
                        className="q-input"
                        type="number"
                        placeholder="市值（萬元）"
                        value={prop.value}
                        onChange={e => updateProperty(idx, 'value', e.target.value)}
                      />
                    </div>
                    <div className="field-row">
                      <label className="field-label">是否有貸款</label>
                      <div className="yn-row" style={{ marginTop: 0 }}>
                        <button
                          className={`yn-btn${prop.has_loan === true ? ' active' : ''}`}
                          style={{ padding: '0.3rem 1rem', fontSize: '0.9rem' }}
                          onClick={() => updateProperty(idx, 'has_loan', true)}
                        >
                          有
                        </button>
                        <button
                          className={`yn-btn${prop.has_loan === false ? ' active' : ''}`}
                          style={{ padding: '0.3rem 1rem', fontSize: '0.9rem' }}
                          onClick={() => updateProperty(idx, 'has_loan', false)}
                        >
                          無
                        </button>
                      </div>
                    </div>
                    {prop.has_loan === true && (
                      <>
                        <div className="field-row">
                          <label className="field-label">貸款餘額（萬元）</label>
                          <input
                            className="q-input"
                            type="number"
                            placeholder="萬元"
                            value={prop.loan_balance}
                            onChange={e => updateProperty(idx, 'loan_balance', e.target.value)}
                          />
                        </div>
                        <div className="field-row">
                          <label className="field-label">每月還款（元）</label>
                          <input
                            className="q-input"
                            type="number"
                            placeholder="元"
                            value={prop.monthly_payment}
                            onChange={e => updateProperty(idx, 'monthly_payment', e.target.value)}
                          />
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
              <button className="add-btn" onClick={addProperty}>＋ 新增房產</button>
              <button className="btn-next" onClick={() => setStep(11)}>
                下一題 →
              </button>
            </>
          )}
        </div>
      )}

      {/* Q11: 負債 */}
      {step === 11 && (
        <div className="q-card" key={11}>
          <div className="q-label">QUESTION 11 OF 14</div>
          <div className="q-title">您目前有哪些負債？</div>
          <div className="checkbox-group">
            {['房貸', '車貸', '信貸', '信用卡循環', '無負債'].map(opt => (
              <button
                key={opt}
                className={`checkbox-btn${data.debt_types.includes(opt) ? ' checked' : ''}`}
                onClick={() => toggleDebt(opt)}
              >
                <span className="checkbox-icon">{data.debt_types.includes(opt) ? '✓' : ''}</span>
                {opt}
              </button>
            ))}
          </div>
          {hasDebtDetail && (
            <>
              <input
                className="q-input"
                type="number"
                placeholder="總負債金額（萬元）"
                value={data.total_debt}
                onChange={e => set('total_debt', e.target.value)}
                style={{ marginTop: '1rem' }}
              />
              <input
                className="q-input"
                type="number"
                placeholder="每月負債總還款金額（元）"
                value={data.monthly_debt}
                onChange={e => set('monthly_debt', e.target.value)}
              />
            </>
          )}
          <button
            className="btn-next"
            disabled={data.debt_types.length === 0}
            onClick={() => setStep(12)}
          >
            下一題 →
          </button>
        </div>
      )}

      {/* Q12: 保險 */}
      {step === 12 && (
        <div className="q-card" key={12}>
          <div className="q-label">QUESTION 12 OF 14</div>
          <div className="q-title">您目前的保險配置？</div>
          <div className="insurance-list">
            {/* 壽險 */}
            <div className="insurance-item">
              <div className="insurance-top">
                <span className="insurance-name">壽險</span>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={data.has_life}
                    onChange={e => set('has_life', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              {data.has_life && (
                <div className="insurance-detail">
                  <input
                    className="q-input"
                    type="number"
                    placeholder="保額（萬元）"
                    value={data.life_coverage}
                    onChange={e => set('life_coverage', e.target.value)}
                  />
                </div>
              )}
            </div>
            {/* 醫療險 */}
            <div className="insurance-item">
              <div className="insurance-top">
                <span className="insurance-name">醫療險</span>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={data.has_medical}
                    onChange={e => set('has_medical', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              {data.has_medical && (
                <div className="insurance-detail">
                  <input
                    className="q-input"
                    type="number"
                    placeholder="每日住院給付（元）"
                    value={data.medical_daily}
                    onChange={e => set('medical_daily', e.target.value)}
                  />
                </div>
              )}
            </div>
            {/* 意外險 */}
            <div className="insurance-item">
              <div className="insurance-top">
                <span className="insurance-name">意外險</span>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={data.has_accident}
                    onChange={e => set('has_accident', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              {data.has_accident && (
                <div className="insurance-detail">
                  <input
                    className="q-input"
                    type="number"
                    placeholder="保額（萬元）"
                    value={data.accident_coverage}
                    onChange={e => set('accident_coverage', e.target.value)}
                  />
                </div>
              )}
            </div>
            {/* 重大傷病 */}
            <div className="insurance-item">
              <div className="insurance-top">
                <span className="insurance-name">重大傷病／癌症險</span>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={data.has_critical}
                    onChange={e => set('has_critical', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              {data.has_critical && (
                <div className="insurance-detail">
                  <input
                    className="q-input"
                    type="number"
                    placeholder="保額（萬元）"
                    value={data.critical_coverage}
                    onChange={e => set('critical_coverage', e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>
          <input
            className="q-input"
            type="number"
            placeholder="每月總保費支出（元）"
            value={data.monthly_premium}
            onChange={e => set('monthly_premium', e.target.value)}
            style={{ marginTop: '1rem' }}
          />
          <button className="btn-next" onClick={() => setStep(13)}>
            下一題 →
          </button>
        </div>
      )}

      {/* Q13: 風險態度 */}
      {step === 13 && (
        <div className="q-card" key={13}>
          <div className="q-label">QUESTION 13 OF 14</div>
          <div className="q-title">您對投資風險的態度是？</div>
          <div className="choices" style={{ flexDirection: 'column' }}>
            {[
              '保守：希望本金安全，利息穩定就好',
              '穩健：可以接受小波動，換取較好報酬',
              '積極：願意承擔風險追求更高報酬',
            ].map(opt => (
              <button
                key={opt}
                className={`choice-btn${data.risk_attitude === opt ? ' selected' : ''}`}
                onClick={() => autoAdvance('risk_attitude', opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Q14: 聯絡資料 */}
      {step === 14 && (
        <div className="q-card" key={14}>
          <div className="q-label">QUESTION 14 OF 14</div>
          <div className="q-title">最後，留下您的聯絡方式</div>
          <input
            className="q-input"
            type="text"
            placeholder="姓名確認"
            value={data.contact_name || data.name}
            onChange={e => set('contact_name', e.target.value)}
          />
          <input
            className="q-input"
            type="tel"
            placeholder="聯絡電話"
            value={data.phone}
            onChange={e => set('phone', e.target.value)}
          />
          <input
            className="q-input"
            type="text"
            placeholder="LINE ID（選填）"
            value={data.line_id}
            onChange={e => set('line_id', e.target.value)}
          />
          <button
            className="btn-next"
            disabled={!((data.contact_name || data.name).trim()) || !data.phone.trim() || submitting}
            onClick={handleSubmit}
            style={{ background: '#D4AF37', color: '#2C3E30' }}
          >
            {submitting ? '提交中…' : '提交，取得前置報告 →'}
          </button>
        </div>
      )}
    </div>
  )
}
