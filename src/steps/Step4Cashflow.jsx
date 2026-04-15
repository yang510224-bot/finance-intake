export default function Step4Cashflow({ data, update }) {
  return (
    <div>
      <h2 className="step-title">第四步：現金流狀況</h2>
      <p className="step-desc">錢流的健不健康，這三個數字最能說明問題。</p>

      <div className="field">
        <label>每月固定支出（新台幣）</label>
        <input
          type="number"
          placeholder="例：55000（含房貸、孝親費、生活費）"
          min={0}
          value={data.monthly_expense || ''}
          onChange={e => update('monthly_expense', e.target.value)}
        />
      </div>

      <div className="field">
        <label>目前儲蓄率（每月能存下的比例）</label>
        <div className="choice-group">
          {[
            { label: '幾乎 0%', val: 0 },
            { label: '5–10%', val: 8 },
            { label: '11–20%', val: 15 },
            { label: '21–30%', val: 25 },
            { label: '30% 以上', val: 35 },
          ].map(({ label, val }) => (
            <button
              key={val}
              type="button"
              className={`choice-btn ${data.savings_rate === val ? 'active' : ''}`}
              onClick={() => update('savings_rate', val)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <label>緊急備用金（可撐幾個月的月支出）</label>
        <div className="choice-group">
          {[
            { label: '不足 1 個月', val: 0 },
            { label: '1–3 個月', val: 2 },
            { label: '3–6 個月', val: 4 },
            { label: '6 個月以上', val: 7 },
          ].map(({ label, val }) => (
            <button
              key={val}
              type="button"
              className={`choice-btn ${data.emergency_months === val ? 'active' : ''}`}
              onClick={() => update('emergency_months', val)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
