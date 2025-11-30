const { v4: uuidv4 } = require('uuid');

class EngineeringSimulator {
  constructor() {
    this.subsystems = this.initializeSubsystems();
    this.powerGrid = this.initializePowerGrid();
    this.diagnostics = [];
    this.maintenanceQueue = [];
  }

  initializeSubsystems() {
    return {
      reactor: {
        id: uuidv4(),
        name: 'Main Reactor Core',
        type: 'fusion',
        status: 'online',
        health: 85 + Math.random() * 15,
        output: {
          current: 80 + Math.random() * 20,
          max: 100,
          unit: '%'
        },
        temperature: {
          core: 15000000 + Math.random() * 5000000,
          containment: 800 + Math.random() * 200,
          coolant: 50 + Math.random() * 30
        },
        fuel: {
          deuterium: 70 + Math.random() * 30,
          tritium: 70 + Math.random() * 30,
          consumptionRate: 0.01 + Math.random() * 0.02
        },
        containment: {
          field: 95 + Math.random() * 5,
          integrity: 90 + Math.random() * 10,
          warnings: Math.floor(Math.random() * 3)
        },
        efficiency: 88 + Math.random() * 12,
        radiationLevel: Math.random() * 10,
        lastMaintenance: Date.now() - Math.random() * 2592000000,
        alerts: []
      },
      lifeSupport: {
        id: uuidv4(),
        name: 'Life Support Systems',
        status: 'online',
        health: 90 + Math.random() * 10,
        atmosphere: {
          oxygen: 20.5 + Math.random() * 1,
          nitrogen: 78 + Math.random() * 1,
          co2: 0.03 + Math.random() * 0.02,
          pressure: 101 + Math.random() * 2,
          humidity: 45 + Math.random() * 15
        },
        temperature: {
          average: 22 + Math.random() * 2,
          min: 18 + Math.random() * 2,
          max: 25 + Math.random() * 2
        },
        airRecyclers: {
          status: 'online',
          efficiency: 95 + Math.random() * 5,
          filterCondition: 60 + Math.random() * 40
        },
        waterRecyclers: {
          status: 'online',
          efficiency: 92 + Math.random() * 8,
          purityLevel: 99 + Math.random() * 1
        },
        powerDraw: 8 + Math.random() * 4,
        lastMaintenance: Date.now() - Math.random() * 1296000000,
        alerts: []
      },
      propulsion: {
        id: uuidv4(),
        name: 'Propulsion Systems',
        status: 'online',
        health: 85 + Math.random() * 15,
        mainEngines: {
          status: 'standby',
          thrust: 0,
          maxThrust: 100,
          efficiency: 90 + Math.random() * 10,
          temperature: 200 + Math.random() * 100
        },
        maneuvering: {
          status: 'online',
          responsiveness: 95 + Math.random() * 5,
          gimbalRange: 15
        },
        fuelPressure: 95 + Math.random() * 5,
        oxidizer: 80 + Math.random() * 20,
        injectorHealth: 85 + Math.random() * 15,
        nozzleCondition: 90 + Math.random() * 10,
        powerDraw: 5 + Math.random() * 10,
        lastMaintenance: Date.now() - Math.random() * 1728000000,
        alerts: []
      },
      shields: {
        id: uuidv4(),
        name: 'Shield Generator Array',
        status: 'online',
        health: 88 + Math.random() * 12,
        sectors: {
          fore: { strength: 80 + Math.random() * 20, status: 'online' },
          aft: { strength: 75 + Math.random() * 25, status: 'online' },
          port: { strength: 80 + Math.random() * 20, status: 'online' },
          starboard: { strength: 78 + Math.random() * 22, status: 'online' },
          dorsal: { strength: 82 + Math.random() * 18, status: 'online' },
          ventral: { strength: 80 + Math.random() * 20, status: 'online' }
        },
        frequency: 47235 + Math.random() * 1000,
        harmonics: 98 + Math.random() * 2,
        rechargeRate: 3 + Math.random() * 2,
        emitterHealth: 90 + Math.random() * 10,
        powerDraw: 15 + Math.random() * 10,
        lastMaintenance: Date.now() - Math.random() * 864000000,
        alerts: []
      },
      communications: {
        id: uuidv4(),
        name: 'Communications Array',
        status: 'online',
        health: 92 + Math.random() * 8,
        subspace: {
          status: 'online',
          range: 50 + Math.random() * 50,
          bandwidth: 80 + Math.random() * 20,
          latency: 50 + Math.random() * 100
        },
        standard: {
          status: 'online',
          range: 1000000 + Math.random() * 500000,
          channels: 128
        },
        encryption: {
          level: 5,
          status: 'active',
          keyRotation: Date.now() - Math.random() * 86400000
        },
        antennaAlignment: 99 + Math.random() * 1,
        signalProcessing: 95 + Math.random() * 5,
        powerDraw: 3 + Math.random() * 2,
        lastMaintenance: Date.now() - Math.random() * 604800000,
        alerts: []
      },
      sensors: {
        id: uuidv4(),
        name: 'Sensor Arrays',
        status: 'online',
        health: 90 + Math.random() * 10,
        longRange: {
          status: 'online',
          range: 15 + Math.random() * 10,
          resolution: 85 + Math.random() * 15,
          activeScans: Math.floor(Math.random() * 5)
        },
        shortRange: {
          status: 'online',
          range: 5000 + Math.random() * 2000,
          resolution: 98 + Math.random() * 2
        },
        navigational: {
          status: 'online',
          accuracy: 99 + Math.random() * 1
        },
        scientific: {
          status: 'online',
          sensitivity: 90 + Math.random() * 10
        },
        interference: Math.random() * 10,
        calibration: 95 + Math.random() * 5,
        powerDraw: 5 + Math.random() * 3,
        lastMaintenance: Date.now() - Math.random() * 432000000,
        alerts: []
      },
      navigation: {
        id: uuidv4(),
        name: 'Navigation Computer',
        status: 'online',
        health: 95 + Math.random() * 5,
        computer: {
          status: 'online',
          processingLoad: 30 + Math.random() * 40,
          memoryUsage: 45 + Math.random() * 30
        },
        gyroscopes: {
          status: 'online',
          drift: Math.random() * 0.001,
          calibration: 99.9 + Math.random() * 0.1
        },
        starTrackers: {
          status: 'online',
          accuracy: 99.99 + Math.random() * 0.01,
          starsTracked: 200 + Math.floor(Math.random() * 100)
        },
        inertialNav: {
          status: 'online',
          accuracy: 99.5 + Math.random() * 0.5
        },
        autopilot: {
          status: 'engaged',
          mode: 'cruise'
        },
        powerDraw: 2 + Math.random() * 1,
        lastMaintenance: Date.now() - Math.random() * 259200000,
        alerts: []
      },
      cooling: {
        id: uuidv4(),
        name: 'Thermal Management',
        status: 'online',
        health: 88 + Math.random() * 12,
        primaryLoop: {
          status: 'online',
          temperature: 35 + Math.random() * 10,
          flowRate: 90 + Math.random() * 10,
          pressure: 95 + Math.random() * 5
        },
        secondaryLoop: {
          status: 'online',
          temperature: 25 + Math.random() * 10,
          flowRate: 85 + Math.random() * 15
        },
        radiators: {
          deployment: 100,
          efficiency: 88 + Math.random() * 12,
          surfaceArea: 5000
        },
        heatExchangers: {
          status: 'online',
          efficiency: 92 + Math.random() * 8
        },
        coolantLevel: 90 + Math.random() * 10,
        powerDraw: 4 + Math.random() * 2,
        lastMaintenance: Date.now() - Math.random() * 1036800000,
        alerts: []
      },
      auxiliary: {
        id: uuidv4(),
        name: 'Auxiliary Power',
        status: 'standby',
        health: 95 + Math.random() * 5,
        batteries: {
          charge: 95 + Math.random() * 5,
          capacity: 100,
          cells: 24,
          degradation: Math.random() * 5
        },
        emergencyReactor: {
          status: 'standby',
          fuelLevel: 100,
          readiness: 'green'
        },
        solarPanels: {
          deployment: 0,
          output: 0,
          condition: 95 + Math.random() * 5
        },
        capacitors: {
          charge: 80 + Math.random() * 20,
          maxDischarge: 500
        },
        powerDraw: 1 + Math.random() * 0.5,
        lastMaintenance: Date.now() - Math.random() * 2592000000,
        alerts: []
      },
      weapons: {
        id: uuidv4(),
        name: 'Weapons Systems',
        status: 'standby',
        health: 90 + Math.random() * 10,
        phasers: {
          banks: 12,
          online: 12,
          power: 0,
          cooldown: 0
        },
        torpedoes: {
          tubes: 4,
          loaded: 4,
          inventory: 50 + Math.floor(Math.random() * 50)
        },
        targeting: {
          status: 'standby',
          accuracy: 95 + Math.random() * 5,
          lockTime: 2 + Math.random() * 1
        },
        pointDefense: {
          status: 'auto',
          coverage: 360,
          responsetime: 0.5 + Math.random() * 0.3
        },
        powerDraw: 0,
        lastMaintenance: Date.now() - Math.random() * 604800000,
        alerts: []
      }
    };
  }

