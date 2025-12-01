// Mock data generator for preview mode (when CSV is not loaded)
import { ZONE_COLUMNS } from '../utils/constants';

function generateZoneTemp(baseTemp, zoneIndex, timeIndex) {
  // Simulate a reflow profile progression
  const profilePosition = (timeIndex % 360) / 360; // Cycle every 360 samples (1 hour)

  let multiplier = 1;
  if (profilePosition < 0.2) {
    // Preheat phase - gradual increase
    multiplier = 0.5 + profilePosition * 2;
  } else if (profilePosition < 0.5) {
    // Soak phase - steady
    multiplier = 0.9;
  } else if (profilePosition < 0.7) {
    // Reflow phase - peak
    multiplier = 1 + (profilePosition - 0.5) * 0.5;
  } else {
    // Cooling phase
    multiplier = 1.1 - (profilePosition - 0.7) * 1.5;
  }

  // Zone-specific base temperatures (zones get progressively hotter)
  const zoneMultiplier = 1 + (zoneIndex * 0.15);
  const noise = (Math.random() - 0.5) * 5;

  return baseTemp * multiplier * zoneMultiplier + noise;
}

function generateMockDataPoint(index) {
  const baseTime = new Date('2025-11-26T09:00:00');
  const timestamp = new Date(baseTime.getTime() + index * 10000); // 10 second intervals

  const profilePosition = (index % 360) / 360;
  const basePower = 30 + Math.sin(profilePosition * Math.PI * 2) * 5;

  const zones = {};
  for (let z = 1; z <= 10; z++) {
    const baseTemp = 100 + (z * 15);
    const upper = generateZoneTemp(baseTemp, z, index);
    const lower = upper - 2 + Math.random() * 4;
    const blowerUpper = upper + 5 + Math.random() * 3;
    const blowerLower = blowerUpper - 2.5;

    zones[z] = {
      upper,
      lower,
      blowerUpper,
      blowerLower,
      avg: (upper + lower) / 2,
      blowerAvg: (blowerUpper + blowerLower) / 2,
    };
  }

  const avgZoneTemp = Object.values(zones).reduce((sum, z) => sum + z.avg, 0) / 10;
  const maxZoneTemp = Math.max(...Object.values(zones).map(z => z.upper));
  const minZoneTemp = Math.min(...Object.values(zones).map(z => z.lower));

  return {
    index,
    timestamp,
    fileName: `log_${timestamp.toISOString().slice(0, 10).replace(/-/g, '')}`,

    power: {
      cumulativeEnergy: (index * 0.0956),
      current: 75 + Math.random() * 2,
      voltage: 480,
      activePower: basePower + Math.random() * 2,
      reactivePower: 11 + Math.random() * 0.5,
      apparentPower: 36 + Math.random() * 0.5,
      powerFactor: 0.95 - Math.random() * 0.005,
      frequency: 60,
      phaseShift: 0,
    },

    production: {
      boardsInside: Math.floor(3 + Math.random() * 4),
      boardsProduced: Math.floor(index / 36) + Math.floor(Math.random() * 2),
      productNumber: ['A-001', 'A-002', 'B-001'][Math.floor(index / 1000) % 3],
      productionStart: baseTime.toISOString(),
      productionEnd: null,
    },

    equipment: {
      conveyorSpeed: 1.0,
      conveyorWidth: 300,
      warpWidth: 290,
      status: 'Operating',
      alarms: Math.random() > 0.95 ? Math.floor(Math.random() * 3) + 1 : index % 50,
    },

    environment: {
      flowRate: 5 + Math.random() * 0.5,
      o2Concentration: 90 + Math.random() * 20,
    },

    zones,

    cooling: {
      cool1Upper: 50 + Math.random() * 5,
      cool2Upper: 45 + Math.random() * 5,
    },

    avgZoneTemp,
    maxZoneTemp,
    minZoneTemp,
  };
}

export function generateMockData(count = 1000) {
  const data = [];
  for (let i = 0; i < count; i++) {
    data.push(generateMockDataPoint(i));
  }
  return data;
}

export function generateMockMetadata(data) {
  if (!data || data.length === 0) {
    return getDefaultMetadata();
  }

  const first = data[0];
  const last = data[data.length - 1];

  const allTemps = data.flatMap(d =>
    Object.values(d.zones).flatMap(z => [z.upper, z.lower])
  );

  const allPower = data.map(d => d.power.activePower);

  return {
    totalRecords: data.length,
    timeRange: {
      start: first.timestamp,
      end: last.timestamp,
      duration: last.timestamp - first.timestamp,
    },
    temperature: {
      min: Math.min(...allTemps),
      max: Math.max(...allTemps),
      avg: allTemps.reduce((a, b) => a + b, 0) / allTemps.length,
    },
    power: {
      min: Math.min(...allPower),
      max: Math.max(...allPower),
      avg: allPower.reduce((a, b) => a + b, 0) / allPower.length,
      total: last.power.cumulativeEnergy,
    },
    production: {
      totalBoards: last.production.boardsProduced,
      products: [...new Set(data.map(d => d.production.productNumber))],
    },
    alarms: {
      total: data.reduce((sum, d) => sum + (d.equipment.alarms || 0), 0),
      max: Math.max(...data.map(d => d.equipment.alarms || 0)),
    },
  };
}

export function getDefaultMetadata() {
  return {
    totalRecords: 0,
    timeRange: {
      start: new Date(),
      end: new Date(),
      duration: 0,
    },
    temperature: {
      min: 0,
      max: 0,
      avg: 0,
    },
    power: {
      min: 0,
      max: 0,
      avg: 0,
      total: 0,
    },
    production: {
      totalBoards: 0,
      products: [],
    },
    alarms: {
      total: 0,
      max: 0,
    },
  };
}

// Pre-generate initial mock data for immediate display
export const INITIAL_MOCK_DATA = generateMockData(500);
export const INITIAL_MOCK_METADATA = generateMockMetadata(INITIAL_MOCK_DATA);
