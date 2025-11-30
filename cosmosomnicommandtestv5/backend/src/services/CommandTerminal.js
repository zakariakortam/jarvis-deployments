const { v4: uuidv4 } = require('uuid');

class CommandTerminal {
  constructor(fleetSimulator, galacticMapSimulator, engineeringSimulator, alertSimulator) {
    this.fleet = fleetSimulator;
    this.galacticMap = galacticMapSimulator;
    this.engineering = engineeringSimulator;
    this.alerts = alertSimulator;
    this.commandHistory = [];
    this.commandRegistry = this.initializeCommands();
  }

  initializeCommands() {
    return {
      help: {
        description: 'Display available commands',
        usage: 'help [command]',
        handler: this.cmdHelp.bind(this)
      },
      status: {
        description: 'Display system status overview',
        usage: 'status [system]',
        handler: this.cmdStatus.bind(this)
      },
      scan: {
        description: 'Perform sensor scan of specified target or sector',
        usage: 'scan <sector|target|anomaly>',
        handler: this.cmdScan.bind(this)
      },
      deploy: {
        description: 'Deploy probe or drone to specified coordinates',
        usage: 'deploy <probe|drone> <coordinates>',
        handler: this.cmdDeploy.bind(this)
      },
      reroute: {
        description: 'Reroute power between systems',
        usage: 'reroute power <from> <to> [amount]',
        handler: this.cmdReroute.bind(this)
      },
      inspect: {
        description: 'Detailed inspection of ship system',
        usage: 'inspect <hull|reactor|shields|engines>',
        handler: this.cmdInspect.bind(this)
      },
      diagnose: {
        description: 'Run diagnostic on specified system',
        usage: 'diagnose <system>',
        handler: this.cmdDiagnose.bind(this)
      },
      hail: {
        description: 'Open communications channel',
        usage: 'hail <target>',
        handler: this.cmdHail.bind(this)
      },
      navigate: {
        description: 'Set navigation waypoint or course',
        usage: 'navigate <to|waypoint|course> <destination>',
        handler: this.cmdNavigate.bind(this)
      },
      alert: {
        description: 'Manage alert status',
        usage: 'alert <status|acknowledge|resolve> [id]',
        handler: this.cmdAlert.bind(this)
      },
      fleet: {
        description: 'Fleet management commands',
        usage: 'fleet <status|ship|summary>',
        handler: this.cmdFleet.bind(this)
      },
      shields: {
        description: 'Shield control commands',
        usage: 'shields <up|down|modulate|status>',
        handler: this.cmdShields.bind(this)
      },
      weapons: {
        description: 'Weapons system commands',
        usage: 'weapons <arm|disarm|status|target>',
        handler: this.cmdWeapons.bind(this)
      },
      sensors: {
        description: 'Sensor array commands',
        usage: 'sensors <sweep|focus|calibrate|status>',
        handler: this.cmdSensors.bind(this)
      },
      comms: {
        description: 'Communications commands',
        usage: 'comms <scan|broadcast|encrypt|status>',
        handler: this.cmdComms.bind(this)
      },
      crew: {
        description: 'Crew status and assignments',
        usage: 'crew <status|assign|locate>',
        handler: this.cmdCrew.bind(this)
      },
      report: {
        description: 'Generate system reports',
        usage: 'report <tactical|engineering|medical|science>',
        handler: this.cmdReport.bind(this)
      },
      log: {
        description: 'Access ship logs',
        usage: 'log <view|search|add> [parameters]',
        handler: this.cmdLog.bind(this)
      },
      clear: {
        description: 'Clear terminal display',
        usage: 'clear',
        handler: this.cmdClear.bind(this)
      }
    };
  }

  execute(commandString) {
    const timestamp = Date.now();
    const parts = commandString.trim().toLowerCase().split(/\s+/);
    const command = parts[0];
    const args = parts.slice(1);

    const entry = {
      id: uuidv4(),
      timestamp,
      input: commandString,
      command,
      args,
      output: null,
      status: 'processing'
    };

    this.commandHistory.push(entry);

    // Simulate processing delay
    const processingTime = 100 + Math.random() * 400;

    return new Promise((resolve) => {
      setTimeout(() => {
        if (this.commandRegistry[command]) {
          try {
            entry.output = this.commandRegistry[command].handler(args);
            entry.status = 'success';
          } catch (error) {
            entry.output = this.formatError(`Command execution failed: ${error.message}`);
            entry.status = 'error';
          }
        } else {
          entry.output = this.formatError(`Unknown command: ${command}. Type 'help' for available commands.`);
          entry.status = 'error';
        }

        resolve(entry);
      }, processingTime);
    });
  }

