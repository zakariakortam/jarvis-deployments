import mongoose, { Document, Schema } from 'mongoose';

export interface ISchedule extends Document {
  userId: string;
  applianceId: string;
  name: string;
  description?: string;
  scheduleType: 'one-time' | 'recurring' | 'conditional';
  
  timing: {
    startTime?: Date; // for one-time schedules
    endTime?: Date;
    recurrenceRule?: {
      frequency: 'daily' | 'weekly' | 'monthly';
      interval: number; // every N days/weeks/months
      daysOfWeek: number[]; // 0=Sunday, 1=Monday, etc.
      daysOfMonth: number[]; // 1-31
      startDate: Date;
      endDate?: Date;
    };
    duration?: number; // runtime in minutes
  };
  
  actions: {
    operation: 'turn_on' | 'turn_off' | 'adjust_temperature' | 'set_mode' | 'custom';
    parameters?: {
      temperature?: number;
      mode?: string;
      intensity?: number;
      customCommand?: string;
    };
  };
  
  conditions: {
    energyPriceThreshold?: number; // only run if price below this
    weatherCondition?: string[];
    occupancyRequired?: boolean;
    minTimeGap?: number; // minutes between runs
    maxDailyRuns?: number;
  };
  
  optimization: {
    priorityLevel: 1 | 2 | 3 | 4 | 5; // 1=lowest, 5=highest
    costTarget?: number; // max cost per execution
    energyBudget?: number; // max kWh per execution
    flexibility: {
      canDelay: boolean;
      maxDelayMinutes?: number;
      canAdvance: boolean;
      maxAdvanceMinutes?: number;
    };
  };
  
  status: {
    isActive: boolean;
    lastExecuted?: Date;
    nextExecution?: Date;
    executionCount: number;
    failureCount: number;
    lastFailureReason?: string;
  };
  
  analytics: {
    totalEnergySaved: number; // kWh
    totalCostSaved: number; // USD
    averageExecutionTime: number; // minutes
    successRate: number; // percentage
  };
  
  notifications: {
    onExecution: boolean;
    onFailure: boolean;
    onOptimization: boolean;
    methods: ('email' | 'push' | 'sms')[];
  };
  
  createdBy: 'user' | 'ai_recommendation' | 'auto_optimization';
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const scheduleSchema = new Schema<ISchedule>({
  userId: {
    type: String,
    required: [true, 'User ID is required'],
    ref: 'User',
    index: true
  },
  applianceId: {
    type: String,
    required: [true, 'Appliance ID is required'],
    ref: 'Appliance',
    index: true
  },
  name: {
    type: String,
    required: [true, 'Schedule name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  scheduleType: {
    type: String,
    required: true,
    enum: ['one-time', 'recurring', 'conditional']
  },
  timing: {
    startTime: Date,
    endTime: Date,
    recurrenceRule: {
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly']
      },
      interval: {
        type: Number,
        min: 1,
        default: 1
      },
      daysOfWeek: [{
        type: Number,
        min: 0,
        max: 6
      }],
      daysOfMonth: [{
        type: Number,
        min: 1,
        max: 31
      }],
      startDate: Date,
      endDate: Date
    },
    duration: {
      type: Number,
      min: 1 // at least 1 minute
    }
  },
  actions: {
    operation: {
      type: String,
      required: true,
      enum: ['turn_on', 'turn_off', 'adjust_temperature', 'set_mode', 'custom']
    },
    parameters: {
      temperature: Number,
      mode: String,
      intensity: {
        type: Number,
        min: 0,
        max: 100
      },
      customCommand: String
    }
  },
  conditions: {
    energyPriceThreshold: {
      type: Number,
      min: 0
    },
    weatherCondition: [String],
    occupancyRequired: Boolean,
    minTimeGap: {
      type: Number,
      min: 1 // at least 1 minute
    },
    maxDailyRuns: {
      type: Number,
      min: 1
    }
  },
  optimization: {
    priorityLevel: {
      type: Number,
      required: true,
      enum: [1, 2, 3, 4, 5],
      default: 3
    },
    costTarget: {
      type: Number,
      min: 0
    },
    energyBudget: {
      type: Number,
      min: 0
    },
    flexibility: {
      canDelay: { type: Boolean, default: false },
      maxDelayMinutes: {
        type: Number,
        min: 1
      },
      canAdvance: { type: Boolean, default: false },
      maxAdvanceMinutes: {
        type: Number,
        min: 1
      }
    }
  },
  status: {
    isActive: { type: Boolean, default: true },
    lastExecuted: Date,
    nextExecution: Date,
    executionCount: { type: Number, default: 0, min: 0 },
    failureCount: { type: Number, default: 0, min: 0 },
    lastFailureReason: String
  },
  analytics: {
    totalEnergySaved: { type: Number, default: 0, min: 0 },
    totalCostSaved: { type: Number, default: 0, min: 0 },
    averageExecutionTime: { type: Number, default: 0, min: 0 },
    successRate: { type: Number, default: 100, min: 0, max: 100 }
  },
  notifications: {
    onExecution: { type: Boolean, default: false },
    onFailure: { type: Boolean, default: true },
    onOptimization: { type: Boolean, default: true },
    methods: [{
      type: String,
      enum: ['email', 'push', 'sms']
    }]
  },
  createdBy: {
    type: String,
    required: true,
    enum: ['user', 'ai_recommendation', 'auto_optimization']
  },
  tags: [String]
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for efficient scheduling queries
scheduleSchema.index({ userId: 1, 'status.isActive': 1 });
scheduleSchema.index({ applianceId: 1, 'status.isActive': 1 });
scheduleSchema.index({ 'status.nextExecution': 1, 'status.isActive': 1 });
scheduleSchema.index({ createdBy: 1, 'analytics.totalCostSaved': -1 });

// Pre-save middleware to calculate next execution
scheduleSchema.pre('save', function(next) {
  if (this.isModified('timing') && this.scheduleType === 'recurring' && this.timing.recurrenceRule) {
    // Calculate next execution based on recurrence rule
    this.status.nextExecution = calculateNextExecution(this);
  }
  next();
});

// Helper function to calculate next execution (simplified version)
function calculateNextExecution(schedule: ISchedule): Date {
  const now = new Date();
  const rule = schedule.timing.recurrenceRule;
  
  if (!rule) return now;
  
  let nextExecution = new Date(now);
  
  switch (rule.frequency) {
    case 'daily':
      nextExecution.setDate(nextExecution.getDate() + rule.interval);
      break;
    case 'weekly':
      nextExecution.setDate(nextExecution.getDate() + (rule.interval * 7));
      break;
    case 'monthly':
      nextExecution.setMonth(nextExecution.getMonth() + rule.interval);
      break;
  }
  
  return nextExecution;
}

export const Schedule = mongoose.model<ISchedule>('Schedule', scheduleSchema);