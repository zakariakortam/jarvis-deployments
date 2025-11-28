// Comprehensive mock data generation for event operations

const ZONES = ['Main Entrance', 'VIP Area', 'General Admission', 'Food Court', 'Stage Area', 'Parking', 'Emergency Exit A', 'Emergency Exit B'];
const VENDORS = ['Food Truck Alpha', 'Beverage Stand', 'Merch Booth 1', 'Merch Booth 2', 'Photo Booth', 'Info Desk'];
const TICKET_TYPES = ['General', 'VIP', 'Early Bird', 'Group', 'Student', 'Staff'];
const SECURITY_LEVELS = ['low', 'medium', 'high', 'critical'];
const STAFF_ROLES = ['Security', 'Usher', 'Medical', 'Technical', 'Coordinator', 'Volunteer'];
const INCIDENT_TYPES = ['Medical', 'Security', 'Technical', 'Crowd Control', 'Lost & Found', 'Complaint'];

class MockDataGenerator {
  constructor() {
    this.eventStartTime = new Date();
    this.totalAttendees = 5000;
    this.checkedInCount = 3200;
    this.scanHistory = [];
    this.alerts = [];
    this.staffMembers = this.generateStaff();
    this.vendors = this.generateVendors();
  }

  // Generate realistic attendee flow data
  generateAttendeeFlow() {
    const currentHour = new Date().getHours();
    const peakHours = currentHour >= 18 && currentHour <= 21;

    return ZONES.map(zone => {
      const baseFlow = Math.floor(Math.random() * 100) + 50;
      const multiplier = peakHours ? 1.5 : 1.0;
      const capacity = zone.includes('VIP') ? 500 : 1000;
      const current = Math.floor(baseFlow * multiplier);
      const percentage = (current / capacity) * 100;

      return {
        zone,
        current,
        capacity,
        percentage: Math.min(percentage, 100),
        trend: Math.random() > 0.5 ? 'increasing' : 'decreasing',
        waitTime: Math.floor(Math.random() * 20),
        entryRate: Math.floor(Math.random() * 30) + 10,
        exitRate: Math.floor(Math.random() * 20) + 5
      };
    });
  }

