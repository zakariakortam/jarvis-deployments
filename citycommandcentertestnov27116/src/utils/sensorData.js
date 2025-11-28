// Mock sensor data generation engine for city-scale operations

export const cityZones = [
  'Downtown', 'North District', 'South District', 'East District',
  'West District', 'Industrial Zone', 'Residential Area', 'Tech Park'
];

export const intersections = [
  { id: 'INT001', name: 'Main & 5th', zone: 'Downtown', lat: 40.7589, lng: -73.9851 },
  { id: 'INT002', name: 'Oak & Maple', zone: 'North District', lat: 40.7689, lng: -73.9751 },
  { id: 'INT003', name: 'Pine & Cedar', zone: 'South District', lat: 40.7489, lng: -73.9951 },
  { id: 'INT004', name: 'Elm & Birch', zone: 'East District', lat: 40.7589, lng: -73.9651 },
  { id: 'INT005', name: 'Willow & Ash', zone: 'West District', lat: 40.7589, lng: -74.0051 },
  { id: 'INT006', name: 'Tech Blvd & Innovation', zone: 'Tech Park', lat: 40.7789, lng: -73.9851 },
  { id: 'INT007', name: 'Factory & Industrial', zone: 'Industrial Zone', lat: 40.7389, lng: -73.9851 },
  { id: 'INT008', name: 'Residential & Park', zone: 'Residential Area', lat: 40.7589, lng: -74.0151 }
];

export const bridges = [
  { id: 'BR001', name: 'Central Bridge', type: 'Suspension', yearBuilt: 1985 },
  { id: 'BR002', name: 'North Bridge', type: 'Arch', yearBuilt: 1992 },
  { id: 'BR003', name: 'East River Bridge', type: 'Cable-stayed', yearBuilt: 2005 },
  { id: 'BR004', name: 'West Highway Bridge', type: 'Beam', yearBuilt: 1978 }
];

export const transitRoutes = [
  { id: 'BUS01', name: 'Express Downtown', type: 'Bus', capacity: 50 },
  { id: 'BUS02', name: 'North Loop', type: 'Bus', capacity: 45 },
  { id: 'RAIL01', name: 'Metro Line A', type: 'Rail', capacity: 200 },
  { id: 'RAIL02', name: 'Metro Line B', type: 'Rail', capacity: 200 },
  { id: 'TRAM01', name: 'City Tram', type: 'Tram', capacity: 80 }
];

// Random number generation utilities
const random = (min, max) => Math.random() * (max - min) + min;
const randomInt = (min, max) => Math.floor(random(min, max + 1));
const randomChoice = (arr) => arr[randomInt(0, arr.length - 1)];

// Traffic congestion levels
export const generateTrafficData = () => {
  return intersections.map(intersection => ({
    ...intersection,
    congestionLevel: random(0, 100),
    vehicleCount: randomInt(20, 200),
    averageSpeed: random(10, 60),
    waitTime: random(0, 120),
    signalStatus: randomChoice(['green', 'yellow', 'red']),
    timestamp: new Date().toISOString()
  }));
};

// Environmental sensors
export const generateEnvironmentalData = () => {
  return cityZones.map(zone => ({
    zone,
    airQuality: {
      aqi: randomInt(0, 200),
      pm25: random(0, 150),
      pm10: random(0, 250),
      co2: random(400, 1200),
      no2: random(0, 100),
      o3: random(0, 120),
      status: randomInt(0, 50) <= 30 ? 'Good' : randomInt(0, 100) <= 60 ? 'Moderate' : 'Unhealthy'
    },
    waterQuality: {
      ph: random(6.5, 8.5),
      turbidity: random(0, 5),
      dissolvedOxygen: random(5, 12),
      temperature: random(10, 25),
      contaminants: random(0, 10),
      status: randomInt(0, 100) <= 80 ? 'Safe' : 'Warning'
    },
    noise: {
      level: random(30, 90),
      peak: random(60, 110),
      average: random(40, 70),
      violations: randomInt(0, 5),
      status: random(30, 90) <= 65 ? 'Acceptable' : 'High'
    },
    timestamp: new Date().toISOString()
  }));
};

