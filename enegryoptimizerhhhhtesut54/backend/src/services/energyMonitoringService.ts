import { Server as SocketIOServer } from 'socket.io';
import { logger, energyLogger } from '../utils/logger.js';
import { EnergyReading } from '../models/EnergyReading.js';
import { Appliance } from '../models/Appliance.js';
import { User } from '../models/User.js';
import { writeEnergyPoint } from '../config/database.js';
import { calculateCost } from '../utils/costCalculator.js';
import { detectAnomalies } from '../utils/anomalyDetector.js';
import { WeatherService } from './weatherService.js';
import { CronJob } from 'cron';

interface EnergyDataPoint {
  applianceId: string;
  userId: string;
  consumption: number;
  voltage: number;
  amperage: number;
  powerFactor?: number;
  timestamp?: Date;
}

export class EnergyMonitoringService {
  private io: SocketIOServer;
  private weatherService: WeatherService;
  private monitoringJobs: Map<string, CronJob> = new Map();
  private realTimeBuffer: Map<string, EnergyDataPoint[]> = new Map();

  constructor(io: SocketIOServer) {
    this.io = io;
    this.weatherService = new WeatherService();
  }

  async startMonitoring(): Promise<void> {
    logger.info('🔋 Starting Energy Monitoring Service');
    
    // Start real-time data collection simulation (every 15 seconds)
    this.startRealTimeCollection();
    
    // Start periodic aggregation job (every 5 minutes)
    this.startAggregationJob();
    
    // Start anomaly detection job (every minute)
    this.startAnomalyDetection();
    
    // Start daily reporting job
    this.startDailyReporting();
  }

  private startRealTimeCollection(): void {
    const job = new CronJob('*/15 * * * * *', async () => {
      try {
        await this.collectRealTimeData();
      } catch (error) {
        logger.error('Error in real-time data collection:', error);
      }
    });
    
    job.start();
    this.monitoringJobs.set('realtime', job);
    logger.info('📊 Real-time energy data collection started (15-second intervals)');
  }

  private startAggregationJob(): void {
    const job = new CronJob('0 */5 * * * *', async () => {
      try {
        await this.aggregateAndStore();
      } catch (error) {
        logger.error('Error in data aggregation:', error);
      }
    });
    
    job.start();
    this.monitoringJobs.set('aggregation', job);
    logger.info('📈 Energy data aggregation started (5-minute intervals)');
  }

  private startAnomalyDetection(): void {
    const job = new CronJob('0 * * * * *', async () => {
      try {
        await this.runAnomalyDetection();
      } catch (error) {
        logger.error('Error in anomaly detection:', error);
      }
    });
    
    job.start();
    this.monitoringJobs.set('anomaly', job);
    logger.info('🚨 Anomaly detection started (1-minute intervals)');
  }

  private startDailyReporting(): void {
    const job = new CronJob('0 0 6 * * *', async () => {
      try {
        await this.generateDailyReports();
      } catch (error) {
        logger.error('Error in daily reporting:', error);
      }
    });
    
    job.start();
    this.monitoringJobs.set('daily_report', job);
    logger.info('📋 Daily reporting started (6 AM daily)');
  }

  async collectRealTimeData(): Promise<void> {
    // Get all active appliances with smart monitoring
    const appliances = await Appliance.find({
      isActive: true,
      'smartFeatures.hasEnergyMonitoring': true
    }).populate('userId');

    const timestamp = new Date();
    const weatherData = await this.weatherService.getCurrentConditions();

    for (const appliance of appliances) {
      try {
        // Simulate real energy readings (in production, this would come from IoT devices)
        const reading = await this.simulateEnergyReading(appliance, timestamp, weatherData);
        
        // Add to real-time buffer
        const userId = appliance.userId.toString();
        if (!this.realTimeBuffer.has(userId)) {
          this.realTimeBuffer.set(userId, []);
        }
        this.realTimeBuffer.get(userId)!.push(reading);

        // Emit real-time data to connected clients
        this.io.to(`user_${userId}`).emit('energy_reading', {
          applianceId: appliance._id,
          applianceName: appliance.name,
          consumption: reading.consumption,
          cost: await calculateCost(reading.consumption, userId),
          timestamp: reading.timestamp
        });

      } catch (error) {
        logger.error(`Error collecting data for appliance ${appliance._id}:`, error);
      }
    }
  }

