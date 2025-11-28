import { useState, useEffect } from 'react';
import dataSimulator from '../services/dataSimulator';

export const useMaintenanceHistory = (machineId) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!machineId) {
      setHistory([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Fetch maintenance history
    const maintenanceHistory = dataSimulator.getMaintenanceHistory(machineId);
    setHistory(maintenanceHistory);
    setLoading(false);
  }, [machineId]);

  return { history, loading };
};
