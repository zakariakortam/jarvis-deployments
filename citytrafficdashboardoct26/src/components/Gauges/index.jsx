import { motion } from 'framer-motion'
import useTrafficStore from '../../store/trafficStore'
import './styles.css'

const CircularGauge = ({ value, maxValue, label, unit, color, icon }) => {
  const percentage = (value / maxValue) * 100
  const circumference = 2 * Math.PI * 45
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center"
    >
      <div className="relative w-32 h-32">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-gray-200 dark:text-gray-700"
          />

          {/* Progress circle */}
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: 'easeInOut' }}
            className="gauge-progress"
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-2xl mb-1">{icon}</div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-2xl font-bold text-gray-900 dark:text-white"
          >
            {typeof value === 'number' ? value.toFixed(0) : value}
          </motion.div>
          <div className="text-xs text-gray-600 dark:text-gray-400">{unit}</div>
        </div>
      </div>

      <div className="mt-3 text-center">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</p>
      </div>
    </motion.div>
  )
}

const LinearGauge = ({ value, maxValue, label, thresholds, zones }) => {
  const percentage = Math.min((value / maxValue) * 100, 100)

  const getZoneColor = () => {
    if (value < thresholds.low) return 'bg-success-500'
    if (value < thresholds.medium) return 'bg-warning-500'
    return 'bg-danger-500'
  }

  const getZoneLabel = () => {
    if (value < thresholds.low) return zones.low
    if (value < thresholds.medium) return zones.medium
    return zones.high
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{label}</h3>
        <div className="flex items-center space-x-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${getZoneColor()}`}
          >
            {getZoneLabel()}
          </span>
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            {value.toFixed(0)}%
          </span>
        </div>
      </div>

      <div className="relative w-full h-8 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeInOut' }}
          className={`h-full ${getZoneColor()} rounded-full relative`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20"></div>
        </motion.div>

        {/* Threshold markers */}
        <div
          className="absolute top-0 h-full w-0.5 bg-gray-400"
          style={{ left: `${(thresholds.low / maxValue) * 100}%` }}
        ></div>
        <div
          className="absolute top-0 h-full w-0.5 bg-gray-400"
          style={{ left: `${(thresholds.medium / maxValue) * 100}%` }}
        ></div>
      </div>

      <div className="flex justify-between mt-2 text-xs text-gray-600 dark:text-gray-400">
        <span>0</span>
        <span>{thresholds.low}</span>
        <span>{thresholds.medium}</span>
        <span>{maxValue}</span>
      </div>
    </motion.div>
  )
}

const TrafficGauges = () => {
  const { metrics } = useTrafficStore()

  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const avgSpeed = parseFloat(metrics.avgSpeed)
  const avgCongestion = parseFloat(metrics.avgCongestion)
  const avgEmissions = parseFloat(metrics.avgEmissions)

  return (
    <div className="space-y-6">
      {/* Circular Gauges */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
      >
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Real-Time Metrics
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <CircularGauge
            value={avgSpeed}
            maxValue={80}
            label="Average Speed"
            unit="mph"
            color="#3b82f6"
            icon="🚗"
          />

          <CircularGauge
            value={avgCongestion}
            maxValue={100}
            label="Congestion"
            unit="%"
            color="#ef4444"
            icon="🚦"
          />

          <CircularGauge
            value={avgEmissions}
            maxValue={200}
            label="Emissions"
            unit="CO2"
            color="#f59e0b"
            icon="🏭"
          />

          <CircularGauge
            value={metrics.totalFlow}
            maxValue={500000}
            label="Total Flow"
            unit="veh/hr"
            color="#10b981"
            icon="📊"
          />
        </div>
      </motion.div>

      {/* Linear Gauges */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LinearGauge
          value={avgCongestion}
          maxValue={100}
          label="Congestion Level"
          thresholds={{ low: 30, medium: 60 }}
          zones={{ low: 'Low', medium: 'Medium', high: 'High' }}
        />

        <LinearGauge
          value={avgEmissions}
          maxValue={200}
          label="Emissions Index"
          thresholds={{ low: 60, medium: 120 }}
          zones={{ low: 'Good', medium: 'Moderate', high: 'Poor' }}
        />
      </div>

      {/* Zone Breakdown */}
      {metrics.zoneMetrics && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Zone Performance
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(metrics.zoneMetrics).map(([zone, data]) => (
              <div
                key={zone}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
              >
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">{zone}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Speed:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {data.speed.toFixed(1)} mph
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Congestion:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {data.congestion.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Flow:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {Math.floor(data.flow)} veh/hr
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default TrafficGauges