  initializePowerGrid() {
    return {
      totalGeneration: 0,
      totalConsumption: 0,
      reserves: 85 + Math.random() * 15,
      distribution: {
        lifeSupport: { allocated: 15, priority: 1 },
        propulsion: { allocated: 25, priority: 2 },
        shields: { allocated: 20, priority: 3 },
        weapons: { allocated: 0, priority: 4 },
        sensors: { allocated: 10, priority: 5 },
        communications: { allocated: 5, priority: 6 },
        navigation: { allocated: 5, priority: 7 },
        cooling: { allocated: 10, priority: 8 },
        auxiliary: { allocated: 5, priority: 9 },
        general: { allocated: 5, priority: 10 }
      },
      efficiency: 92 + Math.random() * 8,
      conduitHealth: 95 + Math.random() * 5,
      alerts: []
    };
  }

  update() {
    // Update reactor
    this.subsystems.reactor.temperature.core += (Math.random() - 0.5) * 100000;
    this.subsystems.reactor.temperature.containment += (Math.random() - 0.5) * 20;
    this.subsystems.reactor.output.current += (Math.random() - 0.5) * 2;
    this.subsystems.reactor.output.current = Math.max(60, Math.min(100, this.subsystems.reactor.output.current));
    this.subsystems.reactor.containment.field += (Math.random() - 0.5) * 1;
    this.subsystems.reactor.containment.field = Math.max(85, Math.min(100, this.subsystems.reactor.containment.field));
    this.subsystems.reactor.fuel.deuterium -= this.subsystems.reactor.fuel.consumptionRate;
    this.subsystems.reactor.fuel.tritium -= this.subsystems.reactor.fuel.consumptionRate * 0.8;

    // Update life support
    this.subsystems.lifeSupport.atmosphere.oxygen += (Math.random() - 0.5) * 0.1;
    this.subsystems.lifeSupport.atmosphere.co2 += (Math.random() - 0.5) * 0.005;
    this.subsystems.lifeSupport.atmosphere.co2 = Math.max(0.02, Math.min(0.08, this.subsystems.lifeSupport.atmosphere.co2));
    this.subsystems.lifeSupport.temperature.average += (Math.random() - 0.5) * 0.2;
    this.subsystems.lifeSupport.airRecyclers.efficiency += (Math.random() - 0.5) * 0.5;

    // Update propulsion
    this.subsystems.propulsion.mainEngines.temperature += (Math.random() - 0.5) * 10;
    this.subsystems.propulsion.fuelPressure += (Math.random() - 0.5) * 1;
    this.subsystems.propulsion.fuelPressure = Math.max(80, Math.min(100, this.subsystems.propulsion.fuelPressure));

    // Update shields
    Object.keys(this.subsystems.shields.sectors).forEach(sector => {
      this.subsystems.shields.sectors[sector].strength += (Math.random() - 0.5) * 3;
      this.subsystems.shields.sectors[sector].strength = Math.max(50, Math.min(100, this.subsystems.shields.sectors[sector].strength));
    });
    this.subsystems.shields.frequency += (Math.random() - 0.5) * 10;

    // Update communications
    this.subsystems.communications.subspace.latency += (Math.random() - 0.5) * 10;
    this.subsystems.communications.subspace.latency = Math.max(20, Math.min(200, this.subsystems.communications.subspace.latency));
    this.subsystems.communications.antennaAlignment += (Math.random() - 0.5) * 0.1;

    // Update sensors
    this.subsystems.sensors.interference += (Math.random() - 0.5) * 2;
    this.subsystems.sensors.interference = Math.max(0, Math.min(30, this.subsystems.sensors.interference));
    this.subsystems.sensors.longRange.resolution += (Math.random() - 0.5) * 1;

    // Update navigation
    this.subsystems.navigation.computer.processingLoad += (Math.random() - 0.5) * 5;
    this.subsystems.navigation.computer.processingLoad = Math.max(20, Math.min(80, this.subsystems.navigation.computer.processingLoad));
    this.subsystems.navigation.gyroscopes.drift += (Math.random() - 0.5) * 0.0001;

    // Update cooling
    this.subsystems.cooling.primaryLoop.temperature += (Math.random() - 0.5) * 2;
    this.subsystems.cooling.primaryLoop.flowRate += (Math.random() - 0.5) * 2;
    this.subsystems.cooling.coolantLevel += (Math.random() - 0.5) * 0.5;
    this.subsystems.cooling.coolantLevel = Math.max(70, Math.min(100, this.subsystems.cooling.coolantLevel));

    // Update auxiliary
    this.subsystems.auxiliary.batteries.charge += (Math.random() - 0.5) * 0.5;
    this.subsystems.auxiliary.batteries.charge = Math.max(80, Math.min(100, this.subsystems.auxiliary.batteries.charge));
    this.subsystems.auxiliary.capacitors.charge += (Math.random() - 0.5) * 1;

    // Update health values
    Object.keys(this.subsystems).forEach(key => {
      this.subsystems[key].health += (Math.random() - 0.5) * 0.5;
      this.subsystems[key].health = Math.max(60, Math.min(100, this.subsystems[key].health));
    });

    // Update power grid
    this.powerGrid.totalGeneration = this.subsystems.reactor.output.current;
    this.powerGrid.totalConsumption = Object.values(this.subsystems).reduce((sum, sys) => sum + (sys.powerDraw || 0), 0);
    this.powerGrid.reserves += (this.powerGrid.totalGeneration - this.powerGrid.totalConsumption) * 0.01;
    this.powerGrid.reserves = Math.max(0, Math.min(100, this.powerGrid.reserves));

    // Generate random alerts
    this.generateAlerts();

    return {
      subsystems: this.subsystems,
      powerGrid: this.powerGrid,
      diagnostics: this.diagnostics.slice(-50),
      maintenanceQueue: this.maintenanceQueue
    };
  }