  formatOutput(lines, type = 'info') {
    return {
      type,
      lines: Array.isArray(lines) ? lines : [lines],
      timestamp: Date.now()
    };
  }

  formatError(message) {
    return this.formatOutput([`ERROR: ${message}`], 'error');
  }

  formatSuccess(message) {
    return this.formatOutput([`SUCCESS: ${message}`], 'success');
  }

  formatWarning(message) {
    return this.formatOutput([`WARNING: ${message}`], 'warning');
  }

  // Command Handlers

  cmdHelp(args) {
    if (args.length > 0) {
      const cmd = this.commandRegistry[args[0]];
      if (cmd) {
        return this.formatOutput([
          `COMMAND: ${args[0].toUpperCase()}`,
          `Description: ${cmd.description}`,
          `Usage: ${cmd.usage}`,
          '',
          'For full command list, type: help'
        ]);
      }
      return this.formatError(`Unknown command: ${args[0]}`);
    }

    const lines = [
      '╔══════════════════════════════════════════════════════════════╗',
      '║           COSMOS OMNI-COMMAND TERMINAL v4.2.1                ║',
      '╚══════════════════════════════════════════════════════════════╝',
      '',
      'AVAILABLE COMMANDS:',
      ''
    ];

    Object.keys(this.commandRegistry).forEach(cmd => {
      lines.push(`  ${cmd.padEnd(12)} - ${this.commandRegistry[cmd].description}`);
    });

    lines.push('');
    lines.push('Type "help <command>" for detailed usage information.');

    return this.formatOutput(lines);
  }

  cmdStatus(args) {
    const system = args[0] || 'all';

    if (system === 'all') {
      const fleetSummary = this.fleet.getFleetSummary();
      const alertSummary = this.alerts.getSummary();
      const engineeringData = this.engineering.getEngineeringData();

      return this.formatOutput([
        '╔══════════════════════════════════════════════════════════════╗',
        '║                   SYSTEM STATUS OVERVIEW                     ║',
        '╚══════════════════════════════════════════════════════════════╝',
        '',
        '[ FLEET STATUS ]',
        `  Ships Operational: ${fleetSummary.operational}/${fleetSummary.totalShips}`,
        `  Ships in Caution: ${fleetSummary.caution}`,
        `  Ships on Alert: ${fleetSummary.alert}`,
        `  Average Fleet Hull: ${fleetSummary.averageHull.toFixed(1)}%`,
        `  Average Fleet Fuel: ${fleetSummary.averageFuel.toFixed(1)}%`,
        '',
        '[ ALERT STATUS ]',
        `  Active Alerts: ${alertSummary.totalAlerts}`,
        `  Unacknowledged: ${alertSummary.unacknowledged}`,
        `  Critical: ${alertSummary.critical}`,
        `  Active Anomalies: ${alertSummary.activeAnomalies}`,
        '',
        '[ POWER GRID ]',
        `  Generation: ${engineeringData.powerGrid.totalGeneration.toFixed(1)}%`,
        `  Consumption: ${engineeringData.powerGrid.totalConsumption.toFixed(1)} units`,
        `  Reserves: ${engineeringData.powerGrid.reserves.toFixed(1)}%`,
        '',
        'STATUS: NOMINAL'
      ]);
    }

    return this.formatOutput([`Status for system: ${system}`, 'Detailed status not implemented']);
  }

