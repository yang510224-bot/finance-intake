import { Routes, Route, Navigate } from 'react-router-dom'
import IntroPage from './pages/IntroPage'
import QuizPage from './pages/QuizPage'
import ReportPage from './pages/ReportPage'
import AdminPage from './pages/AdminPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<IntroPage />} />
      <Route path="/quiz" element={<QuizPage />} />
      <Route path="/report/:id" element={<ReportPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