// Infrastructure health monitoring
export const generateInfrastructureData = () => {
  return bridges.map(bridge => ({
    ...bridge,
    health: {
      structuralIntegrity: random(70, 100),
      vibration: random(0, 5),
      stress: random(0, 100),
      corrosion: random(0, 30),
      temperature: random(-10, 40),
      strain: random(0, 50)
    },
    traffic: {
      vehicleCount: randomInt(100, 5000),
      heavyVehicles: randomInt(10, 500),
      averageWeight: random(1, 15)
    },
    alerts: randomInt(0, 100) > 85 ? ['Inspection Required'] : [],
    status: random(70, 100) >= 85 ? 'Good' : random(70, 100) >= 70 ? 'Fair' : 'Attention Needed',
    lastInspection: new Date(Date.now() - randomInt(1, 90) * 24 * 60 * 60 * 1000).toISOString(),
    nextInspection: new Date(Date.now() + randomInt(30, 180) * 24 * 60 * 60 * 1000).toISOString(),
    timestamp: new Date().toISOString()
  }));
};

// Utility consumption
export const generateUtilityData = () => {
  const hour = new Date().getHours();
  const peakMultiplier = (hour >= 6 && hour <= 9) || (hour >= 17 && hour <= 20) ? 1.5 : 1;

  return cityZones.map(zone => ({
    zone,
    power: {
      current: random(5, 50) * peakMultiplier,
      peak: random(40, 80),
      average: random(20, 40),
      cost: random(100, 500) * peakMultiplier,
      load: random(60, 95) * peakMultiplier,
      outages: randomInt(0, 2),
      renewable: random(10, 40)
    },
    gas: {
      consumption: random(1000, 8000),
      pressure: random(30, 60),
      leaks: randomInt(0, 1),
      cost: random(50, 300)
    },
    water: {
      consumption: random(5000, 30000),
      pressure: random(40, 80),
      quality: random(85, 100),
      leaks: randomInt(0, 3),
      cost: random(80, 400)
    },
    timestamp: new Date().toISOString()
  }));
};

// Public safety events
export const generateSafetyEvents = () => {
  const eventTypes = [
    { type: 'Fire', severity: 'High', icon: 'flame' },
    { type: 'Medical Emergency', severity: 'High', icon: 'heart-pulse' },
    { type: 'Traffic Accident', severity: 'Medium', icon: 'car-crash' },
    { type: 'Gas Leak', severity: 'High', icon: 'wind' },
    { type: 'Power Outage', severity: 'Medium', icon: 'zap-off' },
    { type: 'Water Main Break', severity: 'Medium', icon: 'droplet' },
    { type: 'Suspicious Activity', severity: 'Low', icon: 'eye' },
    { type: 'Weather Alert', severity: 'Medium', icon: 'cloud-rain' },
    { type: 'Structural Damage', severity: 'High', icon: 'building' },
    { type: 'Public Disturbance', severity: 'Low', icon: 'users' }
  ];

  const numEvents = randomInt(5, 15);
  const events = [];

  for (let i = 0; i < numEvents; i++) {
    const event = randomChoice(eventTypes);
    const minutesAgo = randomInt(1, 240);
    events.push({
      id: `EVT${Date.now()}-${i}`,
      ...event,
      location: randomChoice(cityZones),
      coordinates: {
        lat: random(40.73, 40.78),
        lng: random(-74.01, -73.96)
      },
      description: `${event.type} reported in ${randomChoice(cityZones)}`,
      timestamp: new Date(Date.now() - minutesAgo * 60 * 1000).toISOString(),
      status: randomChoice(['Active', 'Responding', 'Under Control', 'Resolved']),
      resources: {
        assigned: randomInt(1, 5),
        enRoute: randomInt(0, 3),
        onScene: randomInt(0, 4)
      },
      priority: event.severity === 'High' ? 1 : event.severity === 'Medium' ? 2 : 3
    });
  }

  return events.sort((a, b) => a.priority - b.priority);
};