  private async simulateEnergyReading(
    appliance: any, 
    timestamp: Date, 
    weatherData?: any
  ): Promise<EnergyDataPoint> {
    const baseConsumption = appliance.energyProfile.avgHourlyConsumption;
    
    // Add realistic variations based on:
    // - Time of day
    // - Weather conditions
    // - Appliance type
    // - Random fluctuations
    
    const hour = timestamp.getHours();
    let consumption = baseConsumption / 4; // Convert hourly to 15-minute reading
    
    // Time of day factor
    if (appliance.category === 'HVAC') {
      if (hour >= 6 && hour <= 9) consumption *= 1.3; // Morning peak
      if (hour >= 17 && hour <= 21) consumption *= 1.5; // Evening peak
      if (hour >= 22 || hour <= 5) consumption *= 0.7; // Night reduction
    }
    
    // Weather factor for HVAC
    if (appliance.category === 'HVAC' && weatherData) {
      if (weatherData.temperature > 80) consumption *= 1.4; // Hot weather
      if (weatherData.temperature < 40) consumption *= 1.3; // Cold weather
    }
    
    // Random variation (±15%)
    consumption *= (0.85 + Math.random() * 0.3);
    
    // Simulate voltage and amperage
    const voltage = 120 + (Math.random() * 10 - 5); // 115-125V typical
    const amperage = consumption * 1000 / voltage; // P = V * I
    
    return {
      applianceId: appliance._id.toString(),
      userId: appliance.userId.toString(),
      consumption: Math.max(0, consumption),
      voltage,
      amperage,
      powerFactor: 0.85 + Math.random() * 0.15, // 0.85-1.0
      timestamp
    };
  }

  private async aggregateAndStore(): Promise<void> {
    for (const [userId, readings] of this.realTimeBuffer.entries()) {
      if (readings.length === 0) continue;

      try {
        const user = await User.findById(userId);
        if (!user) continue;

        // Group readings by appliance
        const applianceGroups = new Map<string, EnergyDataPoint[]>();
        readings.forEach(reading => {
          if (!applianceGroups.has(reading.applianceId)) {
            applianceGroups.set(reading.applianceId, []);
          }
          applianceGroups.get(reading.applianceId)!.push(reading);
        });

        // Process each appliance group
        for (const [applianceId, applianceReadings] of applianceGroups.entries()) {
          await this.storeAggregatedReading(userId, applianceId, applianceReadings, user);
        }

        // Clear processed readings
        this.realTimeBuffer.set(userId, []);

      } catch (error) {
        logger.error(`Error aggregating data for user ${userId}:`, error);
      }
    }
  }

  private async storeAggregatedReading(
    userId: string, 
    applianceId: string, 
    readings: EnergyDataPoint[], 
    user: any
  ): Promise<void> {
    // Calculate aggregated values
    const totalConsumption = readings.reduce((sum, r) => sum + r.consumption, 0);
    const avgVoltage = readings.reduce((sum, r) => sum + r.voltage, 0) / readings.length;
    const avgAmperage = readings.reduce((sum, r) => sum + r.amperage, 0) / readings.length;
    const avgPowerFactor = readings.reduce((sum, r) => sum + (r.powerFactor || 1), 0) / readings.length;

    // Get current electricity rate
    const currentHour = new Date().getHours();
    const isTimeOfUse = user.electricityRate.timeOfUseEnabled;
    const isPeakHour = isTimeOfUse && this.isPeakHour(currentHour, user.electricityRate.peakHours);
    
    const rate = isPeakHour ? user.electricityRate.peakRate :
                 isTimeOfUse ? user.electricityRate.offPeakRate :
                 user.electricityRate.standardRate;

    // Calculate costs
    const currentCost = totalConsumption * rate;
    
    // Get previous cumulative values
    const lastReading = await EnergyReading.findOne({
      userId,
      applianceId
    }).sort({ timestamp: -1 });

    const cumulativeConsumption = (lastReading?.consumption.cumulative || 0) + totalConsumption;
    const cumulativeCost = (lastReading?.cost.cumulative || 0) + currentCost;

    // Calculate environmental impact
    const co2Factor = 0.4; // kg CO2 per kWh (US average)
    const co2Produced = totalConsumption * co2Factor;

    // Get weather context
    const weatherData = await this.weatherService.getCurrentConditions();

    // Create energy reading document
    const energyReading = new EnergyReading({
      userId,
      applianceId,
      timestamp: new Date(),
      consumption: {
        current: totalConsumption,
        cumulative: cumulativeConsumption,
        voltage: avgVoltage,
        amperage: avgAmperage,
        powerFactor: avgPowerFactor,
        frequency: 60
      },
      cost: {
        current: currentCost,
        cumulative: cumulativeCost,
        rate,
        tier: isPeakHour ? 'peak' : isTimeOfUse ? 'off-peak' : 'standard'
      },
      environmental: {
        co2Produced,
        co2Factor
      },
      quality: {
        dataSource: 'iot_sensor',
        confidence: 95,
        anomalyFlags: []
      },
      context: {
        weatherCondition: weatherData?.condition,
        outsideTemperature: weatherData?.temperature,
        occupancyDetected: this.isOccupancyDetected(currentHour),
        timeOfDay: isPeakHour ? 'peak' : isTimeOfUse ? 'off-peak' : 'standard'
      }
    });

    // Save to MongoDB
    await energyReading.save();

    // Write to InfluxDB for time-series analytics
    writeEnergyPoint(applianceId, userId, totalConsumption, currentCost);

    // Log the event
    energyLogger.consumption(applianceId, userId, totalConsumption, currentCost);

    // Update appliance operational data
    await this.updateApplianceOperationalData(applianceId, totalConsumption, currentCost);
  }

