import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import axios from 'axios'
import { calculateProcessCapability } from '../../utils/spcCalculations'
import { PROCESS_LIMITS } from '../../utils/dataValidation'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

const ProcessCapability = () => {
  const [heats, setHeats] = useState([])
  const [capabilities, setCapabilities] = useState([])

  useEffect(() => {
    fetchHeats()
  }, [])

  useEffect(() => {
    if (heats.length > 0) {
      calculateCapabilities()
    }
  }, [heats])

  const fetchHeats = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/heats?limit=100')
      setHeats(response.data)
    } catch (error) {
      console.error('Error fetching heats:', error)
    }
  }

  const calculateCapabilities = () => {
    const parameters = ['temperature', 'carbonContent', 'oxygenLevel', 'slagBasicity']
    const results = []

    parameters.forEach(param => {
      const values = heats.map(h => h[param]).filter(v => v !== undefined)
      const limits = PROCESS_LIMITS[param]

      if (limits && values.length > 0) {
        const capability = calculateProcessCapability(
          values,
          limits.lsl,
          limits.usl,
          limits.target
        )

        if (capability) {
          results.push({
            parameter: param,
            label: param.replace(/([A-Z])/g, ' $1').trim(),
            ...capability,
          })
        }
      }
    })

    setCapabilities(results)
  }

  const getCapabilityStatus = (cpk) => {
    if (cpk >= 1.67) return { text: 'Excellent', color: 'green', icon: TrendingUp }
    if (cpk >= 1.33) return { text: 'Capable', color: 'green', icon: TrendingUp }
    if (cpk >= 1.0) return { text: 'Adequate', color: 'yellow', icon: Minus }
    return { text: 'Poor', color: 'red', icon: TrendingDown }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Process Capability Analysis</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Cp, Cpk, and process performance metrics
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {capabilities.map((cap) => {
          const status = getCapabilityStatus(cap.cpk)
          const StatusIcon = status.icon

          return (
            <div key={cap.parameter} className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold capitalize">{cap.label}</h3>
                <div className={`badge badge-${status.color === 'green' ? 'success' : status.color === 'yellow' ? 'warning' : 'danger'} flex items-center gap-1`}>
                  <StatusIcon size={14} />
                  {status.text}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Cp</p>
                  <p className="text-2xl font-bold">{cap.cp}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Cpk</p>
                  <p className="text-2xl font-bold">{cap.cpk}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Mean</p>
                  <p className="text-xl font-semibold">{cap.mean}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Std Dev</p>
                  <p className="text-xl font-semibold">{cap.stdDev}</p>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-steel-700 pt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">LSL: {cap.lsl}</span>
                  <span className="text-gray-600 dark:text-gray-400">Target: {cap.target}</span>
                  <span className="text-gray-600 dark:text-gray-400">USL: {cap.usl}</span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-steel-700 rounded-full relative">
                  <div
                    className="absolute h-full bg-green-500 rounded-full"
                    style={{
                      left: `${((cap.lsl - cap.lsl) / (cap.usl - cap.lsl)) * 100}%`,
                      width: `${((cap.usl - cap.lsl) / (cap.usl - cap.lsl)) * 100}%`,
                    }}
                  />
                  <div
                    className="absolute h-full w-1 bg-blue-600"
                    style={{
                      left: `${((cap.mean - cap.lsl) / (cap.usl - cap.lsl)) * 100}%`,
                    }}
                  />
                </div>
                <p className="text-sm text-center mt-2 text-gray-600 dark:text-gray-400">
                  {cap.percentWithinSpec}% within specifications
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Capability Comparison Chart */}
      {capabilities.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold">Cpk Comparison</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={capabilities}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="label" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="cpk" name="Cpk">
                {capabilities.map((cap, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      cap.cpk >= 1.33
                        ? '#10b981'
                        : cap.cpk >= 1.0
                        ? '#f59e0b'
                        : '#ef4444'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

export default ProcessCapability
