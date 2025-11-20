// Traffic Simulation Engine - Generates realistic traffic data for hundreds of sensors

class TrafficSimulation {
  constructor() {
    this.sensorCount = 300;
    this.vehicleCount = 1000;
    this.updateInterval = 2000; // 2 seconds
    this.sensors = [];
    this.vehicles = [];
    this.centerLat = 40.7128; // New York City
    this.centerLng = -74.0060;
    this.cityRadius = 0.15; // ~15km radius
  }

  // Initialize sensors across the city
  initializeSensors() {
    const sensors = [];
    const roadTypes = ['highway', 'arterial', 'collector', 'local'];
    const directions = ['N', 'S', 'E', 'W', 'NE', 'NW', 'SE', 'SW'];

    for (let i = 0; i < this.sensorCount; i++) {
      const angle = (Math.PI * 2 * i) / this.sensorCount;
      const radius = Math.random() * this.cityRadius;

      const lat = this.centerLat + radius * Math.cos(angle) + (Math.random() - 0.5) * 0.02;
      const lng = this.centerLng + radius * Math.sin(angle) + (Math.random() - 0.5) * 0.02;

      const roadType = roadTypes[Math.floor(Math.random() * roadTypes.length)];
      const baseSpeed = this.getBaseSpeedForRoadType(roadType);

      sensors.push({
        id: `sensor-${i}`,
        name: `Sensor ${i + 1}`,
        lat,
        lng,
        roadType,
        direction: directions[Math.floor(Math.random() * directions.length)],
        speedLimit: baseSpeed,
        currentSpeed: baseSpeed * (0.6 + Math.random() * 0.4),
        vehicleCount: Math.floor(Math.random() * 50),
        congestionLevel: Math.random(),
        emissions: Math.random() * 100,
        lastUpdate: new Date().toISOString(),
        status: 'active'
      });
    }

    this.sensors = sensors;
    return sensors;
  }

  // Get base speed based on road type
  getBaseSpeedForRoadType(roadType) {
    const speeds = {
      highway: 65,
      arterial: 45,
      collector: 35,
      local: 25
    };
    return speeds[roadType] || 35;
  }

