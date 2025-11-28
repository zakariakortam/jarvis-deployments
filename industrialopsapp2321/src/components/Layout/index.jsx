import { Link, useLocation } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import {
  LayoutDashboard,
  Factory,
  Activity,
  Zap,
  ClipboardCheck,
  Wrench,
  PieChart,
  Moon,
  Sun,
  Bell,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

const navigation = [
  { name: 'Global Overview', path: '/overview', icon: LayoutDashboard },
  { name: 'Digital Twins', path: '/plant/NA-01', icon: Factory },
  { name: 'Process Lines', path: '/process-lines', icon: Activity },
  { name: 'Energy Management', path: '/energy', icon: Zap },
  { name: 'Quality Analytics', path: '/quality', icon: ClipboardCheck },
  { name: 'Maintenance', path: '/maintenance', icon: Wrench },
  { name: 'Executive Dashboard', path: '/executive', icon: PieChart }
];

export default function Layout({ children }) {
  const location = useLocation();
  const theme = useStore((state) => state.theme);
  const toggleTheme = useStore((state) => state.toggleTheme);
  const alerts = useStore((state) => state.alerts);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const unacknowledgedAlerts = alerts.filter(a => !a.acknowledged);
  const criticalAlerts = unacknowledgedAlerts.filter(a => a.type === 'critical');

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="flex h-16 items-center px-4 lg:px-6">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 mr-2"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <div className="flex items-center gap-2">
            <Factory className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-lg font-bold">Industrial Operations</h1>
              <p className="text-xs text-muted-foreground">Real-time Monitoring Platform</p>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-accent transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <div className="relative">
              <button className="p-2 rounded-lg hover:bg-accent transition-colors">
                <Bell className="w-5 h-5" />
                {unacknowledgedAlerts.length > 0 && (
                  <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
              {criticalAlerts.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {criticalAlerts.length}
                </span>
              )}
            </div>
          </div>
        </div>

        <nav className={`lg:block ${mobileMenuOpen ? 'block' : 'hidden'} border-t lg:border-t-0`}>
          <div className="flex flex-col lg:flex-row lg:items-center lg:px-6 overflow-x-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path ||
                (item.path.includes('/plant') && location.pathname.includes('/plant'));

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>
      </header>

      <main className="min-h-[calc(100vh-theme(spacing.16))]">
        {children}
      </main>
    </div>
  );
}
