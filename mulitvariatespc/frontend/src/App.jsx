import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import MonitoringPage from './pages/MonitoringPage'
import HistoricalAnalysis from './pages/HistoricalAnalysis'
import AlertsPage from './pages/AlertsPage'
import ConfigurationPage from './pages/ConfigurationPage'
import { useThemeStore } from './store/themeStore'

function App() {
  const { theme } = useThemeStore()

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="monitoring" element={<MonitoringPage />} />
          <Route path="historical" element={<HistoricalAnalysis />} />
          <Route path="alerts" element={<AlertsPage />} />
          <Route path="configuration" element={<ConfigurationPage />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
