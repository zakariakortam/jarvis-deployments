import { motion } from 'framer-motion'
import {
  Battery,
  Droplet,
  Radio,
  Thermometer,
  Zap,
  Activity,
} from 'lucide-react'

// Circular gauge component
function CircularGauge({ value, max = 100, label, color, icon: Icon }) {
  const percentage = (value / max) * 100
  const circumference = 2 * Math.PI * 45
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  // Determine color based on value
  const getColor = () => {
    if (percentage >= 70) return color || '#22c55e'
    if (percentage >= 40) return '#f59e0b'
    return '#ef4444'
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 transform -rotate-90">
          <circle
            cx="48"
            cy="48"
            r="45"
            stroke="currentColor"
            strokeWidth="6"
            fill="none"
            className="text-muted"
          />
          <motion.circle
            cx="48"
            cy="48"
            r="45"
            stroke={getColor()}
            strokeWidth="6"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-lg font-bold text-foreground">
              {value.toFixed(0)}
              <span className="text-xs">%</span>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-2 text-center">
        {Icon && <Icon className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />}
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}

// Linear gauge component
function LinearGauge({ value, max = 100, label, unit, icon: Icon }) {
  const percentage = (value / max) * 100

  const getColor = () => {
    if (percentage >= 70) return 'bg-success'
    if (percentage >= 40) return 'bg-warning'
    return 'bg-destructive'
  }

  return (
    <div className="flex items-center space-x-3">
      {Icon && <Icon className="w-5 h-5 text-muted-foreground flex-shrink-0" />}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-foreground">{label}</span>
          <span className="text-xs text-muted-foreground">
            {value.toFixed(1)}
            {unit}
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <motion.div
            className={`h-2 rounded-full ${getColor()}`}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>
    </div>
  )
}

// Status indicator component
function StatusIndicator({ status, label, health }) {
  const statusConfig = {
    nominal: { color: 'bg-success', textColor: 'text-success', label: 'Nominal' },
    warning: { color: 'bg-warning', textColor: 'text-warning', label: 'Warning' },
    critical: { color: 'bg-destructive', textColor: 'text-destructive', label: 'Critical' },
    offline: { color: 'bg-muted', textColor: 'text-muted-foreground', label: 'Offline' },
  }

  const config = statusConfig[status] || statusConfig.offline

  return (
    <div className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded-md">
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${config.color} animate-pulse-slow`} />
        <span className="text-sm font-medium text-foreground">{label}</span>
      </div>
      <div className="text-right">
        <div className={`text-xs font-semibold ${config.textColor}`}>{config.label}</div>
        {health !== undefined && (
          <div className="text-xs text-muted-foreground">{health.toFixed(0)}%</div>
        )}
      </div>
    </div>
  )
}

// Main subsystem gauges component
export default function SubsystemGauges({ satellite }) {
  if (!satellite) return null

  return (
    <div className="space-y-6">
      {/* Primary metrics - circular gauges */}
      <div className="bg-card rounded-lg p-6 border border-border">
        <h3 className="text-sm font-semibold text-foreground mb-6">Primary Systems</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <CircularGauge
            value={satellite.power.battery}
            label="Battery"
            icon={Battery}
            color="#22c55e"
          />
          <CircularGauge
            value={satellite.fuel.level}
            label="Fuel"
            icon={Droplet}
            color="#3b82f6"
          />
          <CircularGauge
            value={Math.min(100, ((satellite.comms.signalStrength + 100) / 80) * 100)}
            label="Signal"
            icon={Radio}
            color="#f59e0b"
          />
          <CircularGauge
            value={Math.min(100, (satellite.power.solar / 1) * 100)}
            label="Solar"
            icon={Zap}
            color="#eab308"
          />
        </div>
      </div>

      {/* Thermal systems */}
      <div className="bg-card rounded-lg p-6 border border-border">
        <h3 className="text-sm font-semibold text-foreground mb-4">Thermal Systems</h3>
        <div className="space-y-3">
          <LinearGauge
            value={satellite.thermal.cpuTemp}
            max={100}
            label="CPU Temperature"
            unit="°C"
            icon={Thermometer}
          />
          <LinearGauge
            value={Math.max(0, satellite.thermal.batteryTemp)}
            max={50}
            label="Battery Temperature"
            unit="°C"
            icon={Thermometer}
          />
          <LinearGauge
            value={Math.max(0, satellite.thermal.solarPanelTemp)}
            max={80}
            label="Solar Panel Temperature"
            unit="°C"
            icon={Thermometer}
          />
        </div>
      </div>

      {/* Subsystem health */}
      <div className="bg-card rounded-lg p-6 border border-border">
        <h3 className="text-sm font-semibold text-foreground mb-4">Subsystem Status</h3>
        <div className="space-y-2">
          {Object.entries(satellite.subsystems).map(([name, subsystem]) => (
            <StatusIndicator
              key={name}
              status={subsystem.status}
              label={name.charAt(0).toUpperCase() + name.slice(1)}
              health={subsystem.health}
            />
          ))}
        </div>
      </div>

      {/* Additional metrics */}
      <div className="bg-card rounded-lg p-6 border border-border">
        <h3 className="text-sm font-semibold text-foreground mb-4">Performance Metrics</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Uplink</p>
            <p className="text-lg font-semibold text-foreground">
              {satellite.comms.uplink.toFixed(1)} Mbps
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Downlink</p>
            <p className="text-lg font-semibold text-foreground">
              {satellite.comms.downlink.toFixed(1)} Mbps
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Latency</p>
            <p className="text-lg font-semibold text-foreground">
              {satellite.comms.latency.toFixed(0)} ms
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Packet Loss</p>
            <p className="text-lg font-semibold text-foreground">
              {(
                (satellite.comms.packetsLost /
                  (satellite.comms.packetsReceived + satellite.comms.packetsLost)) *
                100
              ).toFixed(2)}
              %
            </p>
          </div>
        </div>
      </div>

      {/* Power details */}
      <div className="bg-card rounded-lg p-6 border border-border">
        <h3 className="text-sm font-semibold text-foreground mb-4">Power Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Generation</p>
            <p className="text-lg font-semibold text-foreground">
              {satellite.power.generation.toFixed(1)} W
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Consumption</p>
            <p className="text-lg font-semibold text-foreground">
              {satellite.power.consumption.toFixed(1)} W
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Voltage</p>
            <p className="text-lg font-semibold text-foreground">
              {satellite.power.voltage.toFixed(2)} V
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Net Power</p>
            <p
              className={`text-lg font-semibold ${
                satellite.power.generation - satellite.power.consumption > 0
                  ? 'text-success'
                  : 'text-destructive'
              }`}
            >
              {(satellite.power.generation - satellite.power.consumption).toFixed(1)} W
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
