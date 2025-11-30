const { v4: uuidv4 } = require('uuid');

class GalacticMapSimulator {
  constructor() {
    this.celestialObjects = this.initializeCelestialObjects();
    this.hazardZones = this.initializeHazardZones();
    this.tradeRoutes = this.initializeTradeRoutes();
    this.waypoints = [];
  }

  initializeCelestialObjects() {
    const objects = [];

    // Stars
    const starNames = [
      'Sol Prime', 'Arcturus Major', 'Sirius Alpha', 'Vega Nexus', 'Polaris Central',
      'Betelgeuse', 'Rigel System', 'Aldebaran', 'Antares', 'Spica',
      'Deneb', 'Altair', 'Fomalhaut', 'Procyon', 'Achernar'
    ];

    const starTypes = ['G-type', 'K-type', 'M-type', 'A-type', 'B-type', 'F-type', 'O-type'];
    const starColors = ['#ffee77', '#ffaa44', '#ff6644', '#aaddff', '#88ccff', '#ffffff', '#aaaaff'];

    starNames.forEach((name, i) => {
      const typeIndex = Math.floor(Math.random() * starTypes.length);
      objects.push({
        id: uuidv4(),
        type: 'star',
        name,
        starType: starTypes[typeIndex],
        color: starColors[typeIndex],
        position: {
          x: (Math.random() - 0.5) * 4000,
          y: (Math.random() - 0.5) * 4000,
          z: (Math.random() - 0.5) * 1000
        },
        mass: 0.5 + Math.random() * 20,
        radius: 0.5 + Math.random() * 10,
        temperature: 3000 + Math.random() * 30000,
        luminosity: 0.1 + Math.random() * 100,
        age: Math.random() * 10,
        habitable: Math.random() > 0.7,
        planets: Math.floor(Math.random() * 12),
        stations: Math.floor(Math.random() * 3),
        controlledBy: this.randomFaction(),
        resources: this.generateResources()
      });
    });

    // Planets
    const planetNames = [
      'Terra Nova', 'Kepler Prime', 'New Eden', 'Proxima III', 'Avalon',
      'Helios B', 'Meridian', 'Arcadia', 'Elysium', 'Pandora',
      'Atlas', 'Hyperion Moon', 'Titan Colony', 'Europa Station', 'Ganymede Base'
    ];

    const planetTypes = ['Terrestrial', 'Gas Giant', 'Ice Giant', 'Ocean World', 'Desert World', 'Volcanic'];

    planetNames.forEach((name, i) => {
      objects.push({
        id: uuidv4(),
        type: 'planet',
        name,
        planetType: planetTypes[Math.floor(Math.random() * planetTypes.length)],
        position: {
          x: (Math.random() - 0.5) * 4000,
          y: (Math.random() - 0.5) * 4000,
          z: (Math.random() - 0.5) * 500
        },
        mass: 0.1 + Math.random() * 300,
        radius: 0.3 + Math.random() * 15,
        atmosphere: Math.random() > 0.3,
        atmosphereType: this.randomAtmosphere(),
        gravity: 0.1 + Math.random() * 3,
        temperature: -200 + Math.random() * 500,
        water: Math.random() * 100,
        habitable: Math.random() > 0.6,
        population: Math.random() > 0.5 ? Math.floor(Math.random() * 10000000000) : 0,
        moons: Math.floor(Math.random() * 20),
        rings: Math.random() > 0.7,
        orbitalPeriod: 50 + Math.random() * 1000,
        dayLength: 10 + Math.random() * 100,
        controlledBy: this.randomFaction(),
        resources: this.generateResources(),
        facilities: this.generateFacilities()
      });
    });

    // Space Stations
    const stationNames = [
      'Omega Station', 'Gateway Prime', 'Nexus Hub', 'Citadel Central', 'Waypoint Alpha',
      'Trade Hub Sigma', 'Research Station Tau', 'Military Outpost Delta', 'Mining Platform Zeta'
    ];

    const stationTypes = ['Trading Post', 'Military Base', 'Research Facility', 'Mining Platform', 'Shipyard'];

    stationNames.forEach((name, i) => {
      objects.push({
        id: uuidv4(),
        type: 'station',
        name,
        stationType: stationTypes[Math.floor(Math.random() * stationTypes.length)],
        position: {
          x: (Math.random() - 0.5) * 4000,
          y: (Math.random() - 0.5) * 4000,
          z: (Math.random() - 0.5) * 500
        },
        capacity: 1000 + Math.floor(Math.random() * 50000),
        population: Math.floor(Math.random() * 30000),
        dockingBays: 5 + Math.floor(Math.random() * 50),
        defenseLevel: Math.floor(Math.random() * 10) + 1,
        services: this.generateServices(),
        controlledBy: this.randomFaction(),
        status: Math.random() > 0.1 ? 'operational' : 'maintenance'
      });
    });

    // Nebulae
    const nebulaNames = [
      'Crimson Veil', 'Azure Drift', 'Emerald Cloud', 'Golden Expanse', 'Violet Storm',
      'Obsidian Shroud', 'Crystal Nebula', 'Phantom Mist'
    ];

    const nebulaTypes = ['Emission', 'Reflection', 'Dark', 'Planetary', 'Supernova Remnant'];

    nebulaNames.forEach((name, i) => {
      objects.push({
        id: uuidv4(),
        type: 'nebula',
        name,
        nebulaType: nebulaTypes[Math.floor(Math.random() * nebulaTypes.length)],
        position: {
          x: (Math.random() - 0.5) * 5000,
          y: (Math.random() - 0.5) * 5000,
          z: (Math.random() - 0.5) * 1500
        },
        color: this.randomNebulaColor(),
        radius: 200 + Math.random() * 800,
        density: Math.random(),
        sensorInterference: 20 + Math.random() * 80,
        resources: this.generateNebulaResources(),
        anomalies: Math.floor(Math.random() * 5)
      });
    });

    // Anomalies
    const anomalyNames = [
      'Void Rift Alpha', 'Gravitational Lens X7', 'Temporal Distortion', 'Dark Matter Cluster',
      'Quantum Singularity', 'Wormhole Entrance', 'Ion Storm Region'
    ];

    const anomalyTypes = ['Wormhole', 'Black Hole', 'Gravitational Anomaly', 'Temporal Rift', 'Ion Storm', 'Radiation Field'];

    anomalyNames.forEach((name, i) => {
      objects.push({
        id: uuidv4(),
        type: 'anomaly',
        name,
        anomalyType: anomalyTypes[Math.floor(Math.random() * anomalyTypes.length)],
        position: {
          x: (Math.random() - 0.5) * 4000,
          y: (Math.random() - 0.5) * 4000,
          z: (Math.random() - 0.5) * 800
        },
        radius: 50 + Math.random() * 200,
        dangerLevel: Math.floor(Math.random() * 10) + 1,
        effects: this.generateAnomalyEffects(),
        studied: Math.random() > 0.5,
        stable: Math.random() > 0.3
      });
    });

    // Asteroid Fields
    for (let i = 0; i < 8; i++) {
      objects.push({
        id: uuidv4(),
        type: 'asteroidField',
        name: `Asteroid Belt ${String.fromCharCode(65 + i)}`,
        position: {
          x: (Math.random() - 0.5) * 4000,
          y: (Math.random() - 0.5) * 4000,
          z: (Math.random() - 0.5) * 300
        },
        radius: 100 + Math.random() * 400,
        density: 0.3 + Math.random() * 0.7,
        asteroidCount: 1000 + Math.floor(Math.random() * 50000),
        resources: this.generateMiningResources(),
        hazardLevel: Math.floor(Math.random() * 5) + 1,
        miningOperations: Math.floor(Math.random() * 10)
      });
    }

    return objects;
  }

