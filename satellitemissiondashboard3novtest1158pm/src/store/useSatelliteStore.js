import { create } from 'zustand';
import { generateSatelliteBatch, updateSatelliteTelemetry, generateEvents } from '../utils/telemetryGenerator';

const SATELLITE_COUNT = parseInt(import.meta.env.VITE_SATELLITE_COUNT) || 10000;
const BATCH_SIZE = 1000;

const useSatelliteStore = create((set, get) => ({
  // State
  satellites: [],
  selectedSatellite: null,
  events: [],
  filters: {
    search: '',
    status: 'all',
    type: 'all',
  },
  isLoading: true,
  theme: 'dark',
  updateInterval: null,

  // Initialize satellites in batches for performance
  initializeSatellites: () => {
    set({ isLoading: true });

    const allSatellites = [];
    for (let i = 0; i < SATELLITE_COUNT; i += BATCH_SIZE) {
      const batchSize = Math.min(BATCH_SIZE, SATELLITE_COUNT - i);
      const batch = generateSatelliteBatch(i, batchSize);
      allSatellites.push(...batch);
    }

    // Generate events for first 100 satellites
    const allEvents = [];
    for (let i = 0; i < Math.min(100, SATELLITE_COUNT); i++) {
      allEvents.push(...generateEvents(i, 10));
    }

    set({
      satellites: allSatellites,
      events: allEvents.sort((a, b) => b.timestamp - a.timestamp).slice(0, 500),
      isLoading: false,
      selectedSatellite: allSatellites[0]?.id || null,
    });
  },

  // Update telemetry for visible satellites only
  updateTelemetry: (visibleSatelliteIds) => {
    const { satellites } = get();
    const time = Date.now();

    const updatedSatellites = satellites.map(sat => {
      // Only update visible satellites for performance
      if (visibleSatelliteIds && !visibleSatelliteIds.includes(sat.id)) {
        return sat;
      }
      return updateSatelliteTelemetry(sat, time);
    });

    set({ satellites: updatedSatellites });
  },

  // Select a satellite
  selectSatellite: (satelliteId) => {
    set({ selectedSatellite: satelliteId });
  },

  // Filter satellites
  setFilters: (filters) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
    }));
  },

  // Get filtered satellites
  getFilteredSatellites: () => {
    const { satellites, filters } = get();

    return satellites.filter(sat => {
      const matchesSearch = !filters.search ||
        sat.id.toLowerCase().includes(filters.search.toLowerCase()) ||
        sat.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        sat.mission.toLowerCase().includes(filters.search.toLowerCase());

      const matchesStatus = filters.status === 'all' || sat.overallStatus === filters.status;
      const matchesType = filters.type === 'all' || sat.type === filters.type;

      return matchesSearch && matchesStatus && matchesType;
    });
  },

  // Get satellite by ID
  getSatelliteById: (id) => {
    const { satellites } = get();
    return satellites.find(sat => sat.id === id);
  },

  // Get statistics
  getStatistics: () => {
    const { satellites } = get();

    const stats = {
      total: satellites.length,
      nominal: 0,
      warning: 0,
      critical: 0,
      offline: 0,
      byType: {},
      byMission: {},
      totalCost: 0,
      averageFuel: 0,
    };

    satellites.forEach(sat => {
      stats[sat.overallStatus]++;
      stats.byType[sat.type] = (stats.byType[sat.type] || 0) + 1;
      stats.byMission[sat.mission] = (stats.byMission[sat.mission] || 0) + 1;
      stats.totalCost += sat.costs.total;
      stats.averageFuel += sat.telemetry.propulsion.fuel;
    });

    stats.averageFuel = stats.averageFuel / satellites.length;

    return stats;
  },

  // Toggle theme
  toggleTheme: () => {
    set((state) => {
      const newTheme = state.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', newTheme);
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
      return { theme: newTheme };
    });
  },

  // Initialize theme from localStorage
  initializeTheme: () => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    set({ theme: savedTheme });
  },

  // Start real-time updates
  startUpdates: (visibleSatelliteIds) => {
    const interval = setInterval(() => {
      get().updateTelemetry(visibleSatelliteIds);
    }, 2000); // Update every 2 seconds

    set({ updateInterval: interval });
  },

  // Stop real-time updates
  stopUpdates: () => {
    const { updateInterval } = get();
    if (updateInterval) {
      clearInterval(updateInterval);
      set({ updateInterval: null });
    }
  },
}));

export default useSatelliteStore;
