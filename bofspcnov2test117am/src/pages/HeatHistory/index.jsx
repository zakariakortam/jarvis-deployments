import { useState, useEffect } from 'react'
import { Search, Download, Filter } from 'lucide-react'
import axios from 'axios'
import { format } from 'date-fns'

const HeatHistory = () => {
  const [heats, setHeats] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHeats()
  }, [])

  const fetchHeats = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/heats?limit=100')
      setHeats(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching heats:', error)
      setLoading(false)
    }
  }

  const filteredHeats = heats.filter(heat =>
    heat.heatNumber.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Heat History</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Browse and search historical BOF heat data
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
            placeholder="Search by heat number..."
          />
        </div>
        <button className="btn-secondary flex items-center gap-2">
          <Filter size={20} />
          Filters
        </button>
        <button className="btn-primary flex items-center gap-2">
          <Download size={20} />
          Export CSV
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="loading-spinner h-12 w-12" />
        </div>
      ) : (
        <div className="card">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Heat Number</th>
                  <th>Timestamp</th>
                  <th>Temperature</th>
                  <th>Carbon %</th>
                  <th>O₂ Level</th>
                  <th>Slag Basicity</th>
                  <th>Blow Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredHeats.map((heat) => (
                  <tr key={heat.id} className="hover:bg-gray-50 dark:hover:bg-steel-800 cursor-pointer">
                    <td className="font-medium">{heat.heatNumber}</td>
                    <td>{format(new Date(heat.timestamp), 'yyyy-MM-dd HH:mm')}</td>
                    <td>{heat.temperature.toFixed(0)}°C</td>
                    <td>{(heat.carbonContent * 100).toFixed(3)}%</td>
                    <td>{heat.oxygenLevel.toFixed(2)}%</td>
                    <td>{heat.slagBasicity.toFixed(2)}</td>
                    <td>{heat.blowTime.toFixed(1)} min</td>
                    <td>
                      <span className="badge-success">{heat.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default HeatHistory
