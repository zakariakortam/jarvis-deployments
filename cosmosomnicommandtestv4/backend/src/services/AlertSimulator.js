const { v4: uuidv4 } = require('uuid');

class AlertSimulator {
  constructor() {
    this.alerts = this.initializeAlerts();
    this.anomalies = this.initializeAnomalies();
    this.lastAlertTime = Date.now();
  }

  initializeAlerts() {
    const alerts = [];
    const alertTypes = this.getAlertTypes();

    // Generate some initial alerts
    for (let i = 0; i < 15; i++) {
      const type = alertTypes[Math.floor(Math.random() * alertTypes.length)];
      alerts.push(this.createAlert(type, Date.now() - Math.random() * 3600000));
    }

    return alerts.sort((a, b) => b.timestamp - a.timestamp);
  }

  initializeAnomalies() {
    const anomalies = [];
    const anomalyTypes = this.getAnomalyTypes();

    for (let i = 0; i < 8; i++) {
      const type = anomalyTypes[Math.floor(Math.random() * anomalyTypes.length)];
      anomalies.push(this.createAnomaly(type));
    }

    return anomalies;
  }

  getAlertTypes() {
    return [
      {
        category: 'navigation',
        severity: 'warning',
        titles: [
          'Course deviation detected',
          'Uncharted asteroid field ahead',
          'Gravitational anomaly in path',
          'Navigation beacon signal weak',
          'Collision warning system active'
        ]
      },
      {
        category: 'engineering',
        severity: 'caution',
        titles: [
          'Reactor output fluctuation',
          'Coolant pressure variance',
          'Shield generator harmonic drift',
          'Power grid imbalance detected',
          'Propulsion efficiency degraded'
        ]
      },
      {
        category: 'communications',
        severity: 'info',
        titles: [
          'Incoming transmission detected',
          'Subspace interference increasing',
          'Signal intercept logged',
          'Comm array calibration needed',
          'Encrypted message received'
        ]
      },
      {
        category: 'security',
        severity: 'alert',
        titles: [
          'Unknown vessel detected',
          'Unauthorized access attempt',
          'Perimeter breach warning',
          'Hostile signal identified',
          'Security protocol triggered'
        ]
      },
      {
        category: 'environmental',
        severity: 'warning',
        titles: [
          'Radiation levels elevated',
          'Solar flare activity detected',
          'Debris field proximity alert',
          'Ion storm approaching',
          'Cosmic ray burst detected'
        ]
      },
      {
        category: 'systems',
        severity: 'caution',
        titles: [
          'Sensor calibration drift',
          'Memory buffer approaching capacity',
          'Scheduled maintenance due',
          'Diagnostic check required',
          'System update available'
        ]
      },
      {
        category: 'tactical',
        severity: 'alert',
        titles: [
          'Weapons lock detected',
          'Threat assessment elevated',
          'Combat readiness check',
          'Defensive systems active',
          'Tactical situation changed'
        ]
      },
      {
        category: 'medical',
        severity: 'info',
        titles: [
          'Crew health variance logged',
          'Medical bay status update',
          'Quarantine protocol reminder',
          'Health screening due',
          'Medical supply alert'
        ]
      }
    ];
  }

