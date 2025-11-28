import { create } from 'zustand'
import { generateFleet, generateFleetStats } from '../utils/mockDataGenerator'

const useTelemetryStore = create((set, get) => ({
  // Satellite data
  satellites: [],
  selectedSatellite: null,
  fleetStats: null,

  // UI state
  darkMode: false,
  sidebarOpen: true,
  activeView: 'overview', // overview, satellite-detail, analytics

  // Filters
  filters: {
    search: '',
    status: 'all',
    orbitType: 'all',
  },

  // Events log
  events: [],
  maxEvents: 1000,

  // Alerts
  alerts: [],

  // Worker state
  worker: null,
  isStreaming: false,

  // Initialize fleet
  initializeFleet: (count = 100) => {
    const fleet = generateFleet(count)
    const stats = generateFleetStats(fleet)
    set({ satellites: fleet, fleetStats: stats })
  },

  // Initialize web worker
  initializeWorker: () => {
    const worker = new Worker(new URL('../workers/telemetryWorker.js', import.meta.url), {
      type: 'module',
    })

    worker.onmessage = (e) => {
      const { type, data, updates, event, satellite } = e.data

      switch (type) {
        case 'worker_ready':
          break

        case 'init_complete':
          break

        case 'telemetry_update':
          set((state) => {
            const newSatellites = [...state.satellites]
            updates.forEach(({ index, satellite }) => {
              newSatellites[index] = satellite
            })

            // Update selected satellite if it was updated
            const selectedSatellite = state.selectedSatellite
              ? newSatellites.find((s) => s.id === state.selectedSatellite.id)
              : null

            return {
              satellites: newSatellites,
              selectedSatellite,
              fleetStats: generateFleetStats(newSatellites),
            }
          })
          break

        case 'new_event':
          set((state) => {
            const newEvents = [event, ...state.events].slice(0, state.maxEvents)

            // Check if event should generate an alert
            const newAlerts = [...state.alerts]
            if (event.severity === 'critical' || event.severity === 'warning') {
              newAlerts.unshift({
                id: `ALERT-${Date.now()}`,
                ...event,
                acknowledged: false,
              })
            }

            return { events: newEvents, alerts: newAlerts.slice(0, 50) }
          })
          break

        case 'satellite_data':
          break

        default:
          break
      }
    }

    set({ worker })
    return worker
  },

  // Start streaming telemetry
  startStreaming: () => {
    const { worker, satellites } = get()
    if (worker && !get().isStreaming) {
      worker.postMessage({ type: 'init', data: { satellites } })
      worker.postMessage({ type: 'start' })
      set({ isStreaming: true })
    }
  },

  // Stop streaming telemetry
  stopStreaming: () => {
    const { worker } = get()
    if (worker) {
      worker.postMessage({ type: 'stop' })
      set({ isStreaming: false })
    }
  },

  // Select a satellite
  selectSatellite: (satelliteId) => {
    const satellite = get().satellites.find((s) => s.id === satelliteId)
    set({ selectedSatellite: satellite, activeView: 'satellite-detail' })
  },

  // Clear selection
  clearSelection: () => {
    set({ selectedSatellite: null, activeView: 'overview' })
  },

  // Update filters
  setFilter: (filterType, value) => {
    set((state) => ({
      filters: {
        ...state.filters,
        [filterType]: value,
      },
    }))
  },

  // Get filtered satellites
  getFilteredSatellites: () => {
    const { satellites, filters } = get()

    return satellites.filter((satellite) => {
      // Search filter
      if (
        filters.search &&
        !satellite.id.toLowerCase().includes(filters.search.toLowerCase()) &&
        !satellite.name.toLowerCase().includes(filters.search.toLowerCase())
      ) {
        return false
      }

      // Status filter
      if (filters.status !== 'all' && satellite.status !== filters.status) {
        return false
      }

      // Orbit type filter
      if (filters.orbitType !== 'all' && satellite.orbitType !== filters.orbitType) {
        return false
      }

      return true
    })
  },

  // Toggle dark mode
  toggleDarkMode: () => {
    set((state) => {
      const newDarkMode = !state.darkMode
      if (newDarkMode) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
      return { darkMode: newDarkMode }
    })
  },

  // Toggle sidebar
  toggleSidebar: () => {
    set((state) => ({ sidebarOpen: !state.sidebarOpen }))
  },

  // Set active view
  setActiveView: (view) => {
    set({ activeView: view })
  },

  // Acknowledge alert
  acknowledgeAlert: (alertId) => {
    set((state) => ({
      alerts: state.alerts.map((alert) =>
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      ),
    }))
  },

  // Clear all alerts
  clearAlerts: () => {
    set({ alerts: [] })
  },

  // Add manual event
  addEvent: (event) => {
    set((state) => ({
      events: [
        {
          id: `EVT-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
          timestamp: new Date().toISOString(),
          ...event,
        },
        ...state.events,
      ].slice(0, state.maxEvents),
    }))
  },

  // Export data
  exportData: (format = 'json') => {
    const { satellites, events, fleetStats } = get()
    const data = {
      satellites,
      events,
      fleetStats,
      exportDate: new Date().toISOString(),
    }

    if (format === 'json') {
      const json = JSON.stringify(data, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `telemetry-export-${Date.now()}.json`
      a.click()
      URL.revokeObjectURL(url)
    } else if (format === 'csv') {
      // CSV export for satellites
      const headers = [
        'ID',
        'Name',
        'Status',
        'Orbit Type',
        'Altitude (km)',
        'Fuel (%)',
        'Battery (%)',
        'Signal Strength (dBm)',
        'Daily Cost ($)',
      ]
      const rows = satellites.map((s) => [
        s.id,
        s.name,
        s.status,
        s.orbitType,
        s.orbit.altitude.toFixed(2),
        s.fuel.level.toFixed(2),
        s.power.battery.toFixed(2),
        s.comms.signalStrength.toFixed(2),
        s.costs.dailyOperational.toFixed(2),
      ])
      const csv = [headers, ...rows].map((row) => row.join(',')).join('\n')
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `telemetry-export-${Date.now()}.csv`
      a.click()
      URL.revokeObjectURL(url)
    }
  },
}))

export default useTelemetryStore
