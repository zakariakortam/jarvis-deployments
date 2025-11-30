const { v4: uuidv4 } = require('uuid');

class MissionSimulator {
  constructor() {
    this.events = this.initializeEvents();
    this.timeline = this.initializeTimeline();
    this.lastEventTime = Date.now();
  }

  initializeEvents() {
    return [];
  }

  initializeTimeline() {
    const timeline = [];
    const now = Date.now();
    const eventTypes = [
      { type: 'maneuver', category: 'navigation', priority: 'medium' },
      { type: 'docking', category: 'operations', priority: 'high' },
      { type: 'maintenance', category: 'engineering', priority: 'low' },
      { type: 'communication', category: 'comms', priority: 'medium' },
      { type: 'reconnaissance', category: 'intelligence', priority: 'high' },
      { type: 'resupply', category: 'logistics', priority: 'medium' },
      { type: 'patrol', category: 'security', priority: 'low' },
      { type: 'scientific', category: 'research', priority: 'medium' },
      { type: 'diplomatic', category: 'operations', priority: 'critical' },
      { type: 'emergency', category: 'alert', priority: 'critical' }
    ];

    const eventDescriptions = {
      maneuver: [
        'Course correction burn scheduled',
        'Orbital insertion maneuver',
        'Evasive trajectory adjustment',
        'Formation realignment',
        'Hyperspace jump preparation'
      ],
      docking: [
        'Station docking procedure',
        'Supply ship rendezvous',
        'Shuttle bay operations',
        'Emergency evacuation docking',
        'Cargo transfer operation'
      ],
      maintenance: [
        'Reactor coolant flush',
        'Shield generator calibration',
        'Hull integrity inspection',
        'Navigation system update',
        'Life support filter replacement'
      ],
      communication: [
        'Subspace relay window',
        'Fleet command briefing',
        'Diplomatic channel open',
        'Intelligence data burst',
        'Emergency beacon check'
      ],
      reconnaissance: [
        'Sector survey mission',
        'Deep space probe deployment',
        'Signal intelligence gathering',
        'Anomaly investigation',
        'Unknown contact analysis'
      ],
      resupply: [
        'Fuel tanker arrival',
        'Ammunition restocking',
        'Food supply delivery',
        'Medical supplies transfer',
        'Spare parts acquisition'
      ],
      patrol: [
        'Perimeter security sweep',
        'Trade route monitoring',
        'Border patrol duty',
        'Convoy escort mission',
        'Anti-piracy operations'
      ],
      scientific: [
        'Stellar phenomenon observation',
        'Exoplanet atmosphere analysis',
        'Gravitational wave detection',
        'Quantum field experiment',
        'Biological sample collection'
      ],
      diplomatic: [
        'Ambassador transport',
        'Treaty negotiation support',
        'Neutral zone inspection',
        'First contact protocol',
        'Peace summit security'
      ],
      emergency: [
        'Distress signal response',
        'Search and rescue operation',
        'Collision avoidance alert',
        'Hostile contact detected',
        'System-wide emergency drill'
      ]
    };

    // Generate past events
    for (let i = 0; i < 30; i++) {
      const eventConfig = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      const descriptions = eventDescriptions[eventConfig.type];

      timeline.push({
        id: uuidv4(),
        type: eventConfig.type,
        category: eventConfig.category,
        priority: eventConfig.priority,
        title: descriptions[Math.floor(Math.random() * descriptions.length)],
        description: this.generateEventDescription(eventConfig.type),
        scheduledTime: now - (i * 3600000) - Math.random() * 3600000,
        status: 'completed',
        duration: 15 + Math.floor(Math.random() * 120),
        assignedShip: this.randomShipName(),
        personnel: Math.floor(Math.random() * 20) + 1,
        outcome: this.generateOutcome(),
        logs: this.generateEventLogs()
      });
    }

    // Generate future events
    for (let i = 0; i < 50; i++) {
      const eventConfig = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      const descriptions = eventDescriptions[eventConfig.type];

      timeline.push({
        id: uuidv4(),
        type: eventConfig.type,
        category: eventConfig.category,
        priority: eventConfig.priority,
        title: descriptions[Math.floor(Math.random() * descriptions.length)],
        description: this.generateEventDescription(eventConfig.type),
        scheduledTime: now + (i * 1800000) + Math.random() * 3600000,
        status: i === 0 ? 'in_progress' : 'scheduled',
        duration: 15 + Math.floor(Math.random() * 120),
        assignedShip: this.randomShipName(),
        personnel: Math.floor(Math.random() * 20) + 1,
        riskLevel: Math.floor(Math.random() * 10) + 1,
        requirements: this.generateRequirements(),
        contingencies: this.generateContingencies()
      });
    }

    return timeline.sort((a, b) => a.scheduledTime - b.scheduledTime);
  }

