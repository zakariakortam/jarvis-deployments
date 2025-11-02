import { useState } from 'react'
import { FileText, Download, Calendar } from 'lucide-react'

const Reports = () => {
  const [reportType, setReportType] = useState('daily')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })

  const reportTypes = [
    { value: 'daily', label: 'Daily Production Report', description: 'Summary of daily heat production and quality metrics' },
    { value: 'weekly', label: 'Weekly SPC Report', description: 'Control chart analysis and process capability for the week' },
    { value: 'monthly', label: 'Monthly Performance Report', description: 'Comprehensive monthly performance and trend analysis' },
    { value: 'capability', label: 'Process Capability Study', description: 'Detailed Cp/Cpk analysis for all parameters' },
    { value: 'outofcontrol', label: 'Out-of-Control Events', description: 'Summary of all out-of-control conditions and violations' },
  ]

  const handleGenerate = () => {
    // In production, this would call the backend API
    alert(`Generating ${reportType} report...`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Reports</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Generate automated SPC reports and export data
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {reportTypes.map((report) => (
            <div
              key={report.value}
              className={`card cursor-pointer transition-all ${
                reportType === report.value
                  ? 'ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'hover:bg-gray-50 dark:hover:bg-steel-700'
              }`}
              onClick={() => setReportType(report.value)}
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
                  <FileText className="text-primary-600 dark:text-primary-400" size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{report.label}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {report.description}
                  </p>
                </div>
                <input
                  type="radio"
                  checked={reportType === report.value}
                  onChange={() => setReportType(report.value)}
                  className="mt-1"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold">Report Settings</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label">Date Range</label>
                <div className="space-y-2">
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    className="input"
                  />
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label className="label">Format</label>
                <select className="input">
                  <option value="pdf">PDF Document</option>
                  <option value="excel">Excel Spreadsheet</option>
                  <option value="csv">CSV Data</option>
                </select>
              </div>

              <button
                onClick={handleGenerate}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <Download size={20} />
                Generate Report
              </button>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold">Quick Actions</h2>
            </div>
            <div className="space-y-2">
              <button className="btn-secondary w-full text-left">
                Last 24 Hours Report
              </button>
              <button className="btn-secondary w-full text-left">
                Last 7 Days Report
              </button>
              <button className="btn-secondary w-full text-left">
                Last 30 Days Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Reports
