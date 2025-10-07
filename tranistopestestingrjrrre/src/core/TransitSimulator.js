/**
 * Transit Simulation Engine
 * High-performance simulation of up to 10,000 transit vehicles
 * Supports trains, buses, and ride-share with realistic behavior
 */

/**
 * Efficient random number generator using seedable LCG
 */
class FastRandom {
  constructor(seed = Date.now()) {
    this.seed = seed % 2147483647;
  }

  next() {
    this.seed = (this.seed * 16807) % 2147483647;
    return (this.seed - 1) / 2147483646;
  }

  range(min, max) {
    return min + this.next() * (max - min);
  }

  choice(array) {
    return array[Math.floor(this.next() * array.length)];
  }
}

/**
 * Geographic coordinate generator for realistic routes
 */
class GeoGenerator {
  constructor(centerLat = 40.7128, centerLng = -74.0060) {
    this.centerLat = centerLat;
    this.centerLng = centerLng;
    this.random = new FastRandom();
  }

  generateRoute(length = 10, spread = 0.1) {
    const route = [];
    let lat = this.centerLat + this.random.range(-spread, spread);
    let lng = this.centerLng + this.random.range(-spread, spread);

    for (let i = 0; i < length; i++) {
      route.push({ lat, lng });
      lat += this.random.range(-0.01, 0.01);
      lng += this.random.range(-0.01, 0.01);
    }

    return route;
  }

  interpolate(point1, point2, fraction) {
    return {
      lat: point1.lat + (point2.lat - point1.lat) * fraction,
      lng: point1.lng + (point2.lng - point1.lng) * fraction
    };
  }

