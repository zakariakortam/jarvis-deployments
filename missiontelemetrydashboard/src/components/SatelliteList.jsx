import { useMemo } from 'react'
import { FixedSizeList as List } from 'react-window'
import { Satellite, Search } from 'lucide-react'

// Satellite row component for virtualized list
function SatelliteRow({ index, style, data }) {
  const { satellites, selectedId, onSelect } = data
  const satellite = satellites[index]

  const statusConfig = {
    nominal: { bg: 'bg-success', text: 'text-success', label: 'Nominal' },
    warning: { bg: 'bg-warning', text: 'text-warning', label: 'Warning' },
    critical: { bg: 'bg-destructive', text: 'text-destructive', label: 'Critical' },
    offline: { bg: 'bg-muted', text: 'text-muted-foreground', label: 'Offline' },
  }

  const config = statusConfig[satellite.status] || statusConfig.offline
  const isSelected = selectedId === satellite.id

  return (
    <div style={style}>
      <button
        onClick={() => onSelect(satellite.id)}
        className={`w-full text-left px-4 py-3 border-b border-border hover:bg-muted/50 transition-colors ${
          isSelected ? 'bg-primary/10 border-l-4 border-l-primary' : 'border-l-4 border-l-transparent'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <Satellite className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{satellite.id}</p>
              <p className="text-xs text-muted-foreground truncate">{satellite.orbitType}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <div className={`w-2 h-2 rounded-full ${config.bg} animate-pulse-slow`} />
            <span className={`text-xs font-medium ${config.text}`}>{config.label}</span>
          </div>
        </div>
        <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
          <span>Battery: {satellite.power.battery.toFixed(0)}%</span>
          <span>Fuel: {satellite.fuel.level.toFixed(0)}%</span>
        </div>
      </button>
    </div>
  )
}

// Main satellite list component
export default function SatelliteList({
  satellites = [],
  selectedSatelliteId = null,
  onSelectSatellite,
  filters,
  onFilterChange,
  className = '',
}) {
  // Apply filters
  const filteredSatellites = useMemo(() => {
    return satellites.filter((satellite) => {
      if (filters.search) {
        const query = filters.search.toLowerCase()
        if (
          !satellite.id.toLowerCase().includes(query) &&
          !satellite.name.toLowerCase().includes(query)
        ) {
          return false
        }
      }

      if (filters.status !== 'all' && satellite.status !== filters.status) {
        return false
      }

      if (filters.orbitType !== 'all' && satellite.orbitType !== filters.orbitType) {
        return false
      }

      return true
    })
  }, [satellites, filters])

  return (
    <div className={`flex flex-col h-full bg-card rounded-lg border border-border ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-border space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Satellites</h3>
          <span className="text-xs text-muted-foreground">
            {filteredSatellites.length} of {satellites.length}
          </span>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search satellites..."
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-md text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 gap-2">
          <select
            value={filters.status}
            onChange={(e) => onFilterChange('status', e.target.value)}
            className="px-3 py-2 bg-background border border-border rounded-md text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Status</option>
            <option value="nominal">Nominal</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
            <option value="offline">Offline</option>
          </select>

          <select
            value={filters.orbitType}
            onChange={(e) => onFilterChange('orbitType', e.target.value)}
            className="px-3 py-2 bg-background border border-border rounded-md text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Orbits</option>
            <option value="LEO">LEO</option>
            <option value="MEO">MEO</option>
            <option value="GEO">GEO</option>
            <option value="HEO">HEO</option>
          </select>
        </div>
      </div>

      {/* Satellite list with virtualization */}
      {filteredSatellites.length > 0 ? (
        <List
          height={600}
          itemCount={filteredSatellites.length}
          itemSize={80}
          width="100%"
          itemData={{
            satellites: filteredSatellites,
            selectedId: selectedSatelliteId,
            onSelect: onSelectSatellite,
          }}
        >
          {SatelliteRow}
        </List>
      ) : (
        <div className="flex items-center justify-center flex-1">
          <p className="text-sm text-muted-foreground">No satellites found</p>
        </div>
      )}
    </div>
  )
}
