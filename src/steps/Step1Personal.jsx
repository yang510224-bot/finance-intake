export default function Step1Personal({ data, update }) {
  return (
    <div>
      <h2 className="step-title">第一步：個人基本資料</h2>
      <p className="step-desc">讓我們先認識你，這些資料只用於生成你的個人化財務報告。</p>

      <div className="field">
        <label>你的名字（暱稱即可）</label>
        <input
          type="text"
          placeholder="例：小明、Howard、匿名"
          value={data.name || ''}
          onChange={e => update('name', e.target.value)}
        />
      </div>

      <div className="field">
        <label>年齡</label>
        <input
          type="number"
          placeholder="例：35"
          min={18} max={80}
          value={data.age || ''}
          onChange={e => update('age', e.target.value)}
        />
      </div>

      <div className="field">
        <label>目前健康狀況</label>
        <div className="choice-group">
          {['良好', '一般', '需注意'].map(v => (
            <button
              key={v}
              type="button"
              className={`choice-btn ${data.health === v ? 'active' : ''}`}
              onClick={() => update('health', v)}
            >
              {v === '良好' ? '✅ 良好' : v === '一般' ? '🟡 一般' : '⚠️ 需注意'}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
