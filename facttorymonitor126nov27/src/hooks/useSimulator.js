import { useEffect } from 'react';
import dataSimulator from '../services/dataSimulator';
import useFactoryStore from '../store/useFactoryStore';

export const useSimulator = (autoStart = true) => {
  const updateFromSimulator = useFactoryStore(state => state.updateFromSimulator);

  useEffect(() => {
    if (!autoStart) return;

    // Subscribe to simulator updates
    const unsubscribe = dataSimulator.subscribe((data) => {
      updateFromSimulator(data);
    });

    // Start the simulator
    dataSimulator.start(2000);

    // Cleanup
    return () => {
      unsubscribe();
      dataSimulator.stop();
    };
  }, [autoStart, updateFromSimulator]);

  return {
    start: () => dataSimulator.start(),
    stop: () => dataSimulator.stop(),
    reset: () => dataSimulator.reset(),
    isRunning: dataSimulator.isRunning,
  };
};