  // Generate ticket scanning activity with timestamps
  generateTicketScans(count = 20) {
    const scans = [];
    const now = Date.now();

    for (let i = 0; i < count; i++) {
      const scan = {
        id: `SCAN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ticketId: `TKT-${Math.floor(Math.random() * 10000)}`,
        type: TICKET_TYPES[Math.floor(Math.random() * TICKET_TYPES.length)],
        zone: ZONES[Math.floor(Math.random() * ZONES.length)],
        timestamp: new Date(now - Math.random() * 3600000),
        status: Math.random() > 0.05 ? 'valid' : 'invalid',
        scannerDevice: `Device-${Math.floor(Math.random() * 10) + 1}`,
        attendeeName: this.generateName()
      };
      scans.push(scan);
    }

    return scans.sort((a, b) => b.timestamp - a.timestamp);
  }

  // Generate vendor sales data
  generateVendorSales() {
    return this.vendors.map(vendor => ({
      ...vendor,
      currentHourSales: Math.floor(Math.random() * 500) + 100,
      totalSales: Math.floor(Math.random() * 5000) + 1000,
      transactions: Math.floor(Math.random() * 100) + 20,
      averageTransaction: (Math.random() * 30 + 10).toFixed(2),
      topItem: this.getRandomMenuItem(vendor.category),
      performance: Math.random() > 0.5 ? 'above' : 'below'
    }));
  }

  generateVendors() {
    return VENDORS.map(name => ({
      id: `VND-${Math.random().toString(36).substr(2, 9)}`,
      name,
      category: this.getVendorCategory(name),
      status: Math.random() > 0.1 ? 'active' : 'offline',
      location: ZONES[Math.floor(Math.random() * ZONES.length)]
    }));
  }

  getVendorCategory(name) {
    if (name.includes('Food')) return 'food';
    if (name.includes('Beverage')) return 'beverage';
    if (name.includes('Merch')) return 'merchandise';
    return 'other';
  }

  getRandomMenuItem(category) {
    const items = {
      food: ['Burger Combo', 'Pizza Slice', 'Hot Dog', 'Nachos', 'Chicken Wings'],
      beverage: ['Soda', 'Water', 'Beer', 'Coffee', 'Energy Drink'],
      merchandise: ['T-Shirt', 'Hat', 'Poster', 'Sticker Pack', 'Tote Bag'],
      other: ['Service', 'Photo Print', 'Info Package']
    };
    const categoryItems = items[category] || items.other;
    return categoryItems[Math.floor(Math.random() * categoryItems.length)];
  }

  // Generate security monitoring data
  generateSecurityMonitoring() {
    const incidents = Math.floor(Math.random() * 3);

    return {
      overallStatus: incidents > 1 ? 'warning' : 'normal',
      activeIncidents: incidents,
      resolvedToday: Math.floor(Math.random() * 5) + 2,
      securityPersonnel: {
        onDuty: Math.floor(Math.random() * 20) + 30,
        available: Math.floor(Math.random() * 10) + 15,
        responding: Math.floor(Math.random() * 5)
      },
      cameras: {
        total: 48,
        operational: 47,
        alerts: Math.floor(Math.random() * 2)
      },
      zones: ZONES.map(zone => ({
        zone,
        status: this.getZoneSecurityStatus(),
        lastIncident: this.getRandomPastTime(),
        patrols: Math.floor(Math.random() * 3) + 1
      })),
      recentIncidents: this.generateIncidents(5)
    };
  }

  getZoneSecurityStatus() {
    const rand = Math.random();
    if (rand > 0.9) return 'critical';
    if (rand > 0.7) return 'warning';
    return 'normal';
  }

  generateIncidents(count) {
    return Array.from({ length: count }, (_, i) => ({
      id: `INC-${Date.now()}-${i}`,
      type: INCIDENT_TYPES[Math.floor(Math.random() * INCIDENT_TYPES.length)],
      severity: SECURITY_LEVELS[Math.floor(Math.random() * SECURITY_LEVELS.length)],
      location: ZONES[Math.floor(Math.random() * ZONES.length)],
      timestamp: new Date(Date.now() - Math.random() * 7200000),
      status: Math.random() > 0.3 ? 'resolved' : 'active',
      assignedTo: this.generateName(),
      description: 'Incident details and current status'
    }));
  }

  // Generate staff allocation data
  generateStaffAllocation() {
    return {
      total: 150,
      active: 142,
      onBreak: 8,
      byRole: STAFF_ROLES.map(role => ({
        role,
        assigned: Math.floor(Math.random() * 30) + 10,
        active: Math.floor(Math.random() * 25) + 8,
        required: Math.floor(Math.random() * 35) + 15
      })),
      byZone: ZONES.map(zone => ({
        zone,
        staff: this.getStaffForZone(),
        required: Math.floor(Math.random() * 10) + 5,
        status: Math.random() > 0.8 ? 'understaffed' : 'adequate'
      })),
      shifts: this.generateShiftData()
    };
  }

  generateStaff() {
    return Array.from({ length: 150 }, (_, i) => ({
      id: `STF-${i + 1}`,
      name: this.generateName(),
      role: STAFF_ROLES[Math.floor(Math.random() * STAFF_ROLES.length)],
      zone: ZONES[Math.floor(Math.random() * ZONES.length)],
      status: Math.random() > 0.1 ? 'active' : 'break',
      shiftStart: new Date(Date.now() - Math.random() * 14400000),
      shiftEnd: new Date(Date.now() + Math.random() * 14400000)
    }));
  }

  getStaffForZone() {
    return Array.from({ length: Math.floor(Math.random() * 5) + 2 }, () => ({
      id: `STF-${Math.floor(Math.random() * 150) + 1}`,
      name: this.generateName(),
      role: STAFF_ROLES[Math.floor(Math.random() * STAFF_ROLES.length)],
      status: Math.random() > 0.1 ? 'active' : 'break'
    }));
  }

  generateShiftData() {
    return [
      { shift: 'Morning', start: '08:00', end: '16:00', staff: 45 },
      { shift: 'Evening', start: '16:00', end: '00:00', staff: 80 },
      { shift: 'Night', start: '00:00', end: '08:00', staff: 25 }
    ];
  }

  // Generate crowd density heatmap
  generateCrowdDensity() {
    const grid = 8;
    const heatmap = [];

    for (let row = 0; row < grid; row++) {
      for (let col = 0; col < grid; col++) {
        const density = Math.random();
        let level, color;

        if (density < 0.3) {
          level = 'low';
          color = '#10b981';
        } else if (density < 0.6) {
          level = 'medium';
          color = '#f59e0b';
        } else if (density < 0.85) {
          level = 'high';
          color = '#f97316';
        } else {
          level = 'critical';
          color = '#ef4444';
        }

        heatmap.push({
          id: `cell-${row}-${col}`,
          row,
          col,
          density: (density * 100).toFixed(1),
          level,
          color,
          count: Math.floor(density * 200),
          zone: ZONES[Math.floor((row * grid + col) / (grid * grid / ZONES.length))]
        });
      }
    }

    return {
      grid: heatmap,
      timestamp: new Date(),
      totalOccupancy: Math.floor(Math.random() * 1000) + 3000,
      capacity: 5000,
      hotspots: this.identifyHotspots(heatmap)
    };
  }

  identifyHotspots(heatmap) {
    return heatmap
      .filter(cell => cell.level === 'critical' || cell.level === 'high')
      .map(cell => ({
        zone: cell.zone,
        density: cell.density,
        recommendation: 'Increase staff presence'
      }));
  }

  // Generate real-time alerts
  generateAlerts() {
    const alertTypes = [
      { type: 'capacity', message: 'VIP Area approaching capacity', severity: 'warning' },
      { type: 'security', message: 'Security incident resolved at Main Entrance', severity: 'info' },
      { type: 'medical', message: 'Medical team dispatched to Food Court', severity: 'high' },
      { type: 'technical', message: 'Sound system check completed', severity: 'info' },
      { type: 'crowd', message: 'High crowd density at Stage Area', severity: 'warning' }
    ];

    if (Math.random() > 0.7) {
      const alert = alertTypes[Math.floor(Math.random() * alertTypes.length)];
      return {
        id: `ALERT-${Date.now()}`,
        ...alert,
        timestamp: new Date(),
        acknowledged: false
      };
    }

    return null;
  }

  // Generate event statistics
  generateEventStats() {
    return {
      attendance: {
        expected: this.totalAttendees,
        checkedIn: this.checkedInCount,
        percentage: ((this.checkedInCount / this.totalAttendees) * 100).toFixed(1),
        rate: Math.floor(Math.random() * 50) + 20
      },
      tickets: {
        scanned: this.checkedInCount,
        remaining: this.totalAttendees - this.checkedInCount,
        invalid: Math.floor(Math.random() * 20) + 5,
        byType: TICKET_TYPES.map(type => ({
          type,
          count: Math.floor(Math.random() * 500) + 100,
          percentage: Math.floor(Math.random() * 30) + 10
        }))
      },
      revenue: {
        total: (Math.random() * 50000 + 100000).toFixed(2),
        vendors: (Math.random() * 30000 + 50000).toFixed(2),
        parking: (Math.random() * 5000 + 2000).toFixed(2),
        merchandise: (Math.random() * 15000 + 10000).toFixed(2)
      },
      operations: {
        incidents: Math.floor(Math.random() * 10) + 5,
        resolved: Math.floor(Math.random() * 8) + 3,
        averageResolution: Math.floor(Math.random() * 30) + 10,
        satisfaction: (Math.random() * 10 + 85).toFixed(1)
      }
    };
  }

  // Utility functions
  generateName() {
    const firstNames = ['John', 'Jane', 'Mike', 'Sarah', 'David', 'Emily', 'Chris', 'Anna', 'Tom', 'Lisa'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
    return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
  }

  getRandomPastTime() {
    const minutes = Math.floor(Math.random() * 120);
    return `${minutes} min ago`;
  }

  // Update counters for realistic progression
  incrementCheckins(count = 1) {
    this.checkedInCount = Math.min(this.checkedInCount + count, this.totalAttendees);
  }

  // Generate complete dashboard data snapshot
  generateDashboardSnapshot() {
    return {
      timestamp: new Date(),
      attendeeFlow: this.generateAttendeeFlow(),
      ticketScans: this.generateTicketScans(),
      vendorSales: this.generateVendorSales(),
      security: this.generateSecurityMonitoring(),
      staffAllocation: this.generateStaffAllocation(),
      crowdDensity: this.generateCrowdDensity(),
      stats: this.generateEventStats(),
      alerts: this.generateAlerts()
    };
  }
}

export default MockDataGenerator;
