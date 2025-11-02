import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ControlCharts from './pages/ControlCharts'
import DataAnalysis from './pages/DataAnalysis'
import Reports from './pages/Reports'
import DataImport from './pages/DataImport'
import Settings from './pages/Settings'
import NotFound from './pages/NotFound'

function PrivateRoute({ children }) {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated)
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <PrivateRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/control-charts" element={<ControlCharts />} />
                <Route path="/data-analysis" element={<DataAnalysis />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/data-import" element={<DataImport />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </PrivateRoute>
        }
      />
    </Routes>
  )
}

export default App
