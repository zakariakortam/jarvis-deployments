import { Outlet, NavLink } from 'react-router-dom'
import { useState, useEffect } from 'react'
import {
  ChartBarIcon,
  BellIcon,
  ClockIcon,
  Cog6ToothIcon,
  SignalIcon,
  SunIcon,
  MoonIcon,
} from '@heroicons/react/24/outline'
import { useThemeStore } from '../../store/themeStore'
import { useSpcStore } from '../../store/spcStore'
import { wsService } from '../../services/websocket'
import clsx from 'clsx'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: ChartBarIcon },
  { name: 'Real-time Monitoring', href: '/monitoring', icon: SignalIcon },
  { name: 'Historical Analysis', href: '/historical', icon: ClockIcon },
  { name: 'Alerts', href: '/alerts', icon: BellIcon },
  { name: 'Configuration', href: '/configuration', icon: Cog6ToothIcon },
]

export default function Layout() {
  const { theme, toggleTheme } = useThemeStore()
  const { isConnected, unreadAlerts, processStatus } = useSpcStore()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  useEffect(() => {
    // Connect to WebSocket on mount
    wsService.connect()

    return () => {
      // Cleanup on unmount
      wsService.disconnect()
    }
  }, [])

  const getStatusColor = () => {
    switch (processStatus) {
      case 'critical':
        return 'bg-red-500'
      case 'warning':
        return 'bg-yellow-500'
      case 'normal':
        return 'bg-green-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={clsx(
          'flex flex-col border-r border-border bg-card transition-all duration-300',
          isSidebarOpen ? 'w-64' : 'w-20'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          {isSidebarOpen && (
            <h1 className="text-xl font-bold text-primary">SPC System</h1>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="rounded-lg p-2 hover:bg-accent"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              strokeWidth="2"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d={isSidebarOpen ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'}
              />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-2 py-4">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                clsx(
                  'group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )
              }
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {isSidebarOpen && <span className="ml-3">{item.name}</span>}
              {item.name === 'Alerts' && unreadAlerts > 0 && isSidebarOpen && (
                <span className="ml-auto inline-flex items-center rounded-full bg-destructive px-2 py-0.5 text-xs font-semibold text-destructive-foreground">
                  {unreadAlerts}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Status and Theme Toggle */}
        <div className="border-t border-border p-4">
          <div className="flex items-center justify-between">
            {isSidebarOpen && (
              <div className="flex items-center space-x-2">
                <div
                  className={clsx(
                    'h-2 w-2 rounded-full',
                    isConnected ? 'bg-green-500' : 'bg-red-500'
                  )}
                />
                <span className="text-xs text-muted-foreground">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            )}
            <button
              onClick={toggleTheme}
              className="rounded-lg p-2 hover:bg-accent"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <MoonIcon className="h-5 w-5" />
              ) : (
                <SunIcon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold">
              Process Monitoring
            </h2>
            <div className="flex items-center space-x-2">
              <div className={clsx('h-3 w-3 rounded-full', getStatusColor())} />
              <span className="text-sm font-medium capitalize">
                {processStatus}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-sm text-muted-foreground">
              {new Date().toLocaleString()}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-background p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
