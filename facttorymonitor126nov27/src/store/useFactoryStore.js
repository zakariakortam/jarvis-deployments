import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import dataSimulator from '../services/dataSimulator';

const useFactoryStore = create(
  persist(
    (set, get) => ({
      // Core data
      machines: [],
      alarms: [],
      lastUpdate: null,

      // UI state
      darkMode: false,
      selectedMachineId: null,
      comparisonMachineIds: [],
      timeRange: { start: Date.now() - 3600000, end: Date.now() }, // Last hour
      isPlaybackMode: false,
      playbackSpeed: 1,
      playbackPosition: null,

      // Dashboard configuration
      widgets: [
        { id: 'overview', type: 'overview', enabled: true, position: 0 },
        { id: 'machines', type: 'machines', enabled: true, position: 1 },
        { id: 'alarms', type: 'alarms', enabled: true, position: 2 },
        { id: 'performance', type: 'performance', enabled: true, position: 3 },
      ],

      // Filters
      filters: {
        status: 'all', // all, running, idle, error
        severity: 'all', // all, critical, error, warning, info
        machineType: 'all',
      },

      // Actions
      toggleDarkMode: () => {
        set(state => ({ darkMode: !state.darkMode }));
        if (typeof document !== 'undefined') {
          document.documentElement.classList.toggle('dark');
        }
      },

      setMachines: (machines) => set({ machines, lastUpdate: Date.now() }),

      setAlarms: (alarms) => set({ alarms }),

      updateFromSimulator: (data) => {
        set({
          machines: data.machines,
          alarms: data.alarms,
          lastUpdate: data.timestamp,
        });
      },

      selectMachine: (machineId) => set({ selectedMachineId: machineId }),

      toggleComparison: (machineId) => {
        set(state => {
          const ids = state.comparisonMachineIds;
          const index = ids.indexOf(machineId);

          if (index >= 0) {
            return { comparisonMachineIds: ids.filter(id => id !== machineId) };
          } else if (ids.length < 4) {
            return { comparisonMachineIds: [...ids, machineId] };
          }
          return state;
        });
      },

      clearComparison: () => set({ comparisonMachineIds: [] }),

      setTimeRange: (start, end) => set({ timeRange: { start, end } }),

      setPlaybackMode: (enabled) => set({ isPlaybackMode: enabled }),

      setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),

      setPlaybackPosition: (position) => set({ playbackPosition: position }),

      acknowledgeAlarm: (alarmId) => {
        dataSimulator.acknowledgeAlarm(alarmId);
        set(state => ({
          alarms: state.alarms.map(alarm =>
            alarm.id === alarmId ? { ...alarm, acknowledged: true } : alarm
          ),
        }));
      },

      setFilter: (filterType, value) => {
        set(state => ({
          filters: { ...state.filters, [filterType]: value },
        }));
      },

      toggleWidget: (widgetId) => {
        set(state => ({
          widgets: state.widgets.map(widget =>
            widget.id === widgetId
              ? { ...widget, enabled: !widget.enabled }
              : widget
          ),
        }));
      },

      reorderWidgets: (widgets) => set({ widgets }),

      // Computed getters
      getFilteredMachines: () => {
        const { machines, filters } = get();

        return machines.filter(machine => {
          if (filters.status !== 'all' && machine.status !== filters.status) {
            return false;
          }
          if (filters.machineType !== 'all' && machine.type !== filters.machineType) {
            return false;
          }
          return true;
        });
      },

      getFilteredAlarms: () => {
        const { alarms, filters } = get();

        return alarms.filter(alarm => {
          if (filters.severity !== 'all' && alarm.severity !== filters.severity) {
            return false;
          }
          return true;
        });
      },

      getMachineById: (id) => {
        return get().machines.find(m => m.id === id);
      },

      getComparisonMachines: () => {
        const { machines, comparisonMachineIds } = get();
        return machines.filter(m => comparisonMachineIds.includes(m.id));
      },

      getKPIs: () => {
        const machines = get().machines;

        const running = machines.filter(m => m.status === 'running').length;
        const idle = machines.filter(m => m.status === 'idle').length;
        const avgEfficiency = machines.reduce((sum, m) => sum + m.efficiency, 0) / machines.length;
        const totalThroughput = machines.reduce((sum, m) => sum + m.throughput, 0);
        const avgScrapRate = machines.reduce((sum, m) => sum + m.scrapRate, 0) / machines.length;
        const totalEnergy = machines.reduce((sum, m) => sum + m.energyUsage, 0);
        const avgUptime = machines.reduce((sum, m) => sum + m.uptime, 0) / machines.length;

        return {
          totalMachines: machines.length,
          runningMachines: running,
          idleMachines: idle,
          avgEfficiency: avgEfficiency.toFixed(1),
          totalThroughput,
          avgScrapRate: avgScrapRate.toFixed(2),
          totalEnergy: totalEnergy.toFixed(1),
          avgUptime: avgUptime.toFixed(1),
        };
      },

      getAlarmStats: () => {
        const alarms = get().alarms;
        const unacknowledged = alarms.filter(a => !a.acknowledged).length;
        const critical = alarms.filter(a => a.severity === 'critical').length;
        const errors = alarms.filter(a => a.severity === 'error').length;
        const warnings = alarms.filter(a => a.severity === 'warning').length;

        return {
          total: alarms.length,
          unacknowledged,
          critical,
          errors,
          warnings,
        };
      },
    }),
    {
      name: 'factory-monitor-storage',
      partialize: (state) => ({
        darkMode: state.darkMode,
        widgets: state.widgets,
        filters: state.filters,
      }),
    }
  )
);

export default useFactoryStore;
