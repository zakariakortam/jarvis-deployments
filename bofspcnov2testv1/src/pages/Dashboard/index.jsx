import { useEffect, useState } from 'react'
import { TrendingUp, Activity, AlertTriangle, CheckCircle, ThermometerSun, Droplet } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import axios from 'axios'
import { calculateProcessCapability } from '../../utils/spcCalculations'
import { PROCESS_LIMITS } from '../../utils/dataValidation'

const Dashboard = () => {
  const [heats, setHeats] = useState([])
  const [statistics, setStatistics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/heats?limit=50')
      const heatData = response.data

      setHeats(heatData)

      // Calculate statistics
      if (heatData.length > 0) {
        const tempData = heatData.map(h => h.temperature).filter(t => t)
        const carbonData = heatData.map(h => h.carbonContent).filter(c => c)

        const tempCapability = calculateProcessCapability(
          tempData,
          PROCESS_LIMITS.temperature.lsl,
          PROCESS_LIMITS.temperature.usl,
          PROCESS_LIMITS.temperature.target
        )

        const carbonCapability = calculateProcessCapability(
          carbonData,
          PROCESS_LIMITS.carbonContent.lsl,
          PROCESS_LIMITS.carbonContent.usl,
          PROCESS_LIMITS.carbonContent.target
        )

        setStatistics({
          totalHeats: heatData.length,
          avgTemperature: tempCapability?.mean || 0,
          avgCarbon: carbonCapability?.mean || 0,
          tempCpk: tempCapability?.cpk || 0,
          carbonCpk: carbonCapability?.cpk || 0,
        })
      }

      setLoading(false)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setLoading(false)
    }
  }

  const kpiCards = [
    {
      title: 'Total Heats (24h)',
      value: statistics?.totalHeats || 0,
      icon: Activity,
      color: 'blue',
      trend: '+12%',
    },
    {
      title: 'Avg Temperature',
      value: statistics?.avgTemperature ? `${statistics.avgTemperature.toFixed(0)}°C` : '-',
      icon: ThermometerSun,
      color: 'orange',
      trend: '+2.3°C',
    },
    {
      title: 'Process Capability (Temp)',
      value: statistics?.tempCpk ? statistics.tempCpk.toFixed(2) : '-',
      icon: TrendingUp,
      color: statistics?.tempCpk >= 1.33 ? 'green' : statistics?.tempCpk >= 1.0 ? 'yellow' : 'red',
      status: statistics?.tempCpk >= 1.33 ? 'Capable' : statistics?.tempCpk >= 1.0 ? 'Acceptable' : 'Needs Improvement',
    },
    {
      title: 'Avg Carbon Content',
      value: statistics?.avgCarbon ? `${(statistics.avgCarbon * 100).toFixed(2)}%` : '-',
      icon: Droplet,
      color: 'purple',
      trend: '-0.01%',
    },
  ]

  const colorMap = {
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    green: 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400',
    orange: 'bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
    red: 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
    yellow: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400',
  }

  const chartData = heats.slice(0, 20).reverse().map(heat => ({
    heat: heat.heatNumber.substring(4),
    temperature: heat.temperature,
    carbon: heat.carbonContent * 100,
    oxygen: heat.oxygenLevel,
  }))

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="loading-spinner h-12 w-12" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Overview of BOF process performance and key metrics
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi, index) => {
          const Icon = kpi.icon
          return (
            <div key={index} className="card">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${colorMap[kpi.color]}`}>
                  <Icon size={24} />
                </div>
                {kpi.trend && (
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                    {kpi.trend}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{kpi.title}</p>
              <p className="text-2xl font-bold">{kpi.value}</p>
              {kpi.status && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{kpi.status}</p>
              )}
            </div>
          )
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Temperature Trend */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold">Temperature Trend (Last 20 Heats)</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="heat" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" domain={[1600, 1700]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="temperature"
                stroke="#f97316"
                strokeWidth={2}
                dot={{ fill: '#f97316', r: 4 }}
                name="Temperature (°C)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Carbon Content Trend */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold">Carbon Content Trend (Last 20 Heats)</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="heat" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" domain={[0.04, 0.12]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="carbon"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ fill: '#8b5cf6', r: 4 }}
                name="Carbon (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Heats Table */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold">Recent Heats</h2>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Heat Number</th>
                <th>Time</th>
                <th>Temperature</th>
                <th>Carbon %</th>
                <th>O₂ Level</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {heats.slice(0, 10).map((heat) => (
                <tr key={heat.id}>
                  <td className="font-medium">{heat.heatNumber}</td>
                  <td>{new Date(heat.timestamp).toLocaleTimeString()}</td>
                  <td>{heat.temperature.toFixed(0)}°C</td>
                  <td>{(heat.carbonContent * 100).toFixed(3)}%</td>
                  <td>{heat.oxygenLevel.toFixed(2)}%</td>
                  <td>
                    <span className="badge-success flex items-center gap-1 w-fit">
                      <CheckCircle size={14} />
                      {heat.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
