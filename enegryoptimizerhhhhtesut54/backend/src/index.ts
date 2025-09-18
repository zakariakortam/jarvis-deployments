import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/database.js';
import { connectDatabase } from './config/database.js';
import { logger } from './utils/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { rateLimiter } from './middleware/rateLimiter.js';
import { authMiddleware } from './middleware/auth.js';

// Import route controllers
import { authRoutes } from './controllers/authController.js';
import { applianceRoutes } from './controllers/applianceController.js';
import { energyRoutes } from './controllers/energyController.js';
import { schedulingRoutes } from './controllers/schedulingController.js';
import { recommendationRoutes } from './controllers/recommendationController.js';
import { userRoutes } from './controllers/userController.js';

// Import socket handlers
import { setupSocketHandlers } from './events/socketManager.js';

// Import background services
import { startEnergyMonitoringService } from './services/energyMonitoringService.js';
import { startSchedulingService } from './services/schedulingService.js';
import { startRecommendationService } from './services/recommendationService.js';

const app = express();
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));

// Rate limiting
app.use(rateLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/appliances', authMiddleware, applianceRoutes);
app.use('/api/energy', authMiddleware, energyRoutes);
app.use('/api/scheduling', authMiddleware, schedulingRoutes);
app.use('/api/recommendations', authMiddleware, recommendationRoutes);
app.use('/api/users', authMiddleware, userRoutes);

// Socket.io setup
setupSocketHandlers(io);

// Error handling middleware (must be last)
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Connect to databases
    await connectDatabase();
    
    // Start background services
    await startEnergyMonitoringService(io);
    await startSchedulingService(io);
    await startRecommendationService(io);
    
    server.listen(PORT, () => {
      logger.info(`🚀 Energy Optimizer Server running on port ${PORT}`);
      logger.info(`📊 Real-time monitoring active`);
      logger.info(`🤖 ML recommendation engine initialized`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

startServer();