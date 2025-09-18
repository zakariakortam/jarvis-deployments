import { Server as SocketIOServer } from 'socket.io';
import { logger, energyLogger } from '../utils/logger.js';
import { Schedule } from '../models/Schedule.js';
import { Appliance } from '../models/Appliance.js';
import { User } from '../models/User.js';
import { EnergyReading } from '../models/EnergyReading.js';
import { CronJob } from 'cron';
import { calculateOptimalSchedule } from '../utils/scheduleOptimizer.js';
import { executeApplianceAction } from '../utils/deviceController.js';
import { NotificationService } from './notificationService.js';

export class SchedulingService {
  private io: SocketIOServer;
  private notificationService: NotificationService;
  private schedulerJob: CronJob;
  private activeSchedules: Map<string, CronJob> = new Map();
  private executionQueue: Map<string, Date> = new Map();

  constructor(io: SocketIOServer) {
    this.io = io;
    this.notificationService = new NotificationService();
  }

  async startScheduling(): Promise<void> {
    logger.info('⏰ Starting Scheduling Service');
    
    // Load existing schedules
    await this.loadActiveSchedules();
    
    // Start main scheduler job (runs every minute)
    this.schedulerJob = new CronJob('0 * * * * *', async () => {
      try {
        await this.processScheduledTasks();
      } catch (error) {
        logger.error('Error in schedule processing:', error);
      }
    });
    
    this.schedulerJob.start();
    logger.info('📅 Schedule processor started (1-minute intervals)');

    // Start optimization job (runs every hour)
    const optimizationJob = new CronJob('0 0 * * * *', async () => {
      try {
        await this.optimizeSchedules();
      } catch (error) {
        logger.error('Error in schedule optimization:', error);
      }
    });
    
    optimizationJob.start();
    logger.info('🔧 Schedule optimizer started (hourly)');
  }

  private async loadActiveSchedules(): Promise<void> {
    const schedules = await Schedule.find({
      'status.isActive': true
    }).populate(['userId', 'applianceId']);

    for (const schedule of schedules) {
      await this.scheduleTask(schedule);
    }

    logger.info(`📋 Loaded ${schedules.length} active schedules`);
  }

  private async scheduleTask(schedule: any): Promise<void> {
    try {
      const scheduleId = schedule._id.toString();

      // Calculate next execution time
      const nextExecution = await this.calculateNextExecution(schedule);
      if (!nextExecution) return;

      // Update schedule with next execution time
      schedule.status.nextExecution = nextExecution;
      await schedule.save();

      // Store in execution queue
      this.executionQueue.set(scheduleId, nextExecution);

      energyLogger.scheduling(scheduleId, 'scheduled', schedule.applianceId._id.toString());

    } catch (error) {
      logger.error(`Error scheduling task ${schedule._id}:`, error);
    }
  }

  private async processScheduledTasks(): Promise<void> {
    const now = new Date();
    const tasksToExecute: string[] = [];

    // Find tasks ready for execution
    for (const [scheduleId, executionTime] of this.executionQueue.entries()) {
      if (executionTime <= now) {
        tasksToExecute.push(scheduleId);
      }
    }

    // Execute ready tasks
    for (const scheduleId of tasksToExecute) {
      try {
        await this.executeScheduledTask(scheduleId);
        this.executionQueue.delete(scheduleId);
      } catch (error) {
        logger.error(`Error executing scheduled task ${scheduleId}:`, error);
      }
    }
  }

