import React, { useMemo } from 'react';
import { useCityStore } from '../../store/cityStore';
import { motion } from 'framer-motion';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatTimestamp } from '../../utils/helpers';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {formatTimestamp(label)}
        </p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm font-semibold" style={{ color: entry.color }}>
            {entry.name}: {entry.value.toFixed(2)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const SystemChart = ({ system, data, color }) => {
  const chartData = useMemo(() => {
    return data.map(point => ({
      timestamp: point.timestamp,
      value: point.value
    }));
  }, [data]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 mb-4"
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white capitalize mb-4">
        {system} Trends
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id={`gradient-${system}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
          <XAxis
            dataKey="timestamp"
            tickFormatter={(ts) => new Date(ts).toLocaleTimeString()}
            className="text-xs"
            stroke="#9ca3af"
          />
          <YAxis
            className="text-xs"
            stroke="#9ca3af"
            domain={[0, 100]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            fillOpacity={1}
            fill={`url(#gradient-${system})`}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

const TrendCharts = () => {
  const { timeSeriesData, activeSystem } = useCityStore();

  const systems = [
    { name: 'transportation', color: '#3b82f6' },
    { name: 'power', color: '#10b981' },
    { name: 'waste', color: '#f59e0b' },
    { name: 'water', color: '#06b6d4' }
  ];

  const displaySystems = activeSystem === 'overview'
    ? systems
    : systems.filter(s => s.name === activeSystem);

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4"
      >
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Real-Time Trends
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Live data from {Object.keys(timeSeriesData).length} active systems
        </p>

        {displaySystems.map(({ name, color }) => (
          timeSeriesData[name] && timeSeriesData[name].length > 0 ? (
            <SystemChart
              key={name}
              system={name}
              data={timeSeriesData[name]}
              color={color}
            />
          ) : null
        ))}
      </motion.div>

      {/* Comparative Chart */}
      {activeSystem === 'overview' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            System Comparison
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis
                dataKey="timestamp"
                type="number"
                domain={['dataMin', 'dataMax']}
                tickFormatter={(ts) => new Date(ts).toLocaleTimeString()}
                className="text-xs"
                stroke="#9ca3af"
              />
              <YAxis
                className="text-xs"
                stroke="#9ca3af"
                domain={[0, 100]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {systems.map(({ name, color }) => (
                timeSeriesData[name] && (
                  <Line
                    key={name}
                    data={timeSeriesData[name]}
                    type="monotone"
                    dataKey="value"
                    stroke={color}
                    strokeWidth={2}
                    dot={false}
                    name={name}
                  />
                )
              ))}
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      )}
    </div>
  );
};

export default TrendCharts;
