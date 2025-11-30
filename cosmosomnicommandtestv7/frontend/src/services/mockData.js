// Mock data for preview mode when backend is unavailable
import { v4 as uuidv4 } from 'uuid';

const SHIP_NAMES = [
  'Aurora Prime',
  'Vanguard X9',
  'Nova Sentinel',
  'Celestial Harbor',
  'Starlight Courier',
  "Orion's Eye",
  'Hyperion Arc',
  'Specter Shadow',
  'Astra Delta Laboratory',
  'Polaris Gateway'
];

const SHIP_CLASSES = [
  'Dreadnought',
  'Battlecruiser',
  'Carrier',
  'Space Station',
  'Frigate',
  'Scout',
  'Cruiser',
  'Stealth Corvette',
  'Research Vessel',
  'Gateway Station'
];

function generateMockShip(name, index) {
  return {
    id: uuidv4(),
    name,
    class: SHIP_CLASSES[index],
    registry: `CSF-${1000 + index * 111}`,
    status: ['operational', 'operational', 'caution', 'operational'][Math.floor(Math.random() * 4)],
    position: {
      x: (Math.random() - 0.5) * 2000,
      y: (Math.random() - 0.5) * 2000,
      z: (Math.random() - 0.5) * 500,
      sector: `Alpha-${['I', 'II', 'III', 'IV'][Math.floor(Math.random() * 4)]}`
    },
    velocity: {
      current: Math.random() * 0.8 * 299792,
      max: 299792 * 0.9,
      heading: Math.random() * 360,
      pitch: (Math.random() - 0.5) * 30
    },
    hull: {
      integrity: 85 + Math.random() * 15,
      armor: 70 + Math.random() * 30
    },
    fuel: {
      current: 60 + Math.random() * 40,
      capacity: 100
    },
    reactor: {
      output: 80 + Math.random() * 20,
      temperature: 2500 + Math.random() * 1000,
      efficiency: 90 + Math.random() * 10
    },
    lifeSupport: {
      oxygen: 95 + Math.random() * 5,
      pressure: 100 + Math.random() * 2,
      temperature: 22 + Math.random() * 2
    },
    shields: {
      fore: 80 + Math.random() * 20,
      aft: 75 + Math.random() * 25,
      port: 80 + Math.random() * 20,
      starboard: 78 + Math.random() * 22
    },
    communications: {
      signalStrength: 90 + Math.random() * 10,
      latency: 50 + Math.random() * 100
    },
    crew: {
      total: 100 + Math.floor(Math.random() * 400),
      morale: 75 + Math.random() * 25
    },
    mission: {
      current: ['Deep Space Patrol', 'Colony Resupply', 'Reconnaissance', 'Scientific Survey'][Math.floor(Math.random() * 4)],
      progress: Math.random() * 100
    }
  };
}

function generateMockCelestialObjects() {
  const objects = [];

  // Stars
  const starNames = ['Sol Prime', 'Arcturus Major', 'Sirius Alpha', 'Vega Nexus', 'Polaris Central'];
  starNames.forEach(name => {
    objects.push({
      id: uuidv4(),
      type: 'star',
      name,
      starType: ['G-type', 'K-type', 'A-type'][Math.floor(Math.random() * 3)],
      color: ['#ffee77', '#ffaa44', '#aaddff'][Math.floor(Math.random() * 3)],
      position: { x: (Math.random() - 0.5) * 4000, y: (Math.random() - 0.5) * 4000, z: (Math.random() - 0.5) * 1000 }
    });
  });

  // Planets
  const planetNames = ['Terra Nova', 'Kepler Prime', 'New Eden', 'Proxima III', 'Avalon'];
  planetNames.forEach(name => {
    objects.push({
      id: uuidv4(),
      type: 'planet',
      name,
      planetType: ['Terrestrial', 'Gas Giant', 'Ocean World'][Math.floor(Math.random() * 3)],
      position: { x: (Math.random() - 0.5) * 4000, y: (Math.random() - 0.5) * 4000, z: (Math.random() - 0.5) * 500 },
      habitable: Math.random() > 0.5,
      population: Math.floor(Math.random() * 10000000000)
    });
  });

  // Stations
  const stationNames = ['Omega Station', 'Gateway Prime', 'Nexus Hub'];
  stationNames.forEach(name => {
    objects.push({
      id: uuidv4(),
      type: 'station',
      name,
      stationType: ['Trading Post', 'Military Base', 'Research Facility'][Math.floor(Math.random() * 3)],
      position: { x: (Math.random() - 0.5) * 4000, y: (Math.random() - 0.5) * 4000, z: (Math.random() - 0.5) * 500 }
    });
  });

  return objects;
}