  distance(point1, point2) {
    const R = 6371; // Earth radius in km
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLng = (point2.lng - point1.lng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}

/**
 * Vehicle types configuration
 */
const VEHICLE_TYPES = {
  TRAIN: {
    type: 'train',
    capacity: { min: 200, max: 400 },
    speed: { min: 40, max: 80 }, // km/h
    routeLength: { min: 20, max: 40 },
    reliability: 0.95,
    maintenanceInterval: { min: 72, max: 168 }, // hours
    delayProbability: 0.05,
    maxDelay: 15 // minutes
  },
  BUS: {
    type: 'bus',
    capacity: { min: 40, max: 60 },
    speed: { min: 30, max: 60 },
    routeLength: { min: 10, max: 25 },
    reliability: 0.85,
    maintenanceInterval: { min: 48, max: 120 },
    delayProbability: 0.15,
    maxDelay: 30
  },
  RIDESHARE: {
    type: 'rideshare',
    capacity: { min: 1, max: 4 },
    speed: { min: 40, max: 100 },
    routeLength: { min: 2, max: 15 },
    reliability: 0.90,
    maintenanceInterval: { min: 24, max: 72 },
    delayProbability: 0.10,
    maxDelay: 20
  }
};

/**
 * Time-based ridership patterns
 */
class RidershipModel {
  constructor() {
    this.baseLoad = 0.5; // 50% average
  }

  getLoadFactor(hour) {
    // Morning rush: 7-9 AM
    if (hour >= 7 && hour <= 9) return 0.9 + Math.random() * 0.1;
    // Evening rush: 5-7 PM
    if (hour >= 17 && hour <= 19) return 0.85 + Math.random() * 0.15;
    // Midday: 10 AM - 4 PM
    if (hour >= 10 && hour <= 16) return 0.6 + Math.random() * 0.2;
    // Evening: 8 PM - 11 PM
    if (hour >= 20 && hour <= 23) return 0.4 + Math.random() * 0.2;
    // Late night/early morning: 12 AM - 6 AM
    return 0.2 + Math.random() * 0.1;
  }
}

/**
 * Individual vehicle instance
 */
class Vehicle {
  constructor(id, config, geoGen, ridershipModel) {
    this.id = id;
    this.type = config.type;
    this.config = config;
    this.geoGen = geoGen;
    this.ridershipModel = ridershipModel;
    this.random = new FastRandom(id);

    // Vehicle properties
    this.capacity = Math.floor(this.random.range(config.capacity.min, config.capacity.max));
    this.baseSpeed = this.random.range(config.speed.min, config.speed.max);
    this.speed = this.baseSpeed;

    // Route
    const routeLen = Math.floor(this.random.range(config.routeLength.min, config.routeLength.max));
    this.route = geoGen.generateRoute(routeLen);
    this.routeIndex = 0;
    this.routeProgress = 0;
    this.position = { ...this.route[0] };

    // Status
    this.status = 'active';
    this.passengers = 0;
    this.scheduleAdherence = 100; // percentage
    this.delayMinutes = 0;

    // Lifecycle
    this.lastMaintenanceTime = Date.now();
    this.nextMaintenanceHours = this.random.range(
      config.maintenanceInterval.min,
      config.maintenanceInterval.max
    );
    this.maintenanceUntil = null;

    // Metrics
    this.totalDistance = 0;
    this.totalPassengers = 0;
    this.tripCount = 0;
    this.delayEvents = 0;
    this.createdAt = Date.now();
  }

  update(deltaTime, currentHour) {
    if (this.status === 'maintenance') {
      if (Date.now() >= this.maintenanceUntil) {
        this.status = 'active';
        this.delayMinutes = 0;
        this.scheduleAdherence = 100;
        this.lastMaintenanceTime = Date.now();
        this.nextMaintenanceHours = this.random.range(
          this.config.maintenanceInterval.min,
          this.config.maintenanceInterval.max
        );
      }
      return;
    }

    // Check for maintenance
    const hoursSinceLastMaintenance = (Date.now() - this.lastMaintenanceTime) / (1000 * 60 * 60);
    if (hoursSinceLastMaintenance >= this.nextMaintenanceHours) {
      this.enterMaintenance();
      return;
    }

    // Random delay events
    if (this.status === 'active' && this.random.next() < this.config.delayProbability * deltaTime) {
      this.status = 'delayed';
      this.delayMinutes = this.random.range(1, this.config.maxDelay);
      this.scheduleAdherence = Math.max(0, 100 - (this.delayMinutes / this.config.maxDelay) * 50);
      this.delayEvents++;
    }

    // Recover from delays
    if (this.status === 'delayed') {
      this.delayMinutes = Math.max(0, this.delayMinutes - deltaTime * 5);
      if (this.delayMinutes <= 0) {
        this.status = 'active';
        this.scheduleAdherence = Math.min(100, this.scheduleAdherence + 10);
      }
    }

    // Update passengers based on time of day
    const loadFactor = this.ridershipModel.getLoadFactor(currentHour);
    const targetPassengers = Math.floor(this.capacity * loadFactor);

    if (this.passengers < targetPassengers) {
      this.passengers = Math.min(this.capacity, this.passengers + Math.ceil(this.random.range(1, 5)));
    } else if (this.passengers > targetPassengers) {
      this.passengers = Math.max(0, this.passengers - Math.ceil(this.random.range(1, 3)));
    }

    // Update speed based on status and type
    let speedMultiplier = 1;
    if (this.status === 'delayed') {
      speedMultiplier = 0.5;
    }

    // Trains are more consistent, ride-share more variable
    if (this.type === 'train') {
      speedMultiplier *= 0.95 + this.random.next() * 0.1;
    } else if (this.type === 'rideshare') {
      speedMultiplier *= 0.8 + this.random.next() * 0.4;
    } else {
      speedMultiplier *= 0.85 + this.random.next() * 0.3;
    }

    this.speed = this.baseSpeed * speedMultiplier;

    // Move along route
    const distanceThisUpdate = (this.speed / 3600) * deltaTime; // km
    this.totalDistance += distanceThisUpdate;

    // Calculate route progress
    const currentSegment = this.route[this.routeIndex];
    const nextSegment = this.route[(this.routeIndex + 1) % this.route.length];
    const segmentDistance = this.geoGen.distance(currentSegment, nextSegment);

    this.routeProgress += distanceThisUpdate / segmentDistance;

    while (this.routeProgress >= 1) {
      this.routeProgress -= 1;
      this.routeIndex = (this.routeIndex + 1) % this.route.length;

      // Completed a full route cycle
      if (this.routeIndex === 0) {
        this.tripCount++;
        this.totalPassengers += this.passengers;
        // Passengers disembark at end of route
        this.passengers = 0;
      }
    }

    // Update position
    const currentPoint = this.route[this.routeIndex];
    const nextPoint = this.route[(this.routeIndex + 1) % this.route.length];
    this.position = this.geoGen.interpolate(currentPoint, nextPoint, this.routeProgress);
  }

  enterMaintenance() {
    this.status = 'maintenance';
    // Maintenance takes 2-6 hours
    const maintenanceHours = this.random.range(2, 6);
    this.maintenanceUntil = Date.now() + maintenanceHours * 60 * 60 * 1000;
  }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      route: this.route,
      position: this.position,
      speed: Math.round(this.speed * 10) / 10,
      capacity: this.capacity,
      passengers: this.passengers,
      status: this.status,
      scheduleAdherence: Math.round(this.scheduleAdherence * 10) / 10,
      delayMinutes: Math.round(this.delayMinutes * 10) / 10
    };
  }
}

/**
 * Main Transit Simulator
 */
