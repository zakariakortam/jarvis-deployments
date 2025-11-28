import { format, subDays, addDays, startOfMonth, endOfMonth } from 'date-fns';

class DataSimulator {
  constructor() {
    this.buildings = this.generateBuildings(12);
    this.updateInterval = null;
  }

  generateBuildings(count) {
    const buildingTypes = ['Office', 'Retail', 'Residential', 'Mixed-Use', 'Industrial'];
    const locations = ['Downtown', 'Midtown', 'Uptown', 'Waterfront', 'Suburban', 'Tech District'];

    return Array.from({ length: count }, (_, i) => ({
      id: `BLD-${String(i + 1).padStart(3, '0')}`,
      name: `${locations[i % locations.length]} ${buildingTypes[i % buildingTypes.length]} Tower`,
      type: buildingTypes[i % buildingTypes.length],
      location: locations[i % locations.length],
      totalFloors: 15 + Math.floor(Math.random() * 35),
      totalArea: 50000 + Math.floor(Math.random() * 200000),
      yearBuilt: 1990 + Math.floor(Math.random() * 34),
      occupancyRate: 75 + Math.random() * 20,
      baseEnergyUsage: 50000 + Math.random() * 100000,
      baseMaintCost: 10000 + Math.random() * 50000,
      investmentValue: 5000000 + Math.random() * 45000000,
      tenantCount: 10 + Math.floor(Math.random() * 90)
    }));
  }

  getBuildings() {
    return this.buildings;
  }

  generateOccupancyData(buildingId) {
    const building = this.buildings.find(b => b.id === buildingId);
    const months = 12;
    const data = [];

    for (let i = months - 1; i >= 0; i--) {
      const date = subDays(new Date(), i * 30);
      const variance = (Math.random() - 0.5) * 10;
      data.push({
        date: format(date, 'MMM yyyy'),
        occupancy: Math.max(60, Math.min(100, building.occupancyRate + variance)),
        leased: Math.floor(building.totalArea * (building.occupancyRate + variance) / 100),
        available: Math.floor(building.totalArea * (100 - building.occupancyRate - variance) / 100)
      });
    }

    return data;
  }

  generateLeasingTimeline(buildingId) {
    const events = [];
    const types = ['New Lease', 'Renewal', 'Termination', 'Expansion', 'Under Negotiation'];
    const statuses = ['Completed', 'In Progress', 'Pending', 'Scheduled'];

    for (let i = 0; i < 20; i++) {
      const daysOffset = Math.floor(Math.random() * 60) - 30;
      const date = addDays(new Date(), daysOffset);
      const type = types[Math.floor(Math.random() * types.length)];

      events.push({
        id: `LSE-${String(i + 1).padStart(4, '0')}`,
        date: format(date, 'yyyy-MM-dd'),
        type,
        tenant: `Tenant ${i + 1}`,
        area: Math.floor(1000 + Math.random() * 9000),
        value: Math.floor(50000 + Math.random() * 450000),
        status: daysOffset < 0 ? 'Completed' : statuses[Math.floor(Math.random() * statuses.length)],
        floor: Math.floor(1 + Math.random() * 30)
      });
    }

    return events.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  generateSpaceUtilization(buildingId) {
    const building = this.buildings.find(b => b.id === buildingId);
    const floors = building.totalFloors;
    const hoursInDay = 24;
    const daysToShow = 7;

    const data = [];

    for (let floor = 1; floor <= Math.min(floors, 20); floor++) {
      for (let day = 0; day < daysToShow; day++) {
        const date = subDays(new Date(), daysToShow - day - 1);

        for (let hour = 0; hour < hoursInDay; hour++) {
          let utilization = 0;

          if (hour >= 8 && hour <= 18) {
            utilization = 60 + Math.random() * 35;
          } else if (hour >= 6 && hour < 8 || hour > 18 && hour <= 21) {
            utilization = 20 + Math.random() * 40;
          } else {
            utilization = Math.random() * 15;
          }

          const isWeekend = date.getDay() === 0 || date.getDay() === 6;
          if (isWeekend) {
            utilization *= 0.3;
          }

          data.push({
            floor,
            day: format(date, 'EEE'),
            hour,
            utilization: Math.round(utilization),
            timestamp: date.getTime() + (hour * 3600000)
          });
        }
      }
    }

    return data;
  }

  generateEnergyUsage(buildingId) {
    const building = this.buildings.find(b => b.id === buildingId);
    const days = 30;
    const data = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const baseUsage = building.baseEnergyUsage / 30;
      const variance = (Math.random() - 0.5) * 0.3;

      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const weekendFactor = isWeekend ? 0.6 : 1;

      const electricity = baseUsage * 0.6 * (1 + variance) * weekendFactor;
      const gas = baseUsage * 0.25 * (1 + variance * 0.5) * weekendFactor;
      const water = baseUsage * 0.15 * (1 + variance * 0.3) * weekendFactor;

      data.push({
        date: format(date, 'MMM dd'),
        electricity: Math.round(electricity),
        gas: Math.round(gas),
        water: Math.round(water),
        total: Math.round(electricity + gas + water),
        cost: Math.round((electricity * 0.12 + gas * 0.08 + water * 0.05))
      });
    }

    return data;
  }

