const { v4: uuidv4 } = require('uuid');

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

const SUBSYSTEMS = [
  'reactor',
  'lifeSupport',
  'propulsion',
  'weapons',
  'shields',
  'communications',
  'navigation',
  'sensors',
  'cooling',
  'auxiliary'
];

class FleetSimulator {
  constructor() {
    this.ships = this.initializeFleet();
    this.lastUpdate = Date.now();
  }

  initializeFleet() {
    return SHIP_NAMES.map((name, index) => ({
      id: uuidv4(),
      name,
      class: SHIP_CLASSES[index],
      registry: `CSF-${1000 + index * 111}`,
      status: this.randomStatus(),
      position: {
        x: (Math.random() - 0.5) * 2000,
        y: (Math.random() - 0.5) * 2000,
        z: (Math.random() - 0.5) * 500,
        sector: this.randomSector(),
        orbit: Math.random() > 0.7 ? this.randomOrbit() : null
      },
      velocity: {
        current: Math.random() * 0.8 * 299792, // km/s (fraction of light speed)
        max: 299792 * (0.5 + Math.random() * 0.5),
        heading: Math.random() * 360,
        pitch: (Math.random() - 0.5) * 30
      },
      hull: {
        integrity: 85 + Math.random() * 15,
        armor: 70 + Math.random() * 30,
        structuralStress: Math.random() * 20,
        breaches: Math.floor(Math.random() * 2),
        lastRepair: Date.now() - Math.random() * 86400000 * 30
      },
      fuel: {
        current: 60 + Math.random() * 40,
        capacity: 100,
        consumption: 0.1 + Math.random() * 0.3,
        reserves: 20 + Math.random() * 30
      },
      reactor: {
        output: 70 + Math.random() * 30,
        temperature: 2000 + Math.random() * 1500,
        efficiency: 85 + Math.random() * 15,
        stability: 90 + Math.random() * 10,
        coolantLevel: 80 + Math.random() * 20,
        radiationLevel: Math.random() * 15
      },
      lifeSupport: {
        oxygen: 90 + Math.random() * 10,
        pressure: 98 + Math.random() * 4,
        temperature: 20 + Math.random() * 4,
        humidity: 40 + Math.random() * 20,
        co2Level: Math.random() * 3,
        airQuality: 85 + Math.random() * 15
      },
      shields: {
        fore: 70 + Math.random() * 30,
        aft: 70 + Math.random() * 30,
        port: 70 + Math.random() * 30,
        starboard: 70 + Math.random() * 30,
        rechargeRate: 2 + Math.random() * 3,
        frequency: 47000 + Math.random() * 6000
      },
      communications: {
        signalStrength: 80 + Math.random() * 20,
        bandwidth: 50 + Math.random() * 50,
        latency: 50 + Math.random() * 200,
        activeChannels: Math.floor(Math.random() * 12) + 1,
        encryptionLevel: Math.floor(Math.random() * 5) + 1,
        lastContact: Date.now() - Math.random() * 3600000
      },
      sensors: {
        range: 5000 + Math.random() * 10000,
        resolution: 80 + Math.random() * 20,
        activeScans: Math.floor(Math.random() * 5),
        detectedObjects: Math.floor(Math.random() * 50) + 10,
        interferenceLevel: Math.random() * 20
      },
      navigation: {
        accuracy: 95 + Math.random() * 5,
        waypointsSet: Math.floor(Math.random() * 10),
        eta: this.randomETA(),
        courseDeviation: Math.random() * 2,
        autopilot: Math.random() > 0.3
      },
      crew: {
        total: 50 + Math.floor(Math.random() * 450),
        onDuty: 0,
        casualties: Math.floor(Math.random() * 3),
        morale: 70 + Math.random() * 30,
        fatigue: Math.random() * 40
      },
      cargo: {
        capacity: 1000 + Math.floor(Math.random() * 9000),
        used: 0,
        hazardous: Math.random() > 0.8,
        manifest: this.generateCargoManifest()
      },
      mission: {
        current: this.randomMission(),
        priority: Math.floor(Math.random() * 5) + 1,
        progress: Math.random() * 100,
        startTime: Date.now() - Math.random() * 86400000 * 7,
        estimatedCompletion: Date.now() + Math.random() * 86400000 * 14
      },
      subsystems: this.generateSubsystems(),
      alerts: [],
      logs: this.generateInitialLogs()
    }));
  }

  randomStatus() {
    const statuses = ['operational', 'operational', 'operational', 'caution', 'maintenance', 'alert'];
    return statuses[Math.floor(Math.random() * statuses.length)];
  }

