import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'
import { useMemo } from 'react'

export default function ContributionPlot({ contributions = [], title = 'Variable Contributions' }) {
  const chartData = useMemo(() => {
    return contributions.map(item => ({
      name: item.name,
      contribution: item.contribution,
      percentage: item.percentage
    }))
  }, [contributions])

  const getBarColor = (percentage) => {
    if (percentage > 50) return 'hsl(var(--chart-3))' // High contribution
    if (percentage > 25) return 'hsl(var(--chart-4))' // Medium contribution
    return 'hsl(var(--chart-2))' // Low contribution
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
          <p className="text-sm font-semibold">{data.name}</p>
          <p className="text-sm">
            Contribution: {data.contribution.toFixed(4)}
          </p>
          <p className="text-sm font-medium text-primary">
            {data.percentage.toFixed(1)}% of total
          </p>
        </div>
      )
    }
    return null
  }

  if (chartData.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center rounded-lg border border-border bg-card">
        <p className="text-muted-foreground">No contribution data available</p>
      </div>
    )
  }

  return (
    <div className="control-chart-container p-4">
      <h3 className="mb-4 text-lg font-semibold">{title}</h3>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            type="number"
            stroke="hsl(var(--foreground))"
            label={{ value: 'Contribution (%)', position: 'insideBottom', offset: -5 }}
          />
          <YAxis
            dataKey="name"
            type="category"
            stroke="hsl(var(--foreground))"
            width={90}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar
            dataKey="percentage"
            name="Contribution %"
            radius={[0, 8, 8, 0]}
            animationDuration={500}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.percentage)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Top Contributors Summary */}
      <div className="mt-4">
        <h4 className="mb-2 text-sm font-semibold">Top Contributors:</h4>
        <div className="space-y-1">
          {chartData.slice(0, 3).map((item, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <span className="font-medium">{item.name}</span>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary">
                {item.percentage.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
