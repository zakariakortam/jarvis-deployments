#!/bin/bash
PROJECT_ROOT="/home/facilis/storage/piUaoikOYFercIkS3h1a5G5fREk2/projects/bof-spc-monitor"

echo "Generating React components and pages..."

# LoadingSpinner
cat > "$PROJECT_ROOT/src/components/Common/LoadingSpinner.jsx" << 'EOF'
const LoadingSpinner = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className={`animate-spin rounded-full border-4 border-gray-300 border-t-primary-600 ${sizeClasses[size]}`} />
    </div>
  )
}

export default LoadingSpinner
EOF

# Layout
cat > "$PROJECT_ROOT/src/components/Common/Layout.jsx" << 'EOF'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'
import { useState } from 'react'

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-900">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout
EOF

# Header
cat > "$PROJECT_ROOT/src/components/Common/Header.jsx" << 'EOF'
import { useThemeStore } from '@/store/themeStore'
import { useAuthStore } from '@/store/authStore'

const Header = ({ onMenuClick }) => {
  const { theme, toggleTheme } = useThemeStore()
  const { user, logout } = useAuthStore()

  return (
    <header className="bg-white dark:bg-slate-800 shadow-sm px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="lg:hidden">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">BOF SPC Monitor</h1>
      </div>
      <div className="flex items-center gap-4">
        <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700">
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name || 'User'}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{user?.role || 'Operator'}</p>
        </div>
        <button onClick={logout} className="btn-secondary text-sm">
          Logout
        </button>
      </div>
    </header>
  )
}

export default Header
EOF

# Sidebar
cat > "$PROJECT_ROOT/src/components/Common/Sidebar.jsx" << 'EOF'
import { NavLink } from 'react-router-dom'

const Sidebar = ({ isOpen, onToggle }) => {
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/analytics', label: 'Analytics', icon: '📈' },
    { path: '/data-entry', label: 'Data Entry', icon: '✏️' },
    { path: '/reports', label: 'Reports', icon: '📄' },
    { path: '/settings', label: 'Settings', icon: '⚙️' }
  ]

  return (
    <aside className={\`bg-slate-800 text-white w-64 flex-shrink-0 transition-transform duration-300 \${!isOpen && '-translate-x-full lg:translate-x-0'}\`}>
      <div className="p-6">
        <h2 className="text-xl font-bold mb-6">Navigation</h2>
        <nav className="space-y-2">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                \`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors \${
                  isActive
                    ? 'bg-primary-600 text-white'
                    : 'hover:bg-slate-700'
                }\`
              }
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  )
}

export default Sidebar
EOF

# Dashboard Page
cat > "$PROJECT_ROOT/src/pages/Dashboard.jsx" << 'EOF'
import { useState, useEffect } from 'react'
import { BOF_PARAMETERS } from '@/services/spc/bofValidation'

const Dashboard = () => {
  const [liveData, setLiveData] = useState({
    temperature: 1650,
    carbon: 0.06,
    oxygen: 900,
    lanceHeight: 2.25,
    tapToTapTime: 40
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveData(prev => ({
        temperature: prev.temperature + (Math.random() - 0.5) * 10,
        carbon: prev.carbon + (Math.random() - 0.5) * 0.01,
        oxygen: prev.oxygen + (Math.random() - 0.5) * 20,
        lanceHeight: prev.lanceHeight + (Math.random() - 0.5) * 0.1,
        tapToTapTime: prev.tapToTapTime + (Math.random() - 0.5) * 2
      }))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (param, value) => {
    const spec = BOF_PARAMETERS[param]
    if (value > spec.usl || value < spec.lsl) return 'text-red-500'
    if (value > spec.target * 1.05 || value < spec.target * 0.95) return 'text-yellow-500'
    return 'text-green-500'
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Live BOF Monitoring</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(liveData).map(([key, value]) => {
          const param = BOF_PARAMETERS[key]
          return (
            <div key={key} className="card">
              <h3 className="text-lg font-semibold mb-2">{param.name}</h3>
              <p className={\`text-4xl font-bold \${getStatusColor(key, value)}\`}>
                {value.toFixed(2)} {param.unit}
              </p>
              <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                <p>Target: {param.target} {param.unit}</p>
                <p>LSL: {param.lsl} | USL: {param.usl}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Dashboard
EOF

# Other pages (simplified)
for PAGE in Analytics DataEntry Reports Settings Login NotFound; do
  cat > "$PROJECT_ROOT/src/pages/$PAGE.jsx" << EOF
const $PAGE = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">$PAGE</h1>
      <div className="card">
        <p className="text-gray-600 dark:text-gray-400">
          $PAGE page content will be implemented here.
        </p>
      </div>
    </div>
  )
}

export default $PAGE
EOF
done

echo "Components and pages generated successfully!"