  private isPeakHour(currentHour: number, peakHours: string[]): boolean {
    return peakHours.some(range => {
      const [start, end] = range.split('-').map(time => parseInt(time.split(':')[0]));
      return currentHour >= start && currentHour <= end;
    });
  }

  private isOccupancyDetected(hour: number): boolean {
    // Simulate occupancy detection based on typical home patterns
    if (hour >= 6 && hour <= 9) return true; // Morning
    if (hour >= 17 && hour <= 23) return true; // Evening
    return Math.random() > 0.8; // Random chance during other hours
  }

  private async updateApplianceOperationalData(
    applianceId: string, 
    consumption: number, 
    cost: number
  ): Promise<void> {
    await Appliance.findByIdAndUpdate(applianceId, {
      $inc: {
        'operationalData.totalRuntimeHours': consumption > 0 ? 0.25 : 0, // 15 min increments
        'costData.totalCostToDate': cost
      },
      $set: {
        'operationalData.lastUsed': consumption > 0.01 ? new Date() : undefined,
        'costData.monthlyCost': cost * (30 * 24 * 4) // Estimate monthly from 15-min reading
      }
    });
  }

  private async runAnomalyDetection(): Promise<void> {
    const recentReadings = await EnergyReading.find({
      timestamp: { $gte: new Date(Date.now() - 60 * 60 * 1000) } // Last hour
    }).populate('applianceId');

    for (const reading of recentReadings) {
      const anomalies = await detectAnomalies(reading);
      
      if (anomalies.length > 0) {
        reading.quality.anomalyFlags = anomalies;
        await reading.save();

        // Emit alert to user
        this.io.to(`user_${reading.userId}`).emit('energy_alert', {
          type: 'anomaly',
          applianceId: reading.applianceId,
          message: `Unusual energy pattern detected: ${anomalies.join(', ')}`,
          severity: 'medium',
          timestamp: new Date()
        });

        energyLogger.alert(reading.userId, 'anomaly', anomalies.join(', '));
      }
    }
  }

  private async generateDailyReports(): Promise<void> {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const today = new Date(yesterday);
    today.setDate(today.getDate() + 1);

    // Get all active users
    const users = await User.find({ 'subscription.status': 'active' });

    for (const user of users) {
      try {
        // Generate daily summary
        const summary = await this.generateDailySummary(user._id.toString(), yesterday, today);
        
        // Emit to connected clients
        this.io.to(`user_${user._id}`).emit('daily_report', summary);

        // Log report generation
        logger.info(`Daily report generated for user ${user._id}`, {
          totalConsumption: summary.totalConsumption,
          totalCost: summary.totalCost
        });

      } catch (error) {
        logger.error(`Error generating daily report for user ${user._id}:`, error);
      }
    }
  }

