import { useMemo, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Search, Filter, X } from 'lucide-react';
import clsx from 'clsx';
import useSatelliteStore from '../../store/useSatelliteStore';

function SatelliteList() {
  const satellites = useSatelliteStore(state => state.satellites);
  const selectedSatelliteId = useSatelliteStore(state => state.selectedSatellite);
  const selectSatellite = useSatelliteStore(state => state.selectSatellite);
  const filters = useSatelliteStore(state => state.filters);
  const setFilters = useSatelliteStore(state => state.setFilters);
  const getFilteredSatellites = useSatelliteStore(state => state.getFilteredSatellites);

  const [showFilters, setShowFilters] = useState(false);

  const parentRef = useMemo(() => ({ current: null }), []);

  const filteredSatellites = useMemo(() => getFilteredSatellites(), [getFilteredSatellites, satellites, filters]);

  const rowVirtualizer = useVirtualizer({
    count: filteredSatellites.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
    overscan: 20,
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'critical':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'offline':
        return 'bg-gray-500';
      default:
        return 'bg-green-500';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'critical':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'warning':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'offline':
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
      default:
        return 'bg-green-500/10 text-green-500 border-green-500/20';
    }
  };

  const clearFilters = () => {
    setFilters({ search: '', status: 'all', type: 'all' });
  };

  const hasActiveFilters = filters.search || filters.status !== 'all' || filters.type !== 'all';

  return (
    <div className="flex flex-col h-full bg-card overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-border space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Satellites</h3>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={clsx(
              'p-2 rounded-lg transition-colors flex-shrink-0',
              showFilters ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
            )}
            aria-label="Toggle filters"
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search satellites..."
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="space-y-3 p-3 bg-muted/30 rounded-lg border border-border">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ status: e.target.value })}
                className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Statuses</option>
                <option value="nominal">Nominal</option>
                <option value="warning">Warning</option>
                <option value="critical">Critical</option>
                <option value="offline">Offline</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ type: e.target.value })}
                className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Types</option>
                <option value="LEO">LEO</option>
                <option value="MEO">MEO</option>
                <option value="GEO">GEO</option>
                <option value="HEO">HEO</option>
              </select>
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="w-full flex items-center justify-center gap-2 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-background rounded-lg transition-colors"
              >
                <X className="w-3 h-3" />
                Clear Filters
              </button>
            )}
          </div>
        )}

        <div className="text-xs text-muted-foreground flex items-center gap-2">
          <span className="font-medium">{filteredSatellites.length.toLocaleString()}</span>
          <span>of</span>
          <span className="font-medium">{satellites.length.toLocaleString()}</span>
          <span>satellites</span>
        </div>
      </div>

      {/* List */}
      <div ref={parentRef} className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const satellite = filteredSatellites[virtualRow.index];
            const isSelected = satellite.id === selectedSatelliteId;

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
                <button
                  onClick={() => selectSatellite(satellite.id)}
                  className={clsx(
                    'w-full px-3 py-3 text-left transition-all border-b border-border',
                    isSelected
                      ? 'bg-primary/10 border-l-4 border-l-primary pl-2'
                      : 'hover:bg-muted/30'
                  )}
                >
                  <div className="flex items-start gap-2.5">
                    {/* Status Indicator */}
                    <div className="flex-shrink-0 mt-1">
                      <div
                        className={clsx('w-2 h-2 rounded-full', getStatusColor(satellite.overallStatus))}
                      />
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      {/* Satellite ID */}
                      <div className="font-mono text-sm font-semibold text-foreground truncate">
                        {satellite.id}
                      </div>

                      {/* Satellite Name */}
                      <div className="text-xs text-muted-foreground truncate">
                        {satellite.name}
                      </div>

                      {/* Badges Row 1 */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="inline-flex items-center text-xs px-2 py-0.5 bg-muted rounded text-foreground font-medium">
                          {satellite.type}
                        </span>
                        <span
                          className={clsx(
                            'inline-flex items-center text-xs px-2 py-0.5 rounded border capitalize font-medium',
                            getStatusBadge(satellite.overallStatus)
                          )}
                        >
                          {satellite.overallStatus}
                        </span>
                      </div>

                      {/* Badges Row 2 */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="inline-flex items-center text-xs px-2 py-0.5 bg-muted/50 rounded text-muted-foreground">
                          {satellite.mission}
                        </span>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-3 pt-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <span className="font-medium">{satellite.orbit.altitude.toFixed(0)}</span>
                          <span>km</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">{satellite.telemetry.propulsion.fuel.toFixed(0)}%</span>
                          <span>fuel</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            );
          })}
        </div>

        {filteredSatellites.length === 0 && (
          <div className="flex items-center justify-center h-64 px-4">
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-2">No satellites found</div>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-primary hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SatelliteList;
