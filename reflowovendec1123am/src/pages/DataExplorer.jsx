import { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  SortAsc,
  SortDesc,
  X,
} from 'lucide-react';
import useStore from '../store/useStore';
import { Card, TimeRangeSlider } from '../components/common';
import { formatNumber } from '../utils/calculations';
import { ZONE_COLORS } from '../utils/constants';

const PAGE_SIZE_OPTIONS = [25, 50, 100, 250];

export default function DataExplorer() {
  const { getFilteredData, exportData, activeFilters, setActiveFilters } = useStore();
  const filteredData = getFilteredData();

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'index', direction: 'asc' });
  const [visibleColumns, setVisibleColumns] = useState([
    'timestamp',
    'avgZoneTemp',
    'maxZoneTemp',
    'activePower',
    'status',
    'boardsProduced',
    'alarms',
  ]);

  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState({ ...activeFilters });

  const allColumns = [
    { key: 'index', label: 'Index', format: (v) => v },
    { key: 'timestamp', label: 'Time', format: (v) => v?.toLocaleString() || '—' },
    { key: 'avgZoneTemp', label: 'Avg Temp', format: (v) => `${formatNumber(v, 1)}°C`, type: 'number' },
    { key: 'maxZoneTemp', label: 'Max Temp', format: (v) => `${formatNumber(v, 1)}°C`, type: 'number' },
    { key: 'minZoneTemp', label: 'Min Temp', format: (v) => `${formatNumber(v, 1)}°C`, type: 'number' },
    { key: 'activePower', label: 'Power', format: (v) => `${formatNumber(v, 2)} kW`, type: 'number', path: 'power.activePower' },
    { key: 'powerFactor', label: 'PF', format: (v) => formatNumber(v, 3), type: 'number', path: 'power.powerFactor' },
    { key: 'cumulativeEnergy', label: 'Energy', format: (v) => `${formatNumber(v, 3)} kWh`, type: 'number', path: 'power.cumulativeEnergy' },
    { key: 'current', label: 'Current', format: (v) => `${formatNumber(v, 1)} A`, type: 'number', path: 'power.current' },
    { key: 'status', label: 'Status', format: (v) => v || '—', path: 'equipment.status' },
    { key: 'boardsProduced', label: 'Boards', format: (v) => v || 0, type: 'number', path: 'production.boardsProduced' },
    { key: 'boardsInside', label: 'In Process', format: (v) => v || 0, type: 'number', path: 'production.boardsInside' },
    { key: 'alarms', label: 'Alarms', format: (v) => v || 0, type: 'number', path: 'equipment.alarms' },
    { key: 'conveyorSpeed', label: 'Speed', format: (v) => `${formatNumber(v, 2)} m/min`, type: 'number', path: 'equipment.conveyorSpeed' },
    { key: 'o2Concentration', label: 'O2', format: (v) => `${formatNumber(v, 0)} ppm`, type: 'number', path: 'environment.o2Concentration' },
    { key: 'flowRate', label: 'Flow', format: (v) => `${formatNumber(v, 1)} L/min`, type: 'number', path: 'environment.flowRate' },
    { key: 'productNumber', label: 'Product', format: (v) => v || '—', path: 'production.productNumber' },
  ];

  const getValue = (row, column) => {
    if (column.path) {
      const parts = column.path.split('.');
      let value = row;
      for (const part of parts) {
        value = value?.[part];
      }
      return value;
    }
    return row[column.key];
  };

  const processedData = useMemo(() => {
    let data = [...filteredData];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      data = data.filter((row) => {
        return allColumns.some((col) => {
          const value = getValue(row, col);
          return value?.toString().toLowerCase().includes(query);
        });
      });
    }

    // Sort
    if (sortConfig.key) {
      const column = allColumns.find((c) => c.key === sortConfig.key);
      data.sort((a, b) => {
        const aVal = getValue(a, column);
        const bVal = getValue(b, column);

        if (aVal == null) return 1;
        if (bVal == null) return -1;

        let comparison = 0;
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          comparison = aVal - bVal;
        } else {
          comparison = String(aVal).localeCompare(String(bVal));
        }

        return sortConfig.direction === 'asc' ? comparison : -comparison;
      });
    }

    return data;
  }, [filteredData, searchQuery, sortConfig]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedData.slice(start, start + pageSize);
  }, [processedData, currentPage, pageSize]);

  const totalPages = Math.ceil(processedData.length / pageSize);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleExport = (format) => {
    const data = exportData(format);
    const blob = new Blob([data], { type: format === 'csv' ? 'text/csv' : 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reflow-data-${new Date().toISOString().slice(0, 10)}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const applyFilters = () => {
    setActiveFilters(tempFilters);
    setFilterPanelOpen(false);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setTempFilters({});
    setActiveFilters({});
    setCurrentPage(1);
  };

  const toggleColumn = (key) => {
    setVisibleColumns((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const activeFilterCount = Object.keys(activeFilters).filter((k) => activeFilters[k] != null).length;

  return (
    <div className="space-y-6 animate-in">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Data Explorer
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Browse, filter, and export raw data
        </p>
      </div>

      {/* Time Range */}
      <Card>
        <div className="p-4">
          <TimeRangeSlider />
        </div>
      </Card>

      {/* Toolbar */}
      <Card noPadding>
        <div className="p-4 flex flex-wrap items-center gap-4 border-b border-gray-200 dark:border-gray-700">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search data..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="input pl-10"
            />
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setFilterPanelOpen(!filterPanelOpen)}
            className={`btn ${activeFilterCount > 0 ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-white/20 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Export */}
          <div className="flex items-center gap-2">
            <button onClick={() => handleExport('csv')} className="btn btn-secondary">
              <Download className="w-4 h-4" />
              CSV
            </button>
            <button onClick={() => handleExport('json')} className="btn btn-secondary">
              <Download className="w-4 h-4" />
              JSON
            </button>
          </div>

          {/* Results count */}
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {processedData.length.toLocaleString()} records
          </span>
        </div>

        {/* Filter Panel */}
        {filterPanelOpen && (
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  value={tempFilters.status || ''}
                  onChange={(e) => setTempFilters({ ...tempFilters, status: e.target.value || undefined })}
                  className="select"
                >
                  <option value="">All</option>
                  <option value="Operating">Operating</option>
                  <option value="Idle">Idle</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Product
                </label>
                <select
                  value={tempFilters.product || ''}
                  onChange={(e) => setTempFilters({ ...tempFilters, product: e.target.value || undefined })}
                  className="select"
                >
                  <option value="">All</option>
                  <option value="A-001">A-001</option>
                  <option value="A-002">A-002</option>
                  <option value="B-001">B-001</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Min Temp (°C)
                </label>
                <input
                  type="number"
                  value={tempFilters.minTemp || ''}
                  onChange={(e) => setTempFilters({ ...tempFilters, minTemp: e.target.value ? Number(e.target.value) : undefined })}
                  className="input"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Max Temp (°C)
                </label>
                <input
                  type="number"
                  value={tempFilters.maxTemp || ''}
                  onChange={(e) => setTempFilters({ ...tempFilters, maxTemp: e.target.value ? Number(e.target.value) : undefined })}
                  className="input"
                  placeholder="300"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <button onClick={applyFilters} className="btn btn-primary">
                Apply Filters
              </button>
              <button onClick={clearFilters} className="btn btn-ghost">
                Clear All
              </button>
            </div>
          </div>
        )}

        {/* Column Selector */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-2">
            {allColumns.map((col) => (
              <button
                key={col.key}
                onClick={() => toggleColumn(col.key)}
                className={`px-2 py-1 text-xs rounded-full transition-colors ${
                  visibleColumns.includes(col.key)
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                }`}
              >
                {col.label}
              </button>
            ))}
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800">
                {allColumns
                  .filter((col) => visibleColumns.includes(col.key))
                  .map((col) => (
                    <th
                      key={col.key}
                      onClick={() => handleSort(col.key)}
                      className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                    >
                      <div className="flex items-center gap-1">
                        {col.label}
                        {sortConfig.key === col.key && (
                          sortConfig.direction === 'asc' ? (
                            <SortAsc className="w-3 h-3" />
                          ) : (
                            <SortDesc className="w-3 h-3" />
                          )
                        )}
                      </div>
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row, i) => (
                <tr
                  key={row.index}
                  className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  {allColumns
                    .filter((col) => visibleColumns.includes(col.key))
                    .map((col) => {
                      const value = getValue(row, col);
                      return (
                        <td key={col.key} className="py-3 px-4 text-gray-700 dark:text-gray-300">
                          {col.format(value)}
                        </td>
                      );
                    })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="select w-auto text-sm"
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="btn btn-ghost p-2"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="btn btn-ghost p-2"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
