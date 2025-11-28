import { create } from 'zustand';
import dataSimulator from '../services/dataSimulator';

export const useDashboardStore = create((set, get) => ({
  buildings: dataSimulator.getBuildings(),
  selectedBuilding: null,
  realtimeData: [],
  darkMode: false,
  viewMode: 'grid',
  filters: {
    buildingType: 'all',
    location: 'all',
    occupancyMin: 0
  },
  searchQuery: '',

  setSelectedBuilding: (building) => set({ selectedBuilding: building }),

  setDarkMode: (enabled) => {
    set({ darkMode: enabled });
    if (enabled) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },

  toggleDarkMode: () => {
    const { darkMode } = get();
    get().setDarkMode(!darkMode);
  },

  setViewMode: (mode) => set({ viewMode: mode }),

  setFilters: (filters) => set({ filters }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  updateRealtimeData: (data) => set({ realtimeData: data }),

  getFilteredBuildings: () => {
    const { buildings, filters, searchQuery } = get();

    return buildings.filter(building => {
      const matchesType = filters.buildingType === 'all' || building.type === filters.buildingType;
      const matchesLocation = filters.location === 'all' || building.location === filters.location;
      const matchesOccupancy = building.occupancyRate >= filters.occupancyMin;
      const matchesSearch = searchQuery === '' ||
        building.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        building.id.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesType && matchesLocation && matchesOccupancy && matchesSearch;
    });
  },

  exportData: (type, data) => {
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `${type}-${timestamp}.json`;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}));