  cmdScan(args) {
    const target = args[0] || 'sector';

    const scanResults = [
      '╔══════════════════════════════════════════════════════════════╗',
      '║                    SENSOR SCAN RESULTS                       ║',
      '╚══════════════════════════════════════════════════════════════╝',
      '',
      `Scan Type: ${target.toUpperCase()}`,
      `Timestamp: ${new Date().toISOString()}`,
      ''
    ];

    if (target === 'sector') {
      const mapData = this.galacticMap.getMapData();
      const nearbyObjects = mapData.celestialObjects.slice(0, 5);

      scanResults.push('[ SECTOR SCAN ]');
      scanResults.push(`Objects Detected: ${mapData.celestialObjects.length}`);
      scanResults.push(`Hazard Zones: ${mapData.hazardZones.filter(h => h.active).length}`);
      scanResults.push(`Trade Routes: ${mapData.tradeRoutes.length}`);
      scanResults.push('');
      scanResults.push('NEAREST OBJECTS:');

      nearbyObjects.forEach(obj => {
        scanResults.push(`  - ${obj.name} (${obj.type})`);
      });
    } else if (target === 'anomaly') {
      const alertData = this.alerts.getAlertData();
      const anomalies = alertData.anomalies.filter(a => a.status === 'active');

      scanResults.push('[ ANOMALY SCAN ]');
      scanResults.push(`Active Anomalies: ${anomalies.length}`);
      scanResults.push('');

      anomalies.slice(0, 3).forEach(anomaly => {
        scanResults.push(`  ${anomaly.name}`);
        scanResults.push(`    Type: ${anomaly.type}`);
        scanResults.push(`    Danger Level: ${anomaly.dangerLevel}/10`);
        scanResults.push(`    Status: ${anomaly.status}`);
        scanResults.push('');
      });
    } else {
      scanResults.push(`Scanning target: ${target}`);
      scanResults.push('');
      scanResults.push('SCAN RESULTS:');
      scanResults.push(`  Signal Strength: ${(80 + Math.random() * 20).toFixed(1)}%`);
      scanResults.push(`  Interference: ${(Math.random() * 20).toFixed(1)}%`);
      scanResults.push(`  Data Quality: ${(85 + Math.random() * 15).toFixed(1)}%`);
      scanResults.push('');
      scanResults.push('No anomalous readings detected.');
    }

    scanResults.push('');
    scanResults.push('SCAN COMPLETE');

    return this.formatOutput(scanResults);
  }

  cmdDeploy(args) {
    const type = args[0] || 'probe';
    const coords = args.slice(1).join(' ') || 'current sector';

    return this.formatOutput([
      `DEPLOYMENT INITIATED`,
      '',
      `Type: ${type.toUpperCase()}`,
      `Target: ${coords}`,
      `Status: LAUNCHING`,
      '',
      `Deployment sequence initiated...`,
      `Trajectory calculated...`,
      `Launch successful.`,
      '',
      `${type.charAt(0).toUpperCase() + type.slice(1)} will reach target in approximately ${Math.floor(Math.random() * 60) + 10} minutes.`,
      '',
      'Telemetry link established.'
    ], 'success');
  }

  cmdReroute(args) {
    if (args[0] !== 'power' || args.length < 3) {
      return this.formatError('Usage: reroute power <from> <to> [amount]');
    }

    const from = args[1];
    const to = args[2];
    const amount = parseInt(args[3]) || 10;

    const result = this.engineering.reroutePower(from, to, amount);

    if (result.success) {
      return this.formatOutput([
        'POWER REROUTE SUCCESSFUL',
        '',
        `From: ${from.toUpperCase()}`,
        `To: ${to.toUpperCase()}`,
        `Amount: ${result.transferred}%`,
        '',
        `New ${from} allocation: ${result.from.newAllocation}%`,
        `New ${to} allocation: ${result.to.newAllocation}%`,
        '',
        'Power grid stabilized.'
      ], 'success');
    }

    return this.formatError(result.message || 'Power reroute failed');
  }