function generateMockAlerts() {
  const alerts = [];
  const alertTypes = [
    { category: 'navigation', severity: 'warning', title: 'Course deviation detected' },
    { category: 'engineering', severity: 'caution', title: 'Reactor output fluctuation' },
    { category: 'communications', severity: 'info', title: 'Incoming transmission detected' },
    { category: 'security', severity: 'alert', title: 'Unknown vessel detected' },
    { category: 'environmental', severity: 'warning', title: 'Radiation levels elevated' }
  ];

  for (let i = 0; i < 10; i++) {
    const type = alertTypes[Math.floor(Math.random() * alertTypes.length)];
    alerts.push({
      id: uuidv4(),
      ...type,
      timestamp: Date.now() - Math.random() * 3600000,
      acknowledged: Math.random() > 0.5
    });
  }

  return alerts;
}

function generateMockSubsystems() {
  return {
    reactor: {
      name: 'Main Reactor Core',
      status: 'online',
      health: 92,
      output: { current: 85, max: 100 },
      temperature: { core: 15000000, containment: 850 },
      fuel: { deuterium: 78, tritium: 82 }
    },
    lifeSupport: {
      name: 'Life Support Systems',
      status: 'online',
      health: 95,
      atmosphere: { oxygen: 21, co2: 0.04, pressure: 101.3 }
    },
    propulsion: {
      name: 'Propulsion Systems',
      status: 'online',
      health: 88,
      mainEngines: { status: 'standby', thrust: 0, maxThrust: 100 }
    },
    shields: {
      name: 'Shield Generator Array',
      status: 'online',
      health: 90,
      sectors: {
        fore: { strength: 85 },
        aft: { strength: 80 },
        port: { strength: 82 },
        starboard: { strength: 78 }
      }
    },
    communications: {
      name: 'Communications Array',
      status: 'online',
      health: 94,
      subspace: { range: 75, latency: 80 }
    },
    sensors: {
      name: 'Sensor Arrays',
      status: 'online',
      health: 91,
      longRange: { range: 20, resolution: 88 }
    }
  };
}

export function getMockInitialData() {
  const ships = SHIP_NAMES.map((name, i) => generateMockShip(name, i));

  return {
    fleet: ships,
    fleetSummary: {
      totalShips: ships.length,
      operational: ships.filter(s => s.status === 'operational').length,
      caution: ships.filter(s => s.status === 'caution').length,
      alert: ships.filter(s => s.status === 'alert').length,
      totalCrew: ships.reduce((sum, s) => sum + s.crew.total, 0),
      averageFuel: ships.reduce((sum, s) => sum + s.fuel.current, 0) / ships.length,
      averageHull: ships.reduce((sum, s) => sum + s.hull.integrity, 0) / ships.length
    },
    map: {
      celestialObjects: generateMockCelestialObjects(),
      hazardZones: [],
      tradeRoutes: [],
      waypoints: []
    },
    missions: {
      timeline: [],
      currentEvents: [],
      upcomingEvents: [],
      recentEvents: []
    },
    crew: {
      crew: [],
      departments: {},
      summary: { totalCrew: 2500, onDuty: 800, averageMorale: 85 }
    },
    engineering: {
      subsystems: generateMockSubsystems(),
      powerGrid: {
        totalGeneration: 85,
        totalConsumption: 65,
        reserves: 90
      }
    },
    alerts: {
      alerts: generateMockAlerts(),
      anomalies: [],
      summary: {
        totalAlerts: 10,
        unacknowledged: 5,
        critical: 2
      }
    }
  };
}

// Simulate real-time updates
export function createMockUpdates(callback) {
  const intervalId = setInterval(() => {
    // Simulate minor data fluctuations
    callback({
      type: 'update',
      data: {
        fleet: {
          ships: SHIP_NAMES.map((name, i) => generateMockShip(name, i)),
          summary: {
            totalShips: 10,
            operational: 8,
            caution: 2,
            alert: 0
          }
        }
      }
    });
  }, 2000);

  return { stop: () => clearInterval(intervalId) };
}