// Waste management
export const generateWasteData = () => {
  const binTypes = ['General', 'Recycling', 'Organic', 'Hazardous'];
  const bins = [];

  cityZones.forEach(zone => {
    binTypes.forEach(type => {
      const numBins = randomInt(5, 15);
      for (let i = 0; i < numBins; i++) {
        bins.push({
          id: `BIN-${zone.substring(0, 3).toUpperCase()}-${type.substring(0, 3).toUpperCase()}-${i + 1}`,
          zone,
          type,
          fillLevel: random(0, 100),
          lastCollection: new Date(Date.now() - randomInt(1, 7) * 24 * 60 * 60 * 1000).toISOString(),
          nextCollection: new Date(Date.now() + randomInt(1, 3) * 24 * 60 * 60 * 1000).toISOString(),
          status: random(0, 100) > 90 ? 'Urgent' : random(0, 100) > 70 ? 'Scheduled' : 'Normal',
          coordinates: {
            lat: random(40.73, 40.78),
            lng: random(-74.01, -73.96)
          }
        });
      }
    });
  });

  return bins;
};

export const generateRouteData = () => {
  return cityZones.map((zone, idx) => ({
    id: `ROUTE-${idx + 1}`,
    zone,
    vehicleId: `WASTE-${idx + 1}`,
    progress: random(0, 100),
    binsCollected: randomInt(0, 50),
    binsRemaining: randomInt(0, 30),
    efficiency: random(70, 100),
    status: randomChoice(['In Progress', 'Scheduled', 'Completed', 'Delayed']),
    estimatedCompletion: new Date(Date.now() + randomInt(30, 180) * 60 * 1000).toISOString()
  }));
};

// Urban planning projections
export const generatePlanningData = () => {
  const currentYear = new Date().getFullYear();
  const projections = [];

  for (let year = 0; year <= 10; year++) {
    projections.push({
      year: currentYear + year,
      population: 1000000 + year * 15000 + randomInt(-5000, 5000),
      housing: 400000 + year * 5000 + randomInt(-2000, 2000),
      employment: 650000 + year * 8000 + randomInt(-3000, 3000),
      gdp: 50000 + year * 2000 + randomInt(-1000, 1000),
      infrastructure: 85 + year * 1.5 + random(-2, 2),
      sustainability: 60 + year * 2 + random(-1, 1),
      transportation: 70 + year * 1.8 + random(-2, 2)
    });
  }

  return projections;
};

export const generateZoneGrowth = () => {
  return cityZones.map(zone => ({
    zone,
    currentPopulation: randomInt(80000, 200000),
    growthRate: random(-2, 8),
    commercialDevelopment: random(0, 100),
    residentialDevelopment: random(0, 100),
    greenSpace: random(5, 40),
    transitAccess: random(40, 100),
    jobDensity: randomInt(100, 5000),
    housingAffordability: random(30, 90)
  }));
};

// Transit metrics
export const generateTransitMetrics = () => {
  return transitRoutes.map(route => ({
    ...route,
    currentOccupancy: randomInt(10, route.capacity),
    occupancyRate: random(20, 100),
    onTimePerformance: random(75, 98),
    averageDelay: random(0, 15),
    ridership: randomInt(1000, 10000),
    incidents: randomInt(0, 3),
    status: randomChoice(['On Time', 'Minor Delay', 'Delayed', 'Normal']),
    nextArrival: randomInt(2, 20),
    speed: random(20, 70),
    location: randomChoice(cityZones)
  }));
};

// Real-time data simulator
export class SensorDataSimulator {
  constructor() {
    this.listeners = [];
    this.interval = null;
  }

  subscribe(callback) {
    this.listeners.push(callback);
    callback(this.generateAllData());
  }

  unsubscribe(callback) {
    this.listeners = this.listeners.filter(cb => cb !== callback);
  }

  start(intervalMs = 5000) {
    if (this.interval) return;

    this.interval = setInterval(() => {
      const data = this.generateAllData();
      this.listeners.forEach(callback => callback(data));
    }, intervalMs);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  generateAllData() {
    return {
      traffic: generateTrafficData(),
      environment: generateEnvironmentalData(),
      infrastructure: generateInfrastructureData(),
      utilities: generateUtilityData(),
      safety: generateSafetyEvents(),
      waste: generateWasteData(),
      routes: generateRouteData(),
      planning: generatePlanningData(),
      zoneGrowth: generateZoneGrowth(),
      transit: generateTransitMetrics(),
      timestamp: new Date().toISOString()
    };
  }
}