  cmdInspect(args) {
    const target = args[0] || 'hull';
    const engineeringData = this.engineering.getEngineeringData();

    const inspectResults = [
      `╔══════════════════════════════════════════════════════════════╗`,
      `║              ${target.toUpperCase().padStart(20).padEnd(40)}      ║`,
      `╚══════════════════════════════════════════════════════════════╝`,
      ''
    ];

    if (target === 'hull') {
      const ships = this.fleet.getAllShips();
      const avgHull = ships.reduce((sum, s) => sum + s.hull.integrity, 0) / ships.length;

      inspectResults.push('[ HULL INTEGRITY REPORT ]');
      inspectResults.push(`Average Fleet Hull: ${avgHull.toFixed(1)}%`);
      inspectResults.push('');
      inspectResults.push('SHIP STATUS:');

      ships.slice(0, 5).forEach(ship => {
        inspectResults.push(`  ${ship.name.padEnd(25)} ${ship.hull.integrity.toFixed(1)}%`);
      });
    } else if (target === 'reactor') {
      const reactor = engineeringData.subsystems.reactor;

      inspectResults.push('[ REACTOR CORE INSPECTION ]');
      inspectResults.push(`Output: ${reactor.output.current.toFixed(1)}%`);
      inspectResults.push(`Core Temperature: ${(reactor.temperature.core / 1000000).toFixed(2)}M K`);
      inspectResults.push(`Containment Field: ${reactor.containment.field.toFixed(1)}%`);
      inspectResults.push(`Efficiency: ${reactor.efficiency.toFixed(1)}%`);
      inspectResults.push('');
      inspectResults.push('FUEL STATUS:');
      inspectResults.push(`  Deuterium: ${reactor.fuel.deuterium.toFixed(1)}%`);
      inspectResults.push(`  Tritium: ${reactor.fuel.tritium.toFixed(1)}%`);
    } else if (target === 'shields') {
      const shields = engineeringData.subsystems.shields;

      inspectResults.push('[ SHIELD ARRAY INSPECTION ]');
      inspectResults.push(`Health: ${shields.health.toFixed(1)}%`);
      inspectResults.push(`Frequency: ${shields.frequency.toFixed(0)} Hz`);
      inspectResults.push('');
      inspectResults.push('SECTOR STATUS:');

      Object.keys(shields.sectors).forEach(sector => {
        inspectResults.push(`  ${sector.padEnd(12)} ${shields.sectors[sector].strength.toFixed(1)}%`);
      });
    } else {
      inspectResults.push(`Inspection data for ${target} not available.`);
    }

    return this.formatOutput(inspectResults);
  }

  cmdDiagnose(args) {
    const system = args[0] || 'all';

    if (!this.engineering.subsystems[system] && system !== 'all') {
      return this.formatError(`Unknown system: ${system}. Available: ${Object.keys(this.engineering.subsystems).join(', ')}`);
    }

    const diagnostic = this.engineering.runDiagnostic(system === 'all' ? 'reactor' : system);

    return this.formatOutput([
      'DIAGNOSTIC INITIATED',
      '',
      `System: ${system.toUpperCase()}`,
      `Diagnostic ID: ${diagnostic.id.slice(0, 8)}`,
      `Status: ${diagnostic.status.toUpperCase()}`,
      '',
      'Running comprehensive system analysis...',
      'Checking component integrity...',
      'Analyzing performance metrics...',
      '',
      'Diagnostic will complete in approximately 3-5 seconds.',
      'Results will be available in the diagnostics queue.'
    ]);
  }

  cmdHail(args) {
    const target = args.join(' ') || 'unknown';

    const responses = [
      'Channel open. Awaiting response...',
      'Hailing frequencies open.',
      'Subspace channel established.',
      'Attempting to establish contact...'
    ];

    const response = responses[Math.floor(Math.random() * responses.length)];

    return this.formatOutput([
      'COMMUNICATIONS',
      '',
      `Hailing: ${target.toUpperCase()}`,
      `Channel: ${Math.floor(Math.random() * 100) + 1}`,
      `Frequency: ${(47000 + Math.random() * 6000).toFixed(0)} Hz`,
      '',
      response,
      '',
      Math.random() > 0.5 ?
        'Response received. Translating...' :
        'No response. Target may be out of range or not monitoring.'
    ]);
  }

  cmdNavigate(args) {
    const action = args[0] || 'status';
    const destination = args.slice(1).join(' ');

    if (action === 'status') {
      return this.formatOutput([
        'NAVIGATION STATUS',
        '',
        'Current Position: Sector Alpha-VII',
        'Heading: 127.4 degrees',
        'Velocity: 0.75c',
        'ETA to next waypoint: 4h 23m',
        '',
        'Waypoints set: 3',
        'Autopilot: ENGAGED'
      ]);
    }

    if (action === 'to' && destination) {
      return this.formatOutput([
        'COURSE PLOTTED',
        '',
        `Destination: ${destination.toUpperCase()}`,
        `Distance: ${(Math.random() * 100).toFixed(2)} light years`,
        `Estimated Travel Time: ${Math.floor(Math.random() * 72) + 1}h ${Math.floor(Math.random() * 60)}m`,
        '',
        'Course laid in.',
        'Ready to engage on your command.'
      ], 'success');
    }

    return this.formatError('Usage: navigate <to|waypoint|course|status> [destination]');
  }

