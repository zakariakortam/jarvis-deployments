import { create } from 'zustand';
import SensorDataGenerator from '../services/sensorDataGenerator';

const generator = new SensorDataGenerator();

const useDashboardStore = create((set, get) => ({
  // Data state
  currentSnapshot: [],
  alerts: [],
  summary: null,
  historicalData: {},
  isStreaming: false,
  updateInterval: 1000, // 1 second updates

  // UI state
  isDarkMode: true,
  selectedEquipment: null,
  filterStatus: 'all',
  filterLocation: 'all',
  filterType: 'all',
  sortField: 'name',
  sortDirection: 'asc',
  searchQuery: '',

  // Chart data (keeping last 50 points per equipment)
  maxHistoryPoints: 50,

  // Actions
  startStreaming: () => {
    const state = get();
    if (state.isStreaming) return;

    set({ isStreaming: true });

    const intervalId = setInterval(() => {
      const data = generator.generateSnapshot();
      const state = get();

      // Update historical data
      const newHistoricalData = { ...state.historicalData };

      data.snapshot.forEach(reading => {
        if (!newHistoricalData[reading.equipmentId]) {
          newHistoricalData[reading.equipmentId] = [];
        }

        newHistoricalData[reading.equipmentId].push({
          timestamp: reading.timestamp,
          temperature: reading.temperature,
          voltage: reading.voltage,
          vibration: reading.vibration,
          power: reading.power,
        });

        // Keep only last maxHistoryPoints
        if (newHistoricalData[reading.equipmentId].length > state.maxHistoryPoints) {
          newHistoricalData[reading.equipmentId].shift();
        }
      });

      set({
        currentSnapshot: data.snapshot,
        alerts: data.alerts,
        summary: data.summary,
        historicalData: newHistoricalData,
      });
    }, state.updateInterval);

    set({ streamIntervalId: intervalId });
  },

  stopStreaming: () => {
    const state = get();
    if (state.streamIntervalId) {
      clearInterval(state.streamIntervalId);
      set({ isStreaming: false, streamIntervalId: null });
    }
  },

  toggleDarkMode: () => {
    set(state => ({ isDarkMode: !state.isDarkMode }));
  },

  setSelectedEquipment: (equipmentId) => {
    set({ selectedEquipment: equipmentId });
  },

  setFilter: (filterType, value) => {
    set({ [filterType]: value });
  },

  setSort: (field) => {
    const state = get();
    const direction = state.sortField === field && state.sortDirection === 'asc' ? 'desc' : 'asc';
    set({ sortField: field, sortDirection: direction });
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },

  getFilteredData: () => {
    const state = get();
    let filtered = [...state.currentSnapshot];

    // Apply filters
    if (state.filterStatus !== 'all') {
      filtered = filtered.filter(item => item.status === state.filterStatus);
    }

    if (state.filterLocation !== 'all') {
      filtered = filtered.filter(item => item.location === state.filterLocation);
    }

    if (state.filterType !== 'all') {
      filtered = filtered.filter(item => item.type === state.filterType);
    }

    // Apply search
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.equipmentId.toLowerCase().includes(query) ||
        item.type.toLowerCase().includes(query) ||
        item.location.toLowerCase().includes(query)
      );
    }

    // Apply sort
    filtered.sort((a, b) => {
      const aVal = a[state.sortField];
      const bVal = b[state.sortField];

      if (typeof aVal === 'string') {
        return state.sortDirection === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return state.sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    });

    return filtered;
  },

  getEquipmentHistory: (equipmentId) => {
    return get().historicalData[equipmentId] || [];
  },

  getRecentAlerts: (limit = 20) => {
    return get().alerts.slice(-limit).reverse();
  },

  exportData: (format = 'csv') => {
    const state = get();
    const data = state.getFilteredData();

    if (format === 'csv') {
      return state.exportToCSV(data);
    } else if (format === 'json') {
      return JSON.stringify(data, null, 2);
    }
  },

  exportToCSV: (data) => {
    const headers = [
      'Equipment ID',
      'Name',
      'Type',
      'Location',
      'Status',
      'Temperature (°C)',
      'Voltage (V)',
      'Vibration (mm/s)',
      'Power (kW)',
      'Cycle Count',
      'Throughput',
      'Efficiency (%)',
      'Timestamp'
    ];

    const rows = data.map(item => [
      item.equipmentId,
      item.name,
      item.type,
      item.location,
      item.status,
      item.temperature.toFixed(2),
      item.voltage.toFixed(2),
      item.vibration.toFixed(2),
      item.power.toFixed(2),
      item.cycleCount,
      item.throughput,
      item.efficiency.toFixed(2),
      new Date(item.timestamp).toISOString()
    ]);

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    return csv;
  },

  downloadCSV: () => {
    const csv = get().exportData('csv');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `industrial-dashboard-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  getUniqueLocations: () => {
    const state = get();
    return [...new Set(state.currentSnapshot.map(item => item.location))];
  },

  getUniqueTypes: () => {
    const state = get();
    return [...new Set(state.currentSnapshot.map(item => item.type))];
  },
}));

export default useDashboardStore;
