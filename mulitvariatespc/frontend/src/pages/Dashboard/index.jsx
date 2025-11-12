import { useSpcStore } from '../../store/spcStore'
import { useMemo } from 'react'
import {
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import clsx from 'clsx'

export default function Dashboard() {
  const { realtimeData, processStatus, alerts, isConnected, controlLimits } = useSpcStore()

  const stats = useMemo(() => {
    const total = realtimeData.length
    const critical = realtimeData.filter(d => d.status === 'critical').length
    const warning = realtimeData.filter(d => d.status === 'warning').length
    const normal = realtimeData.filter(d => d.status === 'normal').length

    return {
      total,
      critical,
      warning,
      normal,
      criticalRate: total > 0 ? (critical / total) * 100 : 0,
      warningRate: total > 0 ? (warning / total) * 100 : 0,
      normalRate: total > 0 ? (normal / total) * 100 : 0,
    }
  }, [realtimeData])

  const recentAlerts = useMemo(() => {
    return alerts.slice(0, 5)
  }, [alerts])

  const statusDistribution = useMemo(() => [
    { name: 'Normal', value: stats.normal, color: 'hsl(var(--chart-2))' },
    { name: 'Warning', value: stats.warning, color: 'hsl(var(--chart-4))' },
    { name: 'Critical', value: stats.critical, color: 'hsl(var(--chart-3))' },
  ], [stats])

  const trendData = useMemo(() => {
    return realtimeData.slice(-50).map((point, index) => ({
      index: index + 1,
      value: point.statistic || 0,
    }))
  }, [realtimeData])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Real-time process monitoring overview
        </p>
      </div>

      {/* Connection Status Banner */}
      {!isConnected && (
        <div className="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Connection Lost
              </h3>
              <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                Attempting to reconnect to the data stream...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="stat-card">
          <div className="flex items-center">
            <div className="rounded-lg bg-primary/10 p-3">
              <ChartBarIcon className="h-6 w-6 text-primary" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Total Samples</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center">
            <div className="rounded-lg bg-green-500/10 p-3">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Normal</p>
              <p className="text-2xl font-bold">{stats.normal}</p>
              <p className="text-xs text-muted-foreground">{stats.normalRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center">
            <div className="rounded-lg bg-yellow-500/10 p-3">
              <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Warnings</p>
              <p className="text-2xl font-bold">{stats.warning}</p>
              <p className="text-xs text-muted-foreground">{stats.warningRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center">
            <div className="rounded-lg bg-red-500/10 p-3">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Critical</p>
              <p className="text-2xl font-bold">{stats.critical}</p>
              <p className="text-xs text-muted-foreground">{stats.criticalRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Process Trend */}
        <div className="stat-card">
          <h3 className="mb-4 text-lg font-semibold">Process Trend (Last 50 Samples)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="index" stroke="hsl(var(--foreground))" />
              <YAxis stroke="hsl(var(--foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.5rem',
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Status Distribution */}
        <div className="stat-card">
          <h3 className="mb-4 text-lg font-semibold">Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {statusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Alerts and Current Status */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Alerts */}
        <div className="stat-card">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Recent Alerts</h3>
            <span className="text-sm text-muted-foreground">
              {alerts.length} total
            </span>
          </div>
          <div className="space-y-3">
            {recentAlerts.length > 0 ? (
              recentAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={clsx(
                    'rounded-lg border p-3',
                    alert.type === 'critical' && 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-900/20',
                    alert.type === 'warning' && 'border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-900/20',
                    alert.type === 'info' && 'border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-900/20'
                  )}
                >
                  <div className="flex items-start">
                    <ExclamationTriangleIcon className="mt-0.5 h-5 w-5 flex-shrink-0" />
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium">{alert.message}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-sm text-muted-foreground">
                No recent alerts
              </p>
            )}
          </div>
        </div>

        {/* Process Status */}
        <div className="stat-card">
          <h3 className="mb-4 text-lg font-semibold">Current Process Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-muted p-4">
              <span className="font-medium">Status</span>
              <span className={clsx(
                'alert-badge',
                processStatus === 'critical' && 'alert-badge-critical',
                processStatus === 'warning' && 'alert-badge-warning',
                processStatus === 'normal' && 'alert-badge-normal'
              )}>
                {processStatus}
              </span>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Control Limits</h4>
              {controlLimits.hotellingT2.ucl ? (
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Hotelling T² UCL:</span>
                    <span className="font-medium">{controlLimits.hotellingT2.ucl.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Hotelling T² CL:</span>
                    <span className="font-medium">{controlLimits.hotellingT2.cl?.toFixed(4) || 'N/A'}</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Control limits not yet established
                </p>
              )}
            </div>

            {realtimeData.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Latest Reading</h4>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Timestamp:</span>
                  <span className="font-medium">
                    {new Date(realtimeData[realtimeData.length - 1].timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Value:</span>
                  <span className="font-medium">
                    {realtimeData[realtimeData.length - 1].statistic?.toFixed(4) || 'N/A'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
