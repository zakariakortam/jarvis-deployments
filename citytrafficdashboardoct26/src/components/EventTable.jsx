import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import useTrafficStore from '../store/trafficStore';
import { ArrowUpDown, Download, Search, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function getSeverityColor(severity) {
  switch (severity) {
    case 'critical':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    case 'warning':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'info':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
  }
}

function getEventIcon(type) {
  const icons = {
    congestion: '🚗',
    accident: '⚠️',
    roadwork: '🚧',
    speedLimit: '📏',
    emergency: '🚨'
  };
  return icons[type] || '📍';
}

export default function EventTable() {
  const events = useTrafficStore(state => state.events);
  const filters = useTrafficStore(state => state.filters);
  const setFilters = useTrafficStore(state => state.setFilters);

  const [sortField, setSortField] = useState('timestamp');
  const [sortDirection, setSortDirection] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);

  // Filter and sort events
  const filteredAndSortedEvents = useMemo(() => {
    let filtered = [...events];

    // Apply event type filter
    if (filters.eventType !== 'all') {
      filtered = filtered.filter(event => event.type === filters.eventType);
    }

    // Apply severity filter
    if (filters.severity !== 'all') {
      filtered = filtered.filter(event => event.severity === filters.severity);
    }

    // Apply search filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        event =>
          event.description.toLowerCase().includes(searchLower) ||
          event.sensorName.toLowerCase().includes(searchLower) ||
          event.type.toLowerCase().includes(searchLower)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === 'timestamp') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }

      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  }, [events, filters, sortField, sortDirection]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const exportToCSV = () => {
    const headers = ['Timestamp', 'Type', 'Severity', 'Location', 'Description'];
    const csvData = filteredAndSortedEvents.map(event => [
      format(new Date(event.timestamp), 'yyyy-MM-dd HH:mm:ss'),
      event.type,
      event.severity,
      event.sensorName,
      event.description
    ]);

    const csv = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `traffic-events-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToJSON = () => {
    const json = JSON.stringify(filteredAndSortedEvents, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `traffic-events-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-card rounded-lg shadow-lg border border-border">
      {/* Header with filters */}
      <div className="p-4 border-b border-border">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold text-card-foreground">Traffic Events</h3>
            <span className="text-sm text-muted-foreground">
              {filteredAndSortedEvents.length} events
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search events..."
                value={filters.searchTerm}
                onChange={(e) => setFilters({ searchTerm: e.target.value })}
                className="w-full pl-9 pr-4 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-3 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>

            {/* Export buttons */}
            <button
              onClick={exportToCSV}
              className="px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2"
              title="Export to CSV"
            >
              <Download className="w-4 h-4" />
              CSV
            </button>
            <button
              onClick={exportToJSON}
              className="px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2"
              title="Export to JSON"
            >
              <Download className="w-4 h-4" />
              JSON
            </button>
          </div>
        </div>

        {/* Filter panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-hidden"
            >
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Event Type
                </label>
                <select
                  value={filters.eventType}
                  onChange={(e) => setFilters({ eventType: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="all">All Types</option>
                  <option value="congestion">Congestion</option>
                  <option value="accident">Accident</option>
                  <option value="roadwork">Roadwork</option>
                  <option value="speedLimit">Speed Limit</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Severity
                </label>
                <select
                  value={filters.severity}
                  onChange={(e) => setFilters({ severity: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="all">All Severities</option>
                  <option value="critical">Critical</option>
                  <option value="warning">Warning</option>
                  <option value="info">Info</option>
                </select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('timestamp')}
                  className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  Time
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('type')}
                  className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  Type
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('severity')}
                  className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  Severity
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('sensorName')}
                  className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  Location
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Description
              </th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout">
              {filteredAndSortedEvents.slice(0, 100).map((event, index) => (
                <motion.tr
                  key={event.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2, delay: index * 0.02 }}
                  className="border-b border-border hover:bg-muted/50 transition-colors"
                >
                  <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                    {format(new Date(event.timestamp), 'HH:mm:ss')}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className="flex items-center gap-2">
                      <span>{getEventIcon(event.type)}</span>
                      <span className="capitalize">{event.type}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(
                        event.severity
                      )}`}
                    >
                      {event.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">{event.sensorName}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {event.description}
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>

        {filteredAndSortedEvents.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            No events match the current filters
          </div>
        )}
      </div>
    </div>
  );
}
