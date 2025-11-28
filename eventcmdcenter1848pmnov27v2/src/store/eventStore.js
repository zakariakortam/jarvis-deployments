import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useEventStore = create(
  persist(
    (set, get) => ({
      // Theme
      theme: 'dark',
      toggleTheme: () =>
        set(state => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),

      // User authentication
      user: null,
      isAuthenticated: false,
      login: (userData) => set({ user: userData, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),

      // Dashboard data
      attendeeFlow: [],
      ticketScans: [],
      vendorSales: [],
      security: null,
      staffAllocation: null,
      crowdDensity: null,
      stats: null,

      // Update methods
      updateAttendeeFlow: (data) => set({ attendeeFlow: data }),
      updateTicketScans: (data) => set({ ticketScans: data }),
      updateVendorSales: (data) => set({ vendorSales: data }),
      updateSecurity: (data) => set({ security: data }),
      updateStaffAllocation: (data) => set({ staffAllocation: data }),
      updateCrowdDensity: (data) => set({ crowdDensity: data }),
      updateStats: (data) => set({ stats: data }),

      // Alerts
      alerts: [],
      addAlert: (alert) =>
        set(state => ({ alerts: [alert, ...state.alerts].slice(0, 50) })),
      acknowledgeAlert: (alertId) =>
        set(state => ({
          alerts: state.alerts.map(a =>
            a.id === alertId ? { ...a, acknowledged: true } : a
          )
        })),
      clearAlerts: () => set({ alerts: [] }),

      // Filters and view options
      selectedZone: 'all',
      setSelectedZone: (zone) => set({ selectedZone: zone }),

      timeRange: '1h',
      setTimeRange: (range) => set({ timeRange: range }),

      viewMode: 'grid',
      setViewMode: (mode) => set({ viewMode: mode }),

      // Dashboard layout
      layout: 'default',
      setLayout: (layout) => set({ layout }),

      // Real-time connection status
      connectionStatus: {
        connected: false,
        latency: 0,
        lastUpdate: null
      },
      updateConnectionStatus: (status) => set({ connectionStatus: status }),

      // Settings
      settings: {
        autoRefresh: true,
        refreshInterval: 2000,
        notificationsEnabled: true,
        soundEnabled: false,
        dataUpdateInterval: 2000
      },
      updateSettings: (newSettings) =>
        set(state => ({
          settings: { ...state.settings, ...newSettings }
        })),

      // Active filters
      filters: {
        ticketType: 'all',
        securityLevel: 'all',
        staffRole: 'all',
        vendorCategory: 'all'
      },
      updateFilters: (newFilters) =>
        set(state => ({
          filters: { ...state.filters, ...newFilters }
        })),

      // Export data
      exportData: (format) => {
        const state = get();
        const data = {
          attendeeFlow: state.attendeeFlow,
          ticketScans: state.ticketScans,
          vendorSales: state.vendorSales,
          security: state.security,
          staffAllocation: state.staffAllocation,
          stats: state.stats,
          timestamp: new Date().toISOString()
        };

        if (format === 'json') {
          return JSON.stringify(data, null, 2);
        } else if (format === 'csv') {
          // Basic CSV conversion for stats
          return Object.entries(data.stats || {})
            .map(([key, value]) => `${key},${JSON.stringify(value)}`)
            .join('\n');
        }
        return data;
      }
    }),
    {
      name: 'event-command-center-storage',
      partialize: (state) => ({
        theme: state.theme,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        settings: state.settings,
        filters: state.filters
      })
    }
  )
);

export default useEventStore;
