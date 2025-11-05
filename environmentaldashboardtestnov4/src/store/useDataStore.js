import { create } from 'zustand';
import { sensorService } from '../services/sensorService';

const useDataStore = create((set, get) => ({
  // Data state
  realtimeData: [],
  historicalData: [],
  latestReadings: [],
  stations: sensorService.getStations(),

  // UI state
  selectedStation: null,
  selectedType: 'all',
  timeRange: '1h',
  isStreaming: false,
  darkMode: false,

  // Filter state
  searchQuery: '',
  sortBy: 'timestamp',
  sortOrder: 'desc',

  // Alert state
  alerts: [],

  // Actions
  startStreaming: () => {
    const unsubscribe = sensorService.subscribe((newData) => {
      set((state) => {
        // Add new data
        const updated = [...state.realtimeData, ...newData];

        // Keep only last 1000 points for performance
        const trimmed = updated.slice(-1000);

        // Check for alerts
        const newAlerts = get().checkForAlerts(newData);

        return {
          realtimeData: trimmed,
          historicalData: sensorService.getHistory(),
          latestReadings: sensorService.getLatestReadings(),
          alerts: [...state.alerts, ...newAlerts].slice(-50),
        };
      });
    });

    sensorService.start();
    set({ isStreaming: true, unsubscribe });
  },

  stopStreaming: () => {
    const { unsubscribe } = get();
    if (unsubscribe) {
      unsubscribe();
    }
    sensorService.stop();
    set({ isStreaming: false, unsubscribe: null });
  },

  setSelectedStation: (stationId) => set({ selectedStation: stationId }),

  setSelectedType: (type) => set({ selectedType: type }),

  setTimeRange: (range) => set({ timeRange: range }),

  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),

  setSearchQuery: (query) => set({ searchQuery: query }),

  setSorting: (sortBy, sortOrder) => set({ sortBy, sortOrder }),

  // Check for threshold violations
  checkForAlerts: (data) => {
    const alerts = [];
    const thresholds = {
      co2: 800,
      temperature: { high: 35, low: 10 },
      humidity: { high: 80, low: 30 },
      aqi: 100,
    };

    data.forEach((reading) => {
      if (reading.type === 'air') {
        if (reading.readings.co2 > thresholds.co2) {
          alerts.push({
            id: `alert-${Date.now()}-${reading.stationId}`,
            stationId: reading.stationId,
            stationName: reading.stationName,
            type: 'warning',
            metric: 'CO2',
            value: reading.readings.co2.toFixed(2),
            threshold: thresholds.co2,
            timestamp: reading.timestamp,
            message: `CO2 level exceeds threshold at ${reading.stationName}`,
          });
        }

        if (reading.readings.aqi > thresholds.aqi) {
          alerts.push({
            id: `alert-${Date.now()}-${reading.stationId}-aqi`,
            stationId: reading.stationId,
            stationName: reading.stationName,
            type: 'danger',
            metric: 'AQI',
            value: reading.readings.aqi,
            threshold: thresholds.aqi,
            timestamp: reading.timestamp,
            message: `Air Quality Index is unhealthy at ${reading.stationName}`,
          });
        }
      }
    });

    return alerts;
  },

  clearAlerts: () => set({ alerts: [] }),

  dismissAlert: (alertId) =>
    set((state) => ({
      alerts: state.alerts.filter((a) => a.id !== alertId),
    })),

  // Get filtered data
  getFilteredData: () => {
    const { realtimeData, searchQuery, sortBy, sortOrder, selectedType, selectedStation } = get();

    let filtered = [...realtimeData];

    // Apply type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter((d) => d.type === selectedType);
    }

    // Apply station filter
    if (selectedStation) {
      filtered = filtered.filter((d) => d.stationId === selectedStation);
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.stationName.toLowerCase().includes(query) ||
          d.stationId.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];

      if (sortBy === 'timestamp') {
        aVal = a.timestamp;
        bVal = b.timestamp;
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  },

  // Export data
  exportData: (format = 'csv') => {
    const data = get().getFilteredData();

    if (format === 'csv') {
      return get().exportToCSV(data);
    } else if (format === 'json') {
      return get().exportToJSON(data);
    }
  },

  exportToCSV: (data) => {
    const headers = ['Timestamp', 'Station ID', 'Station Name', 'Type', 'Readings', 'Status'];
    const rows = data.map((d) => [
      new Date(d.timestamp).toISOString(),
      d.stationId,
      d.stationName,
      d.type,
      JSON.stringify(d.readings),
      d.status,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sensor-data-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  },

  exportToJSON: (data) => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sensor-data-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  },
}));

export default useDataStore;
