import React, { useMemo } from 'react';
import { useCityStore } from '../../store/cityStore';
import { motion, AnimatePresence } from 'framer-motion';
import { getAlertColor, formatRelativeTime, getSystemIcon } from '../../utils/helpers';

const AlertItem = ({ alert, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: index * 0.05 }}
      className={`p-4 rounded-lg border-l-4 ${
        alert.alertLevel === 'critical' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
        alert.alertLevel === 'warning' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' :
        'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <span className="text-2xl">{getSystemIcon(alert.system)}</span>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-gray-900 dark:text-white">
                {alert.sensorId}
              </h4>
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getAlertColor(alert.alertLevel)}`}>
                {alert.alertLevel}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {alert.system} • {alert.type.replace(/_/g, ' ')}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Value: <span className="font-semibold">{alert.value.toFixed(2)}</span>
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              {formatRelativeTime(alert.timestamp)}
            </p>
          </div>
        </div>
        <button
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          title="Acknowledge alert"
        >
          ✕
        </button>
      </div>
    </motion.div>
  );
};

const AlertPanel = () => {
  const { alerts } = useCityStore();

  const categorizedAlerts = useMemo(() => {
    return {
      critical: alerts.filter(a => a.alertLevel === 'critical'),
      warning: alerts.filter(a => a.alertLevel === 'warning'),
      info: alerts.filter(a => a.alertLevel === 'info')
    };
  }, [alerts]);

  const displayAlerts = useMemo(() => {
    return alerts.slice(0, 10); // Show top 10 alerts
  }, [alerts]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
    >
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Active Alerts
          </h2>
          <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 rounded-full text-sm font-semibold">
            {alerts.length} active
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {categorizedAlerts.critical.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Critical</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {categorizedAlerts.warning.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Warning</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {categorizedAlerts.info.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Info</div>
          </div>
        </div>
      </div>

      <div className="p-6 max-h-[400px] overflow-y-auto space-y-3">
        <AnimatePresence>
          {displayAlerts.length > 0 ? (
            displayAlerts.map((alert, index) => (
              <AlertItem key={`${alert.sensorId}-${alert.timestamp}`} alert={alert} index={index} />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8 text-gray-500 dark:text-gray-400"
            >
              ✓ No active alerts - All systems operating normally
            </motion.div>
          )}
        </AnimatePresence>

        {alerts.length > 10 && (
          <div className="text-center pt-4">
            <button className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium">
              View all {alerts.length} alerts
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AlertPanel;
