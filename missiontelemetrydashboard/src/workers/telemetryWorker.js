// Web Worker for handling telemetry updates in background thread
// This prevents UI blocking when updating 10,000 satellites

let satellites = []
let isRunning = false
let updateInterval = null

// Simple telemetry update logic (worker version)
function updateSatellite(satellite) {
  const updated = { ...satellite }
  updated.lastUpdate = new Date().toISOString()

  // Update orbit position
  const period = satellite.orbit.period * 60
  const angularVelocity = (2 * Math.PI) / period
  const deltaTime = 1
  updated.orbit.trueAnomaly =
    (satellite.orbit.trueAnomaly + (angularVelocity * deltaTime * 180) / Math.PI) % 360

  const theta = (updated.orbit.trueAnomaly * Math.PI) / 180
  const phi = (updated.orbit.inclination * Math.PI) / 180
  const radius = 6371 + updated.orbit.altitude

  updated.orbit.position = {
    x: radius * Math.sin(phi) * Math.cos(theta),
    y: radius * Math.sin(phi) * Math.sin(theta),
    z: radius * Math.cos(phi),
  }

  // Update fuel
  updated.fuel.level = Math.max(0, satellite.fuel.level - 0.0001)

  // Update communications
  updated.comms.signalStrength = Math.max(
    -100,
    Math.min(-20, satellite.comms.signalStrength + (Math.random() - 0.5) * 2)
  )
  updated.comms.latency = Math.max(50, satellite.comms.latency + (Math.random() - 0.5) * 10)
  updated.comms.packetsReceived += Math.floor(Math.random() * 100)
  if (Math.random() < 0.01) updated.comms.packetsLost += 1

  // Update thermal
  const sunExposure = Math.sin((updated.orbit.trueAnomaly * Math.PI) / 180) > 0
  updated.thermal.solarPanelTemp += sunExposure ? 0.1 : -0.1
  updated.thermal.batteryTemp += (Math.random() - 0.5) * 0.2
  updated.thermal.cpuTemp += (Math.random() - 0.5) * 0.5

  // Update power
  updated.power.solar = sunExposure ? 80 + Math.random() * 20 : Math.random() * 20
  updated.power.battery += (updated.power.generation - updated.power.consumption) * 0.0001
  updated.power.battery = Math.max(0, Math.min(100, updated.power.battery))

  // Update status
  if (updated.power.battery < 20 || updated.fuel.level < 10) {
    updated.status = 'critical'
  } else if (updated.power.battery < 40 || updated.fuel.level < 30) {
    updated.status = 'warning'
  } else if (Math.random() < 0.95) {
    updated.status = 'nominal'
  }

  return updated
}

function updateAllSatellites() {
  if (!isRunning) return

  // Update only a subset each cycle for performance (100 at a time)
  const batchSize = 100
  const startIdx = Math.floor(Math.random() * Math.max(1, satellites.length - batchSize))
  const endIdx = Math.min(startIdx + batchSize, satellites.length)

  const updates = []
  for (let i = startIdx; i < endIdx; i++) {
    satellites[i] = updateSatellite(satellites[i])
    updates.push({ index: i, satellite: satellites[i] })
  }

  // Send updates back to main thread
  self.postMessage({
    type: 'telemetry_update',
    updates,
  })

  // Generate random events occasionally
  if (Math.random() < 0.05) {
    const randomSatellite = satellites[Math.floor(Math.random() * satellites.length)]
    const event = generateEvent(randomSatellite.id)
    self.postMessage({
      type: 'new_event',
      event,
    })
  }
}

function generateEvent(satelliteId) {
  const eventTypes = [
    { type: 'telemetry', severity: 'info', message: 'Telemetry update received' },
    { type: 'command', severity: 'info', message: 'Command executed successfully' },
    { type: 'warning', severity: 'warning', message: 'Battery level below 40%' },
    { type: 'warning', severity: 'warning', message: 'Signal strength degraded' },
    { type: 'critical', severity: 'critical', message: 'Fuel reserves critically low' },
    { type: 'critical', severity: 'critical', message: 'Thermal limits exceeded' },
    { type: 'maneuver', severity: 'info', message: 'Orbit adjustment maneuver initiated' },
  ]

  const event = eventTypes[Math.floor(Math.random() * eventTypes.length)]

  return {
    id: `EVT-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    satelliteId,
    timestamp: new Date().toISOString(),
    ...event,
  }
}

// Handle messages from main thread
self.onmessage = function (e) {
  const { type, data } = e.data

  switch (type) {
    case 'init':
      satellites = data.satellites
      self.postMessage({ type: 'init_complete', count: satellites.length })
      break

    case 'start':
      isRunning = true
      updateInterval = setInterval(updateAllSatellites, 1000) // Update every second
      self.postMessage({ type: 'started' })
      break

    case 'stop':
      isRunning = false
      if (updateInterval) {
        clearInterval(updateInterval)
        updateInterval = null
      }
      self.postMessage({ type: 'stopped' })
      break

    case 'get_satellite':
      const satellite = satellites.find((s) => s.id === data.id)
      self.postMessage({ type: 'satellite_data', satellite })
      break

    case 'update_satellite':
      const index = satellites.findIndex((s) => s.id === data.id)
      if (index !== -1) {
        satellites[index] = { ...satellites[index], ...data.updates }
        self.postMessage({ type: 'satellite_updated', satellite: satellites[index] })
      }
      break

    default:
      self.postMessage({ type: 'error', message: 'Unknown message type' })
  }
}

self.postMessage({ type: 'worker_ready' })
