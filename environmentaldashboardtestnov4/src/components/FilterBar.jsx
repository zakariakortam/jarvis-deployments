import { Filter, Download, Search } from 'lucide-react';

const FilterBar = ({ onFilterChange, onExport, filters }) => {
  const stationTypes = [
    { value: 'all', label: 'All Stations' },
    { value: 'air', label: 'Air Quality' },
    { value: 'water', label: 'Water Quality' },
    { value: 'weather', label: 'Weather' },
    { value: 'energy', label: 'Energy' },
  ];

  const timeRanges = [
    { value: '1h', label: 'Last Hour' },
    { value: '6h', label: 'Last 6 Hours' },
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
  ];

  return (
    <div className="bg-card rounded-2xl border border-border p-4 shadow-lg">
      <div className="flex flex-wrap items-center gap-4">
        {/* Filter Icon */}
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Filters</span>
        </div>

        {/* Station Type Filter */}
        <select
          value={filters.type}
          onChange={(e) => onFilterChange('type', e.target.value)}
          className="px-4 py-2 bg-background border border-border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
        >
          {stationTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>

        {/* Time Range Filter */}
        <select
          value={filters.timeRange}
          onChange={(e) => onFilterChange('timeRange', e.target.value)}
          className="px-4 py-2 bg-background border border-border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
        >
          {timeRanges.map((range) => (
            <option key={range.value} value={range.value}>
              {range.label}
            </option>
          ))}
        </select>

        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search stations..."
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            className="w-full pl-11 pr-4 py-2 bg-background border border-border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
          />
        </div>

        {/* Export Buttons */}
        <div className="flex items-center space-x-2 ml-auto">
          <button
            onClick={() => onExport('csv')}
            className="flex items-center space-x-2 px-5 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:opacity-90 transition-opacity shadow-md"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => onExport('json')}
            className="flex items-center space-x-2 px-5 py-2 border border-border rounded-full text-sm font-medium hover:bg-muted transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
