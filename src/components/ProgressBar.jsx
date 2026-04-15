export default function ProgressBar({ current, total }) {
  const pct = Math.round((current / total) * 100)
  return (
    <>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="progress-label">{current} / {total}</div>
    </>
  )
}
