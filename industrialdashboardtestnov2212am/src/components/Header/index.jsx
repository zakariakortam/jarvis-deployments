import { Moon, Sun, Download, RefreshCw } from 'lucide-react';
import useDashboardStore from '../../store/dashboardStore';

const Header = () => {
  const { isDarkMode, toggleDarkMode, downloadCSV, summary } = useDashboardStore();

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <RefreshCw className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Industrial Dashboard</h1>
                <p className="text-sm text-muted-foreground">Real-time Factory Monitoring</p>
              </div>
            </div>
          </div>

          {summary && (
            <div className="hidden md:flex items-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{summary.total}</div>
                <div className="text-xs text-muted-foreground">Total Units</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-success">{summary.operational}</div>
                <div className="text-xs text-muted-foreground">Operational</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-warning">{summary.warning}</div>
                <div className="text-xs text-muted-foreground">Warning</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-destructive">{summary.critical}</div>
                <div className="text-xs text-muted-foreground">Critical</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-muted-foreground">{summary.offline}</div>
                <div className="text-xs text-muted-foreground">Offline</div>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <button
              onClick={downloadCSV}
              className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors"
              title="Export to CSV"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors"
              title="Toggle theme"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
