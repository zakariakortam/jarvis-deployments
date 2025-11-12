import io from 'socket.io-client'
import { useSpcStore } from '../store/spcStore'
import toast from 'react-hot-toast'

class WebSocketService {
  constructor() {
    this.socket = null
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectDelay = 2000
  }

  connect(url = import.meta.env.VITE_WS_URL || 'ws://localhost:5000') {
    if (this.socket?.connected) {
      return
    }

    this.socket = io(url, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: this.reconnectDelay,
      reconnectionAttempts: this.maxReconnectAttempts,
    })

    this.setupEventListeners()
  }

  setupEventListeners() {
    const store = useSpcStore.getState()

    this.socket.on('connect', () => {
      console.log('WebSocket connected')
      store.setConnectionStatus(true)
      this.reconnectAttempts = 0
      toast.success('Connected to real-time data stream')
    })

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected')
      store.setConnectionStatus(false)
      toast.error('Disconnected from data stream')
    })

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error)
      this.reconnectAttempts++

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        toast.error('Failed to connect to server. Please check your connection.')
      }
    })

    // Real-time process data
    this.socket.on('process_data', (data) => {
      store.addDataPoint(data)

      // Check for out-of-control conditions
      if (data.status === 'critical') {
        store.setProcessStatus('critical')
        store.addAlert({
          id: Date.now(),
          type: 'critical',
          message: `Critical: Process out of control - ${data.chartType} statistic exceeded UCL`,
          timestamp: new Date().toISOString(),
          data: data
        })
        toast.error('Critical: Process out of control!')
      } else if (data.status === 'warning') {
        store.setProcessStatus('warning')
        store.addAlert({
          id: Date.now(),
          type: 'warning',
          message: `Warning: Process approaching control limits - ${data.chartType}`,
          timestamp: new Date().toISOString(),
          data: data
        })
      } else {
        store.setProcessStatus('normal')
      }
    })

    // Control limits update
    this.socket.on('control_limits', (data) => {
      store.setControlLimits(data.chartType, {
        ucl: data.ucl,
        cl: data.cl,
        lcl: data.lcl || 0
      })
    })

    // System alerts
    this.socket.on('system_alert', (alert) => {
      store.addAlert({
        id: Date.now(),
        type: alert.type || 'info',
        message: alert.message,
        timestamp: new Date().toISOString(),
        data: alert.data
      })

      if (alert.type === 'critical') {
        toast.error(alert.message)
      } else if (alert.type === 'warning') {
        toast(alert.message, { icon: '⚠️' })
      }
    })

    // Configuration updates
    this.socket.on('config_update', (config) => {
      store.setConfig(config)
      toast.success('Configuration updated')
    })
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      useSpcStore.getState().setConnectionStatus(false)
    }
  }

  emit(event, data) {
    if (this.socket?.connected) {
      this.socket.emit(event, data)
    } else {
      console.warn('Socket not connected. Cannot emit event:', event)
    }
  }

  // Request historical data
  requestHistoricalData(startDate, endDate, variables) {
    this.emit('request_historical_data', {
      startDate,
      endDate,
      variables
    })
  }

  // Update configuration
  updateConfiguration(config) {
    this.emit('update_configuration', config)
  }

  // Start/stop monitoring
  startMonitoring() {
    this.emit('start_monitoring')
  }

  stopMonitoring() {
    this.emit('stop_monitoring')
  }

  // Reset control limits
  resetControlLimits() {
    this.emit('reset_control_limits')
  }

  // Export data
  exportData(format, options) {
    this.emit('export_data', { format, options })
  }
}

export const wsService = new WebSocketService()
export default wsService
