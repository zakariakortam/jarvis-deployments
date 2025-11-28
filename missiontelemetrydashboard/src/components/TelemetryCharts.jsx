import { useMemo } from 'react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { format } from 'date-fns'

// Generate time series data for a satellite
function generateTimeSeriesData(satellite, dataPoints = 30) {
  const data = []
  const now = Date.now()

  for (let i = dataPoints; i >= 0; i--) {
    const timestamp = now - i * 60000 // 1 minute intervals

    // Simulate historical data with some variation
    const variation = Math.sin(i / 5) * 5

    data.push({
      timestamp,
      time: format(timestamp, 'HH:mm'),
      battery: Math.max(0, Math.min(100, satellite.power.battery + variation)),
      fuel: Math.max(0, Math.min(100, satellite.fuel.level + variation * 0.5)),
      signalStrength: Math.max(
        -100,
        Math.min(-20, satellite.comms.signalStrength + variation * 2)
      ),
      cpuTemp: Math.max(0, satellite.thermal.cpuTemp + variation * 2),
      solarPanelTemp: satellite.thermal.solarPanelTemp + variation * 3,
    })
  }

  return data
}

// Custom tooltip
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null

  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
      <p className="text-sm font-medium text-foreground mb-2">{label}</p>
      {payload.map((entry, index) => (
        <p key={index} className="text-xs" style={{ color: entry.color }}>
          {entry.name}: {entry.value.toFixed(2)} {entry.unit || ''}
        </p>
      ))}
    </div>
  )
}

// Power chart
export function PowerChart({ satellite }) {
  const data = useMemo(() => generateTimeSeriesData(satellite), [satellite])

  return (
    <div className="w-full h-64 bg-card rounded-lg p-4 border border-border">
      <h3 className="text-sm font-semibold text-foreground mb-4">Power Systems</h3>
      <ResponsiveContainer width="100%" height="85%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorBattery" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorFuel" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="time" stroke="#9ca3af" style={{ fontSize: '12px' }} />
          <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} domain={[0, 100]} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Area
            type="monotone"
            dataKey="battery"
            stroke="#22c55e"
            fillOpacity={1}
            fill="url(#colorBattery)"
            name="Battery (%)"
          />
          <Area
            type="monotone"
            dataKey="fuel"
            stroke="#3b82f6"
            fillOpacity={1}
            fill="url(#colorFuel)"
            name="Fuel (%)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// Communications chart
export function CommunicationsChart({ satellite }) {
  const data = useMemo(() => generateTimeSeriesData(satellite), [satellite])

  return (
    <div className="w-full h-64 bg-card rounded-lg p-4 border border-border">
      <h3 className="text-sm font-semibold text-foreground mb-4">Communications</h3>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="time" stroke="#9ca3af" style={{ fontSize: '12px' }} />
          <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} domain={[-100, -20]} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="signalStrength"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={false}
            name="Signal Strength (dBm)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

// Thermal chart
export function ThermalChart({ satellite }) {
  const data = useMemo(() => generateTimeSeriesData(satellite), [satellite])

  return (
    <div className="w-full h-64 bg-card rounded-lg p-4 border border-border">
      <h3 className="text-sm font-semibold text-foreground mb-4">Thermal Systems</h3>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="time" stroke="#9ca3af" style={{ fontSize: '12px' }} />
          <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="cpuTemp"
            stroke="#ef4444"
            strokeWidth={2}
            dot={false}
            name="CPU Temp (°C)"
          />
          <Line
            type="monotone"
            dataKey="solarPanelTemp"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            name="Solar Panel Temp (°C)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

// Fleet status distribution chart
export function FleetStatusChart({ fleetStats }) {
  const data = [
    { name: 'Nominal', value: fleetStats?.operational || 0, fill: '#22c55e' },
    { name: 'Warning', value: fleetStats?.warning || 0, fill: '#f59e0b' },
    { name: 'Critical', value: fleetStats?.critical || 0, fill: '#ef4444' },
    { name: 'Offline', value: fleetStats?.offline || 0, fill: '#6b7280' },
  ]

  return (
    <div className="w-full h-64 bg-card rounded-lg p-4 border border-border">
      <h3 className="text-sm font-semibold text-foreground mb-4">Fleet Status Distribution</h3>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="name" stroke="#9ca3af" style={{ fontSize: '12px' }} />
          <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// Orbit distribution chart
export function OrbitDistributionChart({ fleetStats }) {
  const data = Object.entries(fleetStats?.orbitDistribution || {}).map(([name, value]) => ({
    name,
    value,
    fill: {
      LEO: '#3b82f6',
      MEO: '#10b981',
      GEO: '#f59e0b',
      HEO: '#8b5cf6',
    }[name],
  }))

  return (
    <div className="w-full h-64 bg-card rounded-lg p-4 border border-border">
      <h3 className="text-sm font-semibold text-foreground mb-4">Orbit Distribution</h3>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="name" stroke="#9ca3af" style={{ fontSize: '12px' }} />
          <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
