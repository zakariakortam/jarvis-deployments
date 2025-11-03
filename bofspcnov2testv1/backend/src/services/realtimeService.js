import { PROCESS_LIMITS } from '../../../src/utils/dataValidation.js'

// Simulate real-time data for demo purposes
export const startRealtimeSimulation = (io) => {
  setInterval(() => {
    const data = {
      temperature: PROCESS_LIMITS.temperature.target + (Math.random() - 0.5) * 40,
      carbonContent: PROCESS_LIMITS.carbonContent.target + (Math.random() - 0.5) * 0.04,
      oxygenLevel: PROCESS_LIMITS.oxygenLevel.target + (Math.random() - 0.5) * 0.5,
      oxygenFlow: PROCESS_LIMITS.oxygenFlow.target + (Math.random() - 0.5) * 50,
      blowTime: PROCESS_LIMITS.blowTime.target + (Math.random() - 0.5) * 3,
      timestamp: new Date().toISOString(),
    }

    io.to('monitoring').emit('real_time_data', data)
  }, 3000) // Update every 3 seconds
}