  generateAlerts() {
    // Check for conditions that warrant alerts
    if (this.subsystems.reactor.containment.field < 90 && Math.random() > 0.9) {
      this.addAlert('reactor', 'warning', 'Containment field fluctuation detected');
    }

    if (this.subsystems.lifeSupport.atmosphere.co2 > 0.06 && Math.random() > 0.95) {
      this.addAlert('lifeSupport', 'caution', 'CO2 levels elevated');
    }

    if (this.subsystems.cooling.coolantLevel < 80 && Math.random() > 0.9) {
      this.addAlert('cooling', 'warning', 'Coolant level below optimal');
    }

    if (this.subsystems.sensors.interference > 20 && Math.random() > 0.95) {
      this.addAlert('sensors', 'info', 'Sensor interference detected');
    }
  }

  addAlert(system, severity, message) {
    const alert = {
      id: uuidv4(),
      system,
      severity,
      message,
      timestamp: Date.now(),
      acknowledged: false
    };

    this.subsystems[system].alerts.push(alert);

    // Keep only recent alerts
    if (this.subsystems[system].alerts.length > 10) {
      this.subsystems[system].alerts = this.subsystems[system].alerts.slice(-10);
    }

    return alert;
  }

  runDiagnostic(system) {
    const diagnostic = {
      id: uuidv4(),
      system,
      startTime: Date.now(),
      status: 'running',
      progress: 0,
      results: null
    };

    this.diagnostics.push(diagnostic);

    // Simulate diagnostic completion
    setTimeout(() => {
      diagnostic.status = 'complete';
      diagnostic.progress = 100;
      diagnostic.results = this.generateDiagnosticResults(system);
      diagnostic.endTime = Date.now();
    }, 3000 + Math.random() * 2000);

    return diagnostic;
  }