  private async executeScheduledTask(scheduleId: string): Promise<void> {
    const schedule = await Schedule.findById(scheduleId)
      .populate(['userId', 'applianceId']);

    if (!schedule || !schedule.status.isActive) return;

    try {
      // Check execution conditions
      const canExecute = await this.checkExecutionConditions(schedule);
      if (!canExecute.allowed) {
        logger.info(`Schedule ${scheduleId} execution skipped: ${canExecute.reason}`);
        
        // Reschedule if it's a recurring schedule
        if (schedule.scheduleType === 'recurring') {
          await this.scheduleTask(schedule);
        }
        return;
      }

      // Record start time
      const startTime = new Date();

      // Execute the appliance action
      const result = await executeApplianceAction(
        schedule.applianceId._id.toString(),
        schedule.actions.operation,
        schedule.actions.parameters
      );

      if (result.success) {
        // Update schedule status
        schedule.status.lastExecuted = startTime;
        schedule.status.executionCount += 1;
        
        // Calculate execution time
        const executionTime = Date.now() - startTime.getTime();
        schedule.analytics.averageExecutionTime = 
          (schedule.analytics.averageExecutionTime * (schedule.status.executionCount - 1) + executionTime) /
          schedule.status.executionCount;

        // Update success rate
        const successRate = (schedule.status.executionCount / 
          (schedule.status.executionCount + schedule.status.failureCount)) * 100;
        schedule.analytics.successRate = successRate;

        // Calculate energy and cost savings
        await this.calculateSavings(schedule, executionTime);

        await schedule.save();

        // Emit success event
        this.io.to(`user_${schedule.userId._id}`).emit('schedule_executed', {
          scheduleId: schedule._id,
          applianceName: schedule.applianceId.name,
          action: schedule.actions.operation,
          timestamp: startTime,
          success: true,
          executionTime
        });

        // Send notification if enabled
        if (schedule.notifications.onExecution) {
          await this.notificationService.sendScheduleNotification(
            schedule.userId,
            'execution_success',
            schedule
          );
        }

        energyLogger.scheduling(scheduleId, 'executed', schedule.applianceId._id.toString());

        // Schedule next execution if recurring
        if (schedule.scheduleType === 'recurring') {
          await this.scheduleTask(schedule);
        }

      } else {
        // Handle execution failure
        await this.handleExecutionFailure(schedule, result.error);
      }

    } catch (error) {
      await this.handleExecutionFailure(schedule, error as Error);
    }
  }

  private async checkExecutionConditions(schedule: any): Promise<{allowed: boolean, reason?: string}> {
    // Check energy price threshold
    if (schedule.conditions.energyPriceThreshold) {
      const currentPrice = await this.getCurrentEnergyPrice(schedule.userId._id.toString());
      if (currentPrice > schedule.conditions.energyPriceThreshold) {
        return { allowed: false, reason: 'Energy price above threshold' };
      }
    }

    // Check occupancy requirement
    if (schedule.conditions.occupancyRequired) {
      const isOccupied = await this.checkOccupancy(schedule.userId._id.toString());
      if (!isOccupied) {
        return { allowed: false, reason: 'Occupancy required but not detected' };
      }
    }

    // Check minimum time gap
    if (schedule.conditions.minTimeGap && schedule.status.lastExecuted) {
      const timeSinceLastRun = Date.now() - schedule.status.lastExecuted.getTime();
      const minGapMs = schedule.conditions.minTimeGap * 60 * 1000;
      if (timeSinceLastRun < minGapMs) {
        return { allowed: false, reason: 'Minimum time gap not met' };
      }
    }

    // Check daily run limit
    if (schedule.conditions.maxDailyRuns) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const runsToday = await this.getDailyExecutionCount(schedule._id, today);
      if (runsToday >= schedule.conditions.maxDailyRuns) {
        return { allowed: false, reason: 'Daily run limit reached' };
      }
    }

    // Check weather conditions
    if (schedule.conditions.weatherCondition && schedule.conditions.weatherCondition.length > 0) {
      const currentWeather = await this.getCurrentWeather();
      if (!schedule.conditions.weatherCondition.includes(currentWeather.condition)) {
        return { allowed: false, reason: 'Weather condition not met' };
      }
    }