  cmdAlert(args) {
    const action = args[0] || 'status';
    const alertId = args[1];

    if (action === 'status') {
      const summary = this.alerts.getSummary();

      return this.formatOutput([
        'ALERT STATUS',
        '',
        `Total Alerts: ${summary.totalAlerts}`,
        `Unacknowledged: ${summary.unacknowledged}`,
        `Critical: ${summary.critical}`,
        `Warnings: ${summary.warnings}`,
        '',
        `Active Anomalies: ${summary.activeAnomalies}`,
        `High Danger: ${summary.highDangerAnomalies}`,
        '',
        'Type "alert acknowledge <id>" to acknowledge an alert.'
      ]);
    }

    if (action === 'acknowledge' && alertId) {
      if (this.alerts.acknowledgeAlert(alertId)) {
        return this.formatSuccess(`Alert ${alertId} acknowledged.`);
      }
      return this.formatError(`Alert ${alertId} not found.`);
    }

    if (action === 'resolve' && alertId) {
      if (this.alerts.resolveAlert(alertId)) {
        return this.formatSuccess(`Alert ${alertId} resolved.`);
      }
      return this.formatError(`Alert ${alertId} not found.`);
    }

    return this.formatError('Usage: alert <status|acknowledge|resolve> [id]');
  }

  cmdFleet(args) {
    const action = args[0] || 'status';

    if (action === 'status' || action === 'summary') {
      const summary = this.fleet.getFleetSummary();

      return this.formatOutput([
        '╔══════════════════════════════════════════════════════════════╗',
        '║                      FLEET STATUS                           ║',
        '╚══════════════════════════════════════════════════════════════╝',
        '',
        `Total Ships: ${summary.totalShips}`,
        `Operational: ${summary.operational}`,
        `Caution: ${summary.caution}`,
        `Alert: ${summary.alert}`,
        `Maintenance: ${summary.maintenance}`,
        '',
        `Total Crew: ${summary.totalCrew.toLocaleString()}`,
        `Average Fuel: ${summary.averageFuel.toFixed(1)}%`,
        `Average Hull: ${summary.averageHull.toFixed(1)}%`,
        '',
        'Fleet is combat ready.'
      ]);
    }

    if (action === 'ship') {
      const shipName = args.slice(1).join(' ');
      const ships = this.fleet.getAllShips();
      const ship = ships.find(s => s.name.toLowerCase().includes(shipName.toLowerCase()));

      if (ship) {
        return this.formatOutput([
          `SHIP: ${ship.name.toUpperCase()}`,
          `Class: ${ship.class}`,
          `Registry: ${ship.registry}`,
          `Status: ${ship.status.toUpperCase()}`,
          '',
          `Hull: ${ship.hull.integrity.toFixed(1)}%`,
          `Fuel: ${ship.fuel.current.toFixed(1)}%`,
          `Shields: Avg ${((ship.shields.fore + ship.shields.aft + ship.shields.port + ship.shields.starboard) / 4).toFixed(1)}%`,
          `Crew: ${ship.crew.total}`,
          '',
          `Mission: ${ship.mission.current}`,
          `Progress: ${ship.mission.progress.toFixed(1)}%`
        ]);
      }

      return this.formatError(`Ship "${shipName}" not found.`);
    }

    return this.formatOutput([
      'Available fleet commands:',
      '  fleet status  - Fleet overview',
      '  fleet ship <name> - Ship details'
    ]);
  }

  cmdShields(args) {
    const action = args[0] || 'status';
    const shields = this.engineering.subsystems.shields;

    if (action === 'status') {
      return this.formatOutput([
        'SHIELD STATUS',
        '',
        `Overall Health: ${shields.health.toFixed(1)}%`,
        `Frequency: ${shields.frequency.toFixed(0)} Hz`,
        `Recharge Rate: ${shields.rechargeRate.toFixed(1)} units/sec`,
        '',
        'SECTOR STRENGTH:',
        `  Fore:      ${shields.sectors.fore.strength.toFixed(1)}%`,
        `  Aft:       ${shields.sectors.aft.strength.toFixed(1)}%`,
        `  Port:      ${shields.sectors.port.strength.toFixed(1)}%`,
        `  Starboard: ${shields.sectors.starboard.strength.toFixed(1)}%`,
        `  Dorsal:    ${shields.sectors.dorsal.strength.toFixed(1)}%`,
        `  Ventral:   ${shields.sectors.ventral.strength.toFixed(1)}%`
      ]);
    }

    if (action === 'modulate') {
      shields.frequency = 47000 + Math.random() * 6000;
      return this.formatSuccess(`Shield frequency modulated to ${shields.frequency.toFixed(0)} Hz`);
    }

    return this.formatOutput(['shields up - Raise shields', 'shields down - Lower shields', 'shields modulate - Change frequency', 'shields status - Current status']);
  }

