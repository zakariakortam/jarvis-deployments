import mongoose, { Document, Schema } from 'mongoose';

export interface IEnergyReading extends Document {
  userId: string;
  applianceId: string;
  timestamp: Date;
  consumption: {
    current: number; // kWh for current reading period
    cumulative: number; // total kWh since installation
    voltage: number;
    amperage: number;
    powerFactor: number;
    frequency: number;
  };
  cost: {
    current: number; // cost for current reading
    cumulative: number; // total cost to date
    rate: number; // rate per kWh at time of reading
    tier?: string; // peak/off-peak/standard
  };
  environmental: {
    co2Produced: number; // kg of CO2
    co2Factor: number; // kg CO2 per kWh (varies by grid source)
  };
  quality: {
    dataSource: 'smart_meter' | 'iot_sensor' | 'manual_entry' | 'estimated';
    confidence: number; // 0-100 confidence in reading accuracy
    anomalyFlags: string[]; // any detected anomalies
  };
  context: {
    weatherCondition?: string;
    outsideTemperature?: number;
    occupancyDetected?: boolean;
    timeOfDay: 'peak' | 'off-peak' | 'standard';
  };
}

const energyReadingSchema = new Schema<IEnergyReading>({
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
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  consumption: {
    current: {
      type: Number,
      required: [true, 'Current consumption is required'],
      min: [0, 'Consumption cannot be negative']
    },
    cumulative: {
      type: Number,
      required: [true, 'Cumulative consumption is required'],
      min: [0, 'Cumulative consumption cannot be negative']
    },
    voltage: {
      type: Number,
      required: true,
      min: 0
    },
    amperage: {
      type: Number,
      required: true,
      min: 0
    },
    powerFactor: {
      type: Number,
      min: 0,
      max: 1,
      default: 1
    },
    frequency: {
      type: Number,
      default: 60 // 60 Hz in North America
    }
  },
  cost: {
    current: {
      type: Number,
      required: true,
      min: 0
    },
    cumulative: {
      type: Number,
      required: true,
      min: 0
    },
    rate: {
      type: Number,
      required: true,
      min: 0
    },
    tier: {
      type: String,
      enum: ['peak', 'off-peak', 'standard'],
      default: 'standard'
    }
  },
  environmental: {
    co2Produced: {
      type: Number,
      required: true,
      min: 0
    },
    co2Factor: {
      type: Number,
      required: true,
      min: 0,
      default: 0.4 // kg CO2 per kWh (US average)
    }
  },
  quality: {
    dataSource: {
      type: String,
      enum: ['smart_meter', 'iot_sensor', 'manual_entry', 'estimated'],
      required: true
    },
    confidence: {
      type: Number,
      min: 0,
      max: 100,
      default: 95
    },
    anomalyFlags: [String]
  },
  context: {
    weatherCondition: {
      type: String,
      enum: ['sunny', 'cloudy', 'rainy', 'hot', 'cold', 'humid']
    },
    outsideTemperature: Number,
    occupancyDetected: Boolean,
    timeOfDay: {
      type: String,
      enum: ['peak', 'off-peak', 'standard'],
      required: true
    }
  }
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      delete ret.__v;
      return ret;
    }
  }
});

// Compound indexes for efficient time-series queries
energyReadingSchema.index({ userId: 1, timestamp: -1 });
energyReadingSchema.index({ applianceId: 1, timestamp: -1 });
energyReadingSchema.index({ userId: 1, applianceId: 1, timestamp: -1 });
energyReadingSchema.index({ timestamp: -1, 'quality.dataSource': 1 });

// TTL index for automatic cleanup of old readings (optional)
energyReadingSchema.index({ timestamp: 1 }, { 
  expireAfterSeconds: 365 * 24 * 60 * 60 // Keep for 1 year
});

// Static methods for aggregations
energyReadingSchema.statics.getConsumptionByPeriod = function(
  userId: string, 
  startDate: Date, 
  endDate: Date
) {
  return this.aggregate([
    {
      $match: {
        userId,
        timestamp: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$timestamp' },
          month: { $month: '$timestamp' },
          day: { $dayOfMonth: '$timestamp' }
        },
        totalConsumption: { $sum: '$consumption.current' },
        totalCost: { $sum: '$cost.current' },
        totalCO2: { $sum: '$environmental.co2Produced' },
        readingCount: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
    }
  ]);
};

export const EnergyReading = mongoose.model<IEnergyReading>('EnergyReading', energyReadingSchema);