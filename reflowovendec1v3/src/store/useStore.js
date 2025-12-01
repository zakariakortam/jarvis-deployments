import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { dataParser } from '../services/dataParser';
import { generateMockData, generateMockMetadata, INITIAL_MOCK_DATA, INITIAL_MOCK_METADATA } from '../services/mockData';
import { calculateStats, detectAnomalies, calculateTrend } from '../utils/calculations';

const useStore = create(
  persist(
    (set, get) => ({
      // Data state
      data: INITIAL_MOCK_DATA,
      metadata: INITIAL_MOCK_METADATA,
      isLoading: false,
      loadProgress: 0,
      error: null,
      isUsingMockData: true,

      // View state
      selectedTimeRange: { start: 0, end: 500 },
      selectedZones: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      viewMode: 'overview',

      // UI state
      darkMode: true,
      sidebarCollapsed: false,
      activeFilters: {},

      // Simulation state
      simulationParams: {
        conveyorSpeed: 1.0,
        targetPeakTemp: 245,
        soakTime: 90,
        preheatRate: 2,
        coolingRate: 4,
      },

      // Alerts state
      alerts: [],
      alertThresholds: {
        tempHigh: 260,
        tempLow: 20,
        powerHigh: 50,
        o2High: 500,
      },

      // Actions
      setData: (data) => set({ data, isUsingMockData: false }),
      setMetadata: (metadata) => set({ metadata }),
      setLoading: (isLoading) => set({ isLoading }),
      setLoadProgress: (loadProgress) => set({ loadProgress }),
      setError: (error) => set({ error }),

      loadData: async (file) => {
        set({ isLoading: true, error: null, loadProgress: 0 });
        try {
          const data = await dataParser.parseCSV(file, (progress) => {
            set({ loadProgress: progress });
          });
          const metadata = dataParser.getMetadata();
          set({
            data,
            metadata,
            isLoading: false,
            loadProgress: 100,
            isUsingMockData: false,
            selectedTimeRange: { start: 0, end: Math.min(1000, data.length) },
          });
          get().checkAlerts(data);
        } catch (error) {
          set({ error: error.message, isLoading: false });
        }
      },

      loadDataFromString: async (csvString) => {
        set({ isLoading: true, error: null, loadProgress: 0 });
        try {
          const data = await dataParser.parseCSVString(csvString, (progress) => {
            set({ loadProgress: progress });
          });
          const metadata = dataParser.getMetadata();
          set({
            data,
            metadata,
            isLoading: false,
            loadProgress: 100,
            isUsingMockData: false,
            selectedTimeRange: { start: 0, end: Math.min(1000, data.length) },
          });
          get().checkAlerts(data);
        } catch (error) {
          set({ error: error.message, isLoading: false });
        }
      },

      generateMoreMockData: (count = 1000) => {
        const currentData = get().data;
        const newData = generateMockData(count);
        const combinedData = [...currentData, ...newData].map((d, i) => ({ ...d, index: i }));
        const metadata = generateMockMetadata(combinedData);
        set({
          data: combinedData,
          metadata,
          selectedTimeRange: { start: 0, end: Math.min(1000, combinedData.length) },
        });
      },

      setSelectedTimeRange: (range) => set({ selectedTimeRange: range }),
      setSelectedZones: (zones) => set({ selectedZones: zones }),
      setViewMode: (viewMode) => set({ viewMode }),

      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      setActiveFilters: (filters) => set({ activeFilters: filters }),

      setSimulationParams: (params) => set((state) => ({
        simulationParams: { ...state.simulationParams, ...params }
      })),

      setAlertThresholds: (thresholds) => set((state) => ({
        alertThresholds: { ...state.alertThresholds, ...thresholds }
      })),

      checkAlerts: (data) => {
        const { alertThresholds } = get();
        const alerts = [];

        data.forEach((point, index) => {
          // Check temperature alerts
          if (point.maxZoneTemp > alertThresholds.tempHigh) {
            alerts.push({
              id: `temp-high-${index}`,
              type: 'critical',
              category: 'temperature',
              message: `High temperature detected: ${point.maxZoneTemp.toFixed(1)}°C`,
              timestamp: point.timestamp,
              value: point.maxZoneTemp,
              threshold: alertThresholds.tempHigh,
            });
          }

          // Check power alerts
          if (point.power.activePower > alertThresholds.powerHigh) {
            alerts.push({
              id: `power-high-${index}`,
              type: 'warning',
              category: 'power',
              message: `High power consumption: ${point.power.activePower.toFixed(2)} kW`,
              timestamp: point.timestamp,
              value: point.power.activePower,
              threshold: alertThresholds.powerHigh,
            });
          }

          // Check O2 concentration
          if (point.environment.o2Concentration > alertThresholds.o2High) {
            alerts.push({
              id: `o2-high-${index}`,
              type: 'warning',
              category: 'environment',
              message: `High O2 concentration: ${point.environment.o2Concentration.toFixed(0)} ppm`,
              timestamp: point.timestamp,
              value: point.environment.o2Concentration,
              threshold: alertThresholds.o2High,
            });
          }
        });

        set({ alerts: alerts.slice(-100) }); // Keep last 100 alerts
      },

      addAlert: (alert) => set((state) => ({
        alerts: [...state.alerts.slice(-99), alert]
      })),

      clearAlerts: () => set({ alerts: [] }),

      // Computed data getters
      getFilteredData: () => {
        const { data, selectedTimeRange, activeFilters } = get();
        let filtered = data.slice(selectedTimeRange.start, selectedTimeRange.end);

        if (activeFilters.status) {
          filtered = filtered.filter(d => d.equipment.status === activeFilters.status);
        }
        if (activeFilters.product) {
          filtered = filtered.filter(d => d.production.productNumber === activeFilters.product);
        }
        if (activeFilters.minTemp !== undefined) {
          filtered = filtered.filter(d => d.avgZoneTemp >= activeFilters.minTemp);
        }
        if (activeFilters.maxTemp !== undefined) {
          filtered = filtered.filter(d => d.avgZoneTemp <= activeFilters.maxTemp);
        }

        return filtered;
      },

      getZoneStats: (zoneNumber) => {
        const data = get().getFilteredData();
        const temps = data.map(d => d.zones[zoneNumber]?.avg).filter(Boolean);
        return calculateStats(temps);
      },

      getPowerStats: () => {
        const data = get().getFilteredData();
        const power = data.map(d => d.power.activePower).filter(Boolean);
        return calculateStats(power);
      },

      getAnomalies: () => {
        const data = get().getFilteredData();
        const temps = data.map(d => d.avgZoneTemp);
        return detectAnomalies(temps);
      },

      getTrend: (metric = 'avgZoneTemp') => {
        const data = get().getFilteredData();
        const values = data.map(d => {
          if (metric === 'avgZoneTemp') return d.avgZoneTemp;
          if (metric === 'power') return d.power.activePower;
          return d[metric];
        }).filter(Boolean);
        return calculateTrend(values);
      },

      exportData: (format = 'csv') => {
        const data = get().getFilteredData();
        if (format === 'csv') {
          return dataParser.exportToCSV(data);
        }
        return dataParser.exportToJSON(data);
      },
    }),
    {
      name: 'reflow-oven-analytics',
      partialize: (state) => ({
        darkMode: state.darkMode,
        sidebarCollapsed: state.sidebarCollapsed,
        alertThresholds: state.alertThresholds,
        simulationParams: state.simulationParams,
        selectedZones: state.selectedZones,
      }),
    }
  )
);

export default useStore;
