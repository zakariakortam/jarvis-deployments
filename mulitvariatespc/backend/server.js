import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import compression from 'compression'
import helmet from 'helmet'
import dotenv from 'dotenv'
import SPCEngine from './src/services/spcEngine.js'
import DataGenerator from './src/services/dataGenerator.js'
import Database from './src/services/database.js'

dotenv.config()

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
})

// Middleware
app.use(helmet())
app.use(cors())
app.use(compression())
app.use(express.json())

// Initialize services
const db = new Database()
const spcEngine = new SPCEngine(db)
const dataGenerator = new DataGenerator()

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})

// API Routes
app.get('/api/config', (req, res) => {
  res.json(spcEngine.getConfiguration())
})

app.post('/api/config', (req, res) => {
  try {
    spcEngine.updateConfiguration(req.body)
    res.json({ success: true, config: spcEngine.getConfiguration() })
  } catch (error) {
    res.status(400).json({ success: false, error: error.message })
  }
})

app.get('/api/historical', (req, res) => {
  const { startDate, endDate, variables } = req.query
  try {
    const data = db.getHistoricalData(startDate, endDate, variables)
    res.json({ success: true, data })
  } catch (error) {
    res.status(400).json({ success: false, error: error.message })
  }
})

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`)

  let monitoringInterval = null

  // Start monitoring
  socket.on('start_monitoring', () => {
    console.log(`Starting monitoring for ${socket.id}`)

    if (monitoringInterval) {
      clearInterval(monitoringInterval)
    }

    // Initialize Phase I data if not exists
    if (!spcEngine.isInitialized()) {
      const phaseIData = dataGenerator.generatePhaseIData(30, 5)
      spcEngine.initializePhaseI(phaseIData)

      // Send control limits
      socket.emit('control_limits', {
        chartType: 'hotellingT2',
        ucl: spcEngine.controlLimits.hotellingT2.ucl,
        cl: spcEngine.controlLimits.hotellingT2.cl
      })
    }

    // Start sending real-time data
    monitoringInterval = setInterval(() => {
      const observation = dataGenerator.generateObservation(5)
      const result = spcEngine.processObservation(observation)

      // Store in database
      db.saveProcessData({
        timestamp: new Date().toISOString(),
        values: observation,
        statistic: result.statistic,
        chartType: result.chartType,
        status: result.status
      })

      // Emit to client
      socket.emit('process_data', {
        timestamp: new Date().toISOString(),
        values: observation,
        statistic: result.statistic,
        chartType: result.chartType,
        status: result.status,
        contributions: result.contributions
      })

      // Emit alert if out of control
      if (result.status === 'critical' || result.status === 'warning') {
        socket.emit('system_alert', {
          type: result.status,
          message: `Process ${result.status}: ${result.chartType} statistic = ${result.statistic.toFixed(4)}`,
          timestamp: new Date().toISOString(),
          data: result
        })
      }
    }, spcEngine.config.samplingInterval || 5000)
  })

  // Stop monitoring
  socket.on('stop_monitoring', () => {
    console.log(`Stopping monitoring for ${socket.id}`)
    if (monitoringInterval) {
      clearInterval(monitoringInterval)
      monitoringInterval = null
    }
  })

  // Reset control limits
  socket.on('reset_control_limits', () => {
    console.log(`Resetting control limits for ${socket.id}`)
    spcEngine.reset()
    if (monitoringInterval) {
      clearInterval(monitoringInterval)
      monitoringInterval = null
    }
    socket.emit('system_alert', {
      type: 'info',
      message: 'Control limits have been reset',
      timestamp: new Date().toISOString()
    })
  })

  // Update configuration
  socket.on('update_configuration', (config) => {
    console.log(`Updating configuration for ${socket.id}`)
    try {
      spcEngine.updateConfiguration(config)
      socket.emit('config_update', spcEngine.getConfiguration())
      socket.emit('system_alert', {
        type: 'success',
        message: 'Configuration updated successfully',
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      socket.emit('system_alert', {
        type: 'error',
        message: `Configuration update failed: ${error.message}`,
        timestamp: new Date().toISOString()
      })
    }
  })

  // Request historical data
  socket.on('request_historical_data', ({ startDate, endDate, variables }) => {
    console.log(`Historical data requested by ${socket.id}`)
    try {
      const data = db.getHistoricalData(startDate, endDate, variables)
      socket.emit('historical_data', { success: true, data })
    } catch (error) {
      socket.emit('historical_data', { success: false, error: error.message })
    }
  })

  // Export data
  socket.on('export_data', ({ format, options }) => {
    console.log(`Export requested by ${socket.id}: ${format}`)
    // Implementation for export functionality
    socket.emit('system_alert', {
      type: 'info',
      message: `Export to ${format} initiated`,
      timestamp: new Date().toISOString()
    })
  })

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`)
    if (monitoringInterval) {
      clearInterval(monitoringInterval)
    }
  })
})

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  })
})

// Start server
const PORT = process.env.PORT || 5000
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`WebSocket server ready`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...')
  httpServer.close(() => {
    console.log('Server closed')
    db.close()
    process.exit(0)
  })
})
