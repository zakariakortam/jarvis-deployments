import React from 'react';
import { Building2, Search, Filter } from 'lucide-react';
import { Card } from '../common/Card';
import { useDashboardStore } from '../../store/dashboardStore';

export const BuildingSelector = () => {
  const {
    buildings,
    selectedBuilding,
    setSelectedBuilding,
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    getFilteredBuildings,
    realtimeData
  } = useDashboardStore();

  const filteredBuildings = getFilteredBuildings();

  const buildingTypes = [...new Set(buildings.map(b => b.type))];
  const locations = [...new Set(buildings.map(b => b.location))];

  const getRealtimeData = (buildingId) => {
    return realtimeData.find(d => d.id === buildingId) || {};
  };

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search buildings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-background text-foreground"
            />
          </div>

          <select
            value={filters.buildingType}
            onChange={(e) => setFilters({ ...filters, buildingType: e.target.value })}
            className="px-4 py-2 border border-border rounded-md bg-background text-foreground"
          >
            <option value="all">All Types</option>
            {buildingTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          <select
            value={filters.location}
            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
            className="px-4 py-2 border border-border rounded-md bg-background text-foreground"
          >
            <option value="all">All Locations</option>
            {locations.map(location => (
              <option key={location} value={location}>{location}</option>
            ))}
          </select>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredBuildings.map((building) => {
          const rtData = getRealtimeData(building.id);
          const isSelected = selectedBuilding?.id === building.id;

          return (
            <Card
              key={building.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                isSelected ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedBuilding(building)}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">{building.name}</h3>
                  <p className="text-sm text-muted-foreground">{building.id}</p>
                </div>
                {rtData.alerts > 0 && (
                  <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                    {rtData.alerts}
                  </span>
                )}
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-medium text-foreground">{building.type}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Location:</span>
                  <span className="font-medium text-foreground">{building.location}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Occupancy:</span>
                  <span className="font-medium text-foreground">
                    {rtData.occupancy?.toFixed(1) || building.occupancyRate.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Area:</span>
                  <span className="font-medium text-foreground">
                    {building.totalArea.toLocaleString()} sq ft
                  </span>
                </div>
              </div>

              {rtData.activeIssues > 0 && (
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-xs text-yellow-600 dark:text-yellow-400">
                    {rtData.activeIssues} active issue{rtData.activeIssues > 1 ? 's' : ''}
                  </p>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {filteredBuildings.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium text-foreground">No buildings found</p>
            <p className="text-sm text-muted-foreground mt-2">
              Try adjusting your search or filters
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};
