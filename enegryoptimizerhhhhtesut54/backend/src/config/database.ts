import mongoose from 'mongoose';
import { InfluxDB, Point } from '@influxdata/influxdb-client';
import { logger } from '../utils/logger.js';

export const config = {
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/energy-optimizer',
    options: {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    }
  },
  influxdb: {
    url: process.env.INFLUXDB_URL || 'http://localhost:8086',
    token: process.env.INFLUXDB_TOKEN || 'admin-token',
    org: process.env.INFLUXDB_ORG || 'energy-org',
    bucket: process.env.INFLUXDB_BUCKET || 'energy-data'
  }
};

// MongoDB connection
export async function connectDatabase(): Promise<void> {
  try {
    await mongoose.connect(config.mongodb.uri, config.mongodb.options);
    logger.info('✅ MongoDB connected successfully');
    
    // Setup MongoDB event listeners
    mongoose.connection.on('error', (error) => {
      logger.error('MongoDB connection error:', error);
    });
    
    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });
    
    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
    });
    
  } catch (error) {
    logger.error('❌ MongoDB connection failed:', error);
    throw error;
  }
}

// InfluxDB client setup
export const influxDB = new InfluxDB({
  url: config.influxdb.url,
  token: config.influxdb.token
});

export const writeApi = influxDB.getWriteApi(
  config.influxdb.org,
  config.influxdb.bucket,
  'ms'
);

export const queryApi = influxDB.getQueryApi(config.influxdb.org);

// Test InfluxDB connection
export async function testInfluxConnection(): Promise<boolean> {
  try {
    const result = await queryApi.collectRows('buckets()');
    logger.info('✅ InfluxDB connected successfully');
    return true;
  } catch (error) {
    logger.error('❌ InfluxDB connection failed:', error);
    return false;
  }
}

// Utility function to write energy data point
export function writeEnergyPoint(
  deviceId: string,
  userId: string,
  consumption: number,
  cost: number,
  timestamp?: Date
): void {
  const point = new Point('energy_consumption')
    .tag('device_id', deviceId)
    .tag('user_id', userId)
    .floatField('consumption_kwh', consumption)
    .floatField('cost_usd', cost)
    .timestamp(timestamp || new Date());
    
  writeApi.writePoint(point);
}

// Graceful shutdown for database connections
export async function closeConnections(): Promise<void> {
  try {
    await mongoose.connection.close();
    await writeApi.close();
    logger.info('Database connections closed');
  } catch (error) {
    logger.error('Error closing database connections:', error);
  }
}