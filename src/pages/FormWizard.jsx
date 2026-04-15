import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ProgressBar from '../components/ProgressBar'
import Step1Personal from '../steps/Step1Personal'
import Step2Family from '../steps/Step2Family'
import Step3Career from '../steps/Step3Career'
import Step4Cashflow from '../steps/Step4Cashflow'
import Step5Debt from '../steps/Step5Debt'
import Step6Insurance from '../steps/Step6Insurance'

const TOTAL_STEPS = 6

const INITIAL = {
  // Step 1
  name: '', age: '', health: '',
  // Step 2
  marital: '', children: 0, dependents: '',
  // Step 3
  occupation: '', income: '', income_type: '',
  // Step 4
  monthly_expense: '', savings_rate: null, emergency_months: null,
  // Step 5
  has_mortgage: false, mortgage_amt: '', other_debt: '', debt_notes: '',
  // Step 6
  has_life: false, has_health: false, has_accident: false, insurance_gap: '',
}

function stepIsValid(step, data) {
  if (step === 1) return data.name.trim() && data.age && data.health
  if (step === 2) return data.marital
  if (step === 3) return data.occupation.trim() && data.income && data.income_type
  if (step === 4) return data.monthly_expense && data.savings_rate !== null && data.emergency_months !== null
  if (step === 5) return true  // all optional
  if (step === 6) return true  // all optional
  return true
}

export default function FormWizard() {
  const [step, setStep] = useState(1)
  const [data, setData] = useState(INITIAL)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const update = (key, value) => setData(prev => ({ ...prev, [key]: value }))

  const next = () => {
    if (step < TOTAL_STEPS) setStep(s => s + 1)
  }

  const back = () => {
    if (step > 1) setStep(s => s - 1)
  }

  const submit = async () => {
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('提交失敗，請稍後再試')
      const { id } = await res.json()
      navigate(`/report/${id}`)
    } catch (e) {
      setError(e.message || '發生錯誤，請稍後再試')
      setSubmitting(false)
    }
  }

  const StepComponent = [
    null,
    Step1Personal,
    Step2Family,
    Step3Career,
    Step4Cashflow,
    Step5Debt,
    Step6Insurance,
  ][step]

  return (
    <div className="shell">
      <div className="card">
        <div className="brand">
          <div className="brand-title">財務整聊</div>
          <div className="brand-sub">HOWARD · FINANCIAL CONSULTING</div>
        </div>

        <ProgressBar current={step} total={TOTAL_STEPS} />

        {submitting ? (
          <div className="loading-shell">
            <div className="spinner" />
            <p className="loading-title">正在生成你的財務診斷報告…</p>
            <p className="loading-sub">Howard 的 AI 助理正在分析你的財務狀況，通常需要 20–40 秒</p>
          </div>
        ) : (
          <>
            <StepComponent data={data} update={update} />

            {error && (
              <p style={{ color: '#dc2626', fontSize: '0.85rem', marginTop: 8 }}>{error}</p>
            )}

            <div className="btn-row">
              {step > 1 ? (
                <button className="btn btn-back" onClick={back}>← 上一步</button>
              ) : (
                <span />
              )}

              {step < TOTAL_STEPS ? (
                <button
                  className="btn btn-next"
                  onClick={next}
                  disabled={!stepIsValid(step, data)}
                >
                  下一步 →
                </button>
              ) : (
                <button
                  className="btn btn-submit"
                  onClick={submit}
                  disabled={submitting}
                >
                  ✨ 生成我的財務診斷報告
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
