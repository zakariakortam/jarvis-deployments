import { Moon, Sun, Play, Pause, Download, Menu, X } from 'lucide-react'
import { AlertBadge } from './AlertPanel'

export default function Header({
  darkMode,
  onToggleDarkMode,
  isStreaming,
  onToggleStreaming,
  onExport,
  alertCount,
  onShowAlerts,
  sidebarOpen,
  onToggleSidebar,
}) {
  return (
    <header className="bg-card border-b border-border">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg hover:bg-muted transition-colors lg:hidden"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5 text-foreground" />
            ) : (
              <Menu className="w-5 h-5 text-foreground" />
            )}
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground">Mission Control</h1>
            <p className="text-xs text-muted-foreground">Real-Time Telemetry Dashboard</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Streaming toggle */}
          <button
            onClick={onToggleStreaming}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              isStreaming
                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                : 'bg-success text-success-foreground hover:bg-success/90'
            }`}
          >
            {isStreaming ? (
              <>
                <Pause className="w-4 h-4" />
                <span className="text-sm font-medium hidden sm:inline">Stop</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span className="text-sm font-medium hidden sm:inline">Start</span>
              </>
            )}
          </button>

          {/* Export */}
          <div className="relative group">
            <button className="p-2 rounded-lg hover:bg-muted transition-colors">
              <Download className="w-5 h-5 text-foreground" />
            </button>
            <div className="absolute right-0 mt-2 w-32 bg-card border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <button
                onClick={() => onExport('json')}
                className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors rounded-t-lg"
              >
                Export JSON
              </button>
              <button
                onClick={() => onExport('csv')}
                className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors rounded-b-lg"
              >
                Export CSV
              </button>
            </div>
          </div>

          {/* Alerts */}
          <AlertBadge count={alertCount} onClick={onShowAlerts} />

          {/* Dark mode toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-foreground" />
            ) : (
              <Moon className="w-5 h-5 text-foreground" />
            )}
          </button>
        </div>
      </div>
    </header>
  )
}
