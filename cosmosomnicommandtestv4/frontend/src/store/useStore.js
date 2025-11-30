import { create } from 'zustand';

const useStore = create((set, get) => ({
  // Connection state
  connected: false,
  setConnected: (connected) => set({ connected }),

  // Fleet data
  ships: [],
  fleetSummary: null,
  selectedShip: null,
  setShips: (ships) => set({ ships }),
  setFleetSummary: (fleetSummary) => set({ fleetSummary }),
  setSelectedShip: (selectedShip) => set({ selectedShip }),

  // Galactic map data
  celestialObjects: [],
  hazardZones: [],
  tradeRoutes: [],
  waypoints: [],
  selectedObject: null,
  mapView: { x: 0, y: 0, zoom: 1 },
  setCelestialObjects: (celestialObjects) => set({ celestialObjects }),
  setHazardZones: (hazardZones) => set({ hazardZones }),
  setTradeRoutes: (tradeRoutes) => set({ tradeRoutes }),
  setWaypoints: (waypoints) => set({ waypoints }),
  setSelectedObject: (selectedObject) => set({ selectedObject }),
  setMapView: (mapView) => set({ mapView }),

  // Mission data
  timeline: [],
  currentEvents: [],
  upcomingEvents: [],
  recentEvents: [],
  selectedEvent: null,
  setTimeline: (timeline) => set({ timeline }),
  setCurrentEvents: (currentEvents) => set({ currentEvents }),
  setUpcomingEvents: (upcomingEvents) => set({ upcomingEvents }),
  setRecentEvents: (recentEvents) => set({ recentEvents }),
  setSelectedEvent: (selectedEvent) => set({ selectedEvent }),

  // Crew data
  crew: [],
  departments: {},
  crewSummary: null,
  selectedCrewMember: null,
  setCrew: (crew) => set({ crew }),
  setDepartments: (departments) => set({ departments }),
  setCrewSummary: (crewSummary) => set({ crewSummary }),
  setSelectedCrewMember: (selectedCrewMember) => set({ selectedCrewMember }),

  // Engineering data
  subsystems: {},
  powerGrid: null,
  diagnostics: [],
  maintenanceQueue: [],
  selectedSubsystem: null,
  setSubsystems: (subsystems) => set({ subsystems }),
  setPowerGrid: (powerGrid) => set({ powerGrid }),
  setDiagnostics: (diagnostics) => set({ diagnostics }),
  setMaintenanceQueue: (maintenanceQueue) => set({ maintenanceQueue }),
  setSelectedSubsystem: (selectedSubsystem) => set({ selectedSubsystem }),

  // Alert data
  alerts: [],
  anomalies: [],
  alertSummary: null,
  selectedAlert: null,
  setAlerts: (alerts) => set({ alerts }),
  setAnomalies: (anomalies) => set({ anomalies }),
  setAlertSummary: (alertSummary) => set({ alertSummary }),
  setSelectedAlert: (selectedAlert) => set({ selectedAlert }),

  // Command terminal
  commandHistory: [],
  addCommandResult: (result) => set((state) => ({
    commandHistory: [...state.commandHistory, result].slice(-100)
  })),
  clearCommandHistory: () => set({ commandHistory: [] }),

  // UI state
  activePanel: 'fleet',
  setActivePanel: (activePanel) => set({ activePanel }),

  sidePanel: null,
  setSidePanel: (sidePanel) => set({ sidePanel }),

  notifications: [],
  addNotification: (notification) => set((state) => ({
    notifications: [...state.notifications, { ...notification, id: Date.now(), timestamp: Date.now() }].slice(-50)
  })),
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),

  // Audio settings
  audioEnabled: true,
  masterVolume: 0.5,
  setAudioEnabled: (audioEnabled) => set({ audioEnabled }),
  setMasterVolume: (masterVolume) => set({ masterVolume }),

  // Initialize from WebSocket data
  initializeData: (data) => {
    set({
      ships: data.fleet || [],
      fleetSummary: data.fleetSummary || null,
      celestialObjects: data.map?.celestialObjects || [],
      hazardZones: data.map?.hazardZones || [],
      tradeRoutes: data.map?.tradeRoutes || [],
      waypoints: data.map?.waypoints || [],
      timeline: data.missions?.timeline || [],
      currentEvents: data.missions?.currentEvents || [],
      upcomingEvents: data.missions?.upcomingEvents || [],
      recentEvents: data.missions?.recentEvents || [],
      crew: data.crew?.crew || [],
      departments: data.crew?.departments || {},
      crewSummary: data.crew?.summary || null,
      subsystems: data.engineering?.subsystems || {},
      powerGrid: data.engineering?.powerGrid || null,
      diagnostics: data.engineering?.diagnostics || [],
      maintenanceQueue: data.engineering?.maintenanceQueue || [],
      alerts: data.alerts?.alerts || [],
      anomalies: data.alerts?.anomalies || [],
      alertSummary: data.alerts?.summary || null
    });
  },

  // Update from WebSocket data
  updateData: (data) => {
    const updates = {};

    if (data.fleet) {
      updates.ships = data.fleet.ships || get().ships;
      updates.fleetSummary = data.fleet.summary || get().fleetSummary;
    }

    if (data.map) {
      updates.celestialObjects = data.map.celestialObjects || get().celestialObjects;
      updates.hazardZones = data.map.hazardZones || get().hazardZones;
      updates.tradeRoutes = data.map.tradeRoutes || get().tradeRoutes;
    }

    if (data.missions) {
      updates.timeline = data.missions.timeline || get().timeline;
      updates.currentEvents = data.missions.currentEvents || get().currentEvents;
      updates.upcomingEvents = data.missions.upcomingEvents || get().upcomingEvents;
      updates.recentEvents = data.missions.recentEvents || get().recentEvents;
    }

    if (data.crew) {
      updates.crew = data.crew.crew || get().crew;
      updates.departments = data.crew.departments || get().departments;
      updates.crewSummary = data.crew.summary || get().crewSummary;
    }

    if (data.engineering) {
      updates.subsystems = data.engineering.subsystems || get().subsystems;
      updates.powerGrid = data.engineering.powerGrid || get().powerGrid;
      updates.diagnostics = data.engineering.diagnostics || get().diagnostics;
      updates.maintenanceQueue = data.engineering.maintenanceQueue || get().maintenanceQueue;
    }

    if (data.alerts) {
      updates.alerts = data.alerts.alerts || get().alerts;
      updates.anomalies = data.alerts.anomalies || get().anomalies;
      updates.alertSummary = data.alerts.summary || get().alertSummary;
    }

    set(updates);
  }
}));

export default useStore;
