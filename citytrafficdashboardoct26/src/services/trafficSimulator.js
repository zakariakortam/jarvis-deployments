/**
 * Traffic Data Simulator
 * Generates realistic traffic sensor data for city traffic management
 */

// City grid configuration (New York City as default)
const CITY_BOUNDS = {
  lat: { min: 40.6, max: 40.85 },
  lng: { min: -74.1, max: -73.85 }
}

// Sensor types and configurations
const SENSOR_TYPES = ['speed', 'congestion', 'emissions', 'flow']
const EVENT_TYPES = ['accident', 'congestion', 'construction', 'incident']
const ROAD_TYPES = ['highway', 'arterial', 'collector', 'local']

// Generate initial sensor network
export const generateSensorNetwork = (count = 300) => {
  const sensors = []

  for (let i = 0; i < count; i++) {
    const lat = CITY_BOUNDS.lat.min + Math.random() * (CITY_BOUNDS.lat.max - CITY_BOUNDS.lat.min)
    const lng = CITY_BOUNDS.lng.min + Math.random() * (CITY_BOUNDS.lng.max - CITY_BOUNDS.lng.min)
    const roadType = ROAD_TYPES[Math.floor(Math.random() * ROAD_TYPES.length)]

    sensors.push({
      id: `sensor-${i + 1}`,
      position: [lat, lng],
      type: SENSOR_TYPES[Math.floor(Math.random() * SENSOR_TYPES.length)],
      roadType,
      zone: getZone(lat, lng),
      active: true,
      speed: getInitialSpeed(roadType),
      congestion: Math.random() * 30,
      emissions: Math.random() * 100,
      flow: Math.floor(Math.random() * 2000)
    })
  }

  return sensors
}

// Determine city zone based on coordinates
const getZone = (lat, lng) => {
  const latMid = (CITY_BOUNDS.lat.min + CITY_BOUNDS.lat.max) / 2
  const lngMid = (CITY_BOUNDS.lng.min + CITY_BOUNDS.lng.max) / 2

  if (lat > latMid && lng < lngMid) return 'Northwest'
  if (lat > latMid && lng >= lngMid) return 'Northeast'
  if (lat <= latMid && lng < lngMid) return 'Southwest'
  return 'Southeast'
}

// Get initial speed based on road type
const getInitialSpeed = (roadType) => {
  const speedRanges = {
    highway: { min: 55, max: 70 },
    arterial: { min: 35, max: 50 },
    collector: { min: 25, max: 40 },
    local: { min: 15, max: 30 }
  }

  const range = speedRanges[roadType]
  return range.min + Math.random() * (range.max - range.min)
}

// Update sensor data with realistic variations
export const updateSensorData = (sensors, timeOfDay) => {
  const rushHour = isRushHour(timeOfDay)

  return sensors.map(sensor => {
    const baseSpeed = getInitialSpeed(sensor.roadType)
    const congestionMultiplier = rushHour ? 1.8 : 1.0

    // Speed varies inversely with congestion
    const targetCongestion = sensor.congestion + (Math.random() - 0.5) * 10 * congestionMultiplier
    const normalizedCongestion = Math.max(0, Math.min(100, targetCongestion))

    const speedReduction = (normalizedCongestion / 100) * 0.6
    const targetSpeed = baseSpeed * (1 - speedReduction) + (Math.random() - 0.5) * 5
    const normalizedSpeed = Math.max(0, Math.min(baseSpeed * 1.2, targetSpeed))

    // Emissions increase with congestion
    const targetEmissions = 50 + (normalizedCongestion * 0.5) + (Math.random() - 0.5) * 20
    const normalizedEmissions = Math.max(0, Math.min(200, targetEmissions))

    // Flow varies with time and congestion
    const flowMultiplier = rushHour ? 1.5 : 0.8
    const targetFlow = sensor.flow + (Math.random() - 0.5) * 200 * flowMultiplier
    const normalizedFlow = Math.max(0, Math.min(3000, targetFlow))

    return {
      ...sensor,
      speed: normalizedSpeed,
      congestion: normalizedCongestion,
      emissions: normalizedEmissions,
      flow: Math.floor(normalizedFlow),
      lastUpdate: Date.now()
    }
  })
}

// Check if current time is rush hour
const isRushHour = (timeOfDay) => {
  const hour = timeOfDay.getHours()
  return (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)
}

