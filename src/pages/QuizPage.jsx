import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ProgressBar from '../components/ProgressBar'

const TOTAL = 22

const TAIWAN_CITIES = [
  '台北市','新北市','基隆市','桃園市','新竹市','新竹縣','苗栗縣',
  '台中市','彰化縣','南投縣','雲林縣','嘉義市','嘉義縣','台南市',
  '高雄市','屏東縣','宜蘭縣','花蓮縣','台東縣','澎湖縣','金門縣',
  '連江縣','海外',
]

const GOALS = [
  { key: 'medical',   icon: '🏥', label: '醫療保障——照顧自己失去賺錢能力的缺口' },
  { key: 'family',    icon: '🏠', label: '家庭保障——對家庭的承諾與責任' },
  { key: 'education', icon: '🎓', label: '子女教育——針對孩子我們特有的期望與安排' },
  { key: 'freedom',   icon: '💰', label: '財務自由——當我們被動收入超過主動收入，可選擇不工作還有可靠的收入，俗稱「退休規劃」' },
  { key: 'legacy',    icon: '🏛️', label: '資產傳承——當我們有能力在生前贈與、或百年後留遺產給您關心的人' },
]

const WISHES = [
  { key: 'house',        icon: '🏠', label: '擁有自己的房子' },
  { key: 'car',          icon: '🚗', label: '換一台夢想中的車' },
  { key: 'travel',       icon: '✈️', label: '環遊世界／出國長住' },
  { key: 'family_life',  icon: '👨‍👩‍👧', label: '給家人更好的生活' },
  { key: 'edu',          icon: '🎓', label: '孩子的教育無後顧之憂' },
  { key: 'business',     icon: '💼', label: '創業或實現事業夢想' },
  { key: 'early_retire', icon: '🌅', label: '提早退休，不再為錢工作' },
  { key: 'retire_safe',  icon: '👴', label: '退休後生活無虞，不依賴子女' },
  { key: 'legacy',       icon: '💝', label: '留一筆資產給最愛的人' },
]

const MEDICAL_INS = [
  { key: 'ip',         label: '實支實付醫療險',     field: 'ip_coverage',         ph: '保額上限（萬元）或填「不知道」' },
  { key: 'daily',      label: '住院日額險',          field: 'daily_benefit',       ph: '每日給付（元）或填「不知道」' },
  { key: 'disability', label: '失能險',              field: 'disability_coverage', ph: '保額（萬元）或填「不知道」' },
  { key: 'critical',   label: '重大傷病險／癌症險',  field: 'critical_coverage',   ph: '保額（萬元）或填「不知道」' },
  { key: 'ltc',        label: '長期照護險',          field: 'ltc_monthly',         ph: '每月給付（元）或填「不知道」' },
  { key: 'surgery',    label: '手術險',              field: 'surgery_coverage',    ph: '保額（萬元）或填「不知道」' },
]

const INIT_PROP = { city: '', value: '', has_loan: false, loan_balance: '', monthly_payment: '' }

const INIT = {
  name: '', gender: '',
  birth_year: '', birth_month: '', birth_day: '',
  city: '', marital: '', children: '', parents_alive: '', has_dependent: '',
  occupation: '', income_range: '',
  top_goals: [], wishes: [], wish_other: '', wish_timeline: '',
  retirement_age: '', retirement_monthly: '',
  expense_pct: 50, investment_pct: 30, protection_pct: 20,
  savings_range: '', stocks_range: '', savings_policy: '', other_assets: '',
  has_property: null, properties: [],
  debt_types: [], total_debt: '', monthly_debt: '',
  has_life: false, life_coverage: '',
  has_accident: false, accident_coverage: '',
  has_ip: false, ip_coverage: '',
  has_daily: false, daily_benefit: '',
  has_disability: false, disability_coverage: '',
  has_critical: false, critical_coverage: '',
  has_ltc: false, ltc_monthly: '',
  has_surgery: false, surgery_coverage: '',
  monthly_premium: '',
  risk_attitude: '',
  contact_name: '', phone: '', line_id: '',
}

