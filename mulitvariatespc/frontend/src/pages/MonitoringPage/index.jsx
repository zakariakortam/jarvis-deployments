import { useState, useEffect, useMemo } from 'react'
import { useSpcStore } from '../../store/spcStore'
import ControlChart from '../../components/ControlChart'
import ContributionPlot from '../../components/ContributionPlot'
import { calculateContributions, calculateMean, calculateCovariance } from '../../utils/spcCalculations'
import { PlayIcon, PauseIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import { wsService } from '../../services/websocket'
import clsx from 'clsx'

export default function MonitoringPage() {
  const { realtimeData, controlLimits, config, isConnected } = useSpcStore()
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [selectedChart, setSelectedChart] = useState('hotelling')
  const [showContributions, setShowContributions] = useState(true)

  const chartTypes = [
    { id: 'hotelling', name: "Hotelling's T²", description: 'Multivariate control chart' },
    { id: 'mewma', name: 'MEWMA', description: 'Exponentially weighted moving average' },
    { id: 'mcusum', name: 'MCUSUM', description: 'Cumulative sum control chart' }
  ]

  // Calculate contributions for the latest data point
  const contributions = useMemo(() => {
    if (realtimeData.length < 30 || !showContributions) return []

    try {
      const phaseIData = realtimeData.slice(0, 30).map(d => d.values || [])
      const means = calculateMean(phaseIData)
      const covMatrix = calculateCovariance(phaseIData, means)

      const latestPoint = realtimeData[realtimeData.length - 1]
      if (!latestPoint.values) return []

      const variableNames = config.variables.length > 0
        ? config.variables.map(v => v.name)
        : latestPoint.values.map((_, i) => `Var ${i + 1}`)

      return calculateContributions(latestPoint.values, means, covMatrix, variableNames)
    } catch (error) {
      console.error('Error calculating contributions:', error)
      return []
    }
  }, [realtimeData, config.variables, showContributions])

  const handleStartMonitoring = () => {
    wsService.startMonitoring()
    setIsMonitoring(true)
  }

  const handleStopMonitoring = () => {
    wsService.stopMonitoring()
    setIsMonitoring(false)
  }

  const handleResetLimits = () => {
    if (confirm('Are you sure you want to reset control limits? This will clear all current data.')) {
      wsService.resetControlLimits()
      useSpcStore.getState().clearData()
    }
  }

  // Filter data based on selected chart type
  const filteredData = useMemo(() => {
    return realtimeData.filter(d => d.chartType === selectedChart || !d.chartType)
  }, [realtimeData, selectedChart])

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Real-time Monitoring</h1>
          <p className="mt-1 text-muted-foreground">
            Live process control charts and fault diagnosis
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!isMonitoring ? (
            <button
              onClick={handleStartMonitoring}
              disabled={!isConnected}
              className={clsx(
                'inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium shadow-sm transition-colors',
                isConnected
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'cursor-not-allowed bg-gray-300 text-gray-500'
              )}
            >
              <PlayIcon className="mr-2 h-4 w-4" />
              Start Monitoring
            </button>
          ) : (
            <button
              onClick={handleStopMonitoring}
              className="inline-flex items-center rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700"
            >
              <PauseIcon className="mr-2 h-4 w-4" />
              Stop Monitoring
            </button>
          )}

          <button
            onClick={handleResetLimits}
            className="inline-flex items-center rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent"
          >
            <ArrowPathIcon className="mr-2 h-4 w-4" />
            Reset Limits
          </button>
        </div>
      </div>

      {/* Chart Type Selector */}
      <div className="stat-card">
        <h3 className="mb-4 text-sm font-semibold">Chart Type</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {chartTypes.map((chart) => (
            <button
              key={chart.id}
              onClick={() => setSelectedChart(chart.id)}
              className={clsx(
                'rounded-lg border p-4 text-left transition-all',
                selectedChart === chart.id
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-border hover:border-primary/50'
              )}
            >
              <p className="font-semibold">{chart.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">{chart.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Control Chart */}
      <div className="stat-card">
        <ControlChart
          data={filteredData}
          chartType={selectedChart}
          controlLimits={controlLimits[selectedChart] || { ucl: null, cl: null }}
          title={chartTypes.find(c => c.id === selectedChart)?.name || 'Control Chart'}
          yAxisLabel="Statistic Value"
          showLegend={true}
        />

        {/* Chart Info */}
        <div className="mt-4 grid grid-cols-1 gap-4 rounded-lg bg-muted p-4 sm:grid-cols-3">
          <div>
            <p className="text-xs text-muted-foreground">Samples Displayed</p>
            <p className="text-lg font-semibold">{filteredData.length}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Last Update</p>
            <p className="text-lg font-semibold">
              {filteredData.length > 0
                ? new Date(filteredData[filteredData.length - 1].timestamp).toLocaleTimeString()
                : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Monitoring Status</p>
            <p className="text-lg font-semibold">
              {isMonitoring ? (
                <span className="text-green-600">Active</span>
              ) : (
                <span className="text-gray-500">Stopped</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Toggle Contributions */}
      <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
        <div>
          <h3 className="text-sm font-semibold">Variable Contribution Analysis</h3>
          <p className="text-xs text-muted-foreground">
            Show contribution of each variable to out-of-control signal
          </p>
        </div>
        <button
          onClick={() => setShowContributions(!showContributions)}
          className={clsx(
            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
            showContributions ? 'bg-primary' : 'bg-gray-300'
          )}
        >
          <span
            className={clsx(
              'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
              showContributions ? 'translate-x-6' : 'translate-x-1'
            )}
          />
        </button>
      </div>

      {/* Contribution Plot */}
      {showContributions && (
        <div className="stat-card">
          {contributions.length > 0 ? (
            <ContributionPlot
              contributions={contributions}
              title="Variable Contributions (Latest Sample)"
            />
          ) : (
            <div className="flex h-96 items-center justify-center">
              <div className="text-center">
                <p className="text-muted-foreground">
                  {realtimeData.length < 30
                    ? 'Need at least 30 samples to calculate contributions'
                    : 'No contribution data available'}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Process Variables Table */}
      {filteredData.length > 0 && filteredData[filteredData.length - 1].values && (
        <div className="stat-card">
          <h3 className="mb-4 text-lg font-semibold">Current Variable Values</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-2 text-left font-semibold">Variable</th>
                  <th className="pb-2 text-right font-semibold">Current Value</th>
                  <th className="pb-2 text-right font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredData[filteredData.length - 1].values.map((value, index) => {
                  const varName = config.variables[index]?.name || `Variable ${index + 1}`
                  const contribution = contributions.find(c => c.name === varName)

                  return (
                    <tr key={index} className="border-b border-border">
                      <td className="py-3 font-medium">{varName}</td>
                      <td className="py-3 text-right">{value.toFixed(4)}</td>
                      <td className="py-3 text-right">
                        {contribution && contribution.percentage > 25 ? (
                          <span className="alert-badge alert-badge-warning">
                            High Contribution
                          </span>
                        ) : (
                          <span className="alert-badge alert-badge-normal">
                            Normal
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