  randomSector() {
    const prefixes = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta'];
    const numbers = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
    return `${prefixes[Math.floor(Math.random() * prefixes.length)]}-${numbers[Math.floor(Math.random() * numbers.length)]}`;
  }

  randomOrbit() {
    const bodies = ['Kepler-442b', 'Proxima b', 'Trappist-1e', 'Ross 128 b', 'LHS 1140 b', 'Station Omega'];
    return {
      body: bodies[Math.floor(Math.random() * bodies.length)],
      altitude: 200 + Math.random() * 2000,
      period: 60 + Math.random() * 180,
      inclination: Math.random() * 90
    };
  }

  randomETA() {
    const hours = Math.floor(Math.random() * 72);
    const minutes = Math.floor(Math.random() * 60);
    return `${hours}h ${minutes}m`;
  }

  randomMission() {
    const missions = [
      'Deep Space Patrol',
      'Colony Resupply',
      'Reconnaissance',
      'Scientific Survey',
      'Diplomatic Escort',
      'Search and Rescue',
      'Trade Route Security',
      'Station Defense',
      'Exploration',
      'Intelligence Gathering'
    ];
    return missions[Math.floor(Math.random() * missions.length)];
  }

  generateSubsystems() {
    const subsystems = {};
    SUBSYSTEMS.forEach(sys => {
      subsystems[sys] = {
        status: Math.random() > 0.1 ? 'online' : 'degraded',
        health: 70 + Math.random() * 30,
        powerDraw: 5 + Math.random() * 20,
        temperature: 30 + Math.random() * 40,
        lastMaintenance: Date.now() - Math.random() * 86400000 * 60,
        errors: Math.floor(Math.random() * 3),
        uptime: Math.floor(Math.random() * 8760)
      };
    });
    return subsystems;
  }

  generateCargoManifest() {
    const items = [
      { name: 'Medical Supplies', quantity: Math.floor(Math.random() * 500), unit: 'crates' },
      { name: 'Fuel Cells', quantity: Math.floor(Math.random() * 200), unit: 'units' },
      { name: 'Food Rations', quantity: Math.floor(Math.random() * 1000), unit: 'packages' },
      { name: 'Spare Parts', quantity: Math.floor(Math.random() * 300), unit: 'containers' },
      { name: 'Scientific Equipment', quantity: Math.floor(Math.random() * 50), unit: 'modules' }
    ];
    return items.filter(() => Math.random() > 0.3);
  }

  generateInitialLogs() {
    const logTypes = ['system', 'navigation', 'communication', 'engineering', 'security'];
    const messages = [
      'Systems nominal',
      'Course correction applied',
      'Subspace transmission received',
      'Routine maintenance completed',
      'Security sweep completed',
      'Sensor calibration successful',
      'Power redistribution optimized',
      'Shield harmonics adjusted'
    ];

    const logs = [];
    for (let i = 0; i < 10; i++) {
      logs.push({
        id: uuidv4(),
        timestamp: Date.now() - Math.random() * 86400000,
        type: logTypes[Math.floor(Math.random() * logTypes.length)],
        message: messages[Math.floor(Math.random() * messages.length)],
        severity: Math.random() > 0.8 ? 'warning' : 'info'
      });
    }
    return logs.sort((a, b) => b.timestamp - a.timestamp);
  }

