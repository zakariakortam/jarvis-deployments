import mongoose, { Document, Schema } from 'mongoose';

export interface IAppliance extends Document {
  userId: string;
  name: string;
  category: string;
  brand?: string;
  model?: string;
  location: string;
  specifications: {
    ratedPower: number; // watts
    voltageRating: number;
    energyStarRating?: number;
    estimatedLifespan?: number; // years
  };
  energyProfile: {
    avgHourlyConsumption: number; // kWh
    peakConsumption: number; // kWh
    standbyConsumption: number; // kWh
    efficiency: number; // percentage
  };
  smartFeatures: {
    isSmartEnabled: boolean;
    canSchedule: boolean;
    hasRemoteControl: boolean;
    hasEnergyMonitoring: boolean;
    communicationProtocol?: string; // WiFi, Zigbee, Z-Wave, etc.
  };
  operationalData: {
    currentStatus: 'on' | 'off' | 'standby' | 'scheduled';
    totalRuntimeHours: number;
    lastUsed?: Date;
    averageDailyUsage: number; // hours
    usagePattern: string[]; // time slots when typically used
  };
  costData: {
    purchasePrice?: number;
    purchaseDate?: Date;
    monthlyCost: number;
    totalCostToDate: number;
    costPerHour: number;
  };
  maintenanceInfo: {
    lastMaintenance?: Date;
    nextMaintenanceDate?: Date;
    maintenanceAlerts: boolean;
    warrantyExpiry?: Date;
  };
  isActive: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const applianceSchema = new Schema<IAppliance>({
  userId: {
    type: String,
    required: [true, 'User ID is required'],
    ref: 'User',
    index: true
  },
  name: {
    type: String,
    required: [true, 'Appliance name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'HVAC', 'Lighting', 'Kitchen', 'Laundry', 'Electronics', 
      'Water Heating', 'Pool & Spa', 'Security', 'Smart Home', 'Other'
    ]
  },
  brand: {
    type: String,
    trim: true,
    maxlength: [50, 'Brand cannot exceed 50 characters']
  },
  model: {
    type: String,
    trim: true,
    maxlength: [100, 'Model cannot exceed 100 characters']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
    maxlength: [50, 'Location cannot exceed 50 characters']
  },
  specifications: {
    ratedPower: {
      type: Number,
      required: [true, 'Rated power is required'],
      min: [0, 'Power cannot be negative']
    },
    voltageRating: {
      type: Number,
      required: true,
      enum: [110, 120, 220, 240, 277, 480]
    },
    energyStarRating: {
      type: Number,
      min: 1,
      max: 5
    },
    estimatedLifespan: {
      type: Number,
      min: 1,
      max: 50
    }
  },
  energyProfile: {
    avgHourlyConsumption: {
      type: Number,
      required: true,
      min: 0
    },
    peakConsumption: {
      type: Number,
      required: true,
      min: 0
    },
    standbyConsumption: {
      type: Number,
      default: 0,
      min: 0
    },
    efficiency: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    }
  },
  smartFeatures: {
    isSmartEnabled: { type: Boolean, default: false },
    canSchedule: { type: Boolean, default: false },
    hasRemoteControl: { type: Boolean, default: false },
    hasEnergyMonitoring: { type: Boolean, default: false },
    communicationProtocol: {
      type: String,
      enum: ['WiFi', 'Zigbee', 'Z-Wave', 'Bluetooth', 'Thread', 'Matter', 'None']
    }
  },
  operationalData: {
    currentStatus: {
      type: String,
      enum: ['on', 'off', 'standby', 'scheduled'],
      default: 'off'
    },
    totalRuntimeHours: { type: Number, default: 0, min: 0 },
    lastUsed: Date,
    averageDailyUsage: { type: Number, default: 0, min: 0 },
    usagePattern: [String]
  },
  costData: {
    purchasePrice: { type: Number, min: 0 },
    purchaseDate: Date,
    monthlyCost: { type: Number, default: 0, min: 0 },
    totalCostToDate: { type: Number, default: 0, min: 0 },
    costPerHour: { type: Number, default: 0, min: 0 }
  },
  maintenanceInfo: {
    lastMaintenance: Date,
    nextMaintenanceDate: Date,
    maintenanceAlerts: { type: Boolean, default: true },
    warrantyExpiry: Date
  },
  isActive: { type: Boolean, default: true },
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

// Compound indexes for efficient queries
applianceSchema.index({ userId: 1, category: 1 });
applianceSchema.index({ userId: 1, isActive: 1 });
applianceSchema.index({ userId: 1, 'operationalData.currentStatus': 1 });
applianceSchema.index({ 'costData.monthlyCost': -1 });

// Virtual for calculating annual cost
applianceSchema.virtual('annualCost').get(function() {
  return this.costData.monthlyCost * 12;
});

// Pre-save middleware to calculate cost per hour
applianceSchema.pre('save', function(next) {
  if (this.energyProfile.avgHourlyConsumption && this.parent) {
    // This would need access to user's electricity rate
    // For now, using a default rate of $0.12/kWh
    const defaultRate = 0.12;
    this.costData.costPerHour = this.energyProfile.avgHourlyConsumption * defaultRate;
  }
  next();
});

export const Appliance = mongoose.model<IAppliance>('Appliance', applianceSchema);