import { useState, useRef } from 'react';
import {
  Sun,
  Moon,
  Upload,
  Bell,
  RefreshCw,
  Download,
  Database,
  AlertCircle,
  CheckCircle,
  X,
} from 'lucide-react';
import useStore from '../../store/useStore';
import clsx from 'clsx';

export default function Header() {
  const {
    darkMode,
    toggleDarkMode,
    loadData,
    isLoading,
    loadProgress,
    error,
    alerts,
    metadata,
    isUsingMockData,
    generateMoreMockData,
    exportData,
  } = useStore();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const fileInputRef = useRef(null);

  const recentAlerts = alerts.slice(-5).reverse();
  const criticalCount = alerts.filter(a => a.type === 'critical').length;

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      loadData(file);
    }
    event.target.value = '';
  };

  const handleExport = (format) => {
    const data = exportData(format);
    const blob = new Blob([data], { type: format === 'csv' ? 'text/csv' : 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reflow-data-export.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left section - Status */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {metadata.totalRecords?.toLocaleString() || 0} records
            </span>
            {isUsingMockData && (
              <span className="badge badge-warning text-xs">Demo Data</span>
            )}
          </div>

          {isLoading && (
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-primary-500 animate-spin" />
              <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-500 transition-all duration-300"
                  style={{ width: `${loadProgress}%` }}
                />
              </div>
              <span className="text-xs text-gray-500">{loadProgress.toFixed(0)}%</span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-red-500">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}
        </div>

        {/* Right section - Actions */}
        <div className="flex items-center gap-3">
          {/* Generate more data button (for demo) */}
          {isUsingMockData && (
            <button
              onClick={() => generateMoreMockData(500)}
              className="btn btn-ghost text-xs"
              title="Generate more sample data"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">More Data</span>
            </button>
          )}

          {/* Upload Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn btn-secondary"
            disabled={isLoading}
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Upload CSV</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* Export Button */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="btn btn-ghost"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
            {showExportMenu && (
              <div className="absolute right-0 top-full mt-2 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                <button
                  onClick={() => handleExport('csv')}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Export as CSV
                </button>
                <button
                  onClick={() => handleExport('json')}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Export as JSON
                </button>
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={clsx(
                'btn btn-ghost relative',
                criticalCount > 0 && 'text-red-500'
              )}
            >
              <Bell className="w-5 h-5" />
              {criticalCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 text-xs bg-red-500 text-white rounded-full flex items-center justify-center">
                  {criticalCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-medium">Recent Alerts</h3>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {recentAlerts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                      <CheckCircle className="w-8 h-8 mb-2" />
                      <p className="text-sm">No recent alerts</p>
                    </div>
                  ) : (
                    recentAlerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={clsx(
                          'px-4 py-3 border-b border-gray-100 dark:border-gray-700 last:border-0',
                          alert.type === 'critical' && 'bg-red-50 dark:bg-red-900/10'
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className={clsx(
                            'w-2 h-2 rounded-full mt-1.5',
                            alert.type === 'critical' ? 'bg-red-500' : 'bg-yellow-500'
                          )} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {alert.message}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              {alert.timestamp?.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="btn btn-ghost"
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-yellow-500" />
            ) : (
              <Moon className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
