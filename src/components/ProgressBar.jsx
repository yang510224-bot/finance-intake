const STEP_LABELS = ['個人', '家庭', '職業', '現金流', '負債', '保險']

export default function ProgressBar({ current, total }) {
  const pct = Math.round((current / total) * 100)

  return (
    <div className="progress-wrap">
      <div className="progress-label">
        <span>第 {current} 步 / 共 {total} 步</span>
        <span>{pct}%</span>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="step-dots">
        {STEP_LABELS.map((_, i) => (
          <div
            key={i}
            className={`step-dot ${i + 1 < current ? 'done' : i + 1 === current ? 'active' : ''}`}
            title={STEP_LABELS[i]}
          />
        ))}
      </div>
    </div>
  )
}