export default function QuizPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [data, setData] = useState(INIT)
  const [submitting, setSubmitting] = useState(false)

  const set = (k, v) => setData(p => ({ ...p, [k]: v }))

  const auto = (k, v) => {
    setData(p => ({ ...p, [k]: v }))
    setTimeout(() => setStep(s => s + 1), 300)
  }

  const back = () => step === 1 ? navigate('/') : setStep(s => s - 1)

  const slider = (k, val) => {
    const keys = ['expense_pct', 'investment_pct', 'protection_pct']
    const others = keys.filter(x => x !== k)
    const rem = 100 - val
    const ot = others.reduce((s, x) => s + data[x], 0)
    if (ot === 0) {
      const h = Math.floor(rem / 2)
      setData(p => ({ ...p, [k]: val, [others[0]]: h, [others[1]]: rem - h }))
    } else {
      const a = Math.round(rem * data[others[0]] / ot)
      setData(p => ({ ...p, [k]: val, [others[0]]: a, [others[1]]: rem - a }))
    }
  }

  const toggleGoal = k => setData(p => {
    const ex = p.top_goals.find(g => g.key === k)
    if (ex) {
      const f = p.top_goals.filter(g => g.key !== k)
      return { ...p, top_goals: f.map((g, i) => ({ ...g, rank: i + 1 })) }
    }
    if (p.top_goals.length >= 3) return p
    return { ...p, top_goals: [...p.top_goals, { key: k, rank: p.top_goals.length + 1 }] }
  })

  const toggleWish = k => setData(p => ({
    ...p, wishes: p.wishes.includes(k) ? p.wishes.filter(w => w !== k) : [...p.wishes, k],
  }))

  const toggleDebt = v => setData(p => {
    if (v === '無負債') return { ...p, debt_types: p.debt_types.includes('無負債') ? [] : ['無負債'] }
    const w = p.debt_types.filter(d => d !== '無負債' && d !== v)
    return { ...p, debt_types: p.debt_types.includes(v) ? w : [...w, v] }
  })

  const addProp  = () => setData(p => ({ ...p, properties: [...p.properties, { ...INIT_PROP }] }))
  const delProp  = i  => setData(p => ({ ...p, properties: p.properties.filter((_, j) => j !== i) }))
  const updProp  = (i, k, v) => setData(p => ({
    ...p, properties: p.properties.map((x, j) => j === i ? { ...x, [k]: v } : x),
  }))

  const submit = async () => {
    setSubmitting(true)
    const birthday = `${data.birth_year}/${data.birth_month}/${data.birth_day}`
    const payload = { ...data, birthday }
    try {
      const res = await fetch('/api/submit', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      })
      const { id } = await res.json()
      sessionStorage.setItem('intake_data', JSON.stringify({ ...payload, id }))
      navigate(`/report/${id}`)
    } catch {
      const id = `local_${Date.now()}`
      sessionStorage.setItem('intake_data', JSON.stringify({ ...payload, id }))
      navigate(`/report/${id}`)
    }
  }

  const stotal = data.expense_pct + data.investment_pct + data.protection_pct
  const hasDebt = data.debt_types.length > 0 && !(data.debt_types.length === 1 && data.debt_types[0] === '無負債')
  const ql = n => `QUESTION ${n} OF ${TOTAL}`

  return (
    <div className="screen">
      <ProgressBar current={step} total={TOTAL} />
      {step > 1 && <button className="btn-back" onClick={back}>← 返回</button>}

      {/* Q1 姓名 */}
      {step === 1 && (
        <div className="q-card" key="1">
          <div className="q-label">{ql(1)}</div>
          <div className="q-title">請問您的姓名是？</div>
          <input className="q-input" type="text" placeholder="您的姓名或暱稱"
            value={data.name} onChange={e => set('name', e.target.value)} />
          <button className="btn-next" disabled={!data.name.trim()} onClick={() => setStep(2)}>下一題 →</button>
        </div>
      )}

      {/* Q2 性別 */}
      {step === 2 && (
        <div className="q-card" key="2">
          <div className="q-label">{ql(2)}</div>
          <div className="q-title">您的性別是？</div>
          <div className="choices">
            {['男','女','其他'].map(o => (
              <button key={o} className={`choice-btn${data.gender===o?' selected':''}`} onClick={() => auto('gender',o)}>{o}</button>
            ))}
          </div>
        </div>
      )}

      {/* Q3 生日 */}
      {step === 3 && (
        <div className="q-card" key="3">
          <div className="q-label">{ql(3)}</div>
          <div className="q-title">您的生日是？</div>
          <div className="birthday-row">
            <select className="q-select" value={data.birth_year} onChange={e => set('birth_year',e.target.value)}>
              <option value="">年</option>
              {Array.from({length:56},(_,i)=>2005-i).map(y=><option key={y} value={y}>{y}</option>)}
            </select>
            <select className="q-select" value={data.birth_month} onChange={e => set('birth_month',e.target.value)}>
              <option value="">月</option>
              {Array.from({length:12},(_,i)=>i+1).map(m=><option key={m} value={m}>{m}</option>)}
            </select>
            <select className="q-select" value={data.birth_day} onChange={e => set('birth_day',e.target.value)}>
              <option value="">日</option>
              {Array.from({length:31},(_,i)=>i+1).map(d=><option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <button className="btn-next" disabled={!data.birth_year||!data.birth_month||!data.birth_day} onClick={() => setStep(4)}>下一題 →</button>
        </div>
      )}

      {/* Q4 縣市 */}
      {step === 4 && (
        <div className="q-card" key="4">
          <div className="q-label">{ql(4)}</div>
          <div className="q-title">您目前居住在哪裡？</div>
          <select className="q-select" value={data.city} onChange={e => set('city',e.target.value)}>
            <option value="">請選擇縣市</option>
            {TAIWAN_CITIES.map(c=><option key={c} value={c}>{c}</option>)}
          </select>
          <button className="btn-next" disabled={!data.city} onClick={() => setStep(5)}>下一題 →</button>
        </div>
      )}

      {/* Q5 婚姻 */}
      {step === 5 && (
        <div className="q-card" key="5">
          <div className="q-label">{ql(5)}</div>
          <div className="q-title">您的婚姻狀況？</div>
          <div className="choices">
            {['單身','已婚','離婚或喪偶'].map(o=>(
              <button key={o} className={`choice-btn${data.marital===o?' selected':''}`} onClick={() => auto('marital',o)}>{o}</button>
            ))}
          </div>
        </div>
      )}

      {/* Q6 子女 */}
      {step === 6 && (
        <div className="q-card" key="6">
          <div className="q-label">{ql(6)}</div>
          <div className="q-title">您有幾位子女？</div>
          <div className="choices">
            {['無','1位','2位','3位以上'].map(o=>(
              <button key={o} className={`choice-btn${data.children===o?' selected':''}`} onClick={() => auto('children',o)}>{o}</button>
            ))}
          </div>
        </div>
      )}

      {/* Q7 父母 */}
      {step === 7 && (
        <div className="q-card" key="7">
          <div className="q-label">{ql(7)}</div>
          <div className="q-title">您的父母是否健在？</div>
          <div className="choices">
            {['都健在','一位健在','都不在了'].map(o=>(
              <button key={o} className={`choice-btn${data.parents_alive===o?' selected':''}`} onClick={() => auto('parents_alive',o)}>{o}</button>
            ))}
          </div>
        </div>
      )}

      {/* Q8 長照 */}
      {step === 8 && (
        <div className="q-card" key="8">
          <div className="q-label">{ql(8)}</div>
          <div className="q-title">家中是否有需要長期照顧的家人？</div>
          <div className="choices">
            {['有','沒有'].map(o=>(
              <button key={o} className={`choice-btn${data.has_dependent===o?' selected':''}`} onClick={() => auto('has_dependent',o)}>{o}</button>
            ))}
          </div>
        </div>
      )}

      {/* Q9 職業 */}
      {step === 9 && (
        <div className="q-card" key="9">
          <div className="q-label">{ql(9)}</div>
          <div className="q-title">您的職業類別是？</div>
          <div className="choices">
            {['受薪族','自營業主','自由工作者','退休','其他'].map(o=>(
              <button key={o} className={`choice-btn${data.occupation===o?' selected':''}`} onClick={() => auto('occupation',o)}>{o}</button>
            ))}
          </div>
        </div>
      )}

      {/* Q10 收入 */}
      {step === 10 && (
        <div className="q-card" key="10">
          <div className="q-label">{ql(10)}</div>
          <div className="q-title">您的每月收入範圍大約是？</div>
          <div className="choices">
            {['3萬以下','3–5萬','5–8萬','8–12萬','12萬以上'].map(o=>(
              <button key={o} className={`choice-btn${data.income_range===o?' selected':''}`} onClick={() => auto('income_range',o)}>{o}</button>
            ))}
          </div>
        </div>
      )}

      {/* Q11 財務目標 */}
      {step === 11 && (
        <div className="q-card" key="11">
          <div className="q-label">{ql(11)}</div>
          <div className="q-title">請選出您最優先的前三項財務目標</div>
          <div className="q-subtitle">依序點選，數字代表優先順序，再點一次取消</div>
          <div className="goals-list">
            {GOALS.map(({key,icon,label}) => {
              const sel = data.top_goals.find(g => g.key === key)
              return (
                <button key={key} className={`goal-btn${sel?' selected':''}`} onClick={() => toggleGoal(key)}>
                  <span className="goal-rank">{sel ? sel.rank : ''}</span>
                  <span className="goal-icon">{icon}</span>
                  <span className="goal-label">{label}</span>
                </button>
              )
            })}
          </div>
          <button className="btn-next" disabled={data.top_goals.length===0} onClick={() => setStep(12)}>下一題 →</button>
        </div>
      )}

      {/* Q12 人生願望 */}
      {step === 12 && (
        <div className="q-card" key="12">
          <div className="q-label">{ql(12)}</div>
          <div className="q-title">您的人生願望清單是什麼？</div>
          <div className="q-subtitle">可複選</div>
          <div className="goals-list">
            {WISHES.map(({key,icon,label}) => (
              <button key={key} className={`goal-btn${data.wishes.includes(key)?' selected':''}`} onClick={() => toggleWish(key)}>
                <span className="goal-icon">{icon}</span>
                <span className="goal-label">{label}</span>
              </button>
            ))}
          </div>
          <input className="q-input" type="text" placeholder="✍️ 其他（請填寫）"
            value={data.wish_other} onChange={e => set('wish_other',e.target.value)} style={{marginTop:'12px'}} />
          <button className="btn-next" disabled={data.wishes.length===0 && !data.wish_other.trim()} onClick={() => setStep(13)}>下一題 →</button>
        </div>
      )}

      {/* Q13 幾年內 */}
      {step === 13 && (
        <div className="q-card" key="13">
          <div className="q-label">{ql(13)}</div>
          <div className="q-title">您希望幾年內開始實現這些願望？</div>
          <div className="choices">
            {['3年內','5年內','10年內','慢慢來沒關係'].map(o=>(
              <button key={o} className={`choice-btn${data.wish_timeline===o?' selected':''}`} onClick={() => auto('wish_timeline',o)}>{o}</button>
            ))}
          </div>
        </div>
      )}

      {/* Q14 退休年齡 */}
      {step === 14 && (
        <div className="q-card" key="14">
          <div className="q-label">{ql(14)}</div>
          <div className="q-title">您希望幾歲退休？</div>
          <input className="q-input" type="number" placeholder="例：55" min={30} max={80}
            value={data.retirement_age} onChange={e => set('retirement_age',e.target.value)} />
          <button className="btn-next" disabled={!data.retirement_age} onClick={() => setStep(15)}>下一題 →</button>
        </div>
      )}

      {/* Q15 退休月費 */}
      {step === 15 && (
        <div className="q-card" key="15">
          <div className="q-label">{ql(15)}</div>
          <div className="q-title">退休後，您希望每月有多少生活費？</div>
          <div className="choices">
            {['2萬','3萬','5萬','8萬','10萬以上'].map(o=>(
              <button key={o} className={`choice-btn${data.retirement_monthly===o?' selected':''}`} onClick={() => auto('retirement_monthly',o)}>{o}</button>
            ))}
          </div>
        </div>
      )}

      {/* Q16 金三角 */}
      {step === 16 && (
        <div className="q-card" key="16">
          <div className="q-label">{ql(16)}</div>
          <div className="q-title">您希望每月收入如何分配？</div>
          <div className="q-subtitle">三個滑桿合計 100%，拖動調整比例</div>
          <div className="slider-group">
            {[
              {key:'expense_pct',    label:'生活支出（食衣住行育樂）'},
              {key:'investment_pct', label:'理財規劃（投資、儲蓄、退休）'},
              {key:'protection_pct', label:'風險規劃（保險）'},
            ].map(({key,label}) => (
              <div className="slider-item" key={key}>
                <div className="slider-header">
                  <span className="slider-label">{label}</span>
                  <span className="slider-val">{data[key]}%</span>
                </div>
                <input type="range" min={0} max={100} step={1} value={data[key]}
                  onChange={e => slider(key, parseInt(e.target.value))} />
              </div>
            ))}
          </div>
          <div style={{color:stotal===100?'#4ade80':'#f87171',marginTop:'0.5rem',fontWeight:600,textAlign:'center'}}>
            合計：{stotal}%
          </div>
          <button className="btn-next" onClick={() => setStep(17)}>下一題 →</button>
        </div>
      )}

      {/* Q17 資產 */}
      {step === 17 && (
        <div className="q-card" key="17">
          <div className="q-label">{ql(17)}</div>
          <div className="q-title">您目前的資產狀況</div>
          <div className="asset-list">
            <div className="asset-item">
              <div className="asset-label">存款總額</div>
              <div className="asset-opts">
                {['50萬以下','50–100萬','100–300萬','300萬以上'].map(o=>(
                  <button key={o} className={`choice-btn asset-opt${data.savings_range===o?' selected':''}`} onClick={() => set('savings_range',o)}>{o}</button>
                ))}
              </div>
            </div>
            <div className="asset-item">
              <div className="asset-label">股票／基金／ETF 市值</div>
              <div className="asset-opts">
                {['沒有','50萬以下','50–100萬','100萬以上'].map(o=>(
                  <button key={o} className={`choice-btn asset-opt${data.stocks_range===o?' selected':''}`} onClick={() => set('stocks_range',o)}>{o}</button>
                ))}
              </div>
            </div>
            <div className="asset-item">
              <div className="asset-label">儲蓄型保單現金價值</div>
              <input className="q-input" type="text" placeholder="金額（萬元）或填「不知道」"
                value={data.savings_policy} onChange={e => set('savings_policy',e.target.value)} />
            </div>
            <div className="asset-item">
              <div className="asset-label">其他資產</div>
              <input className="q-input" type="text" placeholder="例：黃金、外幣、退休金帳戶等（可留白）"
                value={data.other_assets} onChange={e => set('other_assets',e.target.value)} />
            </div>
          </div>
          <button className="btn-next" onClick={() => setStep(18)}>下一題 →</button>
        </div>
      )}

      {/* Q18 房產 */}
      {step === 18 && (
        <div className="q-card" key="18">
          <div className="q-label">{ql(18)}</div>
          <div className="q-title">您目前有房產嗎？</div>
          <div className="yn-row">
            <button className={`yn-btn${data.has_property===true?' active':''}`}
              onClick={() => setData(p => ({...p, has_property:true, properties: p.properties.length===0?[{...INIT_PROP}]:p.properties}))}>有</button>
            <button className={`yn-btn${data.has_property===false?' active':''}`}
              onClick={() => { setData(p => ({...p, has_property:false, properties:[]})); setTimeout(()=>setStep(19),300) }}>無</button>
          </div>
          {data.has_property===true && (
            <>
              <div className="property-list">
                {data.properties.map((prop,idx) => (
                  <div className="property-item" key={idx}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.5rem'}}>
                      <span style={{color:'#D4AF37',fontWeight:600}}>房產 {idx+1}</span>
                      <button className="remove-btn" onClick={() => delProp(idx)}>×</button>
                    </div>
                    <div className="field-row">
                      <label className="field-label">所在縣市</label>
                      <select className="q-select" value={prop.city} onChange={e => updProp(idx,'city',e.target.value)}>
                        <option value="">請選擇</option>
                        {TAIWAN_CITIES.map(c=><option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="field-row">
                      <label className="field-label">目前市值</label>
                      <input className="q-input" type="number" placeholder="市值（萬元）"
                        value={prop.value} onChange={e => updProp(idx,'value',e.target.value)} />
                    </div>
                    <div className="field-row">
                      <label className="field-label">是否有貸款</label>
                      <div className="yn-row" style={{marginTop:0}}>
                        <button className={`yn-btn${prop.has_loan===true?' active':''}`}
                          style={{padding:'0.3rem 1rem',fontSize:'0.9rem'}} onClick={() => updProp(idx,'has_loan',true)}>有</button>
                        <button className={`yn-btn${prop.has_loan===false?' active':''}`}
                          style={{padding:'0.3rem 1rem',fontSize:'0.9rem'}} onClick={() => updProp(idx,'has_loan',false)}>無</button>
                      </div>
                    </div>
                    {prop.has_loan===true && (
                      <>
                        <div className="field-row">
                          <label className="field-label">貸款餘額（萬元）</label>
                          <input className="q-input" type="number" placeholder="萬元"
                            value={prop.loan_balance} onChange={e => updProp(idx,'loan_balance',e.target.value)} />
                        </div>
                        <div className="field-row">
                          <label className="field-label">每月還款（元）</label>
                          <input className="q-input" type="number" placeholder="元"
                            value={prop.monthly_payment} onChange={e => updProp(idx,'monthly_payment',e.target.value)} />
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
              <button className="add-btn" onClick={addProp}>＋ 新增房產</button>
              <button className="btn-next" onClick={() => setStep(19)}>下一題 →</button>
            </>
          )}
        </div>
      )}

      {/* Q19 負債 */}
      {step === 19 && (
        <div className="q-card" key="19">
          <div className="q-label">{ql(19)}</div>
          <div className="q-title">您目前有哪些負債？</div>
          <div className="checkbox-group">
            {['房貸','車貸','信貸','信用卡循環','無負債'].map(o=>(
              <button key={o} className={`checkbox-btn${data.debt_types.includes(o)?' checked':''}`} onClick={() => toggleDebt(o)}>
                <span className="checkbox-icon">{data.debt_types.includes(o)?'✓':''}</span>{o}
              </button>
            ))}
          </div>
          {hasDebt && (
            <>
              <input className="q-input" type="number" placeholder="總負債金額（萬元）"
                value={data.total_debt} onChange={e => set('total_debt',e.target.value)} style={{marginTop:'1rem'}} />
              <input className="q-input" type="number" placeholder="每月負債總還款金額（元）"
                value={data.monthly_debt} onChange={e => set('monthly_debt',e.target.value)} />
            </>
          )}
          <button className="btn-next" disabled={data.debt_types.length===0} onClick={() => setStep(20)}>下一題 →</button>
        </div>
      )}

      {/* Q20 保險 */}
      {step === 20 && (
        <div className="q-card" key="20">
          <div className="q-label">{ql(20)}</div>
          <div className="q-title">您目前的保險配置？</div>

          <div className="ins-section-title">壽險與意外險</div>
          <div className="insurance-list">
            {[
              {flag:'has_life',    label:'壽險',   field:'life_coverage',     ph:'保額（萬元）或填「不知道」'},
              {flag:'has_accident',label:'意外險', field:'accident_coverage', ph:'保額（萬元）或填「不知道」'},
            ].map(({flag,label,field,ph}) => (
              <div className="insurance-item" key={flag}>
                <div className="insurance-top">
                  <span className="insurance-name">{label}</span>
                  <label className="toggle">
                    <input type="checkbox" checked={data[flag]} onChange={e => set(flag,e.target.checked)} />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                {data[flag] && (
                  <div className="insurance-detail">
                    <input className="q-input" type="text" placeholder={ph}
                      value={data[field]} onChange={e => set(field,e.target.value)} />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="ins-section-title" style={{marginTop:'1.2rem'}}>醫療相關保險（可複選）</div>
          <div className="insurance-list">
            {MEDICAL_INS.map(({key,label,field,ph}) => (
              <div className="insurance-item" key={key}>
                <div className="insurance-top">
                  <span className="insurance-name">{label}</span>
                  <label className="toggle">
                    <input type="checkbox" checked={data[`has_${key}`]} onChange={e => set(`has_${key}`,e.target.checked)} />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                {data[`has_${key}`] && (
                  <div className="insurance-detail">
                    <input className="q-input" type="text" placeholder={ph}
                      value={data[field]} onChange={e => set(field,e.target.value)} />
                  </div>
                )}
              </div>
            ))}
          </div>

          <input className="q-input" type="number" placeholder="每月總保費支出（元）"
            value={data.monthly_premium} onChange={e => set('monthly_premium',e.target.value)} style={{marginTop:'1rem'}} />
          <button className="btn-next" onClick={() => setStep(21)}>下一題 →</button>
        </div>
      )}

      {/* Q21 風險 */}
      {step === 21 && (
        <div className="q-card" key="21">
          <div className="q-label">{ql(21)}</div>
          <div className="q-title">您對投資風險的態度是？</div>
          <div className="choices" style={{flexDirection:'column'}}>
            {[
              '保守：希望本金安全，利息穩定就好',
              '穩健：可以接受小波動，換取較好報酬',
              '積極：願意承擔風險追求更高報酬',
            ].map(o=>(
              <button key={o} className={`choice-btn${data.risk_attitude===o?' selected':''}`} onClick={() => auto('risk_attitude',o)}>{o}</button>
            ))}
          </div>
        </div>
      )}

      {/* Q22 聯絡 */}
      {step === 22 && (
        <div className="q-card" key="22">
          <div className="q-label">{ql(22)}</div>
          <div className="q-title">最後，留下您的聯絡方式</div>
          <input className="q-input" type="text" placeholder="姓名確認"
            value={data.contact_name||data.name} onChange={e => set('contact_name',e.target.value)} />
          <input className="q-input" type="tel" placeholder="聯絡電話 *（必填）"
            value={data.phone} onChange={e => set('phone',e.target.value)} />
          <input className="q-input" type="text" placeholder="LINE ID（選填）"
            value={data.line_id} onChange={e => set('line_id',e.target.value)} />
          <button className="btn-next"
            disabled={!((data.contact_name||data.name).trim())||!data.phone.trim()||submitting}
            onClick={submit} style={{background:'#D4AF37',color:'#2C3E30'}}>
            {submitting?'提交中…':'提交，取得前置報告 →'}
          </button>
        </div>
      )}
    </div>
  )
}