  generateMaintenanceCosts(buildingId) {
    const building = this.buildings.find(b => b.id === buildingId);
    const months = 12;
    const data = [];
    const categories = ['HVAC', 'Electrical', 'Plumbing', 'Elevators', 'Security', 'Cleaning', 'Landscaping'];

    for (let i = months - 1; i >= 0; i--) {
      const date = subDays(new Date(), i * 30);
      const baseCost = building.baseMaintCost / 12;

      const monthData = {
        month: format(date, 'MMM yyyy'),
        total: 0,
        preventive: Math.round(baseCost * 0.4 * (0.8 + Math.random() * 0.4)),
        reactive: Math.round(baseCost * 0.3 * (0.7 + Math.random() * 0.6)),
        emergency: Math.round(baseCost * 0.15 * (Math.random() * 2)),
        planned: Math.round(baseCost * 0.15 * (0.5 + Math.random()))
      };

      monthData.total = monthData.preventive + monthData.reactive + monthData.emergency + monthData.planned;

      categories.forEach(category => {
        monthData[category.toLowerCase()] = Math.round(monthData.total * (0.1 + Math.random() * 0.2));
      });

      data.push(monthData);
    }

    return data;
  }

  generateTenantSatisfaction(buildingId) {
    const building = this.buildings.find(b => b.id === buildingId);
    const categories = [
      'Overall Satisfaction',
      'Building Maintenance',
      'Cleanliness',
      'Security',
      'Amenities',
      'Temperature Control',
      'Response Time',
      'Communication'
    ];

    const data = categories.map(category => ({
      category,
      score: 70 + Math.random() * 25,
      responses: Math.floor(building.tenantCount * (0.6 + Math.random() * 0.3)),
      trend: (Math.random() - 0.5) * 10
    }));

    const historicalData = [];
    for (let i = 11; i >= 0; i--) {
      const date = subDays(new Date(), i * 30);
      historicalData.push({
        month: format(date, 'MMM'),
        satisfaction: 70 + Math.random() * 25,
        responseRate: 50 + Math.random() * 40
      });
    }

    return { current: data, historical: historicalData };
  }

  generateInvestmentPerformance(buildingId) {
    const building = this.buildings.find(b => b.id === buildingId);
    const months = 24;
    const data = [];

    let currentValue = building.investmentValue;

    for (let i = months - 1; i >= 0; i--) {
      const date = subDays(new Date(), i * 30);
      const appreciation = (Math.random() - 0.4) * 0.02;
      currentValue = currentValue * (1 + appreciation);

      const monthlyRevenue = currentValue * 0.005 * (0.8 + Math.random() * 0.4);
      const monthlyExpenses = monthlyRevenue * (0.3 + Math.random() * 0.2);
      const noi = monthlyRevenue - monthlyExpenses;

      data.push({
        date: format(date, 'MMM yyyy'),
        value: Math.round(currentValue),
        revenue: Math.round(monthlyRevenue),
        expenses: Math.round(monthlyExpenses),
        noi: Math.round(noi),
        roi: ((noi * 12 / building.investmentValue) * 100).toFixed(2),
        capRate: ((noi * 12 / currentValue) * 100).toFixed(2)
      });
    }

    return data;
  }

  generateRealtimeUpdates() {
    return this.buildings.map(building => ({
      id: building.id,
      timestamp: new Date().toISOString(),
      occupancy: Math.max(60, Math.min(100, building.occupancyRate + (Math.random() - 0.5) * 2)),
      energyUsage: Math.round(building.baseEnergyUsage / 24 * (0.9 + Math.random() * 0.2)),
      alerts: Math.random() > 0.8 ? Math.floor(Math.random() * 3) : 0,
      activeIssues: Math.random() > 0.7 ? Math.floor(Math.random() * 5) : 0
    }));
  }

  startRealtimeSimulation(callback, interval = 3000) {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    this.updateInterval = setInterval(() => {
      callback(this.generateRealtimeUpdates());
    }, interval);

    callback(this.generateRealtimeUpdates());
  }

  stopRealtimeSimulation() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }
}

export default new DataSimulator();