  private async generateDailySummary(userId: string, startDate: Date, endDate: Date) {
    const readings = await EnergyReading.find({
      userId,
      timestamp: { $gte: startDate, $lt: endDate }
    });

    const totalConsumption = readings.reduce((sum, r) => sum + r.consumption.current, 0);
    const totalCost = readings.reduce((sum, r) => sum + r.cost.current, 0);
    const totalCO2 = readings.reduce((sum, r) => sum + r.environmental.co2Produced, 0);

    // Get appliance breakdown
    const applianceBreakdown = new Map<string, { consumption: number; cost: number }>();
    readings.forEach(reading => {
      const id = reading.applianceId.toString();
      if (!applianceBreakdown.has(id)) {
        applianceBreakdown.set(id, { consumption: 0, cost: 0 });
      }
      const data = applianceBreakdown.get(id)!;
      data.consumption += reading.consumption.current;
      data.cost += reading.cost.current;
    });

    return {
      date: startDate,
      userId,
      totalConsumption,
      totalCost,
      totalCO2,
      applianceBreakdown: Array.from(applianceBreakdown.entries()),
      averageHourlyConsumption: totalConsumption / 24,
      peakHour: this.findPeakConsumptionHour(readings),
      comparisonToPreviousDay: await this.getComparisonData(userId, startDate)
    };
  }

  private findPeakConsumptionHour(readings: any[]): number {
    const hourlyData = new Map<number, number>();
    
    readings.forEach(reading => {
      const hour = new Date(reading.timestamp).getHours();
      hourlyData.set(hour, (hourlyData.get(hour) || 0) + reading.consumption.current);
    });

    let peakHour = 0;
    let maxConsumption = 0;
    
    for (const [hour, consumption] of hourlyData.entries()) {
      if (consumption > maxConsumption) {
        maxConsumption = consumption;
        peakHour = hour;
      }
    }

    return peakHour;
  }

  private async getComparisonData(userId: string, currentDate: Date) {
    const previousDate = new Date(currentDate);
    previousDate.setDate(previousDate.getDate() - 1);
    
    const prevEndDate = new Date(currentDate);
    
    const previousReadings = await EnergyReading.find({
      userId,
      timestamp: { $gte: previousDate, $lt: prevEndDate }
    });

    const previousConsumption = previousReadings.reduce((sum, r) => sum + r.consumption.current, 0);
    const previousCost = previousReadings.reduce((sum, r) => sum + r.cost.current, 0);

    return {
      previousConsumption,
      previousCost,
      consumptionChange: 0, // Will be calculated by caller
      costChange: 0 // Will be calculated by caller
    };
  }

  async stopMonitoring(): Promise<void> {
    logger.info('⏹️ Stopping Energy Monitoring Service');
    
    for (const [name, job] of this.monitoringJobs.entries()) {
      job.stop();
      logger.info(`Stopped ${name} job`);
    }
    
    this.monitoringJobs.clear();
    this.realTimeBuffer.clear();
  }

  // Public methods for manual data collection
  async recordManualReading(
    userId: string,
    applianceId: string,
    consumption: number
  ): Promise<void> {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const cost = consumption * user.electricityRate.standardRate;
    
    const reading = new EnergyReading({
      userId,
      applianceId,
      timestamp: new Date(),
      consumption: {
        current: consumption,
        cumulative: consumption, // This should be updated based on previous readings
        voltage: 120,
        amperage: consumption * 1000 / 120,
        powerFactor: 1,
        frequency: 60
      },
      cost: {
        current: cost,
        cumulative: cost,
        rate: user.electricityRate.standardRate,
        tier: 'standard'
      },
      environmental: {
        co2Produced: consumption * 0.4,
        co2Factor: 0.4
      },
      quality: {
        dataSource: 'manual_entry',
        confidence: 80,
        anomalyFlags: []
      },
      context: {
        timeOfDay: 'standard'
      }
    });

    await reading.save();
    writeEnergyPoint(applianceId, userId, consumption, cost);
    energyLogger.consumption(applianceId, userId, consumption, cost);
  }

  async getRecentReadings(userId: string, hours: number = 24): Promise<any[]> {
    const startTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    return await EnergyReading.find({
      userId,
      timestamp: { $gte: startTime }
    })
    .populate('applianceId', 'name category location')
    .sort({ timestamp: -1 })
    .limit(1000);
  }
}

export async function startEnergyMonitoringService(io: SocketIOServer): Promise<void> {
  const service = new EnergyMonitoringService(io);
  await service.startMonitoring();
}