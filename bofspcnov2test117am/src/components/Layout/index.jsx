import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Activity,
  History,
  BarChart3,
  Target,
  Upload,
  FileText,
  Settings,
  Users,
  Moon,
  Sun,
  Menu,
  X,
  LogOut,
  Bell,
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useThemeStore } from '../../store/themeStore'
import { useHeatStore } from '../../store/heatStore'

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const { alerts, getActiveAlerts } = useHeatStore()
  const activeAlerts = getActiveAlerts()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, permission: 'view_dashboard' },
    { name: 'Real-Time Monitoring', href: '/monitoring', icon: Activity, permission: 'view_monitoring' },
    { name: 'Heat History', href: '/history', icon: History, permission: 'view_history' },
    { name: 'Control Charts', href: '/control-charts', icon: BarChart3, permission: 'view_charts' },
    { name: 'Process Capability', href: '/capability', icon: Target, permission: 'view_capability' },
    { name: 'Data Import', href: '/import', icon: Upload, permission: 'import_data' },
    { name: 'Reports', href: '/reports', icon: FileText, permission: 'generate_reports' },
    { name: 'Settings', href: '/settings', icon: Settings, permission: 'manage_settings' },
    { name: 'User Management', href: '/users', icon: Users, permission: 'manage_users' },
  ]

  const hasPermission = (permission) => {
    const rolePermissions = {
      operator: ['view_dashboard', 'view_monitoring', 'add_heat_data'],
      process_engineer: [
        'view_dashboard',
        'view_monitoring',
        'add_heat_data',
        'view_charts',
        'view_capability',
        'view_history',
        'generate_reports',
      ],
      quality_engineer: [
        'view_dashboard',
        'view_monitoring',
        'add_heat_data',
        'view_charts',
        'view_capability',
        'view_history',
        'generate_reports',
        'import_data',
        'manage_settings',
        'manage_users',
      ],
    }
    return rolePermissions[user?.role]?.includes(permission) || false
  }

  const filteredNavigation = navigation.filter((item) =>
    hasPermission(item.permission)
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-steel-900">
      {/* Header */}
      <header className="bg-white dark:bg-steel-800 border-b border-gray-200 dark:border-steel-700 sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-steel-700"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400">
              BOF SPC System
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Alerts */}
            <div className="relative">
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-steel-700 relative">
                <Bell size={20} />
                {activeAlerts.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                )}
              </button>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-steel-700"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* User Menu */}
            <div className="flex items-center gap-3 pl-3 border-l border-gray-200 dark:border-steel-700">
              <div className="text-right">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {user?.role?.replace('_', ' ')}
                </p>
              </div>
              <button
                onClick={logout}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-steel-700 text-red-600 dark:text-red-400"
                aria-label="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="w-64 bg-white dark:bg-steel-800 border-r border-gray-200 dark:border-steel-700 min-h-[calc(100vh-61px)] sticky top-[61px]">
            <nav className="p-4 space-y-1">
              {filteredNavigation.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                        : 'hover:bg-gray-100 dark:hover:bg-steel-700'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="text-sm font-medium">{item.name}</span>
                  </Link>
                )
              })}
            </nav>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  )
}

export default Layout
