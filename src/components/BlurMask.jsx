export default function BlurMask({ children, locked }) {
  if (!locked) return <>{children}</>

  return (
    <div className="blur-wrap">
      <div className="blur-content">{children}</div>
      <div className="blur-overlay">
        <p className="blur-cta-title">🔒 完整報告需要預約解鎖</p>
        <p className="blur-cta-sub">
          這份財務診斷報告由 Howard 親自設定的 AI 模型分析生成。<br />
          預約一對一財務整聊後，Howard 將親自帶你逐項解讀。
        </p>
        <a
          href="https://line.me/R/ti/p/%40fia8315s"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-line"
        >
          ☕ 預約 Howard 解讀我的報告
        </a>
      </div>
    </div>
  )
}