    return { allowed: true };
  }

  private async calculateSavings(schedule: any, executionTimeMs: number): Promise<void> {
    // Get baseline consumption for comparison
    const baseline = await this.getBaselineConsumption(
      schedule.applianceId._id.toString(),
      executionTimeMs
    );

    // Get actual consumption during execution
    const actual = await this.getExecutionConsumption(
      schedule.applianceId._id.toString(),
      schedule.status.lastExecuted,
      executionTimeMs
    );

    if (baseline && actual) {
      const energySaved = Math.max(0, baseline.consumption - actual.consumption);
      const costSaved = Math.max(0, baseline.cost - actual.cost);

      // Update analytics
      schedule.analytics.totalEnergySaved += energySaved;
      schedule.analytics.totalCostSaved += costSaved;
    }
  }

  private async handleExecutionFailure(schedule: any, error: Error): Promise<void> {
    schedule.status.failureCount += 1;
    schedule.status.lastFailureReason = error.message;

    // Update success rate
    const successRate = (schedule.status.executionCount / 
      (schedule.status.executionCount + schedule.status.failureCount)) * 100;
    schedule.analytics.successRate = successRate;

    await schedule.save();

    // Emit failure event
    this.io.to(`user_${schedule.userId._id}`).emit('schedule_failed', {
      scheduleId: schedule._id,
      applianceName: schedule.applianceId.name,
      error: error.message,
      timestamp: new Date()
    });

    // Send notification if enabled
    if (schedule.notifications.onFailure) {
      await this.notificationService.sendScheduleNotification(
        schedule.userId,
        'execution_failure',
        schedule,
        error.message
      );
    }

    energyLogger.scheduling(schedule._id.toString(), 'failed', schedule.applianceId._id.toString());

    // Disable schedule if too many failures
    if (schedule.status.failureCount >= 5 && schedule.analytics.successRate < 50) {
      schedule.status.isActive = false;
      await schedule.save();
      
      logger.warn(`Schedule ${schedule._id} disabled due to repeated failures`);
    }
  }

  private async optimizeSchedules(): Promise<void> {
    logger.info('🔧 Running schedule optimization');

    const schedules = await Schedule.find({
      'status.isActive': true,
      'optimization.flexibility.canDelay': true
    }).populate(['userId', 'applianceId']);

    for (const schedule of schedules) {
      try {
        const optimization = await calculateOptimalSchedule(schedule);
        
        if (optimization.shouldOptimize) {
          // Update schedule timing
          if (optimization.newExecutionTime) {
            this.executionQueue.set(
              schedule._id.toString(), 
              optimization.newExecutionTime
            );
            
            schedule.status.nextExecution = optimization.newExecutionTime;
            await schedule.save();

            // Notify user of optimization
            this.io.to(`user_${schedule.userId._id}`).emit('schedule_optimized', {
              scheduleId: schedule._id,
              oldTime: schedule.status.nextExecution,
              newTime: optimization.newExecutionTime,
              expectedSavings: optimization.expectedSavings
            });

            if (schedule.notifications.onOptimization) {
              await this.notificationService.sendScheduleNotification(
                schedule.userId,
                'optimization',
                schedule
              );
            }
          }
        }
      } catch (error) {
        logger.error(`Error optimizing schedule ${schedule._id}:`, error);
      }
    }
  }

  // Public API methods
  async createSchedule(userId: string, scheduleData: any): Promise<any> {
    const schedule = new Schedule({
      ...scheduleData,
      userId,
      createdBy: 'user'
    });

    await schedule.save();
    await this.scheduleTask(schedule);

    logger.info(`New schedule created: ${schedule._id} for user ${userId}`);
    return schedule;
  }

  async updateSchedule(scheduleId: string, updates: any): Promise<any> {
    const schedule = await Schedule.findByIdAndUpdate(
      scheduleId,
      { $set: updates },
      { new: true }
    );

    if (schedule) {
      // Remove old schedule from queue
      this.executionQueue.delete(scheduleId);
      
      // Reschedule with new parameters
      if (schedule.status.isActive) {
        await this.scheduleTask(schedule);
      }
    }

    return schedule;
  }

  async deleteSchedule(scheduleId: string): Promise<boolean> {
    const schedule = await Schedule.findByIdAndDelete(scheduleId);
    
    if (schedule) {
      this.executionQueue.delete(scheduleId);
      
      // Stop any active cron jobs for this schedule
      if (this.activeSchedules.has(scheduleId)) {
        this.activeSchedules.get(scheduleId)?.stop();
        this.activeSchedules.delete(scheduleId);
      }
      
      return true;
    }
    
    return false;
  }

  async getUserSchedules(userId: string): Promise<any[]> {
    return await Schedule.find({ userId })
      .populate('applianceId', 'name category location')
      .sort({ createdAt: -1 });
  }

  async getScheduleAnalytics(userId: string, scheduleId?: string): Promise<any> {
    const query: any = { userId };
    if (scheduleId) query._id = scheduleId;

    const schedules = await Schedule.find(query);

    const analytics = {
      totalSchedules: schedules.length,
      activeSchedules: schedules.filter(s => s.status.isActive).length,
      totalExecutions: schedules.reduce((sum, s) => sum + s.status.executionCount, 0),
      totalFailures: schedules.reduce((sum, s) => sum + s.status.failureCount, 0),
      totalEnergySaved: schedules.reduce((sum, s) => sum + s.analytics.totalEnergySaved, 0),
      totalCostSaved: schedules.reduce((sum, s) => sum + s.analytics.totalCostSaved, 0),
      averageSuccessRate: schedules.reduce((sum, s) => sum + s.analytics.successRate, 0) / schedules.length || 0
    };

    return analytics;
  }

  // Helper methods
  private async calculateNextExecution(schedule: any): Promise<Date | null> {
    const now = new Date();

    switch (schedule.scheduleType) {
      case 'one-time':
        return schedule.timing.startTime > now ? schedule.timing.startTime : null;

      case 'recurring':
        if (!schedule.timing.recurrenceRule) return null;
        return this.calculateRecurringExecution(schedule.timing.recurrenceRule, now);

      case 'conditional':
        // For conditional schedules, we'll check conditions every hour
        const nextHour = new Date(now);
        nextHour.setMinutes(0, 0, 0);
        nextHour.setHours(nextHour.getHours() + 1);
        return nextHour;

      default:
        return null;
    }
  }

  private calculateRecurringExecution(rule: any, from: Date): Date {
    const next = new Date(from);

    switch (rule.frequency) {
      case 'daily':
        next.setDate(next.getDate() + rule.interval);
        break;
      case 'weekly':
        next.setDate(next.getDate() + (rule.interval * 7));
        break;
      case 'monthly':
        next.setMonth(next.getMonth() + rule.interval);
        break;
    }

    return next;
  }

  private async getCurrentEnergyPrice(userId: string): Promise<number> {
    const user = await User.findById(userId);
    if (!user) return 0;

    const hour = new Date().getHours();
    const isTimeOfUse = user.electricityRate.timeOfUseEnabled;
    const isPeakHour = isTimeOfUse && this.isPeakHour(hour, user.electricityRate.peakHours);

    return isPeakHour ? user.electricityRate.peakRate :
           isTimeOfUse ? user.electricityRate.offPeakRate :
           user.electricityRate.standardRate;
  }

  private isPeakHour(currentHour: number, peakHours: string[]): boolean {
    return peakHours.some(range => {
      const [start, end] = range.split('-').map(time => parseInt(time.split(':')[0]));
      return currentHour >= start && currentHour <= end;
    });
  }

  private async checkOccupancy(userId: string): Promise<boolean> {
    // In a real implementation, this would check smart home sensors
    // For now, simulate based on time of day patterns
    const hour = new Date().getHours();
    if (hour >= 6 && hour <= 9) return true; // Morning
    if (hour >= 17 && hour <= 23) return true; // Evening
    return Math.random() > 0.7; // Random chance during other hours
  }

  private async getDailyExecutionCount(scheduleId: string, date: Date): Promise<number> {
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) return 0;

    // This is a simplified count - in production, you'd track executions in a separate collection
    return schedule.status.executionCount || 0;
  }

  private async getCurrentWeather(): Promise<{condition: string}> {
    // Mock weather data - in production, integrate with weather API
    const conditions = ['sunny', 'cloudy', 'rainy', 'hot', 'cold'];
    return { condition: conditions[Math.floor(Math.random() * conditions.length)] };
  }

  private async getBaselineConsumption(applianceId: string, duration: number): Promise<any> {
    // Get historical average consumption for this appliance during similar time periods
    const readings = await EnergyReading.find({
      applianceId,
      timestamp: {
        $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
      }
    });

    if (readings.length === 0) return null;

    const avgConsumption = readings.reduce((sum, r) => sum + r.consumption.current, 0) / readings.length;
    const avgCost = readings.reduce((sum, r) => sum + r.cost.current, 0) / readings.length;

    return {
      consumption: avgConsumption * (duration / (15 * 60 * 1000)), // Scale to execution duration
      cost: avgCost * (duration / (15 * 60 * 1000))
    };
  }

  private async getExecutionConsumption(applianceId: string, startTime: Date, duration: number): Promise<any> {
    const endTime = new Date(startTime.getTime() + duration);
    
    const readings = await EnergyReading.find({
      applianceId,
      timestamp: { $gte: startTime, $lte: endTime }
    });

    if (readings.length === 0) return null;

    const totalConsumption = readings.reduce((sum, r) => sum + r.consumption.current, 0);
    const totalCost = readings.reduce((sum, r) => sum + r.cost.current, 0);

    return { consumption: totalConsumption, cost: totalCost };
  }

  async stopScheduling(): Promise<void> {
    logger.info('⏹️ Stopping Scheduling Service');
    
    this.schedulerJob?.stop();
    
    for (const [scheduleId, job] of this.activeSchedules.entries()) {
      job.stop();
    }
    
    this.activeSchedules.clear();
    this.executionQueue.clear();
  }
}

export async function startSchedulingService(io: SocketIOServer): Promise<void> {
  const service = new SchedulingService(io);
  await service.startScheduling();
}