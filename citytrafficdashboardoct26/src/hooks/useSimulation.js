import { useEffect, useRef } from 'react'
import useTrafficStore from '../store/trafficStore'

const UPDATE_INTERVAL = 2000 // 2 seconds

const useSimulation = () => {
  const {
    isSimulationRunning,
    updateSimulation,
    initializeSimulation
  } = useTrafficStore()

  const intervalRef = useRef(null)

  useEffect(() => {
    // Initialize simulation on mount
    initializeSimulation()

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [initializeSimulation])

  useEffect(() => {
    if (isSimulationRunning) {
      intervalRef.current = setInterval(() => {
        updateSimulation()
      }, UPDATE_INTERVAL)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isSimulationRunning, updateSimulation])
}

export default useSimulation
