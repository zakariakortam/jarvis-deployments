import { useMemo, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { format } from 'date-fns';
import { ChevronUp, ChevronDown, Download, Search } from 'lucide-react';
import clsx from 'clsx';

function EventTable({ events }) {
  const [sortConfig, setSortConfig] = useState({ key: 'timestamp', direction: 'desc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');

  const parentRef = useMemo(() => ({ current: null }), []);

  // Filter and sort events
  const filteredAndSortedEvents = useMemo(() => {
    let filtered = events;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        event =>
          event.satelliteId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply severity filter
    if (severityFilter !== 'all') {
      filtered = filtered.filter(event => event.severity === severityFilter);
    }

    // Sort events
    return [...filtered].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (sortConfig.key === 'timestamp') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [events, sortConfig, searchTerm, severityFilter]);

  // Virtual scrolling
  const rowVirtualizer = useVirtualizer({
    count: filteredAndSortedEvents.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,
    overscan: 10,
  });

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const exportToCSV = () => {
    const headers = ['Timestamp', 'Satellite ID', 'Type', 'Severity', 'Message'];
    const csvContent = [
      headers.join(','),
      ...filteredAndSortedEvents.map(event =>
        [
          format(new Date(event.timestamp), 'yyyy-MM-dd HH:mm:ss'),
          event.satelliteId,
          event.type,
          event.severity,
          `"${event.message.replace(/"/g, '""')}"`,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `satellite-events-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'warning':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      default:
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    }
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return null;
    return sortConfig.direction === 'asc' ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  return (
    <div className="flex flex-col h-full bg-card border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Event Log</h3>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Severity Filter */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Severities</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        <div className="text-sm text-muted-foreground">
          Showing {filteredAndSortedEvents.length} of {events.length} events
        </div>
      </div>

      {/* Table */}
      <div ref={parentRef} className="flex-1 overflow-auto custom-scrollbar">
        <table className="w-full">
          <thead className="sticky top-0 bg-card border-b border-border z-10">
            <tr>
              <th
                onClick={() => handleSort('timestamp')}
                className="px-4 py-3 text-left text-sm font-semibold text-foreground cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  Timestamp
                  <SortIcon columnKey="timestamp" />
                </div>
              </th>
              <th
                onClick={() => handleSort('satelliteId')}
                className="px-4 py-3 text-left text-sm font-semibold text-foreground cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  Satellite
                  <SortIcon columnKey="satelliteId" />
                </div>
              </th>
              <th
                onClick={() => handleSort('type')}
                className="px-4 py-3 text-left text-sm font-semibold text-foreground cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  Type
                  <SortIcon columnKey="type" />
                </div>
              </th>
              <th
                onClick={() => handleSort('severity')}
                className="px-4 py-3 text-left text-sm font-semibold text-foreground cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  Severity
                  <SortIcon columnKey="severity" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                Message
              </th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ height: `${rowVirtualizer.getTotalSize()}px` }}>
              <td colSpan={5} className="p-0">
                <div style={{ position: 'relative', height: '100%' }}>
                  {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                    const event = filteredAndSortedEvents[virtualRow.index];
                    return (
                      <div
                        key={virtualRow.key}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: `${virtualRow.size}px`,
                          transform: `translateY(${virtualRow.start}px)`,
                        }}
                      >
                        <div className="flex border-b border-border hover:bg-muted/50 transition-colors">
                          <div className="px-4 py-3 text-sm text-foreground whitespace-nowrap" style={{ width: '200px' }}>
                            {format(new Date(event.timestamp), 'yyyy-MM-dd HH:mm:ss')}
                          </div>
                          <div className="px-4 py-3 text-sm text-foreground font-mono" style={{ width: '150px' }}>
                            {event.satelliteId}
                          </div>
                          <div className="px-4 py-3 text-sm text-foreground capitalize" style={{ width: '150px' }}>
                            {event.type}
                          </div>
                          <div className="px-4 py-3" style={{ width: '120px' }}>
                            <span
                              className={clsx(
                                'inline-flex px-2 py-1 text-xs font-medium rounded-full border capitalize',
                                getSeverityColor(event.severity)
                              )}
                            >
                              {event.severity}
                            </span>
                          </div>
                          <div className="px-4 py-3 text-sm text-muted-foreground flex-1">
                            {event.message}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        {filteredAndSortedEvents.length === 0 && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-muted-foreground mb-2">No events found</div>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSeverityFilter('all');
                }}
                className="text-sm text-primary hover:underline"
              >
                Clear filters
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EventTable;