  cmdWeapons(args) {
    const action = args[0] || 'status';
    const weapons = this.engineering.subsystems.weapons;

    if (action === 'status') {
      return this.formatOutput([
        'WEAPONS STATUS',
        '',
        `System Health: ${weapons.health.toFixed(1)}%`,
        `Status: ${weapons.status.toUpperCase()}`,
        '',
        'PHASER BANKS:',
        `  Banks Online: ${weapons.phasers.online}/${weapons.phasers.banks}`,
        `  Power Level: ${weapons.phasers.power}%`,
        '',
        'TORPEDO SYSTEMS:',
        `  Tubes Loaded: ${weapons.torpedoes.loaded}/${weapons.torpedoes.tubes}`,
        `  Inventory: ${weapons.torpedoes.inventory}`,
        '',
        'TARGETING:',
        `  Status: ${weapons.targeting.status.toUpperCase()}`,
        `  Accuracy: ${weapons.targeting.accuracy.toFixed(1)}%`
      ]);
    }

    if (action === 'arm') {
      weapons.status = 'armed';
      return this.formatWarning('Weapons systems ARMED. Safety protocols engaged.');
    }

    if (action === 'disarm') {
      weapons.status = 'standby';
      return this.formatSuccess('Weapons systems standing down.');
    }

    return this.formatOutput(['weapons arm - Arm weapons', 'weapons disarm - Disarm', 'weapons status - Status', 'weapons target <id> - Lock target']);
  }

  cmdSensors(args) {
    const action = args[0] || 'status';
    const sensors = this.engineering.subsystems.sensors;

    if (action === 'status') {
      return this.formatOutput([
        'SENSOR ARRAY STATUS',
        '',
        `System Health: ${sensors.health.toFixed(1)}%`,
        `Interference: ${sensors.interference.toFixed(1)}%`,
        `Calibration: ${sensors.calibration.toFixed(1)}%`,
        '',
        'LONG RANGE:',
        `  Range: ${sensors.longRange.range.toFixed(1)} light years`,
        `  Resolution: ${sensors.longRange.resolution.toFixed(1)}%`,
        `  Active Scans: ${sensors.longRange.activeScans}`,
        '',
        'SHORT RANGE:',
        `  Range: ${sensors.shortRange.range.toFixed(0)} km`,
        `  Resolution: ${sensors.shortRange.resolution.toFixed(1)}%`
      ]);
    }

    if (action === 'calibrate') {
      sensors.calibration = 95 + Math.random() * 5;
      return this.formatSuccess(`Sensor calibration complete. New calibration: ${sensors.calibration.toFixed(1)}%`);
    }

    return this.formatOutput(['sensors sweep - Initiate sweep', 'sensors calibrate - Calibrate', 'sensors status - Status']);
  }

  cmdComms(args) {
    const action = args[0] || 'status';
    const comms = this.engineering.subsystems.communications;

    if (action === 'status') {
      return this.formatOutput([
        'COMMUNICATIONS STATUS',
        '',
        `System Health: ${comms.health.toFixed(1)}%`,
        `Antenna Alignment: ${comms.antennaAlignment.toFixed(2)}%`,
        '',
        'SUBSPACE:',
        `  Status: ${comms.subspace.status.toUpperCase()}`,
        `  Range: ${comms.subspace.range.toFixed(1)} light years`,
        `  Bandwidth: ${comms.subspace.bandwidth.toFixed(1)} TB/s`,
        `  Latency: ${comms.subspace.latency.toFixed(0)} ms`,
        '',
        'ENCRYPTION:',
        `  Level: ${comms.encryption.level}`,
        `  Status: ${comms.encryption.status.toUpperCase()}`
      ]);
    }

    if (action === 'scan') {
      return this.formatOutput([
        'COMMUNICATIONS SCAN',
        '',
        `Channels Active: ${comms.standard.channels}`,
        `Signals Detected: ${Math.floor(Math.random() * 20) + 5}`,
        `Unknown Sources: ${Math.floor(Math.random() * 3)}`,
        '',
        'Scan complete. No priority traffic detected.'
      ]);
    }

    return this.formatOutput(['comms scan - Scan frequencies', 'comms broadcast <msg> - Broadcast', 'comms status - Status']);
  }

