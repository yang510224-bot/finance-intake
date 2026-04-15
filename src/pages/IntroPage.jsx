import { useNavigate } from 'react-router-dom'

export default function IntroPage() {
  const navigate = useNavigate()
  return (
    <div className="screen">
      <div className="intro-content">
        <div className="intro-logo">財務整聊 · HOWARD</div>
        <div className="intro-body">
          <p>您好，我是財務整聊師 Howard 豪歐，書豪是我的本名。我曾經歷過財務黑洞，虧過才懂痛與光明，現在正在用正確的財務規劃方式重新累積資產。</p>
          <p>您會看到這個頁面，代表您已經有打算規劃您的財務。如果將您的財務目標比喻為海上的目標小島，小島上有您想要的願景，那麼要如何確保您搭乘的船安全抵達小島，就是我們的工作。</p>
          <p>在開始往您的目標前進之前，Howard 需要知道您更多的資訊，才能根據這些資訊告訴您完整的最終方案。</p>
          <p>所以，如果您準備好了，請靜心花 15 分鐘的時間，完成這份旅程開始前的前置準備。</p>
        </div>
        <button className="btn-start" onClick={() => navigate('/quiz')}>
          我準備好了，開始填寫 →
        </button>
      </div>
    </div>
  )
}
