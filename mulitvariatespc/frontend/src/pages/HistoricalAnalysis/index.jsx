import { useState } from 'react'
import { CalendarIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import ControlChart from '../../components/ControlChart'

export default function HistoricalAnalysis() {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [historicalData, setHistoricalData] = useState([])
  const [loading, setLoading] = useState(false)

  const handleLoadData = () => {
    setLoading(true)
    // Simulated data loading
    setTimeout(() => {
      setHistoricalData([])
      setLoading(false)
    }, 1000)
  }

  const handleExport = (format) => {
    console.log(`Exporting data as ${format}`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Historical Analysis</h1>
        <p className="mt-1 text-muted-foreground">
          Analyze past process data and trends
        </p>
      </div>

      {/* Date Range Selector */}
      <div className="stat-card">
        <h3 className="mb-4 text-lg font-semibold">Select Date Range</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-medium">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-4 py-2"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-4 py-2"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleLoadData}
              disabled={!startDate || !endDate || loading}
              className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CalendarIcon className="mr-2 inline-block h-4 w-4" />
              {loading ? 'Loading...' : 'Load Data'}
            </button>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="stat-card">
        <h3 className="mb-4 text-lg font-semibold">Export Data</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleExport('csv')}
            className="inline-flex items-center rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            <ArrowDownTrayIcon className="mr-2 h-4 w-4" />
            Export as CSV
          </button>
          <button
            onClick={() => handleExport('excel')}
            className="inline-flex items-center rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            <ArrowDownTrayIcon className="mr-2 h-4 w-4" />
            Export as Excel
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="inline-flex items-center rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            <ArrowDownTrayIcon className="mr-2 h-4 w-4" />
            Export as PDF
          </button>
        </div>
      </div>

      {/* Historical Chart */}
      {historicalData.length > 0 ? (
        <div className="stat-card">
          <ControlChart
            data={historicalData}
            chartType="hotelling"
            title="Historical Process Data"
          />
        </div>
      ) : (
        <div className="stat-card flex h-96 items-center justify-center">
          <p className="text-muted-foreground">
            Select a date range and click "Load Data" to view historical analysis
          </p>
        </div>
      )}
    </div>
  )
}