class TransitSimulator {
  constructor(options = {}) {
    this.options = {
      maxVehicles: options.maxVehicles || 10000,
      vehicleDistribution: options.vehicleDistribution || {
        train: 0.2,
        bus: 0.5,
        rideshare: 0.3
      },
      updateInterval: options.updateInterval || 1000, // ms
      centerLat: options.centerLat || 40.7128,
      centerLng: options.centerLng || -74.0060,
      spawnRate: options.spawnRate || 100 // vehicles per second
    };

    this.vehicles = new Map();
    this.geoGen = new GeoGenerator(this.options.centerLat, this.options.centerLng);
    this.ridershipModel = new RidershipModel();
    this.random = new FastRandom();

    this.isRunning = false;
    this.intervalId = null;
    this.lastUpdateTime = Date.now();
    this.nextVehicleId = 1;

    // Metrics
    this.metrics = {
      totalVehicles: 0,
      activeVehicles: 0,
      delayedVehicles: 0,
      maintenanceVehicles: 0,
      totalTrips: 0,
      totalPassengers: 0,
      totalDistance: 0,
      averageSpeed: 0,
      averageScheduleAdherence: 0,
      vehiclesByType: { train: 0, bus: 0, rideshare: 0 }
    };

    this.tripLogs = [];
    this.maxTripLogs = 1000;
  }

  /**
   * Start the simulation
   */
  start() {
    if (this.isRunning) {
      console.warn('Simulator is already running');
      return;
    }

    console.log(`Starting transit simulator with max ${this.options.maxVehicles} vehicles`);
    this.isRunning = true;
    this.lastUpdateTime = Date.now();

    // Initial spawn
    this.spawnInitialVehicles();

    // Start update loop
    this.intervalId = setInterval(() => {
      this.update();
    }, this.options.updateInterval);

    console.log('Simulator started successfully');
  }

  /**
   * Stop the simulation
   */
  stop() {
    if (!this.isRunning) {
      console.warn('Simulator is not running');
      return;
    }

    console.log('Stopping transit simulator');
    this.isRunning = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    console.log('Simulator stopped');
  }

  /**
   * Spawn initial vehicles
   */
  spawnInitialVehicles() {
    const targetVehicles = Math.min(this.options.maxVehicles, 1000); // Start with 1000
    console.log(`Spawning ${targetVehicles} initial vehicles`);

    for (let i = 0; i < targetVehicles; i++) {
      this.spawnVehicle();
    }

    console.log(`Spawned ${this.vehicles.size} vehicles`);
  }

  /**
   * Spawn a new vehicle
   */
  spawnVehicle() {
    if (this.vehicles.size >= this.options.maxVehicles) {
      return null;
    }

    const vehicleType = this.selectVehicleType();
    const config = VEHICLE_TYPES[vehicleType];
    const id = `${vehicleType.toLowerCase()}-${this.nextVehicleId++}`;

    const vehicle = new Vehicle(id, config, this.geoGen, this.ridershipModel);
    this.vehicles.set(id, vehicle);

    return vehicle;
  }

  /**
   * Select vehicle type based on distribution
   */
  selectVehicleType() {
    const rand = this.random.next();
    const dist = this.options.vehicleDistribution;

    if (rand < dist.train) {
      return 'TRAIN';
    } else if (rand < dist.train + dist.bus) {
      return 'BUS';
    } else {
      return 'RIDESHARE';
    }
  }

  /**
   * Main update loop
   */
  update() {
    const now = Date.now();
    const deltaTime = (now - this.lastUpdateTime) / 1000; // seconds
    this.lastUpdateTime = now;

    const currentHour = new Date().getHours();

    // Spawn new vehicles gradually
    if (this.vehicles.size < this.options.maxVehicles) {
      const vehiclesToSpawn = Math.min(
        Math.ceil(this.options.spawnRate * deltaTime),
        this.options.maxVehicles - this.vehicles.size
      );

      for (let i = 0; i < vehiclesToSpawn; i++) {
        this.spawnVehicle();
      }
    }

    // Update all vehicles
    let totalSpeed = 0;
    let totalAdherence = 0;
    const typeCount = { train: 0, bus: 0, rideshare: 0 };
    const statusCount = { active: 0, delayed: 0, maintenance: 0 };

    for (const vehicle of this.vehicles.values()) {
      vehicle.update(deltaTime, currentHour);

      totalSpeed += vehicle.speed;
      totalAdherence += vehicle.scheduleAdherence;
      typeCount[vehicle.type]++;
      statusCount[vehicle.status]++;
    }

    // Update metrics
    const vehicleCount = this.vehicles.size;
    this.metrics.totalVehicles = vehicleCount;
    this.metrics.activeVehicles = statusCount.active;
    this.metrics.delayedVehicles = statusCount.delayed;
    this.metrics.maintenanceVehicles = statusCount.maintenance;
    this.metrics.averageSpeed = vehicleCount > 0 ? totalSpeed / vehicleCount : 0;
    this.metrics.averageScheduleAdherence = vehicleCount > 0 ? totalAdherence / vehicleCount : 0;
    this.metrics.vehiclesByType = typeCount;

    // Aggregate trip and passenger data
    let totalTrips = 0;
    let totalPassengers = 0;
    let totalDistance = 0;

    for (const vehicle of this.vehicles.values()) {
      totalTrips += vehicle.tripCount;
      totalPassengers += vehicle.totalPassengers;
      totalDistance += vehicle.totalDistance;
    }

    this.metrics.totalTrips = totalTrips;
    this.metrics.totalPassengers = totalPassengers;
    this.metrics.totalDistance = totalDistance;

    // Log completed trips
    this.logTrips();

    // Periodic lifecycle management
    if (Math.random() < 0.01) { // 1% chance per update
      this.lifecycleManagement();
    }
  }

