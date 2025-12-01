import { useState } from 'react';
import {
  Settings as SettingsIcon,
  Sun,
  Moon,
  Database,
  Bell,
  Download,
  Trash2,
  RefreshCw,
  Info,
} from 'lucide-react';
import useStore from '../store/useStore';
import { Card } from '../components/common';

export default function Settings() {
  const {
    darkMode,
    toggleDarkMode,
    alertThresholds,
    setAlertThresholds,
    simulationParams,
    setSimulationParams,
    metadata,
    isUsingMockData,
    generateMoreMockData,
    data,
  } = useStore();

  const [tempThresholds, setTempThresholds] = useState({ ...alertThresholds });

  const saveThresholds = () => {
    setAlertThresholds(tempThresholds);
  };

  const resetToDefaults = () => {
    setTempThresholds({
      tempHigh: 260,
      tempLow: 20,
      powerHigh: 50,
      o2High: 500,
    });
    setSimulationParams({
      conveyorSpeed: 1.0,
      targetPeakTemp: 245,
      soakTime: 90,
      preheatRate: 2,
      coolingRate: 4,
    });
  };

  const clearStorage = () => {
    if (confirm('Are you sure you want to clear all stored settings? This will reset preferences to defaults.')) {
      localStorage.removeItem('reflow-oven-analytics');
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 animate-in max-w-4xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Configure application preferences and thresholds
        </p>
      </div>

      {/* Appearance */}
      <Card title="Appearance" subtitle="Visual preferences">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {darkMode ? (
                <Moon className="w-5 h-5 text-blue-500" />
              ) : (
                <Sun className="w-5 h-5 text-yellow-500" />
              )}
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Dark Mode</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Toggle between light and dark themes
                </p>
              </div>
            </div>
            <button
              onClick={toggleDarkMode}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                darkMode ? 'bg-primary-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  darkMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </Card>

      {/* Alert Thresholds */}
      <Card title="Alert Thresholds" subtitle="Configure when alerts are triggered">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              High Temperature Warning (°C)
            </label>
            <input
              type="number"
              value={tempThresholds.tempHigh}
              onChange={(e) =>
                setTempThresholds({ ...tempThresholds, tempHigh: Number(e.target.value) })
              }
              className="input"
            />
            <p className="text-xs text-gray-500 mt-1">Default: 260°C</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Low Temperature Warning (°C)
            </label>
            <input
              type="number"
              value={tempThresholds.tempLow}
              onChange={(e) =>
                setTempThresholds({ ...tempThresholds, tempLow: Number(e.target.value) })
              }
              className="input"
            />
            <p className="text-xs text-gray-500 mt-1">Default: 20°C</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              High Power Warning (kW)
            </label>
            <input
              type="number"
              value={tempThresholds.powerHigh}
              onChange={(e) =>
                setTempThresholds({ ...tempThresholds, powerHigh: Number(e.target.value) })
              }
              className="input"
            />
            <p className="text-xs text-gray-500 mt-1">Default: 50 kW</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              High O2 Warning (ppm)
            </label>
            <input
              type="number"
              value={tempThresholds.o2High}
              onChange={(e) =>
                setTempThresholds({ ...tempThresholds, o2High: Number(e.target.value) })
              }
              className="input"
            />
            <p className="text-xs text-gray-500 mt-1">Default: 500 ppm</p>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button onClick={saveThresholds} className="btn btn-primary">
            Save Thresholds
          </button>
          <button onClick={resetToDefaults} className="btn btn-ghost">
            Reset to Defaults
          </button>
        </div>
      </Card>

      {/* Data Management */}
      <Card title="Data Management" subtitle="Manage loaded data and storage">
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Current Dataset</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {isUsingMockData ? 'Demo/Sample Data' : 'User Uploaded Data'}
                  </p>
                </div>
              </div>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                {data.length.toLocaleString()} records
              </span>
            </div>
          </div>

          {metadata.timeRange && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 dark:text-gray-400">Time Range Start</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {metadata.timeRange.start?.toLocaleString() || '—'}
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Time Range End</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {metadata.timeRange.end?.toLocaleString() || '—'}
                </p>
              </div>
            </div>
          )}

          {isUsingMockData && (
            <button
              onClick={() => generateMoreMockData(1000)}
              className="btn btn-secondary w-full"
            >
              <RefreshCw className="w-4 h-4" />
              Generate More Sample Data (+1000 records)
            </button>
          )}
        </div>
      </Card>

      {/* Storage */}
      <Card title="Local Storage" subtitle="Browser storage and preferences">
        <div className="space-y-4">
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-yellow-500 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-700 dark:text-yellow-400">
                  Storage Information
                </p>
                <p className="text-sm text-yellow-600 dark:text-yellow-300 mt-1">
                  Settings and preferences are stored locally in your browser. Clearing browser
                  data will reset all preferences.
                </p>
              </div>
            </div>
          </div>

          <button onClick={clearStorage} className="btn btn-ghost text-red-500 w-full">
            <Trash2 className="w-4 h-4" />
            Clear All Stored Settings
          </button>
        </div>
      </Card>

      {/* About */}
      <Card title="About" subtitle="Application information">
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Application</span>
            <span className="font-medium text-gray-900 dark:text-white">
              Reflow Oven Analytics
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Version</span>
            <span className="font-medium text-gray-900 dark:text-white">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Technology Stack</span>
            <span className="font-medium text-gray-900 dark:text-white">
              React + Vite + Recharts
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Data Columns</span>
            <span className="font-medium text-gray-900 dark:text-white">65 parameters</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Temperature Zones</span>
            <span className="font-medium text-gray-900 dark:text-white">10 zones</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
