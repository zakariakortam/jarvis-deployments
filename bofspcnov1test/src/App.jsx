import { Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import Layout from './components/Common/Layout'
import LoadingSpinner from './components/Common/LoadingSpinner'
import { useThemeStore } from './store/themeStore'
import { useAuthStore } from './store/authStore'

// Lazy load pages for code splitting
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Analytics = lazy(() => import('./pages/Analytics'))
const DataEntry = lazy(() => import('./pages/DataEntry'))
const Reports = lazy(() => import('./pages/Reports'))
const Settings = lazy(() => import('./pages/Settings'))
const Login = lazy(() => import('./pages/Login'))
const NotFound = lazy(() => import('./pages/NotFound'))

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

function App() {
  const { theme } = useThemeStore()

  return (
    <div className={theme}>
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-gray-100 transition-colors">
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="data-entry" element={<DataEntry />} />
              <Route path="reports" element={<Reports />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </div>
    </div>
  )
}

export default App
