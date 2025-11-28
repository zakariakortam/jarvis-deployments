import { useState, useMemo } from 'react'
import { FixedSizeList as List } from 'react-window'
import { format } from 'date-fns'
import { AlertCircle, Info, AlertTriangle, ChevronUp, ChevronDown, Search } from 'lucide-react'

// Sort directions
const SORT_ASC = 'asc'
const SORT_DESC = 'desc'

// Event row component
function EventRow({ index, style, data }) {
  const { events, onSelectSatellite } = data
  const event = events[index]

  const severityConfig = {
    info: {
      icon: Info,
      bgColor: 'bg-primary/10',
      textColor: 'text-primary',
      borderColor: 'border-l-primary',
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-warning/10',
      textColor: 'text-warning',
      borderColor: 'border-l-warning',
    },
    critical: {
      icon: AlertCircle,
      bgColor: 'bg-destructive/10',
      textColor: 'text-destructive',
      borderColor: 'border-l-destructive',
    },
  }

  const config = severityConfig[event.severity] || severityConfig.info
  const Icon = config.icon

  return (
    <div
      style={style}
      className={`flex items-center px-4 py-2 border-b border-border ${config.bgColor} border-l-4 ${config.borderColor} hover:bg-muted/30 transition-colors`}
    >
      <div className="flex items-center space-x-4 flex-1">
        <Icon className={`w-4 h-4 ${config.textColor} flex-shrink-0`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3">
            <span className="text-xs text-muted-foreground font-mono">
              {format(new Date(event.timestamp), 'HH:mm:ss')}
            </span>
            <button
              onClick={() => onSelectSatellite && onSelectSatellite(event.satelliteId)}
              className="text-xs font-medium text-primary hover:underline"
            >
              {event.satelliteId}
            </button>
            <span className={`text-xs font-semibold uppercase ${config.textColor}`}>
              {event.type}
            </span>
          </div>
          <p className="text-sm text-foreground mt-1 truncate">{event.message}</p>
        </div>
      </div>
    </div>
  )
}

// Main event table component
export default function EventTable({ events = [], onSelectSatellite, className = '' }) {
  const [sortField, setSortField] = useState('timestamp')
  const [sortDirection, setSortDirection] = useState(SORT_DESC)
  const [filterSeverity, setFilterSeverity] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Filter and sort events
  const processedEvents = useMemo(() => {
    let filtered = [...events]

    // Filter by severity
    if (filterSeverity !== 'all') {
      filtered = filtered.filter((event) => event.severity === filterSeverity)
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (event) =>
          event.satelliteId.toLowerCase().includes(query) ||
          event.message.toLowerCase().includes(query) ||
          event.type.toLowerCase().includes(query)
      )
    }

    // Sort events
    filtered.sort((a, b) => {
      let aVal = a[sortField]
      let bVal = b[sortField]

      if (sortField === 'timestamp') {
        aVal = new Date(aVal).getTime()
        bVal = new Date(bVal).getTime()
      }

      if (sortDirection === SORT_ASC) {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })

    return filtered
  }, [events, sortField, sortDirection, filterSeverity, searchQuery])

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === SORT_ASC ? SORT_DESC : SORT_ASC)
    } else {
      setSortField(field)
      setSortDirection(SORT_DESC)
    }
  }

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null
    return sortDirection === SORT_ASC ? (
      <ChevronUp className="w-3 h-3" />
    ) : (
      <ChevronDown className="w-3 h-3" />
    )
  }

  return (
    <div className={`bg-card rounded-lg border border-border overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">Event Log</h3>
          <span className="text-xs text-muted-foreground">
            {processedEvents.length} events
          </span>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-md text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Severity filter */}
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="px-4 py-2 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Severities</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
          </select>

          {/* Sort options */}
          <div className="flex gap-2">
            <button
              onClick={() => handleSort('timestamp')}
              className={`px-3 py-2 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${
                sortField === 'timestamp'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Time
              <SortIcon field="timestamp" />
            </button>
            <button
              onClick={() => handleSort('severity')}
              className={`px-3 py-2 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${
                sortField === 'severity'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Severity
              <SortIcon field="severity" />
            </button>
          </div>
        </div>
      </div>

      {/* Event list with virtualization */}
      {processedEvents.length > 0 ? (
        <List
          height={500}
          itemCount={processedEvents.length}
          itemSize={80}
          width="100%"
          itemData={{ events: processedEvents, onSelectSatellite }}
        >
          {EventRow}
        </List>
      ) : (
        <div className="flex items-center justify-center h-64">
          <p className="text-sm text-muted-foreground">No events found</p>
        </div>
      )}
    </div>
  )
}

// Compact event list for sidebar
export function CompactEventList({ events = [], limit = 5, onSelectSatellite }) {
  const recentEvents = events.slice(0, limit)

  const severityConfig = {
    info: { icon: Info, color: 'text-primary' },
    warning: { icon: AlertTriangle, color: 'text-warning' },
    critical: { icon: AlertCircle, color: 'text-destructive' },
  }

  return (
    <div className="space-y-2">
      {recentEvents.map((event) => {
        const config = severityConfig[event.severity] || severityConfig.info
        const Icon = config.icon

        return (
          <div
            key={event.id}
            className="flex items-start space-x-2 p-2 bg-muted/50 rounded-md hover:bg-muted transition-colors"
          >
            <Icon className={`w-4 h-4 ${config.color} flex-shrink-0 mt-0.5`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => onSelectSatellite && onSelectSatellite(event.satelliteId)}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  {event.satelliteId}
                </button>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(event.timestamp), 'HH:mm')}
                </span>
              </div>
              <p className="text-xs text-foreground mt-1 line-clamp-2">{event.message}</p>
            </div>
          </div>
        )
      })}
      {recentEvents.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">No recent events</p>
      )}
    </div>
  )
}
