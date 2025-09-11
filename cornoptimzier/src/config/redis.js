const redis = require('redis');
const logger = require('../utils/logger');

let client;

const connectRedis = async () => {
  try {
    client = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      retry_strategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      }
    });

    client.on('error', (err) => {
      logger.error('Redis Client Error:', err);
    });

    client.on('connect', () => {
      logger.info(' Redis connected successfully');
    });

    await client.connect();
    
  } catch (error) {
    logger.error(' Redis connection failed:', error);
    throw error;
  }
};

const getRedisClient = () => {
  if (!client) {
    throw new Error('Redis not connected');
  }
  return client;
};

module.exports = {
  connectRedis,
  getRedisClient
};