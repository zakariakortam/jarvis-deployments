import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ResponsiveContainer } from 'recharts'
import { useMemo } from 'react'
import clsx from 'clsx'

export default function ControlChart({
  data = [],
  chartType = 'hotelling',
  controlLimits = { ucl: null, cl: null, lcl: 0 },
  title,
  yAxisLabel,
  showLegend = true
}) {
  const chartData = useMemo(() => {
    return data.map((point, index) => ({
      index: index + 1,
      value: point.statistic || 0,
      timestamp: point.timestamp,
      status: point.status
    }))
  }, [data])

  const getStatusColor = (status) => {
    switch (status) {
      case 'critical':
        return '#ef4444'
      case 'warning':
        return '#f59e0b'
      default:
        return '#10b981'
    }
  }

  const CustomDot = (props) => {
    const { cx, cy, payload } = props
    return (
      <circle
        cx={cx}
        cy={cy}
        r={4}
        fill={getStatusColor(payload.status)}
        stroke="#fff"
        strokeWidth={2}
      />
    )
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
          <p className="text-sm font-semibold">Sample {data.index}</p>
          <p className="text-sm text-muted-foreground">
            {new Date(data.timestamp).toLocaleTimeString()}
          </p>
          <p className="text-sm font-medium">
            Value: {data.value.toFixed(4)}
          </p>
          <p className={clsx(
            'text-sm font-medium capitalize',
            data.status === 'critical' && 'text-red-600',
            data.status === 'warning' && 'text-yellow-600',
            data.status === 'normal' && 'text-green-600'
          )}>
            Status: {data.status}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="control-chart-container p-4">
      {title && (
        <h3 className="mb-4 text-lg font-semibold">{title}</h3>
      )}

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="index"
            stroke="hsl(var(--foreground))"
            label={{ value: 'Sample Number', position: 'insideBottom', offset: -5 }}
          />
          <YAxis
            stroke="hsl(var(--foreground))"
            label={{ value: yAxisLabel || 'Statistic Value', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip content={<CustomTooltip />} />
          {showLegend && <Legend />}

          {/* Upper Control Limit */}
          {controlLimits.ucl && (
            <ReferenceLine
              y={controlLimits.ucl}
              stroke="#ef4444"
              strokeWidth={2}
              strokeDasharray="5 5"
              label={{ value: 'UCL', position: 'right', fill: '#ef4444' }}
            />
          )}

          {/* Center Line */}
          {controlLimits.cl && (
            <ReferenceLine
              y={controlLimits.cl}
              stroke="#10b981"
              strokeWidth={2}
              strokeDasharray="5 5"
              label={{ value: 'CL', position: 'right', fill: '#10b981' }}
            />
          )}

          {/* Lower Control Limit (if applicable) */}
          {controlLimits.lcl > 0 && (
            <ReferenceLine
              y={controlLimits.lcl}
              stroke="#ef4444"
              strokeWidth={2}
              strokeDasharray="5 5"
              label={{ value: 'LCL', position: 'right', fill: '#ef4444' }}
            />
          )}

          <Line
            type="monotone"
            dataKey="value"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={<CustomDot />}
            name={chartType.toUpperCase()}
            animationDuration={300}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Control Limits Info */}
      <div className="mt-4 flex justify-around text-sm">
        {controlLimits.ucl && (
          <div>
            <span className="font-medium">UCL: </span>
            <span className="text-red-600">{controlLimits.ucl.toFixed(4)}</span>
          </div>
        )}
        {controlLimits.cl && (
          <div>
            <span className="font-medium">CL: </span>
            <span className="text-green-600">{controlLimits.cl.toFixed(4)}</span>
          </div>
        )}
        {chartData.length > 0 && (
          <div>
            <span className="font-medium">Current: </span>
            <span className={clsx(
              'font-semibold',
              chartData[chartData.length - 1].status === 'critical' && 'text-red-600',
              chartData[chartData.length - 1].status === 'warning' && 'text-yellow-600',
              chartData[chartData.length - 1].status === 'normal' && 'text-green-600'
            )}>
              {chartData[chartData.length - 1].value.toFixed(4)}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
