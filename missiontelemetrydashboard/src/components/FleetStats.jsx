import { Satellite, Activity, DollarSign, TrendingUp, Gauge } from 'lucide-react'
import { motion } from 'framer-motion'

// Stat card component
function StatCard({ label, value, subtitle, icon: Icon, trend, color = 'primary' }) {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary border-primary/20',
    success: 'bg-success/10 text-success border-success/20',
    warning: 'bg-warning/10 text-warning border-warning/20',
    destructive: 'bg-destructive/10 text-destructive border-destructive/20',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-lg p-4 border border-border"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs text-muted-foreground mb-1">{label}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          {trend && (
            <div
              className={`flex items-center mt-2 text-xs ${
                trend > 0 ? 'text-success' : 'text-destructive'
              }`}
            >
              <TrendingUp
                className={`w-3 h-3 mr-1 ${trend < 0 ? 'transform rotate-180' : ''}`}
              />
              <span>{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </motion.div>
  )
}

// Main fleet stats component
export default function FleetStats({ fleetStats, className = '' }) {
  if (!fleetStats) return null

  const operationalPercentage = ((fleetStats.operational / fleetStats.total) * 100).toFixed(1)
  const warningPercentage = ((fleetStats.warning / fleetStats.total) * 100).toFixed(1)
  const criticalPercentage = ((fleetStats.critical / fleetStats.total) * 100).toFixed(1)

  return (
    <div className={className}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Satellites"
          value={fleetStats.total.toLocaleString()}
          icon={Satellite}
          color="primary"
        />
        <StatCard
          label="Operational"
          value={fleetStats.operational.toLocaleString()}
          subtitle={`${operationalPercentage}% of fleet`}
          icon={Activity}
          color="success"
        />
        <StatCard
          label="Warning Status"
          value={fleetStats.warning.toLocaleString()}
          subtitle={`${warningPercentage}% of fleet`}
          icon={Activity}
          color="warning"
        />
        <StatCard
          label="Critical Status"
          value={fleetStats.critical.toLocaleString()}
          subtitle={`${criticalPercentage}% of fleet`}
          icon={Activity}
          color="destructive"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <StatCard
          label="Average Fuel Level"
          value={`${fleetStats.averageFuel.toFixed(1)}%`}
          icon={Gauge}
          color={fleetStats.averageFuel > 50 ? 'success' : 'warning'}
        />
        <StatCard
          label="Average Battery"
          value={`${fleetStats.averageBattery.toFixed(1)}%`}
          icon={Gauge}
          color={fleetStats.averageBattery > 50 ? 'success' : 'warning'}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard
          label="Daily Operational Cost"
          value={`$${(fleetStats.totalDailyCost / 1000000).toFixed(2)}M`}
          subtitle="Per day"
          icon={DollarSign}
          color="primary"
        />
        <StatCard
          label="Total Lifetime Cost"
          value={`$${(fleetStats.totalLifetimeCost / 1000000000).toFixed(2)}B`}
          subtitle="Cumulative"
          icon={DollarSign}
          color="primary"
        />
      </div>

      {/* Orbit distribution summary */}
      <div className="mt-6 bg-card rounded-lg p-4 border border-border">
        <h3 className="text-sm font-semibold text-foreground mb-4">Orbit Distribution</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(fleetStats.orbitDistribution).map(([orbit, count]) => (
            <div key={orbit} className="text-center">
              <p className="text-2xl font-bold text-foreground">{count}</p>
              <p className="text-xs text-muted-foreground">{orbit}</p>
              <p className="text-xs text-muted-foreground">
                {((count / fleetStats.total) * 100).toFixed(1)}%
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Compact stats for sidebar
export function CompactStats({ fleetStats }) {
  if (!fleetStats) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Total</span>
        <span className="text-sm font-semibold text-foreground">
          {fleetStats.total.toLocaleString()}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-success">Operational</span>
        <span className="text-sm font-semibold text-success">{fleetStats.operational}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-warning">Warning</span>
        <span className="text-sm font-semibold text-warning">{fleetStats.warning}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-destructive">Critical</span>
        <span className="text-sm font-semibold text-destructive">{fleetStats.critical}</span>
      </div>
      <div className="pt-3 border-t border-border">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Avg Battery</span>
          <span className="text-sm font-semibold text-foreground">
            {fleetStats.averageBattery.toFixed(0)}%
          </span>
        </div>
      </div>
    </div>
  )
}