  randomShipName() {
    const ships = [
      'Aurora Prime', 'Vanguard X9', 'Nova Sentinel', 'Celestial Harbor',
      'Starlight Courier', "Orion's Eye", 'Hyperion Arc', 'Specter Shadow',
      'Astra Delta Laboratory', 'Polaris Gateway'
    ];
    return ships[Math.floor(Math.random() * ships.length)];
  }

  generateEventDescription(type) {
    const descriptions = {
      maneuver: 'Execute precision thruster burns to adjust vessel trajectory according to mission parameters.',
      docking: 'Coordinate approach vectors and establish hard seal with target structure for personnel and cargo transfer.',
      maintenance: 'Perform scheduled preventive maintenance on critical ship systems to ensure operational readiness.',
      communication: 'Establish secure communication link with designated contacts for data exchange and coordination.',
      reconnaissance: 'Deploy sensor arrays and conduct systematic survey of designated area for intelligence gathering.',
      resupply: 'Coordinate logistics operation for transfer of essential supplies and materials.',
      patrol: 'Maintain vigilant presence in assigned sector to ensure security and deter hostile activity.',
      scientific: 'Conduct scientific observations and experiments according to research protocol.',
      diplomatic: 'Provide security and support for diplomatic personnel and sensitive negotiations.',
      emergency: 'Execute emergency response protocols to address critical situation.'
    };
    return descriptions[type] || 'Standard operational procedure in effect.';
  }

  generateOutcome() {
    const outcomes = [
      { status: 'success', notes: 'All objectives achieved within parameters' },
      { status: 'success', notes: 'Mission completed ahead of schedule' },
      { status: 'partial', notes: 'Primary objectives met, secondary objectives deferred' },
      { status: 'success', notes: 'Nominal operation, no anomalies detected' },
      { status: 'delayed', notes: 'Minor complications resolved, completed with delay' }
    ];
    return outcomes[Math.floor(Math.random() * outcomes.length)];
  }

  generateEventLogs() {
    const logs = [];
    const count = 3 + Math.floor(Math.random() * 5);

    for (let i = 0; i < count; i++) {
      logs.push({
        timestamp: Date.now() - Math.random() * 3600000,
        entry: this.randomLogEntry(),
        author: this.randomCrewName(),
        classification: Math.random() > 0.8 ? 'classified' : 'standard'
      });
    }

    return logs.sort((a, b) => a.timestamp - b.timestamp);
  }

  randomLogEntry() {
    const entries = [
      'Systems check complete, all nominal',
      'Coordinates confirmed, proceeding to waypoint',
      'Contact established with command',
      'Sensor sweep initiated',
      'All personnel in position',
      'Phase one complete, beginning phase two',
      'Minor adjustment required, correcting',
      'Target acquired, maintaining observation',
      'Status report transmitted',
      'Operation proceeding as planned'
    ];
    return entries[Math.floor(Math.random() * entries.length)];
  }

