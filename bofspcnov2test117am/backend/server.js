import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { Server } from 'socket.io'
import dotenv from 'dotenv'
import authRoutes from './src/routes/auth.js'
import heatRoutes from './src/routes/heat.js'
import spcRoutes from './src/routes/spc.js'
import reportRoutes from './src/routes/report.js'
import integrationRoutes from './src/routes/integration.js'
import { errorHandler } from './src/middleware/errorHandler.js'
import { logger } from './src/utils/logger.js'
import { startRealtimeSimulation } from './src/services/realtimeService.js'

dotenv.config()

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
})

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`)
  next()
})

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/heats', heatRoutes)
app.use('/api/spc', spcRoutes)
app.use('/api/reports', reportRoutes)
app.use('/api/integration', integrationRoutes)

// Error handling
app.use(errorHandler)

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`)

  socket.on('subscribe_monitoring', () => {
    socket.join('monitoring')
    logger.info(`Client ${socket.id} subscribed to monitoring`)
  })

  socket.on('unsubscribe_monitoring', () => {
    socket.leave('monitoring')
    logger.info(`Client ${socket.id} unsubscribed from monitoring`)
  })

  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`)
  })
})

// Make io accessible to routes
app.set('io', io)

// Start real-time data simulation for demo purposes
startRealtimeSimulation(io)

const PORT = process.env.API_PORT || 5000

httpServer.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`)
  console.log(`🚀 BOF SPC System API Server running on port ${PORT}`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server')
  httpServer.close(() => {
    logger.info('HTTP server closed')
    process.exit(0)
  })
})

export default app