  cmdCrew(args) {
    const action = args[0] || 'status';

    if (action === 'status') {
      const ships = this.fleet.getAllShips();
      const totalCrew = ships.reduce((sum, s) => sum + s.crew.total, 0);
      const avgMorale = ships.reduce((sum, s) => sum + s.crew.morale, 0) / ships.length;

      return this.formatOutput([
        'CREW STATUS',
        '',
        `Total Personnel: ${totalCrew.toLocaleString()}`,
        `Average Morale: ${avgMorale.toFixed(1)}%`,
        '',
        'DEPARTMENT BREAKDOWN:',
        '  Command: Ready',
        '  Engineering: Ready',
        '  Science: Ready',
        '  Medical: Ready',
        '  Security: Ready',
        '  Operations: Ready',
        '',
        'All departments reporting nominal.'
      ]);
    }

    return this.formatOutput(['crew status - Overview', 'crew assign <id> <ship> - Reassign', 'crew locate <name> - Find crew member']);
  }

  cmdReport(args) {
    const type = args[0] || 'tactical';

    const reports = {
      tactical: [
        '╔══════════════════════════════════════════════════════════════╗',
        '║                    TACTICAL REPORT                          ║',
        '╚══════════════════════════════════════════════════════════════╝',
        '',
        'THREAT ASSESSMENT: LOW',
        '',
        'No hostile contacts in sensor range.',
        'Fleet defense posture: Standard.',
        'Alert status: GREEN',
        '',
        'Patrol routes secure.',
        'No incursions detected in past 24 hours.'
      ],
      engineering: [
        '╔══════════════════════════════════════════════════════════════╗',
        '║                   ENGINEERING REPORT                        ║',
        '╚══════════════════════════════════════════════════════════════╝',
        '',
        'SYSTEM STATUS: NOMINAL',
        '',
        'Reactor output: Stable',
        'Power grid: Balanced',
        'Life support: Optimal',
        'Propulsion: Ready',
        '',
        'Scheduled maintenance: 3 items pending',
        'No critical repairs required.'
      ],
      medical: [
        '╔══════════════════════════════════════════════════════════════╗',
        '║                     MEDICAL REPORT                          ║',
        '╚══════════════════════════════════════════════════════════════╝',
        '',
        'CREW HEALTH: GOOD',
        '',
        'No disease outbreaks reported.',
        'Injury rate: Below average',
        'Psychological assessments: On schedule',
        '',
        'Medical supplies: Adequate',
        'Quarantine status: Clear'
      ],
      science: [
        '╔══════════════════════════════════════════════════════════════╗',
        '║                     SCIENCE REPORT                          ║',
        '╚══════════════════════════════════════════════════════════════╝',
        '',
        'RESEARCH STATUS: ACTIVE',
        '',
        'Ongoing experiments: 7',
        'Anomalies under study: 3',
        'Data collection: On schedule',
        '',
        'Notable findings: Stellar phenomenon at sector boundary.',
        'Recommendation: Extended observation.'
      ]
    };

    if (reports[type]) {
      return this.formatOutput(reports[type]);
    }

    return this.formatError(`Unknown report type: ${type}. Available: tactical, engineering, medical, science`);
  }

  cmdLog(args) {
    const action = args[0] || 'view';

    if (action === 'view') {
      return this.formatOutput([
        'RECENT LOG ENTRIES',
        '',
        ...this.commandHistory.slice(-10).map(entry =>
          `[${new Date(entry.timestamp).toISOString().slice(11, 19)}] ${entry.input}`
        ),
        '',
        `Total entries: ${this.commandHistory.length}`
      ]);
    }

    return this.formatOutput(['log view - View recent', 'log search <term> - Search logs', 'log add <entry> - Add entry']);
  }

  cmdClear() {
    return this.formatOutput(['TERMINAL CLEARED'], 'clear');
  }

  getHistory() {
    return this.commandHistory;
  }
}

module.exports = CommandTerminal;
