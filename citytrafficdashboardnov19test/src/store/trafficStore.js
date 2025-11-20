import { create } from 'zustand';

const useTrafficStore = create((set, get) => ({
  sensors: [],
  vehicles: [],
  events: [],
  historicalData: {
    speed: [],
    congestion: [],
    emissions: [],
    timestamps: []
  },
  alerts: [],
  darkMode: false,
  selectedSensor: null,
  filters: {
    eventType: 'all',
    severity: 'all',
    searchTerm: ''
  },
  stats: {
    avgSpeed: 0,
    totalVehicles: 0,
    avgCongestion: 0,
    totalEmissions: 0,
    activeAlerts: 0
  },

  // Actions
  setSensors: (sensors) => set({ sensors }),
  setVehicles: (vehicles) => set({ vehicles }),
  addEvent: (event) => set((state) => ({
    events: [event, ...state.events].slice(0, 500) // Keep last 500 events
  })),
  addAlert: (alert) => set((state) => ({
    alerts: [alert, ...state.alerts].slice(0, 50)
  })),
  dismissAlert: (id) => set((state) => ({
    alerts: state.alerts.filter(a => a.id !== id)
  })),
  updateHistoricalData: (data) => set((state) => ({
    historicalData: {
      speed: [...state.historicalData.speed, data.speed].slice(-30),
      congestion: [...state.historicalData.congestion, data.congestion].slice(-30),
      emissions: [...state.historicalData.emissions, data.emissions].slice(-30),
      timestamps: [...state.historicalData.timestamps, data.timestamp].slice(-30)
    }
  })),
  updateStats: (stats) => set({ stats }),
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
  setSelectedSensor: (sensor) => set({ selectedSensor: sensor }),
  setFilters: (filters) => set((state) => ({
    filters: { ...state.filters, ...filters }
  })),
  clearEvents: () => set({ events: [] }),
  updateSensor: (id, updates) => set((state) => ({
    sensors: state.sensors.map(s => s.id === id ? { ...s, ...updates } : s)
  }))
}));

export default useTrafficStore;
