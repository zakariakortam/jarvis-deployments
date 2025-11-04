/**
 * Telemetry Data Generation Engine
 * Generates realistic satellite data for up to 10,000 satellites
 */

// Satellite types with different characteristics
const SATELLITE_TYPES = [
  { type: 'LEO', minAlt: 200, maxAlt: 2000, baseCost: 50000 },
  { type: 'MEO', minAlt: 2000, maxAlt: 35000, baseCost: 150000 },
  { type: 'GEO', minAlt: 35786, maxAlt: 35786, baseCost: 250000 },
  { type: 'HEO', minAlt: 1000, maxAlt: 40000, baseCost: 200000 },
];

const SUBSYSTEM_TYPES = ['power', 'thermal', 'propulsion', 'payload', 'attitude'];

const STATUS_LEVELS = {
  NOMINAL: { value: 'nominal', weight: 75 },
  WARNING: { value: 'warning', weight: 15 },
  CRITICAL: { value: 'critical', weight: 5 },
  OFFLINE: { value: 'offline', weight: 5 },
};

// Generate a stable random value based on seed
function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Generate satellite metadata
export function generateSatelliteMetadata(id) {
  const typeIndex = id % SATELLITE_TYPES.length;
  const satType = SATELLITE_TYPES[typeIndex];

  return {
    id: `SAT-${String(id).padStart(5, '0')}`,
    name: `Satellite ${id}`,
    type: satType.type,
    launchDate: new Date(2020 + (id % 5), (id % 12), (id % 28) + 1),
    mission: ['Communication', 'Earth Observation', 'Navigation', 'Scientific'][id % 4],
  };
}

// Generate orbital parameters
export function generateOrbitData(id, time = Date.now()) {
  const satType = SATELLITE_TYPES[id % SATELLITE_TYPES.length];
  const seed = id * 1000 + Math.floor(time / 60000); // Change every minute

  const altitude = satType.minAlt + seededRandom(seed) * (satType.maxAlt - satType.minAlt);
  const inclination = seededRandom(seed + 1) * 180;
  const eccentricity = seededRandom(seed + 2) * 0.1;

  // Calculate position in orbit (simplified)
  const orbitalPeriod = 2 * Math.PI * Math.sqrt(Math.pow(6371 + altitude, 3) / 398600.4418);
  const meanAnomaly = ((time / 1000) % orbitalPeriod) / orbitalPeriod * 2 * Math.PI;

  // Convert to Cartesian coordinates (simplified)
  const r = (6371 + altitude);
  const x = r * Math.cos(meanAnomaly) * Math.cos(inclination * Math.PI / 180);
  const y = r * Math.sin(meanAnomaly) * Math.cos(inclination * Math.PI / 180);
  const z = r * Math.sin(inclination * Math.PI / 180);

  return {
    altitude: parseFloat(altitude.toFixed(2)),
    inclination: parseFloat(inclination.toFixed(2)),
    eccentricity: parseFloat(eccentricity.toFixed(4)),
    position: { x: parseFloat(x.toFixed(2)), y: parseFloat(y.toFixed(2)), z: parseFloat(z.toFixed(2)) },
    velocity: parseFloat((7.8 - altitude / 10000).toFixed(2)), // km/s approximation
  };
}

// Generate telemetry data
export function generateTelemetry(id, time = Date.now()) {
  const seed = id * 1000 + Math.floor(time / 1000);

  return {
    power: {
      solarPanel: parseFloat((85 + seededRandom(seed) * 15).toFixed(2)),
      battery: parseFloat((60 + seededRandom(seed + 1) * 40).toFixed(2)),
      consumption: parseFloat((200 + seededRandom(seed + 2) * 100).toFixed(2)),
    },
    thermal: {
      core: parseFloat((-20 + seededRandom(seed + 3) * 80).toFixed(2)),
      panel: parseFloat((-100 + seededRandom(seed + 4) * 150).toFixed(2)),
      battery: parseFloat((0 + seededRandom(seed + 5) * 40).toFixed(2)),
    },
    propulsion: {
      fuel: parseFloat((20 + seededRandom(seed + 6) * 80).toFixed(2)),
      oxidizer: parseFloat((20 + seededRandom(seed + 7) * 80).toFixed(2)),
      pressure: parseFloat((100 + seededRandom(seed + 8) * 100).toFixed(2)),
    },
    communication: {
      signalStrength: parseFloat((-80 + seededRandom(seed + 9) * 40).toFixed(2)),
      dataRate: parseFloat((1 + seededRandom(seed + 10) * 10).toFixed(2)),
      latency: parseFloat((50 + seededRandom(seed + 11) * 200).toFixed(2)),
    },
  };
}

