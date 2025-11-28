// Mock telemetry data generator for up to 10,000 satellites

export const SATELLITE_STATUS = {
  NOMINAL: 'nominal',
  WARNING: 'warning',
  CRITICAL: 'critical',
  OFFLINE: 'offline',
}

export const ORBIT_TYPES = {
  LEO: 'LEO', // Low Earth Orbit
  MEO: 'MEO', // Medium Earth Orbit
  GEO: 'GEO', // Geostationary Orbit
  HEO: 'HEO', // Highly Elliptical Orbit
}

export const SUBSYSTEMS = [
  'power',
  'thermal',
  'communications',
  'attitude',
  'propulsion',
  'payload',
]

// Generate orbital parameters based on orbit type
function generateOrbitParams(orbitType) {
  const params = {
    LEO: {
      altitude: 400 + Math.random() * 800, // 400-1200 km
      inclination: Math.random() * 180,
      period: 90 + Math.random() * 20, // minutes
    },
    MEO: {
      altitude: 2000 + Math.random() * 18000, // 2000-20000 km
      inclination: Math.random() * 180,
      period: 120 + Math.random() * 600, // minutes
    },
    GEO: {
      altitude: 35786, // Fixed GEO altitude
      inclination: Math.random() * 10, // Near-equatorial
      period: 1436, // 24 hours
    },
    HEO: {
      altitude: 10000 + Math.random() * 30000,
      inclination: 60 + Math.random() * 30,
      period: 600 + Math.random() * 300,
    },
  }

  return params[orbitType]
}

// Generate a single satellite with full telemetry
export function generateSatellite(id) {
  const orbitTypes = Object.values(ORBIT_TYPES)
  const orbitType = orbitTypes[Math.floor(Math.random() * orbitTypes.length)]
  const orbitParams = generateOrbitParams(orbitType)

  // Random position in 3D space (spherical coordinates)
  const theta = Math.random() * Math.PI * 2 // 0 to 2π
  const phi = Math.random() * Math.PI // 0 to π
  const radius = 6371 + orbitParams.altitude // Earth radius + altitude

  const satellite = {
    id: `SAT-${String(id).padStart(5, '0')}`,
    name: `Satellite ${id}`,
    orbitType,
    status: generateStatus(),
    lastUpdate: new Date().toISOString(),

    // Orbit data
    orbit: {
      ...orbitParams,
      eccentricity: Math.random() * 0.1,
      argumentOfPeriapsis: Math.random() * 360,
      raan: Math.random() * 360, // Right Ascension of Ascending Node
      trueAnomaly: Math.random() * 360,
      position: {
        x: radius * Math.sin(phi) * Math.cos(theta),
        y: radius * Math.sin(phi) * Math.sin(theta),
        z: radius * Math.cos(phi),
      },
      velocity: 7.8 - (orbitParams.altitude / 10000) * 2, // km/s, decreases with altitude
    },

    // Fuel/Propulsion
    fuel: {
      level: 50 + Math.random() * 50, // 50-100%
      consumption: Math.random() * 0.1, // kg/day
      remaining: Math.floor(Math.random() * 1000), // days
    },

    // Communications
    comms: {
      uplink: Math.random() * 100, // Mbps
      downlink: Math.random() * 500, // Mbps
      signalStrength: -80 + Math.random() * 60, // dBm
      latency: 100 + Math.random() * 500, // ms
      packetsLost: Math.floor(Math.random() * 100),
      packetsReceived: Math.floor(Math.random() * 1000000),
    },

    // Thermal data
    thermal: {
      batteryTemp: 15 + Math.random() * 20, // 15-35°C
      cpuTemp: 40 + Math.random() * 40, // 40-80°C
      solarPanelTemp: -20 + Math.random() * 80, // -20 to 60°C
      radiatorTemp: -50 + Math.random() * 50, // -50 to 0°C
    },

    // Power systems
    power: {
      battery: 60 + Math.random() * 40, // 60-100%
      solar: Math.random() * 100, // 0-100% (depends on sun exposure)
      generation: Math.random() * 1000, // Watts
      consumption: 300 + Math.random() * 400, // Watts
      voltage: 28 + Math.random() * 4, // 28-32V
    },

    // Subsystem health
    subsystems: SUBSYSTEMS.reduce((acc, subsystem) => {
      acc[subsystem] = {
        health: 70 + Math.random() * 30, // 70-100%
        status: generateSubsystemStatus(),
        lastMaintenance: new Date(
          Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000
        ).toISOString(),
      }
      return acc
    }, {}),

    // Cost tracking
    costs: {
      dailyOperational: 1000 + Math.random() * 4000, // $1000-5000/day
      totalLifetime: Math.floor(10000000 + Math.random() * 90000000), // $10M-100M
      fuelCost: Math.random() * 1000, // $/day
      dataCost: Math.random() * 500, // $/day
    },

    // Mission data
    mission: {
      launchDate: new Date(
        Date.now() - Math.random() * 5 * 365 * 24 * 60 * 60 * 1000
      ).toISOString(),
      expectedLifetime: 5 + Math.floor(Math.random() * 10), // years
      missionType: ['Earth Observation', 'Communications', 'Scientific', 'Navigation'][
        Math.floor(Math.random() * 4)
      ],
      coverage: Math.floor(Math.random() * 100), // % of mission objectives completed
    },
  }

  return satellite
}

function generateStatus() {
  const rand = Math.random()
  if (rand < 0.7) return SATELLITE_STATUS.NOMINAL
  if (rand < 0.9) return SATELLITE_STATUS.WARNING
  if (rand < 0.98) return SATELLITE_STATUS.CRITICAL
  return SATELLITE_STATUS.OFFLINE
}

