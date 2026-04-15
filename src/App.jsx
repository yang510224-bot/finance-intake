import { Routes, Route, Navigate } from 'react-router-dom'
import FormWizard from './pages/FormWizard'
import ReportPage from './pages/ReportPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<FormWizard />} />
      <Route path="/report/:id" element={<ReportPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
