import { Server as SocketIOServer } from 'socket.io';
import { logger, energyLogger } from '../utils/logger.js';
import { Recommendation } from '../models/Recommendation.js';
import { EnergyReading } from '../models/EnergyReading.js';
import { Appliance } from '../models/Appliance.js';
import { User } from '../models/User.js';
import { Schedule } from '../models/Schedule.js';
import { CronJob } from 'cron';
import { MLRecommendationEngine } from '../ml/recommendationEngine.js';
import { PatternAnalyzer } from '../utils/patternAnalyzer.js';
import { CostOptimizer } from '../utils/costOptimizer.js';
import { NotificationService } from './notificationService.js';

interface RecommendationContext {
  user: any;
  appliances: any[];
  recentReadings: any[];
  schedules: any[];
  weatherData?: any;
  seasonalFactors?: any;
}

export class RecommendationService {
  private io: SocketIOServer;
  private mlEngine: MLRecommendationEngine;
  private patternAnalyzer: PatternAnalyzer;
  private costOptimizer: CostOptimizer;
  private notificationService: NotificationService;
  private analysisJob: CronJob;
  private processingQueue: Set<string> = new Set();

  constructor(io: SocketIOServer) {
    this.io = io;
    this.mlEngine = new MLRecommendationEngine();
    this.patternAnalyzer = new PatternAnalyzer();
    this.costOptimizer = new CostOptimizer();
    this.notificationService = new NotificationService();
  }

  async startRecommendationEngine(): Promise<void> {
    logger.info('🤖 Starting Recommendation Service');
    
    // Initialize ML models
    await this.mlEngine.initialize();
    
    // Start periodic analysis job (every 4 hours)
    this.analysisJob = new CronJob('0 0 */4 * * *', async () => {
      try {
        await this.runPeriodicAnalysis();
      } catch (error) {
        logger.error('Error in periodic recommendation analysis:', error);
      }
    });
    
    this.analysisJob.start();
    logger.info('🔍 Recommendation analysis started (4-hour intervals)');

    // Run initial analysis for all active users
    await this.runInitialAnalysis();
  }

  private async runInitialAnalysis(): Promise<void> {
    logger.info('🚀 Running initial recommendation analysis');
    
    const users = await User.find({ 'subscription.status': 'active' });
    
    for (const user of users) {
      try {
        if (!this.processingQueue.has(user._id.toString())) {
          await this.generateRecommendationsForUser(user._id.toString());
        }
      } catch (error) {
        logger.error(`Error in initial analysis for user ${user._id}:`, error);
      }
    }
  }

  private async runPeriodicAnalysis(): Promise<void> {
    logger.info('🔄 Running periodic recommendation analysis');
    
    // Get users who haven't had analysis in the last 4 hours
    const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000);
    
    const users = await User.find({ 
      'subscription.status': 'active',
      updatedAt: { $lt: fourHoursAgo }
    });

