import React, { useMemo } from 'react';
import { useCityStore } from '../../store/cityStore';
import { motion } from 'framer-motion';
import { formatNumber, formatPercentage, getSystemIcon } from '../../utils/helpers';
import GaugeChart from './GaugeChart';

const KPICard = ({ system, metrics, index }) => {
  const { setActiveSystem, activeSystem } = useCityStore();

  const efficiency = useMemo(() => {
    if (!metrics) return 0;
    return ((metrics.operational / metrics.totalSensors) * 100);
  }, [metrics]);

  const healthScore = useMemo(() => {
    if (!metrics) return 0;
    return Math.max(0, 100 - (metrics.alerts / metrics.totalSensors * 100));
  }, [metrics]);

  if (!metrics) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 cursor-pointer transition-all ${
        activeSystem === system ? 'ring-2 ring-blue-500' : ''
      }`}
      onClick={() => setActiveSystem(system)}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{getSystemIcon(system)}</span>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
              {system}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {formatNumber(metrics.totalSensors)} sensors
            </p>
          </div>
        </div>
        {metrics.alerts > 0 && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
            {metrics.alerts} alerts
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Operational</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {formatNumber(metrics.operational)}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Efficiency</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {formatPercentage(efficiency)}
          </p>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span>Health Score</span>
          <span className="font-semibold">{formatPercentage(healthScore, 0)}</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${healthScore}%` }}
            transition={{ duration: 1, delay: index * 0.1 }}
            className={`h-2 rounded-full ${
              healthScore > 80 ? 'bg-green-500' :
              healthScore > 60 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
          />
        </div>
      </div>

      <GaugeChart value={metrics.average} label="Avg Load" />
    </motion.div>
  );
};

const KPIGrid = () => {
  const { systemMetrics } = useCityStore();

  const systems = ['transportation', 'power', 'waste', 'water'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {systems.map((system, index) => (
        <KPICard
          key={system}
          system={system}
          metrics={systemMetrics[system]}
          index={index}
        />
      ))}
    </div>
  );
};

export default KPIGrid;