  initializeHazardZones() {
    const zones = [];
    const hazardTypes = ['Radiation Belt', 'Debris Field', 'Pirate Territory', 'Unstable Space', 'Quarantine Zone'];

    for (let i = 0; i < 12; i++) {
      zones.push({
        id: uuidv4(),
        name: `Hazard Zone ${i + 1}`,
        type: hazardTypes[Math.floor(Math.random() * hazardTypes.length)],
        position: {
          x: (Math.random() - 0.5) * 4000,
          y: (Math.random() - 0.5) * 4000
        },
        radius: 150 + Math.random() * 400,
        dangerLevel: Math.floor(Math.random() * 10) + 1,
        active: Math.random() > 0.2,
        effects: this.generateHazardEffects()
      });
    }

    return zones;
  }

  initializeTradeRoutes() {
    const routes = [];
    const routeNames = [
      'Silk Nebula Route', 'Golden Path', 'Merchant Way', 'Colonial Highway',
      'Resource Corridor', 'Federation Lane', 'Frontier Trail'
    ];

    routeNames.forEach((name, i) => {
      const waypoints = [];
      const numWaypoints = 3 + Math.floor(Math.random() * 5);

      for (let j = 0; j < numWaypoints; j++) {
        waypoints.push({
          x: (Math.random() - 0.5) * 4000,
          y: (Math.random() - 0.5) * 4000
        });
      }

      routes.push({
        id: uuidv4(),
        name,
        waypoints,
        distance: 500 + Math.random() * 3000,
        traffic: Math.floor(Math.random() * 100),
        safety: 50 + Math.random() * 50,
        controlledBy: this.randomFaction(),
        active: Math.random() > 0.1
      });
    });

    return routes;
  }

