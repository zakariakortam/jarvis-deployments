/**
 * Corn Acid Set Point Optimization System
 * Main server entry point
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const http = require('http');
const socketIo = require('socket.io');

const logger = require('./src/utils/logger');
const routes = require('./src/routes');
const errorHandler = require('./src/middleware/errorHandler');
const { connectDatabase } = require('./src/config/database');
const { connectRedis } = require('./src/config/redis');
const OptimizationEngine = require('./src/services/optimizationEngine');
const DataProcessor = require('./src/services/dataProcessor');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 8080;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000 // limit each IP to 1000 requests per windowMs
});
app.use(limiter);

// Logging
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.VERSION || '1.0.0'
  });
});

// API routes
app.use('/api/v1', routes);

// Error handling
app.use(errorHandler);

// Socket.IO for real-time data
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);
  
  socket.on('join-plant', (plantId) => {
    socket.join(`plant-${plantId}`);
    logger.info(`Client ${socket.id} joined plant ${plantId}`);
  });

  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// Make io available globally
app.set('io', io);

async function startServer() {
  try {
    // Connect to databases
    await connectDatabase();
    await connectRedis();
    
    // Initialize services
    const optimizationEngine = new OptimizationEngine();
    const dataProcessor = new DataProcessor(io);
    
    // Start optimization engine
    optimizationEngine.start();
    dataProcessor.start();
    
    // Start server
    server.listen(PORT, () => {
      logger.info(` Corn Optimizer Server running on port ${PORT}`);
      logger.info(` Dashboard available at http://localhost:${PORT}/api/v1/health`);
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

startServer();

module.exports = app;