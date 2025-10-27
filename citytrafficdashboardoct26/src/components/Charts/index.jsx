import { useMemo } from 'react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import useTrafficStore from '../../store/trafficStore'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
          {format(new Date(label), 'HH:mm:ss')}
        </p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            ></div>
            <span className="text-xs text-gray-700 dark:text-gray-300">
              {entry.name}:
            </span>
            <span className="text-xs font-semibold text-gray-900 dark:text-white">
              {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}
              {entry.unit || ''}
            </span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

const TrafficCharts = () => {
  const { historicalData, darkMode } = useTrafficStore()

  const chartData = useMemo(() => {
    return historicalData.map(point => ({
      ...point,
      time: point.timestamp
    }))
  }, [historicalData])

  const chartColors = {
    speed: '#3b82f6',
    congestion: '#ef4444',
    emissions: '#f59e0b',
    flow: '#10b981'
  }

  const gridColor = darkMode ? '#374151' : '#e5e7eb'
  const textColor = darkMode ? '#9ca3af' : '#6b7280'

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Speed Trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Average Speed Trend
          </h3>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-primary-500"></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">mph</span>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis
              dataKey="time"
              tickFormatter={(time) => format(new Date(time), 'HH:mm')}
              stroke={textColor}
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke={textColor}
              style={{ fontSize: '12px' }}
              domain={[0, 80]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="speed"
              stroke={chartColors.speed}
              strokeWidth={2}
              dot={false}
              name="Speed"
              unit=" mph"
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Congestion Trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Congestion Level Trend
          </h3>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-danger-500"></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">%</span>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis
              dataKey="time"
              tickFormatter={(time) => format(new Date(time), 'HH:mm')}
              stroke={textColor}
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke={textColor}
              style={{ fontSize: '12px' }}
              domain={[0, 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="congestion"
              stroke={chartColors.congestion}
              fill={chartColors.congestion}
              fillOpacity={0.3}
              strokeWidth={2}
              name="Congestion"
              unit="%"
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Emissions Trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Emissions Trend
          </h3>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-warning-500"></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">CO2</span>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis
              dataKey="time"
              tickFormatter={(time) => format(new Date(time), 'HH:mm')}
              stroke={textColor}
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke={textColor}
              style={{ fontSize: '12px' }}
              domain={[0, 200]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="emissions"
              stroke={chartColors.emissions}
              fill={chartColors.emissions}
              fillOpacity={0.3}
              strokeWidth={2}
              name="Emissions"
              unit=" CO2"
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Vehicle Flow Trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Vehicle Flow Trend
          </h3>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-success-500"></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">veh/hr</span>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis
              dataKey="time"
              tickFormatter={(time) => format(new Date(time), 'HH:mm')}
              stroke={textColor}
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke={textColor}
              style={{ fontSize: '12px' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="flow"
              stroke={chartColors.flow}
              strokeWidth={2}
              dot={false}
              name="Flow"
              unit=" veh/hr"
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  )
}

export default TrafficCharts
