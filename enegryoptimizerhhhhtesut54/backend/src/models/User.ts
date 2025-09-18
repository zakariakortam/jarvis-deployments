import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  preferences: {
    currency: string;
    timezone: string;
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    energyGoals: {
      monthlyCostTarget: number;
      co2ReductionTarget: number;
    };
  };
  electricityRate: {
    standardRate: number; // per kWh
    peakRate: number;
    offPeakRate: number;
    timeOfUseEnabled: boolean;
    peakHours: string[];
  };
  subscription: {
    plan: 'free' | 'premium' | 'enterprise';
    startDate: Date;
    endDate?: Date;
    status: 'active' | 'cancelled' | 'expired';
  };
  isEmailVerified: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false // Don't include password in queries by default
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  phone: {
    type: String,
    trim: true,
    match: [/^\+?[\d\s-()]+$/, 'Please enter a valid phone number']
  },
  address: {
    street: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    zipCode: { type: String, required: true, trim: true },
    country: { type: String, required: true, default: 'US' }
  },
  preferences: {
    currency: { type: String, default: 'USD', enum: ['USD', 'EUR', 'GBP', 'CAD'] },
    timezone: { type: String, default: 'America/New_York' },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    },
    energyGoals: {
      monthlyCostTarget: { type: Number, default: 150 },
      co2ReductionTarget: { type: Number, default: 10 } // percentage
    }
  },
  electricityRate: {
    standardRate: { type: Number, required: true, default: 0.12 },
    peakRate: { type: Number, default: 0.18 },
    offPeakRate: { type: Number, default: 0.08 },
    timeOfUseEnabled: { type: Boolean, default: false },
    peakHours: { type: [String], default: ['17:00-21:00'] }
  },
  subscription: {
    plan: { type: String, enum: ['free', 'premium', 'enterprise'], default: 'free' },
    startDate: { type: Date, default: Date.now },
    endDate: Date,
    status: { type: String, enum: ['active', 'cancelled', 'expired'], default: 'active' }
  },
  isEmailVerified: { type: Boolean, default: false },
  lastLoginAt: Date
}, {
  timestamps: true,
  toJSON: { 
    transform: (doc, ret) => {
      delete ret.password;
      delete ret.__v;
      return ret;
    }
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ 'subscription.plan': 1, 'subscription.status': 1 });

export const User = mongoose.model<IUser>('User', userSchema);