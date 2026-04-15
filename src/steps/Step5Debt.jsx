export default function Step5Debt({ data, update }) {
  return (
    <div>
      <h2 className="step-title">第五步：負債結構</h2>
      <p className="step-desc">負債不是罪，但不清楚自己的負債才是真正的風險。</p>

      <div className="field">
        <div className="toggle-row">
          <label>目前有房貸</label>
          <label className="toggle">
            <input
              type="checkbox"
              checked={!!data.has_mortgage}
              onChange={e => update('has_mortgage', e.target.checked)}
            />
            <span className="toggle-slider" />
          </label>
        </div>
        {data.has_mortgage && (
          <input
            type="number"
            placeholder="房貸每月還款金額（新台幣）"
            min={0}
            value={data.mortgage_amt || ''}
            onChange={e => update('mortgage_amt', e.target.value)}
            style={{ marginTop: 8 }}
          />
        )}
      </div>

      <div className="field">
        <label>其他負債總額（信用卡、車貸、學貸等，新台幣）</label>
        <input
          type="number"
          placeholder="例：200000，無則填 0"
          min={0}
          value={data.other_debt || ''}
          onChange={e => update('other_debt', e.target.value)}
        />
      </div>

      <div className="field">
        <label>補充說明（選填）</label>
        <textarea
          placeholder="例：信用卡循環利息每月約 2000、有私人借貸"
          value={data.debt_notes || ''}
          onChange={e => update('debt_notes', e.target.value)}
        />
      </div>
    </div>
  )
}
