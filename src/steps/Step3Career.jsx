export default function Step3Career({ data, update }) {
  return (
    <div>
      <h2 className="step-title">第三步：職業與收入</h2>
      <p className="step-desc">收入結構決定了你需要的保障類型與儲蓄策略。</p>

      <div className="field">
        <label>職業 / 行業</label>
        <input
          type="text"
          placeholder="例：工程師、護理師、自營業、業務員"
          value={data.occupation || ''}
          onChange={e => update('occupation', e.target.value)}
        />
      </div>

      <div className="field">
        <label>每月稅前收入（新台幣）</label>
        <input
          type="number"
          placeholder="例：80000"
          min={0}
          value={data.income || ''}
          onChange={e => update('income', e.target.value)}
        />
      </div>

      <div className="field">
        <label>收入類型</label>
        <div className="choice-group">
          {['受薪', '自僱', '混合'].map(v => (
            <button
              key={v}
              type="button"
              className={`choice-btn ${data.income_type === v ? 'active' : ''}`}
              onClick={() => update('income_type', v)}
            >
              {v === '受薪' ? '🏢 受薪' : v === '自僱' ? '🏪 自僱/接案' : '🔀 混合'}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