  update() {
    const now = Date.now();
    const deltaTime = (now - this.lastUpdate) / 1000;
    this.lastUpdate = now;

    this.ships.forEach(ship => {
      // Update position based on velocity
      const radHeading = (ship.velocity.heading * Math.PI) / 180;
      const radPitch = (ship.velocity.pitch * Math.PI) / 180;
      const speed = ship.velocity.current * deltaTime * 0.001;

      ship.position.x += Math.cos(radHeading) * Math.cos(radPitch) * speed;
      ship.position.y += Math.sin(radHeading) * Math.cos(radPitch) * speed;
      ship.position.z += Math.sin(radPitch) * speed;

      // Fluctuate telemetry values
      ship.fuel.current = Math.max(0, ship.fuel.current - ship.fuel.consumption * deltaTime * 0.01);
      ship.reactor.temperature += (Math.random() - 0.5) * 50;
      ship.reactor.temperature = Math.max(1500, Math.min(4000, ship.reactor.temperature));
      ship.reactor.output += (Math.random() - 0.5) * 2;
      ship.reactor.output = Math.max(50, Math.min(100, ship.reactor.output));

      ship.lifeSupport.oxygen += (Math.random() - 0.5) * 0.5;
      ship.lifeSupport.oxygen = Math.max(85, Math.min(100, ship.lifeSupport.oxygen));
      ship.lifeSupport.temperature += (Math.random() - 0.5) * 0.2;
      ship.lifeSupport.co2Level += (Math.random() - 0.5) * 0.1;
      ship.lifeSupport.co2Level = Math.max(0, Math.min(5, ship.lifeSupport.co2Level));

      // Shield fluctuations
      ['fore', 'aft', 'port', 'starboard'].forEach(dir => {
        ship.shields[dir] += (Math.random() - 0.5) * 2;
        ship.shields[dir] = Math.max(0, Math.min(100, ship.shields[dir]));
      });

      // Communications
      ship.communications.signalStrength += (Math.random() - 0.5) * 5;
      ship.communications.signalStrength = Math.max(50, Math.min(100, ship.communications.signalStrength));
      ship.communications.latency += (Math.random() - 0.5) * 20;
      ship.communications.latency = Math.max(10, Math.min(500, ship.communications.latency));

      // Sensors
      ship.sensors.detectedObjects += Math.floor((Math.random() - 0.5) * 5);
      ship.sensors.detectedObjects = Math.max(5, Math.min(100, ship.sensors.detectedObjects));
      ship.sensors.interferenceLevel += (Math.random() - 0.5) * 2;
      ship.sensors.interferenceLevel = Math.max(0, Math.min(50, ship.sensors.interferenceLevel));

      // Navigation
      ship.navigation.courseDeviation += (Math.random() - 0.5) * 0.1;
      ship.navigation.courseDeviation = Math.max(0, Math.min(5, ship.navigation.courseDeviation));

      // Crew
      ship.crew.onDuty = Math.floor(ship.crew.total * (0.3 + Math.random() * 0.2));
      ship.crew.morale += (Math.random() - 0.5) * 1;
      ship.crew.morale = Math.max(40, Math.min(100, ship.crew.morale));
      ship.crew.fatigue += (Math.random() - 0.5) * 2;
      ship.crew.fatigue = Math.max(0, Math.min(80, ship.crew.fatigue));

      // Mission progress
      ship.mission.progress += Math.random() * 0.1;
      ship.mission.progress = Math.min(100, ship.mission.progress);

      // Subsystem fluctuations
      Object.keys(ship.subsystems).forEach(sys => {
        ship.subsystems[sys].health += (Math.random() - 0.5) * 1;
        ship.subsystems[sys].health = Math.max(50, Math.min(100, ship.subsystems[sys].health));
        ship.subsystems[sys].temperature += (Math.random() - 0.5) * 2;
        ship.subsystems[sys].temperature = Math.max(20, Math.min(90, ship.subsystems[sys].temperature));
        ship.subsystems[sys].powerDraw += (Math.random() - 0.5) * 1;
        ship.subsystems[sys].powerDraw = Math.max(3, Math.min(30, ship.subsystems[sys].powerDraw));
      });

      // Random velocity adjustments
      if (Math.random() > 0.95) {
        ship.velocity.heading += (Math.random() - 0.5) * 10;
        ship.velocity.heading = ((ship.velocity.heading % 360) + 360) % 360;
      }

      // Update status based on conditions
      ship.status = this.calculateStatus(ship);

      // Cargo used calculation
      ship.cargo.used = ship.cargo.manifest.reduce((sum, item) => sum + item.quantity * 2, 0);
    });

    return this.ships;
  }

  calculateStatus(ship) {
    const criticalConditions =
      ship.hull.integrity < 50 ||
      ship.fuel.current < 10 ||
      ship.reactor.stability < 70 ||
      ship.lifeSupport.oxygen < 80;

    const cautionConditions =
      ship.hull.integrity < 75 ||
      ship.fuel.current < 30 ||
      ship.reactor.temperature > 3500 ||
      ship.shields.fore < 30 ||
      ship.shields.aft < 30;

    if (criticalConditions) return 'alert';
    if (cautionConditions) return 'caution';
    if (Math.random() > 0.95) return 'maintenance';
    return 'operational';
  }

  getShip(id) {
    return this.ships.find(s => s.id === id);
  }

  getAllShips() {
    return this.ships;
  }

  getFleetSummary() {
    return {
      totalShips: this.ships.length,
      operational: this.ships.filter(s => s.status === 'operational').length,
      caution: this.ships.filter(s => s.status === 'caution').length,
      alert: this.ships.filter(s => s.status === 'alert').length,
      maintenance: this.ships.filter(s => s.status === 'maintenance').length,
      totalCrew: this.ships.reduce((sum, s) => sum + s.crew.total, 0),
      averageFuel: this.ships.reduce((sum, s) => sum + s.fuel.current, 0) / this.ships.length,
      averageHull: this.ships.reduce((sum, s) => sum + s.hull.integrity, 0) / this.ships.length
    };
  }
}

module.exports = FleetSimulator;
