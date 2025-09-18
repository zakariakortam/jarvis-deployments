import mongoose, { Document, Schema } from 'mongoose';

export interface IRecommendation extends Document {
  userId: string;
  applianceId?: string;
  type: 'scheduling' | 'efficiency' | 'replacement' | 'behavioral' | 'rate_optimization' | 'maintenance';
  category: 'cost_saving' | 'energy_reduction' | 'environmental' | 'comfort' | 'safety';
  priority: 'low' | 'medium' | 'high' | 'critical';
  
  title: string;
  description: string;
  detailedAnalysis: {
    currentSituation: string;
    problemIdentified: string;
    proposedSolution: string;
    implementationSteps: string[];
    technicalDetails?: string;
  };
  
  impact: {
    energySavings: {
      daily: number; // kWh
      monthly: number;
      annual: number;
    };
    costSavings: {
      daily: number; // USD
      monthly: number;
      annual: number;
      lifetime?: number;
    };
    environmentalImpact: {
      co2Reduction: number; // kg annually
      equivalentTrees: number; // trees planted equivalent
    };
    comfortImpact: 'positive' | 'neutral' | 'negative';
    reliabilityImpact: 'improved' | 'unchanged' | 'reduced';
  };
  
  implementation: {
    difficulty: 'easy' | 'moderate' | 'difficult' | 'professional_required';
    estimatedTime: number; // minutes
    upfrontCost: number; // USD
    paybackPeriod?: number; // months
    requiredTools: string[];
    safetyPrecautions: string[];
    automatable: boolean;
  };
  
  confidence: {
    score: number; // 0-100
    factors: string[]; // what the confidence is based on
    dataQuality: 'high' | 'medium' | 'low';
    lastAnalysisDate: Date;
  };
  
  status: {
    current: 'pending' | 'accepted' | 'rejected' | 'implemented' | 'expired';
    userFeedback?: {
      rating: number; // 1-5 stars
      comments: string;
      implementation_success: boolean;
      actual_savings?: number;
    };
    autoImplemented: boolean;
    implementedDate?: Date;
    expiryDate: Date;
  };
  
  triggers: {
    dataConditions: string[]; // what data patterns triggered this
    thresholds: {
      costThreshold?: number;
      usageThreshold?: number;
      efficiencyThreshold?: number;
    };
    seasonality: boolean;
    weatherTriggered: boolean;
  };
  
  relatedAppliances: string[]; // other appliance IDs that might be affected
  conflictsWith: string[]; // other recommendation IDs that conflict
  dependsOn: string[]; // other recommendations that should be implemented first
  
  mlMetadata: {
    modelVersion: string;
    algorithmUsed: string;
    trainingDataPeriod: {
      start: Date;
      end: Date;
    };
    features: string[]; // features used for this recommendation
    confidence_intervals: {
      lower: number;
      upper: number;
    };
  };
  
  createdAt: Date;
  updatedAt: Date;
}

const recommendationSchema = new Schema<IRecommendation>({
  userId: {
    type: String,
    required: [true, 'User ID is required'],
    ref: 'User',
    index: true
  },
  applianceId: {
    type: String,
    ref: 'Appliance',
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: ['scheduling', 'efficiency', 'replacement', 'behavioral', 'rate_optimization', 'maintenance']
  },
  category: {
    type: String,
    required: true,
    enum: ['cost_saving', 'energy_reduction', 'environmental', 'comfort', 'safety']
  },
  priority: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  detailedAnalysis: {
    currentSituation: { type: String, required: true },
    problemIdentified: { type: String, required: true },
    proposedSolution: { type: String, required: true },
    implementationSteps: [{ type: String, required: true }],
    technicalDetails: String
  },
  impact: {
    energySavings: {
      daily: { type: Number, required: true, min: 0 },
      monthly: { type: Number, required: true, min: 0 },
      annual: { type: Number, required: true, min: 0 }
    },
    costSavings: {
      daily: { type: Number, required: true, min: 0 },
      monthly: { type: Number, required: true, min: 0 },
      annual: { type: Number, required: true, min: 0 },
      lifetime: { type: Number, min: 0 }
    },
    environmentalImpact: {
      co2Reduction: { type: Number, required: true, min: 0 },
      equivalentTrees: { type: Number, required: true, min: 0 }
    },
    comfortImpact: {
      type: String,
      required: true,
      enum: ['positive', 'neutral', 'negative']
    },
    reliabilityImpact: {
      type: String,
      required: true,
      enum: ['improved', 'unchanged', 'reduced']
    }
  },
  implementation: {
    difficulty: {
      type: String,
      required: true,
      enum: ['easy', 'moderate', 'difficult', 'professional_required']
    },
    estimatedTime: { type: Number, required: true, min: 0 },
    upfrontCost: { type: Number, required: true, min: 0 },
    paybackPeriod: { type: Number, min: 1 },
    requiredTools: [String],
    safetyPrecautions: [String],
    automatable: { type: Boolean, default: false }
  },
  confidence: {
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    factors: [String],
    dataQuality: {
      type: String,
      required: true,
      enum: ['high', 'medium', 'low']
    },
    lastAnalysisDate: { type: Date, default: Date.now }
  },
  status: {
    current: {
      type: String,
      required: true,
      enum: ['pending', 'accepted', 'rejected', 'implemented', 'expired'],
      default: 'pending'
    },
    userFeedback: {
      rating: { type: Number, min: 1, max: 5 },
      comments: String,
      implementation_success: Boolean,
      actual_savings: Number
    },
    autoImplemented: { type: Boolean, default: false },
    implementedDate: Date,
    expiryDate: { type: Date, required: true }
  },
  triggers: {
    dataConditions: [String],
    thresholds: {
      costThreshold: Number,
      usageThreshold: Number,
      efficiencyThreshold: Number
    },
    seasonality: { type: Boolean, default: false },
    weatherTriggered: { type: Boolean, default: false }
  },
  relatedAppliances: [String],
  conflictsWith: [String],
  dependsOn: [String],
  mlMetadata: {
    modelVersion: { type: String, required: true },
    algorithmUsed: { type: String, required: true },
    trainingDataPeriod: {
      start: { type: Date, required: true },
      end: { type: Date, required: true }
    },
    features: [String],
    confidence_intervals: {
      lower: { type: Number, required: true },
      upper: { type: Number, required: true }
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

// Indexes for efficient querying
recommendationSchema.index({ userId: 1, 'status.current': 1, priority: -1 });
recommendationSchema.index({ userId: 1, category: 1, createdAt: -1 });
recommendationSchema.index({ applianceId: 1, type: 1 });
recommendationSchema.index({ 'status.expiryDate': 1 }); // For cleanup
recommendationSchema.index({ 'impact.costSavings.annual': -1 }); // For sorting by savings

// TTL index for automatic cleanup of expired recommendations
recommendationSchema.index({ 'status.expiryDate': 1 }, { 
  expireAfterSeconds: 0 // Remove at expiry date
});

// Pre-save middleware to set expiry date
recommendationSchema.pre('save', function(next) {
  if (this.isNew && !this.status.expiryDate) {
    // Set expiry date based on priority
    const daysToExpiry = this.priority === 'critical' ? 7 : 
                        this.priority === 'high' ? 30 : 
                        this.priority === 'medium' ? 60 : 90;
    
    this.status.expiryDate = new Date(Date.now() + daysToExpiry * 24 * 60 * 60 * 1000);
  }
  next();
});

export const Recommendation = mongoose.model<IRecommendation>('Recommendation', recommendationSchema);