import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, Search } from 'lucide-react';
import { format } from 'date-fns';

const DataTable = ({ data, onSort, sortBy, sortOrder }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter data based on search
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;

    const term = searchTerm.toLowerCase();
    return data.filter(
      (item) =>
        item.stationName.toLowerCase().includes(term) ||
        item.stationId.toLowerCase().includes(term) ||
        item.type.toLowerCase().includes(term)
    );
  }, [data, searchTerm]);

  // Paginate data (show 50 per page)
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 50;
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const paginatedData = useMemo(() => {
    const start = currentPage * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  const handleSort = (column) => {
    const newOrder = sortBy === column && sortOrder === 'asc' ? 'desc' : 'asc';
    onSort(column, newOrder);
  };

  const SortIcon = ({ column }) => {
    if (sortBy !== column) return <div className="w-4 h-4" />;
    return sortOrder === 'asc' ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  const getReadingValue = (reading) => {
    const values = Object.entries(reading.readings || {})
      .slice(0, 3)
      .map(([key, value]) => `${key}: ${typeof value === 'number' ? value.toFixed(2) : value}`);
    return values.join(', ');
  };

  return (
    <div className="bg-card rounded-2xl border border-border shadow-lg">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Sensor Data Table</h3>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search stations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 pr-4 py-2 bg-background border border-border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/80"
                onClick={() => handleSort('timestamp')}
              >
                <div className="flex items-center space-x-1">
                  <span>Timestamp</span>
                  <SortIcon column="timestamp" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/80"
                onClick={() => handleSort('stationId')}
              >
                <div className="flex items-center space-x-1">
                  <span>Station ID</span>
                  <SortIcon column="stationId" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/80"
                onClick={() => handleSort('stationName')}
              >
                <div className="flex items-center space-x-1">
                  <span>Station Name</span>
                  <SortIcon column="stationName" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/80"
                onClick={() => handleSort('type')}
              >
                <div className="flex items-center space-x-1">
                  <span>Type</span>
                  <SortIcon column="type" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Readings
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paginatedData.map((item, index) => (
              <tr key={item.id || index} className="hover:bg-muted/50 transition-colors">
                <td className="px-4 py-3 text-sm text-foreground whitespace-nowrap">
                  {format(item.timestamp, 'MMM dd, HH:mm:ss')}
                </td>
                <td className="px-4 py-3 text-sm font-mono text-foreground">{item.stationId}</td>
                <td className="px-4 py-3 text-sm text-foreground">{item.stationName}</td>
                <td className="px-4 py-3 text-sm">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      item.type === 'air'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : item.type === 'water'
                        ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200'
                        : item.type === 'weather'
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    }`}
                  >
                    {item.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground max-w-xs truncate">
                  {getReadingValue(item)}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span
                    className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                      item.status === 'active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                        item.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'
                      }`}
                    />
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-4 border-t border-border flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {currentPage * itemsPerPage + 1} to{' '}
          {Math.min((currentPage + 1) * itemsPerPage, filteredData.length)} of {filteredData.length}{' '}
          entries
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
            className="px-4 py-2 text-sm border border-border rounded-full hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm bg-primary/10 rounded-full">
            Page {currentPage + 1} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
            disabled={currentPage >= totalPages - 1}
            className="px-4 py-2 text-sm border border-border rounded-full hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
