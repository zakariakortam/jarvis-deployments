import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Thermometer,
  Zap,
  Grid3X3,
  Factory,
  Database,
  FlaskConical,
  AlertTriangle,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Flame,
} from 'lucide-react';
import useStore from '../../store/useStore';
import clsx from 'clsx';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/temperature', icon: Thermometer, label: 'Temperature Profile' },
  { to: '/power', icon: Zap, label: 'Power Analytics' },
  { to: '/zones', icon: Grid3X3, label: 'Zone Analysis' },
  { to: '/production', icon: Factory, label: 'Production' },
  { to: '/explorer', icon: Database, label: 'Data Explorer' },
  { to: '/simulator', icon: FlaskConical, label: 'Simulator' },
  { to: '/alerts', icon: AlertTriangle, label: 'Alerts' },
  { to: '/statistics', icon: BarChart3, label: 'Statistics' },
];

export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, alerts } = useStore();
  const activeAlerts = alerts.filter(a => a.type === 'critical').length;

  return (
    <aside
      className={clsx(
        'fixed left-0 top-0 z-40 h-screen transition-all duration-300 ease-in-out',
        'bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700',
        sidebarCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
        <div className={clsx('flex items-center gap-3', sidebarCollapsed && 'justify-center w-full')}>
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 shadow-lg">
            <Flame className="w-6 h-6 text-white" />
          </div>
          {!sidebarCollapsed && (
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">Reflow</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Oven Analytics</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              clsx(
                'nav-link',
                isActive && 'nav-link-active',
                sidebarCollapsed && 'justify-center px-3'
              )
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && <span>{item.label}</span>}
            {item.to === '/alerts' && activeAlerts > 0 && (
              <span className={clsx(
                'ml-auto px-2 py-0.5 text-xs font-medium bg-red-100 text-red-600 rounded-full',
                'dark:bg-red-900/30 dark:text-red-400',
                sidebarCollapsed && 'absolute top-0 right-0 ml-0'
              )}>
                {activeAlerts}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Settings */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-3">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            clsx(
              'nav-link',
              isActive && 'nav-link-active',
              sidebarCollapsed && 'justify-center px-3'
            )
          }
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          {!sidebarCollapsed && <span>Settings</span>}
        </NavLink>
      </div>

      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className={clsx(
          'absolute -right-3 top-20 z-50',
          'flex items-center justify-center w-6 h-6 rounded-full',
          'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600',
          'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white',
          'shadow-sm hover:shadow transition-all'
        )}
      >
        {sidebarCollapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>
    </aside>
  );
}
