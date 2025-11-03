import { useEffect, useState } from 'react'
import { Activity, Thermometer, Droplets, Wind, Flame } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import io from 'socket.io-client'
import { PROCESS_LIMITS } from '../../utils/dataValidation'

const RealTimeMonitoring = () => {
  const [realTimeData, setRealTimeData] = useState({
    temperature: 0,
    carbonContent: 0,
    oxygenLevel: 0,
    oxygenFlow: 0,
    blowTime: 0,
  })
  const [historicalData, setHistoricalData] = useState([])
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const socket = io('http://localhost:5000')

    socket.on('connect', () => {
      setConnected(true)
      socket.emit('subscribe_monitoring')
    })

    socket.on('real_time_data', (data) => {
      setRealTimeData(data)

      // Add to historical data for chart
      const timestamp = new Date().toLocaleTimeString()
      setHistoricalData(prev => {
        const newData = [...prev, { ...data, timestamp }]
        return newData.slice(-30) // Keep last 30 points
      })
    })

    socket.on('disconnect', () => {
      setConnected(false)
    })

    return () => {
      socket.emit('unsubscribe_monitoring')
      socket.disconnect()
    }
  }, [])

  const parameters = [
    {
      key: 'temperature',
      label: 'Temperature',
      value: realTimeData.temperature,
      unit: '°C',
      icon: Thermometer,
      color: 'orange',
      limits: PROCESS_LIMITS.temperature,
    },
    {
      key: 'carbonContent',
      label: 'Carbon Content',
      value: realTimeData.carbonContent * 100,
      unit: '%',
      icon: Flame,
      color: 'red',
      limits: { ...PROCESS_LIMITS.carbonContent, lsl: PROCESS_LIMITS.carbonContent.lsl * 100, usl: PROCESS_LIMITS.carbonContent.usl * 100 },
    },
    {
      key: 'oxygenLevel',
      label: 'Oxygen Level',
      value: realTimeData.oxygenLevel,
      unit: '%',
      icon: Wind,
      color: 'blue',
      limits: PROCESS_LIMITS.oxygenLevel,
    },
    {
      key: 'oxygenFlow',
      label: 'Oxygen Flow',
      value: realTimeData.oxygenFlow,
      unit: 'Nm³/min',
      icon: Droplets,
      color: 'cyan',
      limits: PROCESS_LIMITS.oxygenFlow,
    },
  ]

  const getStatusColor = (value, limits) => {
    if (!limits || !value) return 'gray'
    if (value < limits.lsl || value > limits.usl) return 'red'
    if (value < limits.lsl + (limits.target - limits.lsl) * 0.2 ||
        value > limits.usl - (limits.usl - limits.target) * 0.2) return 'yellow'
    return 'green'
  }

  const colorClasses = {
    orange: 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
    red: 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400',
    blue: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    cyan: 'bg-cyan-100 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400',
  }

  const statusColors = {
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
    gray: 'bg-gray-500',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Real-Time Monitoring</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Live process data from BOF operations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          <span className="text-sm font-medium">
            {connected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Parameter Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {parameters.map((param) => {
          const Icon = param.icon
          const statusColor = getStatusColor(param.value, param.limits)

          return (
            <div key={param.key} className="card relative overflow-hidden">
              <div className={`absolute top-0 right-0 w-2 h-full ${statusColors[statusColor]}`} />
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${colorClasses[param.color]}`}>
                  <Icon size={24} />
                </div>
                <div className={`w-3 h-3 rounded-full ${statusColors[statusColor]}`} />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{param.label}</p>
              <p className="text-3xl font-bold">
                {param.value ? param.value.toFixed(2) : '-'} <span className="text-lg text-gray-500">{param.unit}</span>
              </p>
              {param.limits && (
                <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                  <p>Target: {param.limits.target} {param.unit}</p>
                  <p>Range: {param.limits.lsl} - {param.limits.usl} {param.unit}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Real-Time Chart */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold">Temperature Trend (Last 30 readings)</h2>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={historicalData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="timestamp" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" domain={[1600, 1700]} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: 'none',
                borderRadius: '8px',
              }}
            />
            <Line
              type="monotone"
              dataKey="temperature"
              stroke="#f97316"
              strokeWidth={2}
              dot={false}
              name="Temperature (°C)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default RealTimeMonitoring