  randomFaction() {
    const factions = [
      'United Earth Federation',
      'Colonial Alliance',
      'Free Traders Guild',
      'Independent',
      'Neutral Zone',
      'Research Consortium'
    ];
    return factions[Math.floor(Math.random() * factions.length)];
  }

  randomAtmosphere() {
    const types = ['Nitrogen-Oxygen', 'Carbon Dioxide', 'Methane', 'Ammonia', 'None', 'Toxic', 'Thin'];
    return types[Math.floor(Math.random() * types.length)];
  }

  randomNebulaColor() {
    const colors = [
      { primary: '#ff4466', secondary: '#ff88aa' },
      { primary: '#4488ff', secondary: '#88bbff' },
      { primary: '#44ff88', secondary: '#88ffaa' },
      { primary: '#ffaa44', secondary: '#ffcc88' },
      { primary: '#aa44ff', secondary: '#cc88ff' },
      { primary: '#44ffff', secondary: '#88ffff' }
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  generateResources() {
    const allResources = [
      'Deuterium', 'Tritium', 'Rare Earth Elements', 'Titanium',
      'Helium-3', 'Water Ice', 'Organic Compounds', 'Platinum',
      'Uranium', 'Gold', 'Quantum Crystals', 'Dark Matter Traces'
    ];

    const count = 1 + Math.floor(Math.random() * 4);
    const resources = [];

    for (let i = 0; i < count; i++) {
      const resource = allResources[Math.floor(Math.random() * allResources.length)];
      if (!resources.find(r => r.name === resource)) {
        resources.push({
          name: resource,
          abundance: Math.random(),
          extractionDifficulty: Math.floor(Math.random() * 10) + 1
        });
      }
    }

    return resources;
  }

  generateMiningResources() {
    return [
      { name: 'Iron', abundance: 0.5 + Math.random() * 0.5 },
      { name: 'Nickel', abundance: 0.3 + Math.random() * 0.4 },
      { name: 'Cobalt', abundance: 0.1 + Math.random() * 0.3 },
      { name: 'Platinum', abundance: Math.random() * 0.2 },
      { name: 'Water Ice', abundance: 0.2 + Math.random() * 0.3 }
    ];
  }

  generateNebulaResources() {
    return [
      { name: 'Hydrogen', abundance: 0.7 + Math.random() * 0.3 },
      { name: 'Helium', abundance: 0.5 + Math.random() * 0.3 },
      { name: 'Exotic Particles', abundance: Math.random() * 0.1 }
    ];
  }

  generateFacilities() {
    const allFacilities = [
      'Spaceport', 'Refinery', 'Research Lab', 'Military Base',
      'Colony', 'Mining Operation', 'Terraforming Station', 'Shipyard'
    ];

    const count = Math.floor(Math.random() * 4);
    return allFacilities.slice(0, count);
  }

  generateServices() {
    const allServices = [
      'Refueling', 'Repairs', 'Medical', 'Trading',
      'Bounty Board', 'Ship Sales', 'Crew Recruitment', 'Intel'
    ];

    const count = 3 + Math.floor(Math.random() * 5);
    return allServices.slice(0, count);
  }

  generateAnomalyEffects() {
    const effects = [
      'Sensor Disruption',
      'Navigation Errors',
      'Shield Drain',
      'Communication Blackout',
      'Temporal Dilation',
      'Hull Stress',
      'Power Fluctuations'
    ];

    const count = 1 + Math.floor(Math.random() * 3);
    return effects.slice(0, count);
  }

  generateHazardEffects() {
    const effects = [
      'Radiation Damage',
      'Hull Degradation',
      'System Malfunctions',
      'Crew Health Impact',
      'Fuel Consumption Increase'
    ];

    const count = 1 + Math.floor(Math.random() * 2);
    return effects.slice(0, count);
  }

  update() {
    // Animate nebula positions slightly
    this.celestialObjects.forEach(obj => {
      if (obj.type === 'nebula') {
        obj.position.x += (Math.random() - 0.5) * 0.5;
        obj.position.y += (Math.random() - 0.5) * 0.5;
      }

      // Update station populations
      if (obj.type === 'station') {
        obj.population += Math.floor((Math.random() - 0.5) * 100);
        obj.population = Math.max(100, obj.population);
      }

      // Update anomaly stability
      if (obj.type === 'anomaly') {
        if (Math.random() > 0.99) {
          obj.stable = !obj.stable;
        }
      }
    });

    // Update trade route traffic
    this.tradeRoutes.forEach(route => {
      route.traffic += Math.floor((Math.random() - 0.5) * 10);
      route.traffic = Math.max(0, Math.min(100, route.traffic));
    });

    // Update hazard zones
    this.hazardZones.forEach(zone => {
      if (Math.random() > 0.98) {
        zone.active = !zone.active;
      }
      zone.dangerLevel += Math.floor((Math.random() - 0.5) * 2);
      zone.dangerLevel = Math.max(1, Math.min(10, zone.dangerLevel));
    });

    return {
      celestialObjects: this.celestialObjects,
      hazardZones: this.hazardZones,
      tradeRoutes: this.tradeRoutes
    };
  }

  getCelestialObject(id) {
    return this.celestialObjects.find(obj => obj.id === id);
  }

  getObjectsByType(type) {
    return this.celestialObjects.filter(obj => obj.type === type);
  }

  addWaypoint(waypoint) {
    this.waypoints.push({
      id: uuidv4(),
      ...waypoint,
      createdAt: Date.now()
    });
    return this.waypoints;
  }

  removeWaypoint(id) {
    this.waypoints = this.waypoints.filter(w => w.id !== id);
    return this.waypoints;
  }

  getMapData() {
    return {
      celestialObjects: this.celestialObjects,
      hazardZones: this.hazardZones,
      tradeRoutes: this.tradeRoutes,
      waypoints: this.waypoints
    };
  }
}

module.exports = GalacticMapSimulator;
