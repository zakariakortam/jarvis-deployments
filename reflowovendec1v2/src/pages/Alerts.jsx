import { useState, useMemo } from 'react';
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Bell,
  Settings,
  Trash2,
  Filter,
  Download,
} from 'lucide-react';
import useStore from '../store/useStore';
import { Card, TimeRangeSlider } from '../components/common';
import { formatNumber, detectAnomalies, calculateStats } from '../utils/calculations';

export default function Alerts() {
  const {
    alerts,
    alertThresholds,
    setAlertThresholds,
    clearAlerts,
    getFilteredData,
  } = useStore();

  const filteredData = getFilteredData();
  const [showSettings, setShowSettings] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [tempThresholds, setTempThresholds] = useState({ ...alertThresholds });

  const filteredAlerts = useMemo(() => {
    if (filterType === 'all') return alerts;
    return alerts.filter(a => a.type === filterType || a.category === filterType);
  }, [alerts, filterType]);

  const alertStats = useMemo(() => {
    return {
      total: alerts.length,
      critical: alerts.filter(a => a.type === 'critical').length,
      warning: alerts.filter(a => a.type === 'warning').length,
      byCategory: {
        temperature: alerts.filter(a => a.category === 'temperature').length,
        power: alerts.filter(a => a.category === 'power').length,
        environment: alerts.filter(a => a.category === 'environment').length,
      },
    };
  }, [alerts]);

  const anomalies = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return { temperature: [], power: [] };

    const tempAnomalies = detectAnomalies(
      filteredData.map(d => d.avgZoneTemp),
      2.5
    ).map(a => ({
      ...a,
      timestamp: filteredData[a.index]?.timestamp,
      type: 'temperature',
    }));

    const powerAnomalies = detectAnomalies(
      filteredData.map(d => d.power?.activePower).filter(Boolean),
      2.5
    ).map(a => ({
      ...a,
      timestamp: filteredData[a.index]?.timestamp,
      type: 'power',
    }));

    return { temperature: tempAnomalies, power: powerAnomalies };
  }, [filteredData]);

  const saveThresholds = () => {
    setAlertThresholds(tempThresholds);
    setShowSettings(false);
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'critical':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Bell className="w-5 h-5 text-blue-500" />;
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'critical':
        return 'border-red-500 bg-red-50 dark:bg-red-900/20';
      case 'warning':
        return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      default:
        return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20';
    }
  };

  return (
    <div className="space-y-6 animate-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Alerts & Anomalies
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Monitor system alerts and detect anomalies
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="btn btn-secondary"
          >
            <Settings className="w-4 h-4" />
            Thresholds
          </button>
          <button onClick={clearAlerts} className="btn btn-ghost text-red-500">
            <Trash2 className="w-4 h-4" />
            Clear All
          </button>
        </div>
      </div>

      {/* Time Range */}
      <Card>
        <div className="p-4">
          <TimeRangeSlider />
        </div>
      </Card>

      {/* Alert Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Alerts</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {alertStats.total}
              </p>
            </div>
            <Bell className="w-8 h-8 text-gray-400" />
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Critical</p>
              <p className="text-2xl font-bold text-red-500">{alertStats.critical}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Warning</p>
              <p className="text-2xl font-bold text-yellow-500">{alertStats.warning}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Temp Anomalies</p>
              <p className="text-2xl font-bold text-orange-500">
                {anomalies.temperature.length}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-orange-500" />
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Power Anomalies</p>
              <p className="text-2xl font-bold text-purple-500">
                {anomalies.power.length}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Threshold Settings Panel */}
      {showSettings && (
        <Card title="Alert Thresholds" subtitle="Configure when alerts are triggered">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                High Temperature (°C)
              </label>
              <input
                type="number"
                value={tempThresholds.tempHigh}
                onChange={(e) =>
                  setTempThresholds({ ...tempThresholds, tempHigh: Number(e.target.value) })
                }
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Low Temperature (°C)
              </label>
              <input
                type="number"
                value={tempThresholds.tempLow}
                onChange={(e) =>
                  setTempThresholds({ ...tempThresholds, tempLow: Number(e.target.value) })
                }
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                High Power (kW)
              </label>
              <input
                type="number"
                value={tempThresholds.powerHigh}
                onChange={(e) =>
                  setTempThresholds({ ...tempThresholds, powerHigh: Number(e.target.value) })
                }
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                High O2 (ppm)
              </label>
              <input
                type="number"
                value={tempThresholds.o2High}
                onChange={(e) =>
                  setTempThresholds({ ...tempThresholds, o2High: Number(e.target.value) })
                }
                className="input"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button onClick={saveThresholds} className="btn btn-primary">
              Save Thresholds
            </button>
            <button onClick={() => setShowSettings(false)} className="btn btn-ghost">
              Cancel
            </button>
          </div>
        </Card>
      )}

      {/* Filter Bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-gray-500">Filter:</span>
        {['all', 'critical', 'warning', 'temperature', 'power', 'environment'].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              filterType === type
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200'
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Alerts List */}
      <Card title="Alert History" subtitle="Recent system alerts and notifications">
        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {filteredAlerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <CheckCircle className="w-12 h-12 mb-3" />
              <p className="text-lg font-medium">No alerts</p>
              <p className="text-sm">System is operating normally</p>
            </div>
          ) : (
            filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border-l-4 ${getAlertColor(alert.type)}`}
              >
                <div className="flex items-start gap-3">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {alert.message}
                      </p>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {alert.timestamp?.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <span>Category: {alert.category}</span>
                      <span>Value: {formatNumber(alert.value, 2)}</span>
                      <span>Threshold: {formatNumber(alert.threshold, 2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Anomaly Detection Results */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card
          title="Temperature Anomalies"
          subtitle="Statistically significant temperature deviations"
        >
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {anomalies.temperature.length === 0 ? (
              <div className="flex items-center justify-center py-8 text-gray-400">
                <CheckCircle className="w-5 h-5 mr-2" />
                No anomalies detected
              </div>
            ) : (
              anomalies.temperature.slice(0, 20).map((a, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Index #{a.index}
                    </p>
                    <p className="text-xs text-gray-500">
                      {a.timestamp?.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-orange-500">
                      {formatNumber(a.value, 1)}°C
                    </p>
                    <p className="text-xs text-gray-500">
                      Z-score: {formatNumber(a.zScore, 2)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card
          title="Power Anomalies"
          subtitle="Unusual power consumption patterns"
        >
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {anomalies.power.length === 0 ? (
              <div className="flex items-center justify-center py-8 text-gray-400">
                <CheckCircle className="w-5 h-5 mr-2" />
                No anomalies detected
              </div>
            ) : (
              anomalies.power.slice(0, 20).map((a, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Index #{a.index}
                    </p>
                    <p className="text-xs text-gray-500">
                      {a.timestamp?.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-purple-500">
                      {formatNumber(a.value, 2)} kW
                    </p>
                    <p className="text-xs text-gray-500">
                      Z-score: {formatNumber(a.zScore, 2)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Current Thresholds Summary */}
      <Card title="Active Thresholds" subtitle="Current alert configuration">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-600 dark:text-red-400">High Temperature</p>
            <p className="text-2xl font-bold text-red-700 dark:text-red-300">
              {alertThresholds.tempHigh}°C
            </p>
          </div>
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-600 dark:text-blue-400">Low Temperature</p>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              {alertThresholds.tempLow}°C
            </p>
          </div>
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="text-sm text-yellow-600 dark:text-yellow-400">High Power</p>
            <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
              {alertThresholds.powerHigh} kW
            </p>
          </div>
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <p className="text-sm text-purple-600 dark:text-purple-400">High O2</p>
            <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
              {alertThresholds.o2High} ppm
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