  randomCrewName() {
    const firstNames = ['James', 'Sarah', 'Michael', 'Elena', 'David', 'Anna', 'Robert', 'Lisa', 'William', 'Maria'];
    const lastNames = ['Chen', 'Rodriguez', 'Kim', 'Patel', 'Johnson', 'Williams', 'Brown', 'Garcia', 'Miller', 'Davis'];
    const ranks = ['Lt.', 'Cmdr.', 'Ens.', 'Cpt.', 'Lt. Cmdr.'];
    return `${ranks[Math.floor(Math.random() * ranks.length)]} ${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
  }

  generateRequirements() {
    const requirements = [
      'Minimum shield strength: 80%',
      'Full sensor array operational',
      'Navigation systems calibrated',
      'Communication relay established',
      'Emergency protocols reviewed',
      'Medical staff on standby',
      'Engineering team allocated',
      'Security clearance verified'
    ];

    const count = 2 + Math.floor(Math.random() * 4);
    return requirements.slice(0, count);
  }

  generateContingencies() {
    const contingencies = [
      { trigger: 'Hostile contact', response: 'Initiate defensive protocols' },
      { trigger: 'System failure', response: 'Switch to backup systems' },
      { trigger: 'Communication loss', response: 'Execute autonomous procedures' },
      { trigger: 'Personnel casualty', response: 'Activate medical emergency' },
      { trigger: 'Mission abort', response: 'Return to rally point' }
    ];

    const count = 1 + Math.floor(Math.random() * 3);
    return contingencies.slice(0, count);
  }

  update() {
    const now = Date.now();

    // Update event statuses
    this.timeline.forEach(event => {
      if (event.status === 'scheduled' && event.scheduledTime <= now) {
        event.status = 'in_progress';
      }

      if (event.status === 'in_progress' && event.scheduledTime + event.duration * 60000 <= now) {
        event.status = 'completed';
        event.outcome = this.generateOutcome();
        event.logs = this.generateEventLogs();
      }
    });

    // Generate new random events occasionally
    if (now - this.lastEventTime > 30000 && Math.random() > 0.7) {
      this.generateNewEvent();
      this.lastEventTime = now;
    }

    return {
      timeline: this.timeline,
      currentEvents: this.timeline.filter(e => e.status === 'in_progress'),
      upcomingEvents: this.timeline.filter(e => e.status === 'scheduled').slice(0, 10),
      recentEvents: this.timeline.filter(e => e.status === 'completed').slice(-10)
    };
  }

  generateNewEvent() {
    const eventTypes = ['anomaly_detected', 'signal_intercept', 'system_alert', 'contact_report'];
    const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];

    const newEvent = {
      id: uuidv4(),
      type,
      category: 'alert',
      priority: Math.random() > 0.5 ? 'high' : 'medium',
      title: this.getEventTitle(type),
      description: this.getEventFullDescription(type),
      scheduledTime: Date.now(),
      status: 'in_progress',
      duration: 5 + Math.floor(Math.random() * 30),
      assignedShip: this.randomShipName(),
      personnel: Math.floor(Math.random() * 10) + 1,
      riskLevel: Math.floor(Math.random() * 10) + 1,
      isNew: true
    };

    this.timeline.push(newEvent);
    this.events.push({
      ...newEvent,
      timestamp: Date.now()
    });

    // Keep events list manageable
    if (this.events.length > 100) {
      this.events = this.events.slice(-100);
    }

    return newEvent;
  }

  getEventTitle(type) {
    const titles = {
      anomaly_detected: 'Spatial Anomaly Detected',
      signal_intercept: 'Unknown Signal Intercepted',
      system_alert: 'System Status Alert',
      contact_report: 'New Contact Report'
    };
    return titles[type] || 'New Event';
  }

  getEventFullDescription(type) {
    const descriptions = {
      anomaly_detected: 'Sensors have detected an unusual spatial distortion requiring analysis.',
      signal_intercept: 'Communications array has intercepted an unidentified transmission.',
      system_alert: 'Automated monitoring systems have flagged a condition requiring attention.',
      contact_report: 'Sensor sweep has identified a new contact in the operational area.'
    };
    return descriptions[type] || 'Event details pending analysis.';
  }

  getEvent(id) {
    return this.timeline.find(e => e.id === id);
  }

  getTimelineData() {
    return {
      timeline: this.timeline,
      events: this.events
    };
  }
}

module.exports = MissionSimulator;
