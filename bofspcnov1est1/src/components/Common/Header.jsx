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
