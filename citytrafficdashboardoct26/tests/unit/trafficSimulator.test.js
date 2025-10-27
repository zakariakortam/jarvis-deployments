import { describe, it, expect } from 'vitest'
import {
  generateSensorNetwork,
  updateSensorData,
  generateEvents,
  calculateMetrics
} from '../../src/services/trafficSimulator'

describe('Traffic Simulator', () => {
  describe('generateSensorNetwork', () => {
    it('should generate correct number of sensors', () => {
      const sensors = generateSensorNetwork(100)
      expect(sensors).toHaveLength(100)
    })

    it('should generate sensors with required properties', () => {
      const sensors = generateSensorNetwork(10)
      const sensor = sensors[0]

      expect(sensor).toHaveProperty('id')
      expect(sensor).toHaveProperty('position')
      expect(sensor).toHaveProperty('type')
      expect(sensor).toHaveProperty('roadType')
      expect(sensor).toHaveProperty('zone')
      expect(sensor).toHaveProperty('speed')
      expect(sensor).toHaveProperty('congestion')
      expect(sensor).toHaveProperty('emissions')
      expect(sensor).toHaveProperty('flow')
    })

    it('should generate sensors with valid positions', () => {
      const sensors = generateSensorNetwork(50)

      sensors.forEach(sensor => {
        expect(sensor.position).toBeInstanceOf(Array)
        expect(sensor.position).toHaveLength(2)
        expect(sensor.position[0]).toBeGreaterThanOrEqual(40.6)
        expect(sensor.position[0]).toBeLessThanOrEqual(40.85)
        expect(sensor.position[1]).toBeGreaterThanOrEqual(-74.1)
        expect(sensor.position[1]).toBeLessThanOrEqual(-73.85)
      })
    })
  })

  describe('updateSensorData', () => {
    it('should update sensor data', () => {
      const sensors = generateSensorNetwork(10)
      const timeOfDay = new Date()
      const updated = updateSensorData(sensors, timeOfDay)

      expect(updated).toHaveLength(sensors.length)
      expect(updated[0].speed).not.toBe(sensors[0].speed)
    })

    it('should maintain valid data ranges', () => {
      const sensors = generateSensorNetwork(20)
      const timeOfDay = new Date()
      const updated = updateSensorData(sensors, timeOfDay)

      updated.forEach(sensor => {
        expect(sensor.speed).toBeGreaterThanOrEqual(0)
        expect(sensor.congestion).toBeGreaterThanOrEqual(0)
        expect(sensor.congestion).toBeLessThanOrEqual(100)
        expect(sensor.emissions).toBeGreaterThanOrEqual(0)
        expect(sensor.emissions).toBeLessThanOrEqual(200)
        expect(sensor.flow).toBeGreaterThanOrEqual(0)
      })
    })
  })

  describe('calculateMetrics', () => {
    it('should calculate aggregate metrics', () => {
      const sensors = generateSensorNetwork(50)
      const metrics = calculateMetrics(sensors)

      expect(metrics).toHaveProperty('avgSpeed')
      expect(metrics).toHaveProperty('avgCongestion')
      expect(metrics).toHaveProperty('avgEmissions')
      expect(metrics).toHaveProperty('totalFlow')
      expect(metrics).toHaveProperty('activeSensors')
      expect(metrics).toHaveProperty('zoneMetrics')
      expect(metrics).toHaveProperty('timestamp')
    })

    it('should return null for empty sensor array', () => {
      const metrics = calculateMetrics([])
      expect(metrics).toBeNull()
    })

    it('should calculate zone metrics correctly', () => {
      const sensors = generateSensorNetwork(100)
      const metrics = calculateMetrics(sensors)

      expect(metrics.zoneMetrics).toBeDefined()
      expect(Object.keys(metrics.zoneMetrics).length).toBeGreaterThan(0)

      Object.values(metrics.zoneMetrics).forEach(zoneData => {
        expect(zoneData).toHaveProperty('count')
        expect(zoneData).toHaveProperty('speed')
        expect(zoneData).toHaveProperty('congestion')
        expect(zoneData).toHaveProperty('emissions')
        expect(zoneData).toHaveProperty('flow')
      })
    })
  })

  describe('generateEvents', () => {
    it('should generate events array', () => {
      const sensors = generateSensorNetwork(50)
      const events = generateEvents(sensors, [])

      expect(Array.isArray(events)).toBe(true)
    })

    it('should remove expired events', () => {
      const sensors = generateSensorNetwork(50)
      const oldEvent = {
        id: 'old-event',
        timestamp: Date.now() - 1000000,
        duration: 60000
      }

      const events = generateEvents(sensors, [oldEvent])
      expect(events.find(e => e.id === 'old-event')).toBeUndefined()
    })

    it('should generate events with required properties', () => {
      const sensors = generateSensorNetwork(100)
      let events = []

      // Try multiple times to generate at least one event
      for (let i = 0; i < 50; i++) {
        events = generateEvents(sensors, events)
        if (events.length > 0) break
      }

      if (events.length > 0) {
        const event = events[0]
        expect(event).toHaveProperty('id')
        expect(event).toHaveProperty('type')
        expect(event).toHaveProperty('position')
        expect(event).toHaveProperty('severity')
        expect(event).toHaveProperty('description')
        expect(event).toHaveProperty('timestamp')
        expect(event).toHaveProperty('duration')
      }
    })
  })
})
