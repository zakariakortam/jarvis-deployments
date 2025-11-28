import { Sun, Moon, Bell, Settings, Download, LogOut } from 'lucide-react';
import useEventStore from '../../store/eventStore';
import { format } from 'date-fns';

const Header = () => {
  const { theme, toggleTheme, user, alerts, connectionStatus } = useEventStore();
  const unreadAlerts = alerts.filter(a => !a.acknowledged).length;

  return (
    <header className="glass-effect border-b border-border sticky top-0 z-50">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
              <span className="text-white font-bold text-xl">EC</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">Event Command Center</h1>
              <p className="text-xs text-muted-foreground">
                {format(new Date(), 'EEEE, MMMM d, yyyy • HH:mm')}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Connection Status */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-accent rounded-lg">
              <div
                className={`w-2 h-2 rounded-full ${
                  connectionStatus.connected ? 'bg-success' : 'bg-danger'
                }`}
              />
              <span className="text-sm font-medium">
                {connectionStatus.connected ? 'Connected' : 'Disconnected'}
              </span>
              {connectionStatus.connected && (
                <span className="text-xs text-muted-foreground">
                  {connectionStatus.latency}ms
                </span>
              )}
            </div>

            {/* Notifications */}
            <button className="relative p-2 hover:bg-accent rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              {unreadAlerts > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-danger text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {unreadAlerts}
                </span>
              )}
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            {/* Settings */}
            <button className="p-2 hover:bg-accent rounded-lg transition-colors">
              <Settings className="w-5 h-5" />
            </button>

            {/* Export */}
            <button className="hidden md:flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
              <Download className="w-4 h-4" />
              <span className="text-sm font-medium">Export</span>
            </button>

            {/* User Menu */}
            {user && (
              <div className="flex items-center gap-3 pl-3 border-l border-border">
                <div className="hidden md:block text-right">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                  {user.name.charAt(0)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