function generateSubsystemStatus() {
  const rand = Math.random()
  if (rand < 0.8) return SATELLITE_STATUS.NOMINAL
  if (rand < 0.95) return SATELLITE_STATUS.WARNING
  return SATELLITE_STATUS.CRITICAL
}

// Generate a fleet of satellites
export function generateFleet(count = 10000) {
  const fleet = []
  for (let i = 1; i <= count; i++) {
    fleet.push(generateSatellite(i))
  }
  return fleet
}

// Update satellite telemetry with realistic changes
export function updateSatelliteTelemetry(satellite) {
  const updated = { ...satellite }
  updated.lastUpdate = new Date().toISOString()

  // Update orbit position (simplified orbital mechanics)
  const period = satellite.orbit.period * 60 // Convert to seconds
  const angularVelocity = (2 * Math.PI) / period
  const deltaTime = 1 // 1 second update
  updated.orbit.trueAnomaly = (satellite.orbit.trueAnomaly + angularVelocity * deltaTime * 180 / Math.PI) % 360

  // Recalculate position
  const theta = (updated.orbit.trueAnomaly * Math.PI) / 180
  const phi = (updated.orbit.inclination * Math.PI) / 180
  const radius = 6371 + updated.orbit.altitude

  updated.orbit.position = {
    x: radius * Math.sin(phi) * Math.cos(theta),
    y: radius * Math.sin(phi) * Math.sin(theta),
    z: radius * Math.cos(phi),
  }

  // Update fuel (slow depletion)
  updated.fuel.level = Math.max(0, satellite.fuel.level - 0.0001)

  // Update communications (add noise)
  updated.comms.signalStrength = Math.max(-100, Math.min(-20,
    satellite.comms.signalStrength + (Math.random() - 0.5) * 2))
  updated.comms.latency = Math.max(50, satellite.comms.latency + (Math.random() - 0.5) * 10)
  updated.comms.packetsReceived += Math.floor(Math.random() * 100)
  if (Math.random() < 0.01) updated.comms.packetsLost += 1

  // Update thermal (gradual changes based on sun exposure)
  const sunExposure = Math.sin((updated.orbit.trueAnomaly * Math.PI) / 180) > 0
  updated.thermal.solarPanelTemp += sunExposure ? 0.1 : -0.1
  updated.thermal.batteryTemp += (Math.random() - 0.5) * 0.2
  updated.thermal.cpuTemp += (Math.random() - 0.5) * 0.5

  // Update power (correlates with sun exposure)
  updated.power.solar = sunExposure ? 80 + Math.random() * 20 : Math.random() * 20
  updated.power.battery += (updated.power.generation - updated.power.consumption) * 0.0001
  updated.power.battery = Math.max(0, Math.min(100, updated.power.battery))

  // Randomly update status based on battery and fuel levels
  if (updated.power.battery < 20 || updated.fuel.level < 10) {
    updated.status = SATELLITE_STATUS.CRITICAL
  } else if (updated.power.battery < 40 || updated.fuel.level < 30) {
    updated.status = SATELLITE_STATUS.WARNING
  } else if (Math.random() < 0.95) {
    updated.status = SATELLITE_STATUS.NOMINAL
  }

  return updated
}

// Generate random events for event log
export function generateEvent(satelliteId) {
  const eventTypes = [
    { type: 'telemetry', severity: 'info', message: 'Telemetry update received' },
    { type: 'command', severity: 'info', message: 'Command executed successfully' },
    { type: 'warning', severity: 'warning', message: 'Battery level below 40%' },
    { type: 'warning', severity: 'warning', message: 'Signal strength degraded' },
    { type: 'critical', severity: 'critical', message: 'Fuel reserves critically low' },
    { type: 'critical', severity: 'critical', message: 'Thermal limits exceeded' },
    { type: 'maneuver', severity: 'info', message: 'Orbit adjustment maneuver initiated' },
    { type: 'maintenance', severity: 'info', message: 'System diagnostics completed' },
    { type: 'anomaly', severity: 'warning', message: 'Unexpected sensor reading detected' },
  ]

  const event = eventTypes[Math.floor(Math.random() * eventTypes.length)]

  return {
    id: `EVT-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    satelliteId,
    timestamp: new Date().toISOString(),
    ...event,
  }
}

// Generate aggregated statistics for fleet
export function generateFleetStats(fleet) {
  const stats = {
    total: fleet.length,
    operational: fleet.filter((s) => s.status === SATELLITE_STATUS.NOMINAL).length,
    warning: fleet.filter((s) => s.status === SATELLITE_STATUS.WARNING).length,
    critical: fleet.filter((s) => s.status === SATELLITE_STATUS.CRITICAL).length,
    offline: fleet.filter((s) => s.status === SATELLITE_STATUS.OFFLINE).length,
    averageFuel: fleet.reduce((sum, s) => sum + s.fuel.level, 0) / fleet.length,
    averageBattery: fleet.reduce((sum, s) => sum + s.power.battery, 0) / fleet.length,
    totalDailyCost: fleet.reduce((sum, s) => sum + s.costs.dailyOperational, 0),
    totalLifetimeCost: fleet.reduce((sum, s) => sum + s.costs.totalLifetime, 0),
    orbitDistribution: fleet.reduce((acc, s) => {
      acc[s.orbitType] = (acc[s.orbitType] || 0) + 1
      return acc
    }, {}),
  }

  return stats
}
