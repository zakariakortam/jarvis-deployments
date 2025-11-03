import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts'
import axios from 'axios'
import { calculateXBarChart, calculateRChart, detectOutOfControl } from '../../utils/spcCalculations'
import { AlertTriangle } from 'lucide-react'

const ControlCharts = () => {
  const [heats, setHeats] = useState([])
  const [selectedParameter, setSelectedParameter] = useState('temperature')
  const [chartType, setChartType] = useState('xbar')
  const [chartData, setChartData] = useState(null)
  const [violations, setViolations] = useState([])

  useEffect(() => {
    fetchHeats()
  }, [])

  useEffect(() => {
    if (heats.length > 0) {
      calculateChartData()
    }
  }, [heats, selectedParameter, chartType])

  const fetchHeats = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/heats?limit=50')
      setHeats(response.data)
    } catch (error) {
      console.error('Error fetching heats:', error)
    }
  }

  const calculateChartData = () => {
    const values = heats.map(h => h[selectedParameter]).filter(v => v !== undefined)

    if (chartType === 'xbar') {
      const result = calculateXBarChart(values, 5)
      if (result) {
        const violations = detectOutOfControl(result.values, result.centerLine, result.ucl, result.lcl)
        setViolations(violations)

        const data = result.values.map((value, index) => ({
          index: index + 1,
          value,
          ucl: result.ucl,
          lcl: result.lcl,
          centerLine: result.centerLine,
        }))
        setChartData({ ...result, data })
      }
    } else if (chartType === 'r') {
      const result = calculateRChart(values, 5)
      if (result) {
        const data = result.values.map((value, index) => ({
          index: index + 1,
          value,
          ucl: result.ucl,
          lcl: result.lcl,
          centerLine: result.centerLine,
        }))
        setChartData({ ...result, data })
      }
    }
  }

  const parameters = [
    { value: 'temperature', label: 'Temperature' },
    { value: 'carbonContent', label: 'Carbon Content' },
    { value: 'oxygenLevel', label: 'Oxygen Level' },
    { value: 'slagBasicity', label: 'Slag Basicity' },
  ]

  const chartTypes = [
    { value: 'xbar', label: 'X-bar Chart' },
    { value: 'r', label: 'R Chart' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Control Charts</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Statistical process control charts for monitoring process stability
        </p>
      </div>

      <div className="flex flex-wrap gap-4">
        <div>
          <label className="label">Parameter</label>
          <select
            value={selectedParameter}
            onChange={(e) => setSelectedParameter(e.target.value)}
            className="input"
          >
            {parameters.map(param => (
              <option key={param.value} value={param.value}>{param.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Chart Type</label>
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
            className="input"
          >
            {chartTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
      </div>

      {violations.length > 0 && (
        <div className="alert-warning">
          <AlertTriangle size={20} />
          <div>
            <p className="font-semibold">{violations.length} Out-of-Control Conditions Detected</p>
            <p className="text-sm mt-1">
              {violations.map((v, i) => v.rule).join(', ')}
            </p>
          </div>
        </div>
      )}

      {chartData && (
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold">
              {chartType === 'xbar' ? 'X-bar Chart' : 'R Chart'} - {parameters.find(p => p.value === selectedParameter)?.label}
            </h2>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">UCL</p>
              <p className="text-xl font-bold text-red-600">{chartData.ucl.toFixed(3)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Center Line</p>
              <p className="text-xl font-bold text-green-600">{chartData.centerLine.toFixed(3)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">LCL</p>
              <p className="text-xl font-bold text-red-600">{chartData.lcl.toFixed(3)}</p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="index" stroke="#9ca3af" label={{ value: 'Subgroup', position: 'insideBottom', offset: -5 }} />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <ReferenceLine y={chartData.ucl} stroke="#ef4444" strokeDasharray="5 5" label="UCL" />
              <ReferenceLine y={chartData.centerLine} stroke="#10b981" strokeDasharray="5 5" label="CL" />
              <ReferenceLine y={chartData.lcl} stroke="#ef4444" strokeDasharray="5 5" label="LCL" />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 4 }}
                name="Value"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

export default ControlCharts