// Generate traffic events (accidents, construction, etc.)
export const generateEvents = (sensors, existingEvents = []) => {
  const events = [...existingEvents]

  // Random chance of new event
  if (Math.random() < 0.05) {
    const sensor = sensors[Math.floor(Math.random() * sensors.length)]
    const eventType = EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)]

    const event = {
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: eventType,
      position: sensor.position,
      zone: sensor.zone,
      roadType: sensor.roadType,
      severity: getSeverity(eventType),
      description: getEventDescription(eventType, sensor),
      timestamp: Date.now(),
      duration: getEventDuration(eventType),
      affected: Math.floor(Math.random() * 500) + 50
    }

    events.push(event)
  }

  // Remove expired events
  const currentTime = Date.now()
  return events.filter(event =>
    currentTime - event.timestamp < event.duration
  )
}

// Get event severity level
const getSeverity = (eventType) => {
  const severityMap = {
    accident: ['high', 'critical'][Math.floor(Math.random() * 2)],
    congestion: ['medium', 'high'][Math.floor(Math.random() * 2)],
    construction: 'medium',
    incident: ['low', 'medium'][Math.floor(Math.random() * 2)]
  }
  return severityMap[eventType]
}

// Generate event description
const getEventDescription = (eventType, sensor) => {
  const descriptions = {
    accident: [
      'Multi-vehicle collision reported',
      'Vehicle accident blocking lanes',
      'Traffic accident with injuries',
      'Fender bender causing delays'
    ],
    congestion: [
      'Heavy traffic congestion',
      'Severe congestion building',
      'Traffic jam reported',
      'Slow-moving traffic'
    ],
    construction: [
      'Road construction in progress',
      'Lane closure for maintenance',
      'Utility work affecting traffic',
      'Roadwork reducing capacity'
    ],
    incident: [
      'Disabled vehicle on roadway',
      'Police activity affecting traffic',
      'Emergency vehicle response',
      'Traffic signal malfunction'
    ]
  }

  const typeDescriptions = descriptions[eventType]
  const description = typeDescriptions[Math.floor(Math.random() * typeDescriptions.length)]
  return `${description} on ${sensor.roadType} in ${sensor.zone} zone`
}

// Get event duration in milliseconds
const getEventDuration = (eventType) => {
  const durations = {
    accident: 20 * 60 * 1000, // 20 minutes
    congestion: 15 * 60 * 1000, // 15 minutes
    construction: 60 * 60 * 1000, // 60 minutes
    incident: 10 * 60 * 1000 // 10 minutes
  }
  return durations[eventType] + Math.random() * durations[eventType]
}

// Calculate aggregate metrics
export const calculateMetrics = (sensors) => {
  if (sensors.length === 0) return null

  const avgSpeed = sensors.reduce((sum, s) => sum + s.speed, 0) / sensors.length
  const avgCongestion = sensors.reduce((sum, s) => sum + s.congestion, 0) / sensors.length
  const avgEmissions = sensors.reduce((sum, s) => sum + s.emissions, 0) / sensors.length
  const totalFlow = sensors.reduce((sum, s) => sum + s.flow, 0)

  // Calculate congestion by zone
  const zoneMetrics = {}
  sensors.forEach(sensor => {
    if (!zoneMetrics[sensor.zone]) {
      zoneMetrics[sensor.zone] = {
        count: 0,
        speed: 0,
        congestion: 0,
        emissions: 0,
        flow: 0
      }
    }
    zoneMetrics[sensor.zone].count++
    zoneMetrics[sensor.zone].speed += sensor.speed
    zoneMetrics[sensor.zone].congestion += sensor.congestion
    zoneMetrics[sensor.zone].emissions += sensor.emissions
    zoneMetrics[sensor.zone].flow += sensor.flow
  })

  Object.keys(zoneMetrics).forEach(zone => {
    const count = zoneMetrics[zone].count
    zoneMetrics[zone].speed /= count
    zoneMetrics[zone].congestion /= count
    zoneMetrics[zone].emissions /= count
  })

  return {
    avgSpeed: avgSpeed.toFixed(1),
    avgCongestion: avgCongestion.toFixed(1),
    avgEmissions: avgEmissions.toFixed(1),
    totalFlow,
    activeSensors: sensors.filter(s => s.active).length,
    zoneMetrics,
    timestamp: Date.now()
  }
}

// Export historical data point
export const createHistoricalDataPoint = (metrics, timestamp) => {
  return {
    timestamp,
    speed: parseFloat(metrics.avgSpeed),
    congestion: parseFloat(metrics.avgCongestion),
    emissions: parseFloat(metrics.avgEmissions),
    flow: metrics.totalFlow
  }
}