// Generate subsystem status
export function generateSubsystemStatus(id, subsystem, time = Date.now()) {
  const seed = id * 1000 + subsystem.charCodeAt(0) + Math.floor(time / 5000);
  const random = seededRandom(seed) * 100;

  let cumulativeWeight = 0;
  for (const [, status] of Object.entries(STATUS_LEVELS)) {
    cumulativeWeight += status.weight;
    if (random < cumulativeWeight) {
      return status.value;
    }
  }

  return STATUS_LEVELS.NOMINAL.value;
}

// Generate cost data
export function generateCostData(id) {
  const satType = SATELLITE_TYPES[id % SATELLITE_TYPES.length];
  const seed = id * 1000;

  const baseCost = satType.baseCost;
  const operationalCost = parseFloat((baseCost * 0.01 * (1 + seededRandom(seed))).toFixed(2));

  return {
    total: baseCost,
    operational: operationalCost,
    maintenance: parseFloat((operationalCost * 0.3).toFixed(2)),
    fuel: parseFloat((operationalCost * 0.2).toFixed(2)),
  };
}

// Generate events
export function generateEvents(id, count = 50) {
  const events = [];
  const eventTypes = [
    { type: 'maneuver', severity: 'info' },
    { type: 'communication', severity: 'info' },
    { type: 'warning', severity: 'warning' },
    { type: 'anomaly', severity: 'critical' },
    { type: 'maintenance', severity: 'info' },
  ];

  for (let i = 0; i < count; i++) {
    const seed = id * 10000 + i;
    const eventType = eventTypes[Math.floor(seededRandom(seed) * eventTypes.length)];
    const timestamp = Date.now() - Math.floor(seededRandom(seed + 1) * 7 * 24 * 60 * 60 * 1000);

    events.push({
      id: `EVT-${id}-${i}`,
      satelliteId: `SAT-${String(id).padStart(5, '0')}`,
      type: eventType.type,
      severity: eventType.severity,
      message: `${eventType.type.charAt(0).toUpperCase() + eventType.type.slice(1)} event detected`,
      timestamp: new Date(timestamp),
    });
  }

  return events.sort((a, b) => b.timestamp - a.timestamp);
}

// Generate complete satellite data
export function generateSatelliteData(id) {
  const metadata = generateSatelliteMetadata(id);
  const orbit = generateOrbitData(id);
  const telemetry = generateTelemetry(id);
  const costs = generateCostData(id);

  const subsystems = SUBSYSTEM_TYPES.reduce((acc, subsystem) => {
    acc[subsystem] = {
      status: generateSubsystemStatus(id, subsystem),
      health: parseFloat((70 + seededRandom(id * 100 + subsystem.charCodeAt(0)) * 30).toFixed(2)),
    };
    return acc;
  }, {});

  return {
    ...metadata,
    orbit,
    telemetry,
    subsystems,
    costs,
    overallStatus: calculateOverallStatus(subsystems),
  };
}

// Calculate overall satellite status
function calculateOverallStatus(subsystems) {
  const statuses = Object.values(subsystems).map(s => s.status);

  if (statuses.includes('critical')) return 'critical';
  if (statuses.includes('offline')) return 'offline';
  if (statuses.includes('warning')) return 'warning';
  return 'nominal';
}

// Generate batch of satellites efficiently
export function generateSatelliteBatch(startId, count) {
  const satellites = [];
  for (let i = startId; i < startId + count; i++) {
    satellites.push(generateSatelliteData(i));
  }
  return satellites;
}

// Update telemetry for existing satellite
export function updateSatelliteTelemetry(satellite, time = Date.now()) {
  return {
    ...satellite,
    orbit: generateOrbitData(parseInt(satellite.id.split('-')[1]), time),
    telemetry: generateTelemetry(parseInt(satellite.id.split('-')[1]), time),
    subsystems: Object.keys(satellite.subsystems).reduce((acc, subsystem) => {
      acc[subsystem] = {
        ...satellite.subsystems[subsystem],
        status: generateSubsystemStatus(parseInt(satellite.id.split('-')[1]), subsystem, time),
      };
      return acc;
    }, {}),
  };
}
