import { create } from 'zustand'

export const useHeatStore = create((set, get) => ({
  heats: [],
  currentHeat: null,
  realTimeData: {},
  alerts: [],
  statistics: null,

  setHeats: (heats) => set({ heats }),

  addHeat: (heat) => {
    set((state) => ({
      heats: [heat, ...state.heats],
    }))
  },

  updateHeat: (heatId, updates) => {
    set((state) => ({
      heats: state.heats.map((heat) =>
        heat.id === heatId ? { ...heat, ...updates } : heat
      ),
      currentHeat:
        state.currentHeat?.id === heatId
          ? { ...state.currentHeat, ...updates }
          : state.currentHeat,
    }))
  },

  setCurrentHeat: (heat) => set({ currentHeat: heat }),

  updateRealTimeData: (data) => {
    set((state) => ({
      realTimeData: { ...state.realTimeData, ...data },
    }))
  },

  addAlert: (alert) => {
    set((state) => ({
      alerts: [
        {
          ...alert,
          id: Date.now(),
          timestamp: new Date().toISOString(),
        },
        ...state.alerts,
      ],
    }))
  },

  clearAlert: (alertId) => {
    set((state) => ({
      alerts: state.alerts.filter((alert) => alert.id !== alertId),
    }))
  },

  clearAllAlerts: () => set({ alerts: [] }),

  setStatistics: (statistics) => set({ statistics }),

  getHeatById: (heatId) => {
    const { heats } = get()
    return heats.find((heat) => heat.id === heatId)
  },

  getRecentHeats: (count = 10) => {
    const { heats } = get()
    return heats.slice(0, count)
  },

  getActiveAlerts: () => {
    const { alerts } = get()
    return alerts.filter((alert) => !alert.acknowledged)
  },
}))
