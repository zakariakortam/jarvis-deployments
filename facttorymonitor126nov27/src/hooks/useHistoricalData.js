import { useState, useEffect } from 'react';
import dataSimulator from '../services/dataSimulator';

export const useHistoricalData = (machineId, startTime, endTime) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!machineId) {
      setData([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Fetch historical data
    const historicalData = dataSimulator.getHistoricalData(machineId, startTime, endTime);
    setData(historicalData);
    setLoading(false);
  }, [machineId, startTime, endTime]);

  return { data, loading };
};