  generateDiagnosticResults(system) {
    const subsystem = this.subsystems[system];
    if (!subsystem) return null;

    return {
      overallHealth: subsystem.health,
      componentsChecked: 15 + Math.floor(Math.random() * 10),
      issuesFound: Math.floor(Math.random() * 5),
      recommendations: this.generateRecommendations(system),
      performanceMetrics: {
        efficiency: 85 + Math.random() * 15,
        reliability: 90 + Math.random() * 10,
        degradation: Math.random() * 10
      }
    };
  }

  generateRecommendations(system) {
    const recommendations = {
      reactor: ['Schedule containment field calibration', 'Monitor fuel consumption rates', 'Verify radiation shielding'],
      lifeSupport: ['Replace air filters within 30 days', 'Calibrate atmospheric sensors', 'Check recycler efficiency'],
      propulsion: ['Inspect fuel injectors', 'Recalibrate thrust vectoring', 'Check nozzle erosion'],
      shields: ['Reharmonize shield frequency', 'Check emitter alignment', 'Test backup generators'],
      communications: ['Align antenna array', 'Update encryption protocols', 'Test emergency beacon'],
      sensors: ['Recalibrate long-range sensors', 'Clear interference filters', 'Update target database'],
      navigation: ['Sync star tracker database', 'Calibrate gyroscopes', 'Verify inertial navigation'],
      cooling: ['Flush coolant system', 'Check radiator deployment', 'Inspect heat exchangers'],
      auxiliary: ['Test battery cells', 'Verify emergency reactor startup', 'Check solar panel condition'],
      weapons: ['Verify targeting calibration', 'Check torpedo inventory', 'Test point defense response']
    };

    const systemRecs = recommendations[system] || ['General maintenance recommended'];
    return systemRecs.slice(0, 2 + Math.floor(Math.random() * 2));
  }

