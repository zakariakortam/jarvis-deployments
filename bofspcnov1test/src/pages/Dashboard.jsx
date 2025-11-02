import { useState, useEffect } from 'react'
import { BOF_PARAMETERS } from '@/services/spc/bofValidation'

const Dashboard = () => {
  const [liveData, setLiveData] = useState({
    temperature: 1650,
    carbon: 0.06,
    oxygen: 900,
    lanceHeight: 2.25,
    tapToTapTime: 40
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveData(prev => ({
        temperature: prev.temperature + (Math.random() - 0.5) * 10,
        carbon: prev.carbon + (Math.random() - 0.5) * 0.01,
        oxygen: prev.oxygen + (Math.random() - 0.5) * 20,
        lanceHeight: prev.lanceHeight + (Math.random() - 0.5) * 0.1,
        tapToTapTime: prev.tapToTapTime + (Math.random() - 0.5) * 2
      }))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (param, value) => {
    const spec = BOF_PARAMETERS[param]
    if (value > spec.usl || value < spec.lsl) return 'text-red-500'
    if (value > spec.target * 1.05 || value < spec.target * 0.95) return 'text-yellow-500'
    return 'text-green-500'
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Live BOF Monitoring</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(liveData).map(([key, value]) => {
          const param = BOF_PARAMETERS[key]
          return (
            <div key={key} className="card">
              <h3 className="text-lg font-semibold mb-2">{param.name}</h3>
              <p className={`text-4xl font-bold ${getStatusColor(key, value)}`}>
                {value.toFixed(2)} {param.unit}
              </p>
              <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                <p>Target: {param.target} {param.unit}</p>
                <p>LSL: {param.lsl} | USL: {param.usl}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Dashboard
