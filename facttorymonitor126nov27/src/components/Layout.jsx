import { NavLink, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import useFactoryStore from '../store/useFactoryStore';
import { formatDate } from '../utils/formatters';
import {
  HomeIcon,
  CpuChipIcon,
  ChartBarIcon,
  BellAlertIcon,
  ArrowPathIcon,
  MoonIcon,
  SunIcon,
} from '@heroicons/react/24/outline';

const navItems = [
  { path: '/', label: 'Dashboard', icon: HomeIcon },
  { path: '/machines', label: 'Machines', icon: CpuChipIcon },
  { path: '/comparison', label: 'Comparison', icon: ChartBarIcon },
  { path: '/command-center', label: 'Command Center', icon: BellAlertIcon },
];

export const Layout = () => {
  const darkMode = useFactoryStore(state => state.darkMode);
  const toggleDarkMode = useFactoryStore(state => state.toggleDarkMode);
  const lastUpdate = useFactoryStore(state => state.lastUpdate);
  const getAlarmStats = useFactoryStore(state => state.getAlarmStats);

  const alarmStats = getAlarmStats();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <CpuChipIcon className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Factory Monitor</h1>
                <p className="text-xs text-muted-foreground">Real-time Analytics</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                  {item.label === 'Command Center' && alarmStats.unacknowledged > 0 && (
                    <span className="ml-1 px-2 py-0.5 text-xs font-bold rounded-full bg-destructive text-destructive-foreground">
                      {alarmStats.unacknowledged}
                    </span>
                  )}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-4">
              {lastUpdate && (
                <div className="hidden lg:flex items-center gap-2 text-sm text-muted-foreground">
                  <ArrowPathIcon className="w-4 h-4 animate-pulse-slow" />
                  <span>Updated {formatDate(lastUpdate)}</span>
                </div>
              )}

              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-accent transition-colors"
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <SunIcon className="w-5 h-5" />
                ) : (
                  <MoonIcon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <nav className="md:hidden border-b border-border bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-1 overflow-x-auto py-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent'
                  }`
                }
              >
                <item.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{item.label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Outlet />
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Factory Monitor v1.0.0 - Real-time Factory Monitoring Platform</p>
        </div>
      </footer>
    </div>
  );
};