  reroutePower(from, to, amount) {
    if (this.powerGrid.distribution[from] && this.powerGrid.distribution[to]) {
      const available = this.powerGrid.distribution[from].allocated;
      const transfer = Math.min(amount, available);

      this.powerGrid.distribution[from].allocated -= transfer;
      this.powerGrid.distribution[to].allocated += transfer;

      return {
        success: true,
        transferred: transfer,
        from: { system: from, newAllocation: this.powerGrid.distribution[from].allocated },
        to: { system: to, newAllocation: this.powerGrid.distribution[to].allocated }
      };
    }
    return { success: false, message: 'Invalid systems specified' };
  }

  scheduleMaintenance(system, priority = 'normal') {
    const task = {
      id: uuidv4(),
      system,
      priority,
      scheduledTime: Date.now() + (priority === 'urgent' ? 3600000 : 86400000),
      status: 'scheduled',
      estimatedDuration: 30 + Math.floor(Math.random() * 90)
    };

    this.maintenanceQueue.push(task);
    this.maintenanceQueue.sort((a, b) => {
      const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    return task;
  }

  getEngineeringData() {
    return {
      subsystems: this.subsystems,
      powerGrid: this.powerGrid,
      diagnostics: this.diagnostics,
      maintenanceQueue: this.maintenanceQueue
    };
  }
}

module.exports = EngineeringSimulator;
