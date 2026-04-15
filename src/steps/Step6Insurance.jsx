export default function Step6Insurance({ data, update }) {
  return (
    <div>
      <h2 className="step-title">第六步：保險配置</h2>
      <p className="step-desc">最後一步。保險是防護網的核心——填完就能生成你的專屬財務診斷。</p>

      <div className="field">
        <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: 12 }}>
          你目前有哪些保險？（可複選）
        </p>
        <div className="toggle-row">
          <label>壽險（含定期壽險）</label>
          <label className="toggle">
            <input
              type="checkbox"
              checked={!!data.has_life}
              onChange={e => update('has_life', e.target.checked)}
            />
            <span className="toggle-slider" />
          </label>
        </div>
        <div className="toggle-row">
          <label>醫療險（住院/手術）</label>
          <label className="toggle">
            <input
              type="checkbox"
              checked={!!data.has_health}
              onChange={e => update('has_health', e.target.checked)}
            />
            <span className="toggle-slider" />
          </label>
        </div>
        <div className="toggle-row">
          <label>意外險</label>
          <label className="toggle">
            <input
              type="checkbox"
              checked={!!data.has_accident}
              onChange={e => update('has_accident', e.target.checked)}
            />
            <span className="toggle-slider" />
          </label>
        </div>
      </div>

      <div className="field">
        <label>你覺得自己的保障有哪些缺口？（選填）</label>
        <textarea
          placeholder="例：重大傷病沒有規劃、壽險保額太低、保費快繳不下去"
          value={data.insurance_gap || ''}
          onChange={e => update('insurance_gap', e.target.value)}
        />
      </div>
    </div>
  )
}