  // Initialize vehicles
  initializeVehicles() {
    const vehicles = [];
    const vehicleTypes = ['car', 'truck', 'bus', 'motorcycle', 'emergency'];

    for (let i = 0; i < this.vehicleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * this.cityRadius;

      vehicles.push({
        id: `vehicle-${i}`,
        type: vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)],
        lat: this.centerLat + radius * Math.cos(angle),
        lng: this.centerLng + radius * Math.sin(angle),
        speed: 20 + Math.random() * 50,
        heading: Math.random() * 360,
        emissions: Math.random() * 10
      });
    }

    this.vehicles = vehicles;
    return vehicles;
  }

  // Update sensor data with realistic variations
  updateSensors() {
    const currentHour = new Date().getHours();
    const isRushHour = (currentHour >= 7 && currentHour <= 9) || (currentHour >= 16 && currentHour <= 19);
    const rushHourMultiplier = isRushHour ? 1.5 : 1.0;

    this.sensors = this.sensors.map(sensor => {
      // Simulate traffic variations
      const speedVariation = (Math.random() - 0.5) * 10;
      const congestionChange = (Math.random() - 0.5) * 0.2 * rushHourMultiplier;
      const vehicleChange = Math.floor((Math.random() - 0.5) * 10);

      const newSpeed = Math.max(5, Math.min(
        sensor.speedLimit,
        sensor.currentSpeed + speedVariation
      ));

      const newCongestion = Math.max(0, Math.min(1, sensor.congestionLevel + congestionChange));
      const newVehicleCount = Math.max(0, sensor.vehicleCount + vehicleChange);

      // Calculate emissions based on congestion and vehicle count
      const emissionsBase = newVehicleCount * (1 + newCongestion * 2);
      const emissions = emissionsBase * (0.8 + Math.random() * 0.4);

      return {
        ...sensor,
        currentSpeed: newSpeed,
        congestionLevel: newCongestion,
        vehicleCount: newVehicleCount,
        emissions: emissions,
        lastUpdate: new Date().toISOString()
      };
    });

    return this.sensors;
  }

  // Update vehicle positions
  updateVehicles() {
    this.vehicles = this.vehicles.map(vehicle => {
      // Move vehicle based on speed and heading
      const speedInDegrees = vehicle.speed * 0.00001; // Convert to lat/lng change
      const headingRad = (vehicle.heading * Math.PI) / 180;

      let newLat = vehicle.lat + speedInDegrees * Math.cos(headingRad);
      let newLng = vehicle.lng + speedInDegrees * Math.sin(headingRad);

      // Keep vehicles within city bounds
      const distance = Math.sqrt(
        Math.pow(newLat - this.centerLat, 2) + Math.pow(newLng - this.centerLng, 2)
      );

      if (distance > this.cityRadius) {
        // Bounce back towards center
        const headingChange = 150 + Math.random() * 60;
        return {
          ...vehicle,
          heading: (vehicle.heading + headingChange) % 360
        };
      }

      // Occasionally change direction
      const headingChange = Math.random() < 0.1 ? (Math.random() - 0.5) * 30 : 0;

      return {
        ...vehicle,
        lat: newLat,
        lng: newLng,
        heading: (vehicle.heading + headingChange + 360) % 360,
        speed: Math.max(10, Math.min(70, vehicle.speed + (Math.random() - 0.5) * 5))
      };
    });

    return this.vehicles;
  }

  // Generate traffic events
  generateEvents() {
    const events = [];
    const eventTypes = [
      { type: 'congestion', severity: 'warning', probability: 0.05 },
      { type: 'accident', severity: 'critical', probability: 0.01 },
      { type: 'roadwork', severity: 'info', probability: 0.02 },
      { type: 'speedLimit', severity: 'warning', probability: 0.03 },
      { type: 'emergency', severity: 'critical', probability: 0.005 }
    ];

    this.sensors.forEach(sensor => {
      eventTypes.forEach(eventType => {
        if (Math.random() < eventType.probability) {
          events.push({
            id: `event-${Date.now()}-${Math.random()}`,
            type: eventType.type,
            severity: eventType.severity,
            sensorId: sensor.id,
            sensorName: sensor.name,
            location: { lat: sensor.lat, lng: sensor.lng },
            description: this.getEventDescription(eventType.type, sensor),
            timestamp: new Date().toISOString()
          });
        }
      });
    });

    return events;
  }

  // Get event description
  getEventDescription(type, sensor) {
    const descriptions = {
      congestion: `Heavy traffic on ${sensor.roadType} road, speed reduced to ${Math.round(sensor.currentSpeed)} mph`,
      accident: `Vehicle accident reported, ${sensor.vehicleCount} vehicles affected`,
      roadwork: `Planned maintenance on ${sensor.roadType}, expect delays`,
      speedLimit: `Speed limit violation detected, current speed ${Math.round(sensor.currentSpeed)} mph`,
      emergency: `Emergency vehicle in area, clear the lane`
    };
    return descriptions[type] || 'Traffic event detected';
  }

  // Calculate aggregate statistics
  calculateStats() {
    const avgSpeed = this.sensors.reduce((sum, s) => sum + s.currentSpeed, 0) / this.sensors.length;
    const totalVehicles = this.sensors.reduce((sum, s) => sum + s.vehicleCount, 0);
    const avgCongestion = this.sensors.reduce((sum, s) => sum + s.congestionLevel, 0) / this.sensors.length;
    const totalEmissions = this.sensors.reduce((sum, s) => sum + s.emissions, 0);

    return {
      avgSpeed: Math.round(avgSpeed * 10) / 10,
      totalVehicles,
      avgCongestion: Math.round(avgCongestion * 100),
      totalEmissions: Math.round(totalEmissions),
      activeAlerts: this.sensors.filter(s => s.congestionLevel > 0.7).length
    };
  }

  // Generate alerts for critical conditions
  generateAlerts() {
    const alerts = [];

    this.sensors.forEach(sensor => {
      if (sensor.congestionLevel > 0.8) {
        alerts.push({
          id: `alert-${sensor.id}-${Date.now()}`,
          type: 'severe-congestion',
          severity: 'critical',
          sensorId: sensor.id,
          location: sensor.name,
          message: `Severe congestion detected: ${Math.round(sensor.congestionLevel * 100)}% capacity`,
          timestamp: new Date().toISOString()
        });
      }

      if (sensor.currentSpeed < sensor.speedLimit * 0.3 && sensor.vehicleCount > 30) {
        alerts.push({
          id: `alert-${sensor.id}-${Date.now()}-speed`,
          type: 'traffic-jam',
          severity: 'warning',
          sensorId: sensor.id,
          location: sensor.name,
          message: `Traffic jam: Speed dropped to ${Math.round(sensor.currentSpeed)} mph`,
          timestamp: new Date().toISOString()
        });
      }

      if (sensor.emissions > 80) {
        alerts.push({
          id: `alert-${sensor.id}-${Date.now()}-emissions`,
          type: 'high-emissions',
          severity: 'warning',
          sensorId: sensor.id,
          location: sensor.name,
          message: `High emissions detected: ${Math.round(sensor.emissions)} units`,
          timestamp: new Date().toISOString()
        });
      }
    });

    return alerts;
  }

  // Get sensor by ID
  getSensorById(id) {
    return this.sensors.find(s => s.id === id);
  }

  // Get sensors in bounds
  getSensorsInBounds(bounds) {
    return this.sensors.filter(sensor =>
      sensor.lat >= bounds.south &&
      sensor.lat <= bounds.north &&
      sensor.lng >= bounds.west &&
      sensor.lng <= bounds.east
    );
  }
}

export default TrafficSimulation;