  getAnomalyTypes() {
    return [
      {
        type: 'spatial',
        name: 'Spatial Distortion',
        descriptions: [
          'Localized space-time curvature detected',
          'Dimensional fold signature identified',
          'Gravity wave anomaly measured',
          'Subspace rupture forming'
        ],
        effects: ['navigation', 'sensors', 'communications'],
        dangerLevel: () => Math.floor(Math.random() * 5) + 3
      },
      {
        type: 'electromagnetic',
        name: 'EM Anomaly',
        descriptions: [
          'Electromagnetic pulse detected',
          'Ion storm activity increasing',
          'Magnetic field disruption',
          'Plasma discharge event'
        ],
        effects: ['shields', 'communications', 'sensors'],
        dangerLevel: () => Math.floor(Math.random() * 4) + 2
      },
      {
        type: 'radiation',
        name: 'Radiation Event',
        descriptions: [
          'Gamma ray burst detected',
          'Solar radiation spike',
          'Cosmic ray intensity elevated',
          'Neutron flux anomaly'
        ],
        effects: ['hull', 'crew', 'systems'],
        dangerLevel: () => Math.floor(Math.random() * 6) + 4
      },
      {
        type: 'gravitational',
        name: 'Gravity Anomaly',
        descriptions: [
          'Gravitational lens detected',
          'Mass shadow identified',
          'Tidal force variance',
          'Dark matter concentration'
        ],
        effects: ['navigation', 'propulsion', 'structure'],
        dangerLevel: () => Math.floor(Math.random() * 5) + 2
      },
      {
        type: 'temporal',
        name: 'Temporal Disturbance',
        descriptions: [
          'Chronometric fluctuation detected',
          'Time dilation field identified',
          'Temporal echo recorded',
          'Causality loop potential'
        ],
        effects: ['navigation', 'systems', 'crew'],
        dangerLevel: () => Math.floor(Math.random() * 3) + 7
      },
      {
        type: 'biological',
        name: 'Biological Anomaly',
        descriptions: [
          'Unknown organism detected',
          'Spore cloud identified',
          'Biological contamination risk',
          'Life form signature anomalous'
        ],
        effects: ['medical', 'environmental', 'crew'],
        dangerLevel: () => Math.floor(Math.random() * 5) + 3
      },
      {
        type: 'quantum',
        name: 'Quantum Event',
        descriptions: [
          'Quantum state collapse detected',
          'Probability wave disturbance',
          'Quantum entanglement signature',
          'Heisenberg uncertainty spike'
        ],
        effects: ['sensors', 'navigation', 'communications'],
        dangerLevel: () => Math.floor(Math.random() * 4) + 5
      },
      {
        type: 'unknown',
        name: 'Unknown Phenomenon',
        descriptions: [
          'Unclassified energy signature',
          'Anomalous readings detected',
          'Pattern not in database',
          'Origin undetermined'
        ],
        effects: ['all'],
        dangerLevel: () => Math.floor(Math.random() * 10) + 1
      }
    ];
  }

  createAlert(typeConfig, timestamp = Date.now()) {
    const title = typeConfig.titles[Math.floor(Math.random() * typeConfig.titles.length)];

    return {
      id: uuidv4(),
      category: typeConfig.category,
      severity: typeConfig.severity,
      title,
      description: this.generateAlertDescription(typeConfig.category),
      timestamp,
      acknowledged: Math.random() > 0.7,
      resolved: Math.random() > 0.8,
      affectedSystems: this.getAffectedSystems(typeConfig.category),
      source: this.getAlertSource(),
      actionRequired: typeConfig.severity === 'alert' || typeConfig.severity === 'warning',
      priority: this.getPriority(typeConfig.severity),
      relatedAlerts: [],
      log: this.generateAlertLog()
    };
  }

  createAnomaly(typeConfig) {
    const description = typeConfig.descriptions[Math.floor(Math.random() * typeConfig.descriptions.length)];

    return {
      id: uuidv4(),
      type: typeConfig.type,
      name: typeConfig.name,
      description,
      position: {
        x: (Math.random() - 0.5) * 2000,
        y: (Math.random() - 0.5) * 2000,
        z: (Math.random() - 0.5) * 500
      },
      radius: 50 + Math.random() * 200,
      dangerLevel: typeConfig.dangerLevel(),
      effects: typeConfig.effects,
      firstDetected: Date.now() - Math.random() * 86400000,
      lastUpdated: Date.now(),
      status: Math.random() > 0.3 ? 'active' : 'dormant',
      stability: Math.random(),
      readings: this.generateAnomalyReadings(typeConfig.type),
      studyProgress: Math.random() * 100,
      recommendations: this.generateAnomalyRecommendations(typeConfig.type)
    };
  }

  generateAlertDescription(category) {
    const descriptions = {
      navigation: 'Navigation systems have detected a potential hazard requiring attention.',
      engineering: 'Engineering telemetry indicates a condition requiring monitoring or intervention.',
      communications: 'Communications array has registered activity requiring acknowledgment.',
      security: 'Security protocols have identified a condition requiring immediate assessment.',
      environmental: 'Environmental sensors have detected conditions outside normal parameters.',
      systems: 'System monitoring has identified a maintenance or operational condition.',
      tactical: 'Tactical systems have detected a situation requiring command attention.',
      medical: 'Medical systems have logged a condition for review.'
    };

    return descriptions[category] || 'Alert condition detected.';
  }

