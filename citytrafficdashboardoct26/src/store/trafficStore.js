import { create } from 'zustand'
import {
  generateSensorNetwork,
  updateSensorData,
  generateEvents,
  calculateMetrics,
  createHistoricalDataPoint
} from '../services/trafficSimulator'

const MAX_HISTORY_POINTS = 50

const useTrafficStore = create((set, get) => ({
  // State
  sensors: [],
  events: [],
  metrics: null,
  historicalData: [],
  isSimulationRunning: false,
  selectedSensor: null,
  selectedZone: null,
  timeOfDay: new Date(),
  darkMode: false,

  // Actions
  initializeSimulation: () => {
    const sensors = generateSensorNetwork(300)
    const metrics = calculateMetrics(sensors)
    const historicalDataPoint = createHistoricalDataPoint(metrics, Date.now())

    set({
      sensors,
      metrics,
      historicalData: [historicalDataPoint],
      isSimulationRunning: true
    })
  },

  updateSimulation: () => {
    const { sensors, events, timeOfDay, historicalData } = get()

    // Update sensor data
    const updatedSensors = updateSensorData(sensors, timeOfDay)

    // Generate/update events
    const updatedEvents = generateEvents(updatedSensors, events)

    // Calculate new metrics
    const newMetrics = calculateMetrics(updatedSensors)

    // Update historical data
    const newHistoricalPoint = createHistoricalDataPoint(newMetrics, Date.now())
    const updatedHistory = [...historicalData, newHistoricalPoint].slice(-MAX_HISTORY_POINTS)

    // Update time
    const newTime = new Date(timeOfDay.getTime() + 60000) // Advance 1 minute

    set({
      sensors: updatedSensors,
      events: updatedEvents,
      metrics: newMetrics,
      historicalData: updatedHistory,
      timeOfDay: newTime
    })
  },

  startSimulation: () => {
    set({ isSimulationRunning: true })
  },

  pauseSimulation: () => {
    set({ isSimulationRunning: false })
  },

  resetSimulation: () => {
    const sensors = generateSensorNetwork(300)
    const metrics = calculateMetrics(sensors)
    const historicalDataPoint = createHistoricalDataPoint(metrics, Date.now())

    set({
      sensors,
      events: [],
      metrics,
      historicalData: [historicalDataPoint],
      timeOfDay: new Date(),
      selectedSensor: null,
      selectedZone: null
    })
  },

  selectSensor: (sensorId) => {
    const { sensors } = get()
    const sensor = sensors.find(s => s.id === sensorId)
    set({ selectedSensor: sensor })
  },

  deselectSensor: () => {
    set({ selectedSensor: null })
  },

  selectZone: (zone) => {
    set({ selectedZone: zone })
  },

  deselectZone: () => {
    set({ selectedZone: null })
  },

  toggleDarkMode: () => {
    const { darkMode } = get()
    set({ darkMode: !darkMode })

    // Update document class for Tailwind
    if (!darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  },

  setDarkMode: (enabled) => {
    set({ darkMode: enabled })
    if (enabled) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  },

  // Computed getters
  getFilteredSensors: (zone = null) => {
    const { sensors } = get()
    if (!zone) return sensors
    return sensors.filter(s => s.zone === zone)
  },

  getFilteredEvents: (type = null, severity = null) => {
    const { events } = get()
    let filtered = events

    if (type) {
      filtered = filtered.filter(e => e.type === type)
    }

    if (severity) {
      filtered = filtered.filter(e => e.severity === severity)
    }

    return filtered
  },

  getCongestionLevel: () => {
    const { metrics } = get()
    if (!metrics) return 'low'

    const congestion = parseFloat(metrics.avgCongestion)
    if (congestion < 30) return 'low'
    if (congestion < 60) return 'medium'
    return 'high'
  },

  getZoneStats: (zone) => {
    const { metrics } = get()
    if (!metrics || !metrics.zoneMetrics || !metrics.zoneMetrics[zone]) {
      return null
    }
    return metrics.zoneMetrics[zone]
  }
}))

export default useTrafficStore
