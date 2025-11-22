import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, ChevronUp, ChevronDown, Filter } from 'lucide-react';
import useDashboardStore from '../../store/dashboardStore';

const ProductionTable = () => {
  const {
    getFilteredData,
    setSort,
    sortField,
    sortDirection,
    setSearchQuery,
    searchQuery,
    setFilter,
    filterStatus,
    filterLocation,
    filterType,
    getUniqueLocations,
    getUniqueTypes,
  } = useDashboardStore();

  const [showFilters, setShowFilters] = useState(false);
  const data = getFilteredData();
  const locations = getUniqueLocations();
  const types = getUniqueTypes();

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ChevronUp className="w-4 h-4 opacity-20" />;
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'operational':
        return 'status-operational';
      case 'warning':
        return 'status-warning';
      case 'critical':
        return 'status-critical';
      default:
        return 'status-offline';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Production Data</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg transition-colors ${
              showFilters
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            <Filter className="w-4 h-4" />
          </button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search equipment..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
          </div>
        </div>
      </div>

      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-4 grid grid-cols-3 gap-4"
        >
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilter('filterStatus', e.target.value)}
              className="w-full px-3 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="operational">Operational</option>
              <option value="warning">Warning</option>
              <option value="critical">Critical</option>
              <option value="offline">Offline</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Location</label>
            <select
              value={filterLocation}
              onChange={(e) => setFilter('filterLocation', e.target.value)}
              className="w-full px-3 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            >
              <option value="all">All Locations</option>
              {locations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilter('filterType', e.target.value)}
              className="w-full px-3 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            >
              <option value="all">All Types</option>
              {types.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </motion.div>
      )}

      <div className="overflow-x-auto scrollbar-thin">
        <table className="data-table">
          <thead>
            <tr>
              <th
                onClick={() => setSort('equipmentId')}
                className="cursor-pointer hover:bg-muted/70"
              >
                <div className="flex items-center space-x-1">
                  <span>ID</span>
                  <SortIcon field="equipmentId" />
                </div>
              </th>
              <th
                onClick={() => setSort('name')}
                className="cursor-pointer hover:bg-muted/70"
              >
                <div className="flex items-center space-x-1">
                  <span>Equipment</span>
                  <SortIcon field="name" />
                </div>
              </th>
              <th
                onClick={() => setSort('location')}
                className="cursor-pointer hover:bg-muted/70"
              >
                <div className="flex items-center space-x-1">
                  <span>Location</span>
                  <SortIcon field="location" />
                </div>
              </th>
              <th
                onClick={() => setSort('status')}
                className="cursor-pointer hover:bg-muted/70"
              >
                <div className="flex items-center space-x-1">
                  <span>Status</span>
                  <SortIcon field="status" />
                </div>
              </th>
              <th
                onClick={() => setSort('temperature')}
                className="cursor-pointer hover:bg-muted/70"
              >
                <div className="flex items-center space-x-1">
                  <span>Temp (°C)</span>
                  <SortIcon field="temperature" />
                </div>
              </th>
              <th
                onClick={() => setSort('voltage')}
                className="cursor-pointer hover:bg-muted/70"
              >
                <div className="flex items-center space-x-1">
                  <span>Voltage (V)</span>
                  <SortIcon field="voltage" />
                </div>
              </th>
              <th
                onClick={() => setSort('vibration')}
                className="cursor-pointer hover:bg-muted/70"
              >
                <div className="flex items-center space-x-1">
                  <span>Vibration</span>
                  <SortIcon field="vibration" />
                </div>
              </th>
              <th
                onClick={() => setSort('power')}
                className="cursor-pointer hover:bg-muted/70"
              >
                <div className="flex items-center space-x-1">
                  <span>Power (kW)</span>
                  <SortIcon field="power" />
                </div>
              </th>
              <th
                onClick={() => setSort('cycleCount')}
                className="cursor-pointer hover:bg-muted/70"
              >
                <div className="flex items-center space-x-1">
                  <span>Cycles</span>
                  <SortIcon field="cycleCount" />
                </div>
              </th>
              <th
                onClick={() => setSort('throughput')}
                className="cursor-pointer hover:bg-muted/70"
              >
                <div className="flex items-center space-x-1">
                  <span>Throughput</span>
                  <SortIcon field="throughput" />
                </div>
              </th>
              <th
                onClick={() => setSort('efficiency')}
                className="cursor-pointer hover:bg-muted/70"
              >
                <div className="flex items-center space-x-1">
                  <span>Efficiency</span>
                  <SortIcon field="efficiency" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <motion.tr
                key={row.equipmentId}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.01 }}
              >
                <td className="font-mono text-sm">{row.equipmentId}</td>
                <td className="font-medium">{row.name}</td>
                <td className="text-sm">{row.location}</td>
                <td>
                  <span className={`status-indicator ${getStatusColor(row.status)}`}>
                    {row.status}
                  </span>
                </td>
                <td className="text-right font-mono">{row.temperature.toFixed(1)}</td>
                <td className="text-right font-mono">{row.voltage.toFixed(1)}</td>
                <td className="text-right font-mono">{row.vibration.toFixed(2)}</td>
                <td className="text-right font-mono">{row.power.toFixed(1)}</td>
                <td className="text-right font-mono">{row.cycleCount.toLocaleString()}</td>
                <td className="text-right font-mono">{row.throughput.toLocaleString()}</td>
                <td className="text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <div className="w-16 bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${row.efficiency}%` }}
                      />
                    </div>
                    <span className="font-mono text-sm">{row.efficiency.toFixed(0)}%</span>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-sm text-muted-foreground text-center">
        Showing {data.length} equipment units
      </div>
    </motion.div>
  );
};

export default ProductionTable;