    for (const user of users) {
      try {
        if (!this.processingQueue.has(user._id.toString())) {
          await this.generateRecommendationsForUser(user._id.toString());
        }
      } catch (error) {
        logger.error(`Error in periodic analysis for user ${user._id}:`, error);
      }
    }
  }

  async generateRecommendationsForUser(userId: string): Promise<void> {
    if (this.processingQueue.has(userId)) {
      logger.debug(`Recommendation generation already in progress for user ${userId}`);
      return;
    }

    this.processingQueue.add(userId);
    
    try {
      logger.info(`🎯 Generating recommendations for user ${userId}`);
      
      // Gather context data
      const context = await this.gatherUserContext(userId);
      if (!context) {
        logger.warn(`Insufficient data for recommendations for user ${userId}`);
        return;
      }

      // Generate different types of recommendations
      const recommendations: any[] = [];

      // 1. Energy efficiency recommendations
      const efficiencyRecs = await this.generateEfficiencyRecommendations(context);
      recommendations.push(...efficiencyRecs);

      // 2. Scheduling recommendations
      const schedulingRecs = await this.generateSchedulingRecommendations(context);
      recommendations.push(...schedulingRecs);

      // 3. Cost optimization recommendations
      const costRecs = await this.generateCostOptimizationRecommendations(context);
      recommendations.push(...costRecs);

      // 4. Behavioral recommendations
      const behavioralRecs = await this.generateBehavioralRecommendations(context);
      recommendations.push(...behavioralRecs);

      // 5. Appliance replacement recommendations
      const replacementRecs = await this.generateReplacementRecommendations(context);
      recommendations.push(...replacementRecs);

      // 6. Maintenance recommendations
      const maintenanceRecs = await this.generateMaintenanceRecommendations(context);
      recommendations.push(...maintenanceRecs);

      // Filter out conflicting recommendations and prioritize
      const finalRecommendations = await this.processAndPrioritizeRecommendations(
        recommendations, 
        context
      );

      // Save recommendations to database
      for (const rec of finalRecommendations) {
        await this.saveRecommendation(userId, rec);
      }

      // Emit to connected clients
      this.io.to(`user_${userId}`).emit('new_recommendations', {
        count: finalRecommendations.length,
        highPriority: finalRecommendations.filter(r => r.priority === 'high').length,
        totalPotentialSavings: finalRecommendations.reduce((sum, r) => 
          sum + r.impact.costSavings.annual, 0
        )
      });

      // Send notifications for high-priority recommendations
      const highPriorityRecs = finalRecommendations.filter(r => 
        r.priority === 'high' || r.priority === 'critical'
      );

      for (const rec of highPriorityRecs) {
        await this.notificationService.sendRecommendationNotification(
          context.user,
          rec
        );
      }

      energyLogger.recommendation(
        userId, 
        'bulk_generation', 
        finalRecommendations.reduce((sum, r) => sum + r.impact.costSavings.annual, 0)
      );

    } catch (error) {
      logger.error(`Error generating recommendations for user ${userId}:`, error);
    } finally {
      this.processingQueue.delete(userId);
    }
  }

  private async gatherUserContext(userId: string): Promise<RecommendationContext | null> {
    try {
      const [user, appliances, recentReadings, schedules] = await Promise.all([
        User.findById(userId),
        Appliance.find({ userId, isActive: true }),
        EnergyReading.find({ userId })
          .sort({ timestamp: -1 })
          .limit(1000), // Last 1000 readings
        Schedule.find({ userId, 'status.isActive': true })
      ]);

      if (!user || appliances.length === 0 || recentReadings.length < 10) {
        return null;
      }

      return {
        user,
        appliances,
        recentReadings,
        schedules,
        // weatherData and seasonalFactors would be fetched from external APIs
      };
    } catch (error) {
      logger.error(`Error gathering context for user ${userId}:`, error);
      return null;
    }
  }

  private async generateEfficiencyRecommendations(context: RecommendationContext): Promise<any[]> {
    const recommendations: any[] = [];

    for (const appliance of context.appliances) {
      try {
        // Analyze energy consumption patterns
        const applianceReadings = context.recentReadings.filter(
          r => r.applianceId.toString() === appliance._id.toString()
        );

        if (applianceReadings.length < 5) continue;

        // Detect inefficient usage patterns
        const patterns = await this.patternAnalyzer.analyzeAppliance(
          appliance,
          applianceReadings
        );

        // Low efficiency detection
        if (patterns.efficiency < 70) {
          recommendations.push({
            type: 'efficiency',
            category: 'energy_reduction',
            priority: patterns.efficiency < 50 ? 'high' : 'medium',
            applianceId: appliance._id,
            title: `Improve ${appliance.name} Efficiency`,
            description: `Your ${appliance.name} is operating at ${patterns.efficiency}% efficiency. Optimization could reduce energy consumption significantly.`,
            detailedAnalysis: {
              currentSituation: `${appliance.name} consuming ${patterns.avgConsumption.toFixed(2)} kWh/day`,
              problemIdentified: `Efficiency at ${patterns.efficiency}% - below optimal range`,
              proposedSolution: this.getEfficiencySolution(appliance, patterns),
              implementationSteps: this.getEfficiencySteps(appliance, patterns)
            },
            impact: await this.calculateEfficiencyImpact(appliance, patterns),
            implementation: {
              difficulty: 'moderate',
              estimatedTime: 30,
              upfrontCost: 0,
              automatable: true
            },
            confidence: {
              score: patterns.confidenceScore,
              factors: ['Historical usage data', 'Pattern analysis'],
              dataQuality: 'high'
            }
          });
        }

        // Standby power waste detection
        if (patterns.standbyWaste > 0.1) { // More than 0.1 kWh/day in standby
          recommendations.push({
            type: 'efficiency',
            category: 'cost_saving',
            priority: 'medium',
            applianceId: appliance._id,
            title: `Reduce ${appliance.name} Standby Power`,
            description: `${appliance.name} consumes ${(patterns.standbyWaste * 365 * 0.12).toFixed(0)}$ annually in standby power.`,
            impact: {
              energySavings: {
                daily: patterns.standbyWaste,
                monthly: patterns.standbyWaste * 30,
                annual: patterns.standbyWaste * 365
              },
              costSavings: {
                daily: patterns.standbyWaste * 0.12,
                monthly: patterns.standbyWaste * 30 * 0.12,
                annual: patterns.standbyWaste * 365 * 0.12
              }
            }
          });
        }

      } catch (error) {
        logger.error(`Error analyzing appliance ${appliance._id}:`, error);
      }
    }

    return recommendations;
  }

  private async generateSchedulingRecommendations(context: RecommendationContext): Promise<any[]> {
    const recommendations: any[] = [];

    // Analyze usage patterns to suggest optimal scheduling
    for (const appliance of context.appliances) {
      if (!appliance.smartFeatures.canSchedule) continue;

      const applianceReadings = context.recentReadings.filter(
        r => r.applianceId.toString() === appliance._id.toString()
      );

      if (applianceReadings.length < 10) continue;

      // Find current usage patterns
      const usagePattern = await this.patternAnalyzer.getUsagePattern(applianceReadings);
      
      // Calculate optimal schedule based on electricity rates
      const optimalSchedule = await this.costOptimizer.findOptimalSchedule(
        appliance,
        context.user.electricityRate,
        usagePattern
      );

      if (optimalSchedule.potentialSavings > 5) { // At least $5/month savings
        recommendations.push({
          type: 'scheduling',
          category: 'cost_saving',
          priority: optimalSchedule.potentialSavings > 20 ? 'high' : 'medium',
          applianceId: appliance._id,
          title: `Optimize ${appliance.name} Schedule`,
          description: `Running ${appliance.name} during off-peak hours could save $${optimalSchedule.potentialSavings.toFixed(0)}/month.`,
          detailedAnalysis: {
            currentSituation: `Currently runs mostly during ${usagePattern.peakHours} (peak hours)`,
            problemIdentified: `Running during expensive peak rate periods`,
            proposedSolution: `Schedule to run during ${optimalSchedule.recommendedHours} (off-peak)`,
            implementationSteps: [
              'Enable smart scheduling for this appliance',
              `Set schedule to run between ${optimalSchedule.recommendedHours}`,
              'Allow flexible timing within off-peak hours',
              'Monitor savings over first month'
            ]
          },
          impact: {
            energySavings: {
              daily: 0, // No energy saved, just cost optimization
              monthly: 0,
              annual: 0
            },
            costSavings: {
              daily: optimalSchedule.potentialSavings / 30,
              monthly: optimalSchedule.potentialSavings,
              annual: optimalSchedule.potentialSavings * 12
            }
          },
          implementation: {
            difficulty: 'easy',
            estimatedTime: 10,
            upfrontCost: 0,
            automatable: true
          }
        });
      }
    }

    return recommendations;
  }

  private async generateCostOptimizationRecommendations(context: RecommendationContext): Promise<any[]> {
    const recommendations: any[] = [];

    // Time-of-use rate optimization
    if (!context.user.electricityRate.timeOfUseEnabled) {
      const potentialSavings = await this.costOptimizer.calculateTimeOfUseSavings(
        context.user,
        context.recentReadings
      );

      if (potentialSavings > 10) { // At least $10/month
        recommendations.push({
          type: 'rate_optimization',
          category: 'cost_saving',
          priority: potentialSavings > 30 ? 'high' : 'medium',
          title: 'Enable Time-of-Use Electricity Rates',
          description: `Switching to time-of-use rates could save approximately $${potentialSavings.toFixed(0)}/month based on your usage patterns.`,
          detailedAnalysis: {
            currentSituation: `Currently on standard flat rate of $${context.user.electricityRate.standardRate}/kWh`,
            problemIdentified: 'Not taking advantage of lower off-peak rates',
            proposedSolution: 'Switch to time-of-use billing and shift usage to off-peak hours',
            implementationSteps: [
              'Contact utility company to switch to time-of-use rates',
              'Update app settings with new rate structure',
              'Enable automatic scheduling for flexible appliances',
              'Monitor savings in first billing cycle'
            ]
          },
          impact: {
            costSavings: {
              daily: potentialSavings / 30,
              monthly: potentialSavings,
              annual: potentialSavings * 12
            }
          },
          implementation: {
            difficulty: 'easy',
            estimatedTime: 60,
            upfrontCost: 0
          }
        });
      }
    }

    return recommendations;
  }

  private async generateBehavioralRecommendations(context: RecommendationContext): Promise<any[]> {
    const recommendations: any[] = [];

    // Analyze user behavior patterns
    const behaviorAnalysis = await this.patternAnalyzer.analyzeBehavior(
      context.recentReadings,
      context.schedules
    );

    // High consumption during peak hours
    if (behaviorAnalysis.peakHourUsage > 40) { // >40% of usage during peak
      recommendations.push({
        type: 'behavioral',
        category: 'cost_saving',
        priority: 'medium',
        title: 'Shift Usage Away from Peak Hours',
        description: `${behaviorAnalysis.peakHourUsage}% of your energy usage occurs during expensive peak hours (5-9 PM).`,
        detailedAnalysis: {
          currentSituation: `High energy usage during peak rate hours`,
          problemIdentified: `Paying premium rates for ${behaviorAnalysis.peakHourUsage}% of usage`,
          proposedSolution: 'Shift discretionary usage to off-peak hours (10 PM - 6 AM)',
          implementationSteps: [
            'Run dishwashers and washing machines after 10 PM',
            'Charge electric vehicles during off-peak hours',
            'Use timers for water heaters and pool pumps',
            'Enable smart scheduling for flexible appliances'
          ]
        },
        impact: await this.calculateBehaviorImpact(behaviorAnalysis, context.user.electricityRate),
        implementation: {
          difficulty: 'moderate',
          estimatedTime: 0, // Behavioral change
          upfrontCost: 0
        }
      });
    }

    // Excessive standby consumption
    if (behaviorAnalysis.standbyPercentage > 15) { // >15% standby consumption
      recommendations.push({
        type: 'behavioral',
        category: 'energy_reduction',
        priority: 'low',
        title: 'Reduce Standby Power Consumption',
        description: `${behaviorAnalysis.standbyPercentage}% of your energy goes to standby power. Simple changes can reduce this waste.`,
        implementation: {
          difficulty: 'easy',
          estimatedTime: 30
        }
      });
    }

    return recommendations;
  }

  private async generateReplacementRecommendations(context: RecommendationContext): Promise<any[]> {
    const recommendations: any[] = [];

    for (const appliance of context.appliances) {
      // Check if appliance is old and inefficient
      const age = appliance.costData.purchaseDate ? 
        (Date.now() - appliance.costData.purchaseDate.getTime()) / (365 * 24 * 60 * 60 * 1000) : 
        10; // Assume 10 years if no purchase date

      if (age > 8 && appliance.energyProfile.efficiency < 80) {
        const replacementAnalysis = await this.costOptimizer.analyzeReplacement(appliance);
        
        if (replacementAnalysis.paybackPeriod < 36) { // Less than 3 years payback
          recommendations.push({
            type: 'replacement',
            category: 'cost_saving',
            priority: replacementAnalysis.paybackPeriod < 18 ? 'high' : 'medium',
            applianceId: appliance._id,
            title: `Replace Inefficient ${appliance.name}`,
            description: `Your ${age.toFixed(0)}-year-old ${appliance.name} could be replaced with a more efficient model, saving $${replacementAnalysis.annualSavings.toFixed(0)}/year.`,
            detailedAnalysis: {
              currentSituation: `${appliance.name} operating at ${appliance.energyProfile.efficiency}% efficiency`,
              problemIdentified: `Old appliance consuming excessive energy`,
              proposedSolution: `Replace with Energy Star certified model`,
              implementationSteps: [
                'Research Energy Star certified alternatives',
                'Compare lifecycle costs vs. current appliance',
                'Look for utility rebates and tax incentives',
                'Schedule professional installation if needed'
              ]
            },
            impact: {
              energySavings: {
                annual: replacementAnalysis.energySavings
              },
              costSavings: {
                annual: replacementAnalysis.annualSavings,
                lifetime: replacementAnalysis.lifetimeSavings
              }
            },
            implementation: {
              difficulty: 'professional_required',
              upfrontCost: replacementAnalysis.upfrontCost,
              paybackPeriod: replacementAnalysis.paybackPeriod
            }
          });
        }
      }
    }

    return recommendations;
  }

  private async generateMaintenanceRecommendations(context: RecommendationContext): Promise<any[]> {
    const recommendations: any[] = [];

    for (const appliance of context.appliances) {
      // Check if maintenance is due
      if (appliance.maintenanceInfo.nextMaintenanceDate && 
          appliance.maintenanceInfo.nextMaintenanceDate <= new Date()) {
        
        recommendations.push({
          type: 'maintenance',
          category: 'efficiency',
          priority: 'medium',
          applianceId: appliance._id,
          title: `${appliance.name} Maintenance Due`,
          description: `Regular maintenance can improve efficiency by 5-15% and prevent costly breakdowns.`,
          implementation: {
            difficulty: appliance.category === 'HVAC' ? 'professional_required' : 'moderate',
            estimatedTime: 60,
            upfrontCost: appliance.category === 'HVAC' ? 150 : 50
          }
        });
      }

      // Detect efficiency degradation
      const recentEfficiency = await this.calculateRecentEfficiency(appliance._id, context.recentReadings);
      if (recentEfficiency < appliance.energyProfile.efficiency * 0.85) { // 15% drop
        recommendations.push({
          type: 'maintenance',
          category: 'efficiency',
          priority: 'high',
          applianceId: appliance._id,
          title: `${appliance.name} Efficiency Decline Detected`,
          description: `Performance has dropped ${((appliance.energyProfile.efficiency - recentEfficiency) / appliance.energyProfile.efficiency * 100).toFixed(0)}%. Maintenance may be needed.`,
          priority: 'high'
        });
      }
    }

    return recommendations;
  }

  private async processAndPrioritizeRecommendations(
    recommendations: any[], 
    context: RecommendationContext
  ): Promise<any[]> {
    // Remove duplicates and conflicting recommendations
    const filtered = this.removeConflictingRecommendations(recommendations);
    
    // Add ML confidence scores
    for (const rec of filtered) {
      rec.mlMetadata = {
        modelVersion: '1.0.0',
        algorithmUsed: 'pattern_analysis',
        trainingDataPeriod: {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          end: new Date()
        },
        features: ['usage_pattern', 'cost_analysis', 'efficiency_metrics'],
        confidence_intervals: {
          lower: Math.max(0, (rec.confidence?.score || 80) - 10),
          upper: Math.min(100, (rec.confidence?.score || 80) + 10)
        }
      };
    }

    // Sort by priority and potential savings
    return filtered.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const aPriority = priorityOrder[a.priority] || 0;
      const bPriority = priorityOrder[b.priority] || 0;
      
      if (aPriority !== bPriority) return bPriority - aPriority;
      
      const aSavings = a.impact?.costSavings?.annual || 0;
      const bSavings = b.impact?.costSavings?.annual || 0;
      return bSavings - aSavings;
    }).slice(0, 10); // Limit to top 10 recommendations
  }

  private removeConflictingRecommendations(recommendations: any[]): any[] {
    // Group by appliance and type
    const groups = new Map<string, any[]>();
    
    recommendations.forEach(rec => {
      const key = `${rec.applianceId || 'global'}_${rec.type}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(rec);
    });

    // Keep only the highest priority/savings recommendation per group
    const filtered: any[] = [];
    
    for (const group of groups.values()) {
      if (group.length === 1) {
        filtered.push(group[0]);
      } else {
        // Sort by priority and savings, take the best
        const best = group.sort((a, b) => {
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          const aPriority = priorityOrder[a.priority] || 0;
          const bPriority = priorityOrder[b.priority] || 0;
          
          if (aPriority !== bPriority) return bPriority - aPriority;
          
          const aSavings = a.impact?.costSavings?.annual || 0;
          const bSavings = b.impact?.costSavings?.annual || 0;
          return bSavings - aSavings;
        })[0];
        
        filtered.push(best);
      }
    }

    return filtered;
  }

  private async saveRecommendation(userId: string, recData: any): Promise<void> {
    try {
      const recommendation = new Recommendation({
        userId,
        ...recData
      });

      await recommendation.save();
    } catch (error) {
      logger.error('Error saving recommendation:', error);
    }
  }

  // Helper methods
  private getEfficiencySolution(appliance: any, patterns: any): string {
    switch (appliance.category) {
      case 'HVAC':
        return 'Adjust temperature settings, clean/replace filters, seal air leaks, and optimize scheduling';
      case 'Water Heating':
        return 'Lower water heater temperature, insulate tank and pipes, fix leaks, use low-flow fixtures';
      case 'Lighting':
        return 'Replace with LED bulbs, install smart switches, use daylight sensors';
      default:
        return 'Optimize settings, maintain regularly, consider smart controls';
    }
  }

  private getEfficiencySteps(appliance: any, patterns: any): string[] {
    const baseSteps = [
      'Review current usage patterns and identify waste',
      'Implement recommended efficiency improvements',
      'Monitor energy consumption for one week',
      'Fine-tune settings based on results'
    ];

    switch (appliance.category) {
      case 'HVAC':
        return [
          'Set thermostat to 68°F (winter) / 78°F (summer)',
          'Replace air filters monthly',
          'Seal windows and doors',
          'Enable smart scheduling',
          ...baseSteps
        ];
      case 'Water Heating':
        return [
          'Set water heater to 120°F',
          'Insulate hot water tank and first 6 feet of pipes',
          'Fix any hot water leaks',
          'Install low-flow showerheads',
          ...baseSteps
        ];
      default:
        return baseSteps;
    }
  }

  private async calculateEfficiencyImpact(appliance: any, patterns: any): Promise<any> {
    const currentConsumption = patterns.avgConsumption; // kWh/day
    const potentialImprovement = Math.min(0.3, (100 - patterns.efficiency) / 100); // Max 30% improvement
    const energySavings = currentConsumption * potentialImprovement;
    const costSavings = energySavings * 0.12; // $0.12/kWh average

    return {
      energySavings: {
        daily: energySavings,
        monthly: energySavings * 30,
        annual: energySavings * 365
      },
      costSavings: {
        daily: costSavings,
        monthly: costSavings * 30,
        annual: costSavings * 365
      },
      environmentalImpact: {
        co2Reduction: energySavings * 365 * 0.4, // 0.4 kg CO2 per kWh
        equivalentTrees: Math.floor(energySavings * 365 * 0.4 / 22) // 22 kg CO2 per tree/year
      },
      comfortImpact: 'neutral',
      reliabilityImpact: 'improved'
    };
  }

  private async calculateBehaviorImpact(behaviorAnalysis: any, electricityRate: any): Promise<any> {
    const peakUsage = behaviorAnalysis.peakConsumption; // kWh during peak
    const potentialShift = peakUsage * 0.5; // Assume 50% can be shifted
    const rateDifference = electricityRate.peakRate - electricityRate.offPeakRate;
    const dailySavings = potentialShift * rateDifference;

    return {
      energySavings: {
        daily: 0, // No energy saved, just cost optimization
        monthly: 0,
        annual: 0
      },
      costSavings: {
        daily: dailySavings,
        monthly: dailySavings * 30,
        annual: dailySavings * 365
      },
      environmentalImpact: {
        co2Reduction: 0,
        equivalentTrees: 0
      },
      comfortImpact: 'neutral',
      reliabilityImpact: 'unchanged'
    };
  }

  private async calculateRecentEfficiency(applianceId: string, readings: any[]): Promise<number> {
    const applianceReadings = readings.filter(
      r => r.applianceId.toString() === applianceId.toString()
    ).slice(0, 50); // Last 50 readings

    if (applianceReadings.length === 0) return 100;

    // Calculate efficiency based on consumption vs. rated power
    const avgConsumption = applianceReadings.reduce((sum, r) => sum + r.consumption.current, 0) / applianceReadings.length;
    
    // This is a simplified efficiency calculation
    // In reality, efficiency would be calculated based on appliance-specific metrics
    return Math.min(100, Math.max(0, 100 - (avgConsumption * 10))); // Simplified formula
  }

  // Public API methods
  async getUserRecommendations(userId: string, status?: string): Promise<any[]> {
    const query: any = { userId };
    if (status) query['status.current'] = status;

    return await Recommendation.find(query)
      .populate('applianceId', 'name category location')
      .sort({ priority: -1, 'impact.costSavings.annual': -1 });
  }

  async updateRecommendationStatus(
    recommendationId: string, 
    status: string, 
    feedback?: any
  ): Promise<any> {
    const update: any = { 'status.current': status };
    if (feedback) update['status.userFeedback'] = feedback;
    if (status === 'implemented') update['status.implementedDate'] = new Date();

    return await Recommendation.findByIdAndUpdate(
      recommendationId,
      { $set: update },
      { new: true }
    );
  }

  async getRecommendationAnalytics(userId: string): Promise<any> {
    const recommendations = await Recommendation.find({ userId });

    return {
      totalRecommendations: recommendations.length,
      byStatus: {
        pending: recommendations.filter(r => r.status.current === 'pending').length,
        accepted: recommendations.filter(r => r.status.current === 'accepted').length,
        implemented: recommendations.filter(r => r.status.current === 'implemented').length,
        rejected: recommendations.filter(r => r.status.current === 'rejected').length
      },
      byPriority: {
        critical: recommendations.filter(r => r.priority === 'critical').length,
        high: recommendations.filter(r => r.priority === 'high').length,
        medium: recommendations.filter(r => r.priority === 'medium').length,
        low: recommendations.filter(r => r.priority === 'low').length
      },
      totalPotentialSavings: {
        annual: recommendations.reduce((sum, r) => sum + (r.impact.costSavings?.annual || 0), 0),
        lifetime: recommendations.reduce((sum, r) => sum + (r.impact.costSavings?.lifetime || 0), 0)
      },
      implementationRate: recommendations.length > 0 ? 
        recommendations.filter(r => r.status.current === 'implemented').length / recommendations.length * 100 : 0
    };
  }

  async stopRecommendationEngine(): Promise<void> {
    logger.info('⏹️ Stopping Recommendation Service');
    
    this.analysisJob?.stop();
    this.processingQueue.clear();
    await this.mlEngine.cleanup();
  }
}

export async function startRecommendationService(io: SocketIOServer): Promise<void> {
  const service = new RecommendationService(io);
  await service.startRecommendationEngine();
}