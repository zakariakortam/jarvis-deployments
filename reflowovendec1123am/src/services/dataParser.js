import Papa from 'papaparse';
import { COLUMN_MAPPING, ZONE_COLUMNS } from '../utils/constants';

export class DataParser {
  constructor() {
    this.rawData = [];
    this.parsedData = [];
    this.metadata = {};
    this.isLoading = false;
    this.progress = 0;
  }

  async parseCSV(file, onProgress) {
    return new Promise((resolve, reject) => {
      this.isLoading = true;
      this.rawData = [];

      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        chunk: (results, parser) => {
          this.rawData.push(...results.data);
          this.progress = Math.min(95, this.rawData.length / 60000 * 100);
          if (onProgress) onProgress(this.progress);
        },
        complete: () => {
          this.processData();
          this.isLoading = false;
          this.progress = 100;
          if (onProgress) onProgress(100);
          resolve(this.parsedData);
        },
        error: (error) => {
          this.isLoading = false;
          reject(error);
        }
      });
    });
  }

  parseCSVString(csvString, onProgress) {
    return new Promise((resolve, reject) => {
      this.isLoading = true;
      this.rawData = [];

      Papa.parse(csvString, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        chunk: (results) => {
          this.rawData.push(...results.data);
          this.progress = Math.min(95, this.rawData.length / 60000 * 100);
          if (onProgress) onProgress(this.progress);
        },
        complete: () => {
          this.processData();
          this.isLoading = false;
          this.progress = 100;
          if (onProgress) onProgress(100);
          resolve(this.parsedData);
        },
        error: (error) => {
          this.isLoading = false;
          reject(error);
        }
      });
    });
  }

  processData() {
    this.parsedData = this.rawData.map((row, index) => {
      const processed = {
        index,
        timestamp: this.parseTimestamp(row[COLUMN_MAPPING.timestamp]),
        fileName: row[COLUMN_MAPPING.fileName],

        // Power metrics
        power: {
          cumulativeEnergy: row[COLUMN_MAPPING.cumulativeEnergy],
          current: row[COLUMN_MAPPING.current],
          voltage: row[COLUMN_MAPPING.voltage],
          activePower: row[COLUMN_MAPPING.activePower],
          reactivePower: row[COLUMN_MAPPING.reactivePower],
          apparentPower: row[COLUMN_MAPPING.apparentPower],
          powerFactor: row[COLUMN_MAPPING.powerFactor],
          frequency: row[COLUMN_MAPPING.frequency],
          phaseShift: row[COLUMN_MAPPING.phaseShift],
        },

        // Production metrics
        production: {
          boardsInside: row[COLUMN_MAPPING.boardsInside],
          boardsProduced: row[COLUMN_MAPPING.boardsProduced],
          productNumber: row[COLUMN_MAPPING.productNumber],
          productionStart: row[COLUMN_MAPPING.productionStart],
          productionEnd: row[COLUMN_MAPPING.productionEnd],
        },

        // Equipment status
        equipment: {
          conveyorSpeed: row[COLUMN_MAPPING.conveyorSpeed],
          conveyorWidth: row[COLUMN_MAPPING.conveyorWidth],
          warpWidth: row[COLUMN_MAPPING.warpWidth],
          status: row[COLUMN_MAPPING.status],
          alarms: row[COLUMN_MAPPING.alarms],
        },

        // Environment
        environment: {
          flowRate: row[COLUMN_MAPPING.flowRate],
          o2Concentration: row[COLUMN_MAPPING.o2Concentration],
        },

        // Zones
        zones: this.parseZones(row),

        // Cooling
        cooling: {
          cool1Upper: row[COLUMN_MAPPING.cool1Upper],
          cool2Upper: row[COLUMN_MAPPING.cool2Upper],
        },
      };

      // Calculate aggregate values
      processed.avgZoneTemp = this.calculateAvgZoneTemp(processed.zones);
      processed.maxZoneTemp = this.calculateMaxZoneTemp(processed.zones);
      processed.minZoneTemp = this.calculateMinZoneTemp(processed.zones);

      return processed;
    });

    this.calculateMetadata();
  }

  parseTimestamp(value) {
    if (!value) return null;
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  }

  parseZones(row) {
    const zones = {};

    ZONE_COLUMNS.forEach(({ zone, upper, lower, blowerUpper, blowerLower }) => {
      zones[zone] = {
        upper: row[upper],
        lower: row[lower],
        blowerUpper: row[blowerUpper],
        blowerLower: row[blowerLower],
        avg: (row[upper] + row[lower]) / 2,
        blowerAvg: (row[blowerUpper] + row[blowerLower]) / 2,
      };
    });

    return zones;
  }

  calculateAvgZoneTemp(zones) {
    const temps = Object.values(zones).map(z => z.avg);
    return temps.reduce((a, b) => a + b, 0) / temps.length;
  }

  calculateMaxZoneTemp(zones) {
    const temps = Object.values(zones).flatMap(z => [z.upper, z.lower]);
    return Math.max(...temps);
  }

  calculateMinZoneTemp(zones) {
    const temps = Object.values(zones).flatMap(z => [z.upper, z.lower]);
    return Math.min(...temps);
  }

  calculateMetadata() {
    if (this.parsedData.length === 0) {
      this.metadata = {};
      return;
    }

    const first = this.parsedData[0];
    const last = this.parsedData[this.parsedData.length - 1];

    // Calculate temp stats iteratively to avoid stack overflow with large datasets
    let tempMin = Infinity;
    let tempMax = -Infinity;
    let tempSum = 0;
    let tempCount = 0;

    let powerMin = Infinity;
    let powerMax = -Infinity;
    let powerSum = 0;

    let alarmTotal = 0;
    let alarmMax = 0;

    const products = new Set();

    for (const d of this.parsedData) {
      // Temperature stats
      for (const zone of Object.values(d.zones)) {
        if (zone.upper != null) {
          tempMin = Math.min(tempMin, zone.upper);
          tempMax = Math.max(tempMax, zone.upper);
          tempSum += zone.upper;
          tempCount++;
        }
        if (zone.lower != null) {
          tempMin = Math.min(tempMin, zone.lower);
          tempMax = Math.max(tempMax, zone.lower);
          tempSum += zone.lower;
          tempCount++;
        }
      }

      // Power stats
      if (d.power.activePower != null) {
        powerMin = Math.min(powerMin, d.power.activePower);
        powerMax = Math.max(powerMax, d.power.activePower);
        powerSum += d.power.activePower;
      }

      // Alarm stats
      const alarmVal = d.equipment.alarms || 0;
      alarmTotal += alarmVal;
      alarmMax = Math.max(alarmMax, alarmVal);

      // Products
      if (d.production.productNumber) {
        products.add(d.production.productNumber);
      }
    }

    this.metadata = {
      totalRecords: this.parsedData.length,
      timeRange: {
        start: first.timestamp,
        end: last.timestamp,
        duration: last.timestamp - first.timestamp,
      },
      temperature: {
        min: tempMin === Infinity ? 0 : tempMin,
        max: tempMax === -Infinity ? 0 : tempMax,
        avg: tempCount > 0 ? tempSum / tempCount : 0,
      },
      power: {
        min: powerMin === Infinity ? 0 : powerMin,
        max: powerMax === -Infinity ? 0 : powerMax,
        avg: this.parsedData.length > 0 ? powerSum / this.parsedData.length : 0,
        total: last.power.cumulativeEnergy,
      },
      production: {
        totalBoards: last.production.boardsProduced,
        products: [...products],
      },
      alarms: {
        total: alarmTotal,
        max: alarmMax,
      },
    };
  }

  getData(startIndex = 0, endIndex = this.parsedData.length) {
    return this.parsedData.slice(startIndex, endIndex);
  }

  getMetadata() {
    return this.metadata;
  }

  getZoneData(zoneNumber) {
    return this.parsedData.map(d => ({
      timestamp: d.timestamp,
      index: d.index,
      ...d.zones[zoneNumber],
    }));
  }

  getPowerData() {
    return this.parsedData.map(d => ({
      timestamp: d.timestamp,
      index: d.index,
      ...d.power,
    }));
  }

  getProductionData() {
    return this.parsedData.map(d => ({
      timestamp: d.timestamp,
      index: d.index,
      ...d.production,
      ...d.equipment,
    }));
  }

  filterByTimeRange(startTime, endTime) {
    return this.parsedData.filter(d =>
      d.timestamp >= startTime && d.timestamp <= endTime
    );
  }

  filterByStatus(status) {
    return this.parsedData.filter(d => d.equipment.status === status);
  }

  filterByProduct(productNumber) {
    return this.parsedData.filter(d => d.production.productNumber === productNumber);
  }

  exportToCSV(data = this.parsedData) {
    const flatData = data.map(d => ({
      timestamp: d.timestamp?.toISOString(),
      ...Object.fromEntries(
        Object.entries(d.power).map(([k, v]) => [`power_${k}`, v])
      ),
      ...Object.fromEntries(
        Object.entries(d.production).map(([k, v]) => [`production_${k}`, v])
      ),
      ...Object.fromEntries(
        Object.entries(d.equipment).map(([k, v]) => [`equipment_${k}`, v])
      ),
      ...Object.fromEntries(
        Object.entries(d.environment).map(([k, v]) => [`environment_${k}`, v])
      ),
      avgZoneTemp: d.avgZoneTemp,
      maxZoneTemp: d.maxZoneTemp,
      minZoneTemp: d.minZoneTemp,
    }));

    return Papa.unparse(flatData);
  }

  exportToJSON(data = this.parsedData) {
    return JSON.stringify(data, null, 2);
  }
}

export const dataParser = new DataParser();
