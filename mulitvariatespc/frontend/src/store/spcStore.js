import { create } from 'zustand'

export const useSpcStore = create((set, get) => ({
  // Real-time data
  realtimeData: [],
  processStatus: 'normal', // normal, warning, critical

  // Control limits
  controlLimits: {
    hotellingT2: { ucl: null, cl: null },
    mewma: { ucl: null, cl: null },
    mcusum: { ucl: null, cl: null }
  },

  // Alerts
  alerts: [],
  unreadAlerts: 0,

  // Configuration
  config: {
    variables: [],
    samplingInterval: 5000, // ms
    chartType: 'hotelling', // hotelling, mewma, mcusum
    showContributions: true,
    autoExport: false
  },

  // Connection status
  isConnected: false,

  // Actions
  addDataPoint: (dataPoint) => {
    set((state) => ({
      realtimeData: [...state.realtimeData.slice(-499), dataPoint],
    }))
  },

  clearData: () => {
    set({ realtimeData: [] })
  },

  setControlLimits: (chartType, limits) => {
    set((state) => ({
      controlLimits: {
        ...state.controlLimits,
        [chartType]: limits
      }
    }))
  },

  setProcessStatus: (status) => {
    set({ processStatus: status })
  },

  addAlert: (alert) => {
    set((state) => ({
      alerts: [alert, ...state.alerts].slice(0, 100),
      unreadAlerts: state.unreadAlerts + 1
    }))
  },

  markAlertsAsRead: () => {
    set({ unreadAlerts: 0 })
  },

  clearAlerts: () => {
    set({ alerts: [], unreadAlerts: 0 })
  },

  setConfig: (config) => {
    set((state) => ({
      config: { ...state.config, ...config }
    }))
  },

  setConnectionStatus: (isConnected) => {
    set({ isConnected })
  }
}))