  getAffectedSystems(category) {
    const systemsMap = {
      navigation: ['Navigation Computer', 'Sensors', 'Autopilot'],
      engineering: ['Reactor', 'Power Grid', 'Propulsion'],
      communications: ['Comm Array', 'Subspace Radio', 'Encryption'],
      security: ['Security Grid', 'Weapons', 'Shields'],
      environmental: ['Life Support', 'Hull Sensors', 'Radiation Shielding'],
      systems: ['Main Computer', 'Backup Systems', 'Diagnostics'],
      tactical: ['Targeting', 'Shields', 'Weapons'],
      medical: ['Medical Bay', 'Quarantine', 'Life Support']
    };

    const systems = systemsMap[category] || ['General Systems'];
    const count = 1 + Math.floor(Math.random() * systems.length);
    return systems.slice(0, count);
  }

  getAlertSource() {
    const sources = [
      'Automated Monitoring',
      'Sensor Array Alpha',
      'Engineering Watchstation',
      'Bridge Command',
      'Security Station',
      'Medical Bay',
      'Science Lab',
      'External Probe'
    ];
    return sources[Math.floor(Math.random() * sources.length)];
  }

  getPriority(severity) {
    const priorities = {
      alert: 1,
      warning: 2,
      caution: 3,
      info: 4
    };
    return priorities[severity] || 3;
  }

  generateAlertLog() {
    const log = [];
    const entries = 2 + Math.floor(Math.random() * 4);

    for (let i = 0; i < entries; i++) {
      log.push({
        timestamp: Date.now() - i * 60000 - Math.random() * 60000,
        entry: this.getLogEntry(),
        source: this.getLogSource()
      });
    }

    return log.sort((a, b) => a.timestamp - b.timestamp);
  }

  getLogEntry() {
    const entries = [
      'Condition first detected',
      'Automated response initiated',
      'Diagnostic scan completed',
      'Monitoring parameters adjusted',
      'Status update logged',
      'Assessment in progress',
      'Readings confirmed',
      'Threshold exceeded'
    ];
    return entries[Math.floor(Math.random() * entries.length)];
  }

  getLogSource() {
    const sources = ['SYSTEM', 'SENSOR', 'MANUAL', 'AUTO', 'BRIDGE'];
    return sources[Math.floor(Math.random() * sources.length)];
  }

  generateAnomalyReadings(type) {
    const readingsMap = {
      spatial: {
        curvature: (Math.random() * 10).toFixed(4),
        stability: (Math.random() * 100).toFixed(2),
        diameter: Math.floor(Math.random() * 500) + 50
      },
      electromagnetic: {
        frequency: Math.floor(Math.random() * 1000000),
        amplitude: (Math.random() * 100).toFixed(2),
        polarization: (Math.random() * 360).toFixed(1)
      },
      radiation: {
        intensity: (Math.random() * 1000).toFixed(2),
        type: ['gamma', 'x-ray', 'neutron', 'cosmic'][Math.floor(Math.random() * 4)],
        penetration: (Math.random() * 100).toFixed(2)
      },
      gravitational: {
        mass: (Math.random() * 100).toFixed(4),
        pull: (Math.random() * 10).toFixed(3),
        gradient: (Math.random() * 5).toFixed(4)
      },
      temporal: {
        dilation: (Math.random() * 2).toFixed(6),
        stability: (Math.random() * 100).toFixed(2),
        variance: (Math.random() * 0.1).toFixed(8)
      },
      biological: {
        biomass: Math.floor(Math.random() * 10000),
        activity: (Math.random() * 100).toFixed(2),
        classification: 'Unknown'
      },
      quantum: {
        coherence: (Math.random() * 100).toFixed(4),
        entanglement: Math.floor(Math.random() * 1000),
        superposition: (Math.random()).toFixed(6)
      },
      unknown: {
        energy: (Math.random() * 10000).toFixed(2),
        pattern: 'Unclassified',
        confidence: (Math.random() * 50).toFixed(2)
      }
    };

    return readingsMap[type] || readingsMap.unknown;
  }

