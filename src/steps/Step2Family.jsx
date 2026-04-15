export default function Step2Family({ data, update }) {
  return (
    <div>
      <h2 className="step-title">第二步：家庭結構</h2>
      <p className="step-desc">家庭狀況直接影響你的財務風險係數與保障缺口。</p>

      <div className="field">
        <label>婚姻狀況</label>
        <div className="choice-group">
          {['單身', '已婚', '離婚/喪偶'].map(v => (
            <button
              key={v}
              type="button"
              className={`choice-btn ${data.marital === v ? 'active' : ''}`}
              onClick={() => update('marital', v)}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <label>子女人數</label>
        <div className="choice-group">
          {['0', '1', '2', '3+'].map(v => (
            <button
              key={v}
              type="button"
              className={`choice-btn ${String(data.children) === v ? 'active' : ''}`}
              onClick={() => update('children', v === '3+' ? 3 : Number(v))}
            >
              {v} 人
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <label>需扶養的家人（可自由描述）</label>
        <textarea
          placeholder="例：父母每月孝親費 1 萬、岳父母偶爾補貼、無"
          value={data.dependents || ''}
          onChange={e => update('dependents', e.target.value)}
        />
      </div>
    </div>
  )
}
