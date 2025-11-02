import { create } from 'zustand';
import { sensorSimulator } from '../services/sensorSimulator';

/**
 * Global state management for Smart City Control System
 */
export const useCityStore = create((set, get) => ({
  // Theme
  darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
  toggleDarkMode: () => set(state => ({ darkMode: !state.darkMode })),

  // Active system view
  activeSystem: 'overview',
  setActiveSystem: (system) => set({ activeSystem: system }),

  // Real-time data
  systemMetrics: {},
  heatmapData: {},
  alerts: [],
  timeSeriesData: {},

  // Filters
  filters: {
    system: 'all',
    alertLevel: 'all',
    status: 'all',
    timeRange: '1h'
  },
  setFilter: (key, value) => set(state => ({
    filters: { ...state.filters, [key]: value }
  })),

  // Data refresh
  isRefreshing: false,
  lastUpdated: null,

  refreshData: () => {
    set({ isRefreshing: true });

    const metrics = {};
    const heatmaps = {};
    const timeSeries = {};

    ['transportation', 'power', 'waste', 'water'].forEach(system => {
      metrics[system] = sensorSimulator.getSystemMetrics(system);
      heatmaps[system] = sensorSimulator.getHeatmapData(system);
      timeSeries[system] = sensorSimulator.getSystemTimeSeries(system);
    });

    const alerts = sensorSimulator.getAllAlerts();

    set({
      systemMetrics: metrics,
      heatmapData: heatmaps,
      alerts,
      timeSeriesData: timeSeries,
      isRefreshing: false,
      lastUpdated: Date.now()
    });
  },

  // Initialize auto-refresh
  startAutoRefresh: (interval = 2000) => {
    const refreshInterval = setInterval(() => {
      get().refreshData();
    }, interval);

    set({ refreshInterval });
  },

  stopAutoRefresh: () => {
    const { refreshInterval } = get();
    if (refreshInterval) {
      clearInterval(refreshInterval);
      set({ refreshInterval: null });
    }
  },

  // Table state
  selectedRows: [],
  setSelectedRows: (rows) => set({ selectedRows: rows }),

  // Map state
  mapCenter: [40.7128, -74.0060],
  mapZoom: 12,
  setMapCenter: (center) => set({ mapCenter: center }),
  setMapZoom: (zoom) => set({ mapZoom: zoom }),

  // Active layers
  activeLayers: ['transportation'],
  toggleLayer: (layer) => set(state => ({
    activeLayers: state.activeLayers.includes(layer)
      ? state.activeLayers.filter(l => l !== layer)
      : [...state.activeLayers, layer]
  })),

  // Modal state
  selectedSensor: null,
  setSelectedSensor: (sensor) => set({ selectedSensor: sensor }),

  // Search
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),

  // Performance metrics
  performanceMetrics: {
    fps: 60,
    memoryUsage: 0,
    renderTime: 0
  },
  updatePerformanceMetrics: (metrics) => set(state => ({
    performanceMetrics: { ...state.performanceMetrics, ...metrics }
  }))
}));