  generateAnomalyRecommendations(type) {
    const recommendationsMap = {
      spatial: ['Maintain safe distance', 'Deploy sensor probes', 'Calculate alternative route'],
      electromagnetic: ['Adjust shield frequency', 'Reduce sensor sensitivity', 'Monitor crew exposure'],
      radiation: ['Activate radiation shielding', 'Limit exterior operations', 'Monitor crew health'],
      gravitational: ['Adjust course bearing', 'Calculate escape trajectory', 'Monitor structural stress'],
      temporal: ['Avoid direct contact', 'Synchronize chronometers', 'Document all observations'],
      biological: ['Maintain quarantine protocols', 'Deploy containment measures', 'Prepare medical response'],
      quantum: ['Minimize sensor interference', 'Record all data', 'Avoid direct interaction'],
      unknown: ['Proceed with caution', 'Gather more data', 'Report to command']
    };

    return recommendationsMap[type] || recommendationsMap.unknown;
  }

  update() {
    const now = Date.now();

    // Generate new alerts periodically
    if (now - this.lastAlertTime > 15000 && Math.random() > 0.5) {
      const alertTypes = this.getAlertTypes();
      const type = alertTypes[Math.floor(Math.random() * alertTypes.length)];
      const newAlert = this.createAlert(type);
      newAlert.isNew = true;

      this.alerts.unshift(newAlert);
      this.lastAlertTime = now;

      // Keep alerts list manageable
      if (this.alerts.length > 100) {
        this.alerts = this.alerts.slice(0, 100);
      }
    }

    // Update anomalies
    this.anomalies.forEach(anomaly => {
      anomaly.lastUpdated = now;
      anomaly.stability += (Math.random() - 0.5) * 0.1;
      anomaly.stability = Math.max(0, Math.min(1, anomaly.stability));

      if (Math.random() > 0.98) {
        anomaly.status = anomaly.status === 'active' ? 'dormant' : 'active';
      }

      anomaly.dangerLevel += Math.floor((Math.random() - 0.5) * 2);
      anomaly.dangerLevel = Math.max(1, Math.min(10, anomaly.dangerLevel));

      // Update readings
      Object.keys(anomaly.readings).forEach(key => {
        if (typeof anomaly.readings[key] === 'string' && !isNaN(parseFloat(anomaly.readings[key]))) {
          const value = parseFloat(anomaly.readings[key]);
          anomaly.readings[key] = (value + (Math.random() - 0.5) * value * 0.1).toFixed(
            anomaly.readings[key].includes('.') ? anomaly.readings[key].split('.')[1].length : 0
          );
        }
      });
    });

    // Occasionally add new anomalies
    if (Math.random() > 0.99) {
      const anomalyTypes = this.getAnomalyTypes();
      const type = anomalyTypes[Math.floor(Math.random() * anomalyTypes.length)];
      const newAnomaly = this.createAnomaly(type);
      newAnomaly.isNew = true;
      this.anomalies.push(newAnomaly);

      if (this.anomalies.length > 20) {
        this.anomalies = this.anomalies.slice(-20);
      }
    }

    return {
      alerts: this.alerts,
      anomalies: this.anomalies,
      summary: this.getSummary()
    };
  }

  getSummary() {
    return {
      totalAlerts: this.alerts.length,
      unacknowledged: this.alerts.filter(a => !a.acknowledged).length,
      critical: this.alerts.filter(a => a.severity === 'alert').length,
      warnings: this.alerts.filter(a => a.severity === 'warning').length,
      activeAnomalies: this.anomalies.filter(a => a.status === 'active').length,
      highDangerAnomalies: this.anomalies.filter(a => a.dangerLevel >= 7).length
    };
  }

  acknowledgeAlert(id) {
    const alert = this.alerts.find(a => a.id === id);
    if (alert) {
      alert.acknowledged = true;
      alert.acknowledgedAt = Date.now();
      return true;
    }
    return false;
  }

  resolveAlert(id) {
    const alert = this.alerts.find(a => a.id === id);
    if (alert) {
      alert.resolved = true;
      alert.resolvedAt = Date.now();
      return true;
    }
    return false;
  }

  getAlertData() {
    return {
      alerts: this.alerts,
      anomalies: this.anomalies
    };
  }
}

module.exports = AlertSimulator;