  /**
   * Log completed trips
   */
  logTrips() {
    for (const vehicle of this.vehicles.values()) {
      if (vehicle.tripCount > 0 && vehicle.routeIndex === 0 && vehicle.routeProgress < 0.1) {
        const log = {
          timestamp: Date.now(),
          vehicleId: vehicle.id,
          vehicleType: vehicle.type,
          passengers: vehicle.totalPassengers,
          distance: Math.round(vehicle.totalDistance * 10) / 10,
          trips: vehicle.tripCount,
          delayEvents: vehicle.delayEvents,
          averageAdherence: vehicle.scheduleAdherence
        };

        this.tripLogs.push(log);

        // Maintain log size
        if (this.tripLogs.length > this.maxTripLogs) {
          this.tripLogs.shift();
        }
      }
    }
  }

  /**
   * Lifecycle management - retire old vehicles, spawn new ones
   */
  lifecycleManagement() {
    // Remove vehicles that have been in maintenance too long (simulated retirement)
    const now = Date.now();
    const vehiclesToRemove = [];

    for (const [id, vehicle] of this.vehicles.entries()) {
      const age = (now - vehicle.createdAt) / (1000 * 60 * 60); // hours

      // Retire vehicles after 240 hours (10 days) with 5% probability
      if (age > 240 && this.random.next() < 0.05) {
        vehiclesToRemove.push(id);
      }
    }

    for (const id of vehiclesToRemove) {
      this.vehicles.delete(id);
    }
  }

  /**
   * Get all vehicles (optimized for large datasets)
   */
  getVehicles(filter = {}) {
    const result = [];
    const { type, status, limit = 1000 } = filter;

    let count = 0;
    for (const vehicle of this.vehicles.values()) {
      if (count >= limit) break;

      if (type && vehicle.type !== type) continue;
      if (status && vehicle.status !== status) continue;

      result.push(vehicle.toJSON());
      count++;
    }

    return result;
  }

  /**
   * Get current metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      timestamp: Date.now(),
      isRunning: this.isRunning,
      uptimeSeconds: (Date.now() - (this.lastUpdateTime - Date.now())) / 1000
    };
  }

  /**
   * Get trip logs
   */
  getTripLogs(limit = 100) {
    return this.tripLogs.slice(-limit);
  }

  /**
   * Get vehicle by ID
   */
  getVehicle(id) {
    const vehicle = this.vehicles.get(id);
    return vehicle ? vehicle.toJSON() : null;
  }

  /**
   * Get vehicles in geographic bounds
   */
  getVehiclesInBounds(bounds) {
    const { minLat, maxLat, minLng, maxLng } = bounds;
    const result = [];

    for (const vehicle of this.vehicles.values()) {
      const pos = vehicle.position;
      if (pos.lat >= minLat && pos.lat <= maxLat &&
          pos.lng >= minLng && pos.lng <= maxLng) {
        result.push(vehicle.toJSON());
      }
    }

    return result;
  }

  /**
   * Reset simulation
   */
  reset() {
    this.stop();
    this.vehicles.clear();
    this.nextVehicleId = 1;
    this.tripLogs = [];
    this.metrics = {
      totalVehicles: 0,
      activeVehicles: 0,
      delayedVehicles: 0,
      maintenanceVehicles: 0,
      totalTrips: 0,
      totalPassengers: 0,
      totalDistance: 0,
      averageSpeed: 0,
      averageScheduleAdherence: 0,
      vehiclesByType: { train: 0, bus: 0, rideshare: 0 }
    };
    console.log('Simulator reset');
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TransitSimulator, VEHICLE_TYPES };
}

// Export for browser
if (typeof window !== 'undefined') {
  window.TransitSimulator = TransitSimulator;
  window.VEHICLE_TYPES = VEHICLE_TYPES;
}
