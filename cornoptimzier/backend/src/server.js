require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const socketIo = require('socket.io');

const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const authMiddleware = require('./middleware/auth');

// Route imports
const dataRoutes = require('./routes/data');
const optimizationRoutes = require('./routes/optimization');
const setpointRoutes = require('./routes/setpoints');
const alertRoutes = require('./routes/alerts');
const configRoutes = require('./routes/config');

// Initialize Express app
const app = express();
const server = createServer(app);
const io = socketIo(server, {
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
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API routes
app.use('/api/v1/data', authMiddleware, dataRoutes);
app.use('/api/v1/optimization', authMiddleware, optimizationRoutes);
app.use('/api/v1/setpoints', authMiddleware, setpointRoutes);
app.use('/api/v1/alerts', authMiddleware, alertRoutes);
app.use('/api/v1/config', authMiddleware, configRoutes);

// WebSocket connection handling
io.use(authMiddleware.socketAuth);

io.on('connection', (socket) => {
  logger.info('Client connected', { socketId: socket.id });

  // Join plant-specific rooms
  socket.on('join-plant', (plantId) => {
    socket.join(`plant-${plantId}`);
    logger.info('Client joined plant room', { socketId: socket.id, plantId });
  });

  socket.on('join-unit', (plantId, unitId) => {
    socket.join(`unit-${plantId}-${unitId}`);
    logger.info('Client joined unit room', { socketId: socket.id, plantId, unitId });
  });

  socket.on('disconnect', () => {
    logger.info('Client disconnected', { socketId: socket.id });
  });
});

// Make io available to other modules
app.set('io', io);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found',
    path: req.originalUrl
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`, {
    environment: process.env.NODE_ENV || 'development',
    port: PORT
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

module.exports = { app, server, io };