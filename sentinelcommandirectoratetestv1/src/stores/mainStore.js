import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { generateInitialData, generateEvent, generateThreat, generateIntercept, generateCyberEvent, generateAsset, generateOperation, generateDocument, generateInfluenceOperation, generateInfrastructureIncident, rng } from '../data/generators';

// ==================== MAIN APPLICATION STORE ====================

const useStore = create(
  subscribeWithSelector((set, get) => ({
    // ==================== INITIALIZATION STATE ====================
    initialized: false,
    loading: true,
    currentTime: new Date(),
    simulationSpeed: 1, // 1x, 2x, 5x, 10x
    simulationRunning: true,

    // ==================== NAVIGATION STATE ====================
    activeModule: 'dashboard',
    sidebarExpanded: true,
    selectedEntity: null,
    selectedEntityType: null,
    modalOpen: null,
    modalData: null,

    // ==================== CORE DATA COLLECTIONS ====================
    threats: [],
    operations: [],
    intercepts: [],
    cyberEvents: [],
    assets: [],
    documents: [],
    influenceOps: [],
    incidents: [],

    // ==================== FILTER STATES ====================
    filters: {
      threats: {
        threatLevel: 'all',
        status: 'all',
        region: 'all',
        actorType: 'all',
        classification: 'all',
        searchQuery: '',
      },
      operations: {
        agency: 'all',
        status: 'all',
        type: 'all',
        region: 'all',
        searchQuery: '',
      },
      intercepts: {
        protocol: 'all',
        encryption: 'all',
        decryptionStatus: 'all',
        region: 'all',
        searchQuery: '',
      },
      cyberEvents: {
        severity: 'all',
        status: 'all',
        type: 'all',
        actor: 'all',
        searchQuery: '',
      },
      assets: {
        type: 'all',
        status: 'all',
        reliability: 'all',
        country: 'all',
        searchQuery: '',
      },
      documents: {
        classification: 'all',
        type: 'all',
        agency: 'all',
        searchQuery: '',
      },
      influenceOps: {
        status: 'all',
        platform: 'all',
        actor: 'all',
        searchQuery: '',
      },
      incidents: {
        severity: 'all',
        sector: 'all',
        status: 'all',
        searchQuery: '',
      },
    },

    // ==================== MAP STATE ====================
    mapState: {
      center: [20, 0],
      zoom: 2,
      activeOverlays: ['threats', 'operations'],
      selectedRegion: null,
      timelinePosition: 100, // 0-100% of available history
      showHeatmap: false,
      show3D: false,
    },

    // ==================== TERMINAL STATE ====================
    terminalHistory: [],
    terminalCommandHistory: [],
    terminalHistoryIndex: -1,

    // ==================== NOTIFICATION STATE ====================
    notifications: [],
    alertLevel: 'ELEVATED', // LOW, GUARDED, ELEVATED, HIGH, SEVERE
    unreadCount: 0,

    // ==================== METRICS STATE ====================
    globalMetrics: {
      threatCount: 0,
      activeOperations: 0,
      interceptsToday: 0,
      cyberAlerts: 0,
      assetsActive: 0,
      influenceOpsTracked: 0,
      infrastructureAlerts: 0,
      overallRiskScore: 0,
    },

    // ==================== INITIALIZATION ACTIONS ====================
    initialize: () => {
      const data = generateInitialData();

      set({
        ...data,
        initialized: true,
        loading: false,
        globalMetrics: calculateMetrics(data),
        alertLevel: calculateAlertLevel(data),
      });

      // Start simulation loop
      get().startSimulation();
    },

    // ==================== SIMULATION ACTIONS ====================
    startSimulation: () => {
      set({ simulationRunning: true });
    },

    stopSimulation: () => {
      set({ simulationRunning: false });
    },

    setSimulationSpeed: (speed) => {
      set({ simulationSpeed: speed });
    },

    tick: () => {
      const state = get();
      if (!state.simulationRunning) return;

      // Update current time
      set({ currentTime: new Date() });

      // Random events based on simulation speed
      const eventChance = 0.1 * state.simulationSpeed;
      if (Math.random() < eventChance) {
        const event = generateEvent();
        if (event) {
          state.processEvent(event);
        }
      }

      // Update metrics periodically
      if (Math.random() < 0.05 * state.simulationSpeed) {
        state.updateMetrics();
      }

      // Random status changes
      if (Math.random() < 0.02 * state.simulationSpeed) {
        state.randomStatusChange();
      }
    },

    processEvent: (event) => {
      const state = get();

      switch (event.type) {
        case 'NEW_THREAT':
          set({
            threats: [event.data, ...state.threats].slice(0, 100),
            notifications: [{
              id: Date.now(),
              type: 'threat',
              title: 'New Threat Detected',
              message: `${event.data.type} from ${event.data.actor.name}`,
              severity: event.data.threatLevel,
              timestamp: new Date(),
              read: false,
            }, ...state.notifications].slice(0, 50),
            unreadCount: state.unreadCount + 1,
          });
          break;

        case 'NEW_INTERCEPT':
          set({
            intercepts: [event.data, ...state.intercepts].slice(0, 150),
          });
          break;

        case 'NEW_CYBER_EVENT':
          set({
            cyberEvents: [event.data, ...state.cyberEvents].slice(0, 100),
            notifications: [{
              id: Date.now(),
              type: 'cyber',
              title: 'Cyber Event Detected',
              message: `${event.data.type} targeting ${event.data.target}`,
              severity: event.data.severity,
              timestamp: new Date(),
              read: false,
            }, ...state.notifications].slice(0, 50),
            unreadCount: state.unreadCount + 1,
          });
          break;

        case 'NEW_INCIDENT':
          set({
            incidents: [event.data, ...state.incidents].slice(0, 50),
            notifications: [{
              id: Date.now(),
              type: 'incident',
              title: 'Infrastructure Incident',
              message: `${event.data.type} at ${event.data.facility}`,
              severity: event.data.severity,
              timestamp: new Date(),
              read: false,
            }, ...state.notifications].slice(0, 50),
            unreadCount: state.unreadCount + 1,
          });
          break;

        case 'INFLUENCE_UPDATE':
          // Update existing influence operation
          set({
            influenceOps: state.influenceOps.map(op =>
              op.id === event.data.id
                ? { ...op, status: event.data.change === 'escalation' ? 'active' : op.status }
                : op
            ),
          });
          break;

        default:
          break;
      }

      // Recalculate metrics after event
      get().updateMetrics();
    },

    randomStatusChange: () => {
      const state = get();

      // Randomly change threat status
      if (state.threats.length > 0) {
        const threatIndex = Math.floor(Math.random() * state.threats.length);
        const statuses = ['active', 'developing', 'imminent', 'suspected', 'confirmed'];
        const newStatus = statuses[Math.floor(Math.random() * statuses.length)];

        set({
          threats: state.threats.map((t, i) =>
            i === threatIndex ? { ...t, status: newStatus } : t
          ),
        });
      }

      // Randomly change operation phase progress
      if (state.operations.length > 0) {
        const opIndex = Math.floor(Math.random() * state.operations.length);
        const currentProgress = state.operations[opIndex].phaseProgress;
        const newProgress = Math.min(100, currentProgress + Math.floor(Math.random() * 10));

        set({
          operations: state.operations.map((o, i) =>
            i === opIndex ? { ...o, phaseProgress: newProgress } : o
          ),
        });
      }

      // Randomly change cyber event status
      if (state.cyberEvents.length > 0) {
        const cyberIndex = Math.floor(Math.random() * state.cyberEvents.length);
        const cyberStatuses = ['active', 'contained', 'investigating', 'remediated', 'escalated'];
        const newCyberStatus = cyberStatuses[Math.floor(Math.random() * cyberStatuses.length)];

        set({
          cyberEvents: state.cyberEvents.map((c, i) =>
            i === cyberIndex ? { ...c, status: newCyberStatus } : c
          ),
        });
      }
    },

    updateMetrics: () => {
      const state = get();
      const data = {
        threats: state.threats,
        operations: state.operations,
        intercepts: state.intercepts,
        cyberEvents: state.cyberEvents,
        assets: state.assets,
        influenceOps: state.influenceOps,
        incidents: state.incidents,
      };

      set({
        globalMetrics: calculateMetrics(data),
        alertLevel: calculateAlertLevel(data),
      });
    },

    // ==================== NAVIGATION ACTIONS ====================
    setActiveModule: (module) => {
      set({ activeModule: module, selectedEntity: null, selectedEntityType: null });
    },

    toggleSidebar: () => {
      set(state => ({ sidebarExpanded: !state.sidebarExpanded }));
    },

    selectEntity: (entity, type) => {
      set({ selectedEntity: entity, selectedEntityType: type });
    },

    clearSelection: () => {
      set({ selectedEntity: null, selectedEntityType: null });
    },

    openModal: (modalType, data = null) => {
      set({ modalOpen: modalType, modalData: data });
    },

    closeModal: () => {
      set({ modalOpen: null, modalData: null });
    },

    // ==================== FILTER ACTIONS ====================
    setFilter: (category, filterName, value) => {
      set(state => ({
        filters: {
          ...state.filters,
          [category]: {
            ...state.filters[category],
            [filterName]: value,
          },
        },
      }));
    },

    resetFilters: (category) => {
      const defaultFilters = {
        threats: { threatLevel: 'all', status: 'all', region: 'all', actorType: 'all', classification: 'all', searchQuery: '' },
        operations: { agency: 'all', status: 'all', type: 'all', region: 'all', searchQuery: '' },
        intercepts: { protocol: 'all', encryption: 'all', decryptionStatus: 'all', region: 'all', searchQuery: '' },
        cyberEvents: { severity: 'all', status: 'all', type: 'all', actor: 'all', searchQuery: '' },
        assets: { type: 'all', status: 'all', reliability: 'all', country: 'all', searchQuery: '' },
        documents: { classification: 'all', type: 'all', agency: 'all', searchQuery: '' },
        influenceOps: { status: 'all', platform: 'all', actor: 'all', searchQuery: '' },
        incidents: { severity: 'all', sector: 'all', status: 'all', searchQuery: '' },
      };

      set(state => ({
        filters: {
          ...state.filters,
          [category]: defaultFilters[category],
        },
      }));
    },

    // ==================== MAP ACTIONS ====================
    setMapCenter: (center) => {
      set(state => ({ mapState: { ...state.mapState, center } }));
    },

    setMapZoom: (zoom) => {
      set(state => ({ mapState: { ...state.mapState, zoom } }));
    },

    toggleMapOverlay: (overlay) => {
      set(state => {
        const overlays = state.mapState.activeOverlays;
        const newOverlays = overlays.includes(overlay)
          ? overlays.filter(o => o !== overlay)
          : [...overlays, overlay];
        return { mapState: { ...state.mapState, activeOverlays: newOverlays } };
      });
    },

    setMapTimeline: (position) => {
      set(state => ({ mapState: { ...state.mapState, timelinePosition: position } }));
    },

    selectMapRegion: (region) => {
      set(state => ({ mapState: { ...state.mapState, selectedRegion: region } }));
    },

    toggleMapHeatmap: () => {
      set(state => ({ mapState: { ...state.mapState, showHeatmap: !state.mapState.showHeatmap } }));
    },

    toggleMap3D: () => {
      set(state => ({ mapState: { ...state.mapState, show3D: !state.mapState.show3D } }));
    },

    // ==================== TERMINAL ACTIONS ====================
    executeCommand: (command) => {
      const result = processTerminalCommand(command, get());

      set(state => ({
        terminalHistory: [
          ...state.terminalHistory,
          { type: 'input', content: command, timestamp: new Date() },
          { type: result.type, content: result.output, timestamp: new Date() },
        ].slice(-200),
        terminalCommandHistory: [command, ...state.terminalCommandHistory.filter(c => c !== command)].slice(0, 50),
        terminalHistoryIndex: -1,
      }));

      // Execute any side effects from the command
      if (result.action) {
        result.action(set, get);
      }

      return result;
    },

    navigateTerminalHistory: (direction) => {
      set(state => {
        const maxIndex = state.terminalCommandHistory.length - 1;
        let newIndex = state.terminalHistoryIndex + direction;
        newIndex = Math.max(-1, Math.min(maxIndex, newIndex));
        return { terminalHistoryIndex: newIndex };
      });
    },

    clearTerminal: () => {
      set({ terminalHistory: [] });
    },

    // ==================== NOTIFICATION ACTIONS ====================
    markNotificationRead: (id) => {
      set(state => ({
        notifications: state.notifications.map(n =>
          n.id === id ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    },

    markAllNotificationsRead: () => {
      set(state => ({
        notifications: state.notifications.map(n => ({ ...n, read: true })),
        unreadCount: 0,
      }));
    },

    clearNotifications: () => {
      set({ notifications: [], unreadCount: 0 });
    },

    addNotification: (notification) => {
      set(state => ({
        notifications: [notification, ...state.notifications].slice(0, 50),
        unreadCount: state.unreadCount + 1,
      }));
    },

    // ==================== ENTITY ACTIONS ====================
    addThreat: (threat) => {
      set(state => ({ threats: [threat, ...state.threats] }));
      get().updateMetrics();
    },

    updateThreat: (id, updates) => {
      set(state => ({
        threats: state.threats.map(t => t.id === id ? { ...t, ...updates } : t),
      }));
      get().updateMetrics();
    },

    addOperation: (operation) => {
      set(state => ({ operations: [operation, ...state.operations] }));
      get().updateMetrics();
    },

    updateOperation: (id, updates) => {
      set(state => ({
        operations: state.operations.map(o => o.id === id ? { ...o, ...updates } : o),
      }));
      get().updateMetrics();
    },

    addIntercept: (intercept) => {
      set(state => ({ intercepts: [intercept, ...state.intercepts] }));
      get().updateMetrics();
    },

    decryptIntercept: (id) => {
      set(state => ({
        intercepts: state.intercepts.map(i =>
          i.id === id ? { ...i, decryptionStatus: 'decrypted' } : i
        ),
      }));
    },

    addCyberEvent: (event) => {
      set(state => ({ cyberEvents: [event, ...state.cyberEvents] }));
      get().updateMetrics();
    },

    updateCyberEvent: (id, updates) => {
      set(state => ({
        cyberEvents: state.cyberEvents.map(c => c.id === id ? { ...c, ...updates } : c),
      }));
      get().updateMetrics();
    },

    isolateCyberNode: (eventId, nodeId) => {
      set(state => ({
        cyberEvents: state.cyberEvents.map(event => {
          if (event.id === eventId) {
            return {
              ...event,
              networkNodes: event.networkNodes.map(node =>
                node.id === nodeId ? { ...node, status: 'isolated' } : node
              ),
            };
          }
          return event;
        }),
      }));
    },

    addAsset: (asset) => {
      set(state => ({ assets: [asset, ...state.assets] }));
      get().updateMetrics();
    },

    updateAsset: (id, updates) => {
      set(state => ({
        assets: state.assets.map(a => a.id === id ? { ...a, ...updates } : a),
      }));
      get().updateMetrics();
    },

    addDocument: (document) => {
      set(state => ({ documents: [document, ...state.documents] }));
    },

    addInfluenceOp: (influenceOp) => {
      set(state => ({ influenceOps: [influenceOp, ...state.influenceOps] }));
      get().updateMetrics();
    },

    applyCountermeasure: (opId, measureIndex) => {
      set(state => ({
        influenceOps: state.influenceOps.map(op => {
          if (op.id === opId) {
            const newMeasures = [...op.counterMeasures];
            newMeasures[measureIndex] = { ...newMeasures[measureIndex], status: 'active' };
            return { ...op, counterMeasures: newMeasures };
          }
          return op;
        }),
      }));
    },

    addIncident: (incident) => {
      set(state => ({ incidents: [incident, ...state.incidents] }));
      get().updateMetrics();
    },

    updateIncident: (id, updates) => {
      set(state => ({
        incidents: state.incidents.map(i => i.id === id ? { ...i, ...updates } : i),
      }));
      get().updateMetrics();
    },

    // ==================== COMPUTED SELECTORS ====================
    getFilteredThreats: () => {
      const state = get();
      const filters = state.filters.threats;

      return state.threats.filter(threat => {
        if (filters.threatLevel !== 'all' && threat.threatLevel !== filters.threatLevel) return false;
        if (filters.status !== 'all' && threat.status !== filters.status) return false;
        if (filters.region !== 'all' && threat.origin.region !== filters.region) return false;
        if (filters.actorType !== 'all' && threat.actor.type !== filters.actorType) return false;
        if (filters.classification !== 'all' && threat.classification !== filters.classification) return false;
        if (filters.searchQuery && !threat.type.toLowerCase().includes(filters.searchQuery.toLowerCase()) &&
            !threat.actor.name.toLowerCase().includes(filters.searchQuery.toLowerCase())) return false;
        return true;
      });
    },

    getFilteredOperations: () => {
      const state = get();
      const filters = state.filters.operations;

      return state.operations.filter(op => {
        if (filters.agency !== 'all' && op.leadAgency.id !== filters.agency) return false;
        if (filters.status !== 'all' && op.status !== filters.status) return false;
        if (filters.type !== 'all' && op.type !== filters.type) return false;
        if (filters.region !== 'all' && op.targetRegion.region !== filters.region) return false;
        if (filters.searchQuery && !op.codeName.toLowerCase().includes(filters.searchQuery.toLowerCase()) &&
            !op.type.toLowerCase().includes(filters.searchQuery.toLowerCase())) return false;
        return true;
      });
    },

    getFilteredIntercepts: () => {
      const state = get();
      const filters = state.filters.intercepts;

      return state.intercepts.filter(intercept => {
        if (filters.protocol !== 'all' && intercept.protocol !== filters.protocol) return false;
        if (filters.encryption !== 'all' && intercept.encryption !== filters.encryption) return false;
        if (filters.decryptionStatus !== 'all' && intercept.decryptionStatus !== filters.decryptionStatus) return false;
        if (filters.searchQuery && !intercept.id.toLowerCase().includes(filters.searchQuery.toLowerCase()) &&
            !intercept.suspectedActor.name.toLowerCase().includes(filters.searchQuery.toLowerCase())) return false;
        return true;
      });
    },

    getFilteredCyberEvents: () => {
      const state = get();
      const filters = state.filters.cyberEvents;

      return state.cyberEvents.filter(event => {
        if (filters.severity !== 'all' && event.severity !== filters.severity) return false;
        if (filters.status !== 'all' && event.status !== filters.status) return false;
        if (filters.type !== 'all' && event.type !== filters.type) return false;
        if (filters.actor !== 'all' && event.suspectedActor.id !== filters.actor) return false;
        if (filters.searchQuery && !event.target.toLowerCase().includes(filters.searchQuery.toLowerCase()) &&
            !event.type.toLowerCase().includes(filters.searchQuery.toLowerCase())) return false;
        return true;
      });
    },

    getFilteredAssets: () => {
      const state = get();
      const filters = state.filters.assets;

      return state.assets.filter(asset => {
        if (filters.type !== 'all' && asset.type !== filters.type) return false;
        if (filters.status !== 'all' && asset.status !== filters.status) return false;
        if (filters.reliability !== 'all' && asset.reliability !== filters.reliability) return false;
        if (filters.country !== 'all' && asset.nationality !== filters.country) return false;
        if (filters.searchQuery && !asset.codeName.toLowerCase().includes(filters.searchQuery.toLowerCase()) &&
            !asset.realName.toLowerCase().includes(filters.searchQuery.toLowerCase())) return false;
        return true;
      });
    },

    getFilteredDocuments: () => {
      const state = get();
      const filters = state.filters.documents;

      return state.documents.filter(doc => {
        if (filters.classification !== 'all' && doc.classification !== filters.classification) return false;
        if (filters.type !== 'all' && doc.type !== filters.type) return false;
        if (filters.agency !== 'all' && doc.author.id !== filters.agency) return false;
        if (filters.searchQuery && !doc.title.toLowerCase().includes(filters.searchQuery.toLowerCase())) return false;
        return true;
      });
    },

    getFilteredInfluenceOps: () => {
      const state = get();
      const filters = state.filters.influenceOps;

      return state.influenceOps.filter(op => {
        if (filters.status !== 'all' && op.status !== filters.status) return false;
        if (filters.platform !== 'all' && !op.platforms.includes(filters.platform)) return false;
        if (filters.actor !== 'all' && op.actor.id !== filters.actor) return false;
        if (filters.searchQuery && !op.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) &&
            !op.narrative.toLowerCase().includes(filters.searchQuery.toLowerCase())) return false;
        return true;
      });
    },

    getFilteredIncidents: () => {
      const state = get();
      const filters = state.filters.incidents;

      return state.incidents.filter(incident => {
        if (filters.severity !== 'all' && incident.severity !== filters.severity) return false;
        if (filters.sector !== 'all' && incident.sector.name !== filters.sector) return false;
        if (filters.status !== 'all' && incident.status !== filters.status) return false;
        if (filters.searchQuery && !incident.facility.toLowerCase().includes(filters.searchQuery.toLowerCase()) &&
            !incident.type.toLowerCase().includes(filters.searchQuery.toLowerCase())) return false;
        return true;
      });
    },

    getThreatById: (id) => {
      return get().threats.find(t => t.id === id);
    },

    getOperationById: (id) => {
      return get().operations.find(o => o.id === id);
    },

    getAssetById: (id) => {
      return get().assets.find(a => a.id === id);
    },

    getDocumentById: (id) => {
      return get().documents.find(d => d.id === id);
    },

    getCyberEventById: (id) => {
      return get().cyberEvents.find(c => c.id === id);
    },

    getInterceptById: (id) => {
      return get().intercepts.find(i => i.id === id);
    },
  }))
);

// ==================== HELPER FUNCTIONS ====================

function calculateMetrics(data) {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return {
    threatCount: data.threats?.filter(t => ['critical', 'high'].includes(t.threatLevel)).length || 0,
    activeOperations: data.operations?.filter(o => o.status === 'active').length || 0,
    interceptsToday: data.intercepts?.filter(i => new Date(i.timestamp) >= todayStart).length || 0,
    cyberAlerts: data.cyberEvents?.filter(c => ['critical', 'high'].includes(c.severity) && c.status === 'active').length || 0,
    assetsActive: data.assets?.filter(a => a.status === 'active').length || 0,
    influenceOpsTracked: data.influenceOps?.filter(o => o.status === 'active').length || 0,
    infrastructureAlerts: data.incidents?.filter(i => ['critical', 'high'].includes(i.severity)).length || 0,
    overallRiskScore: calculateOverallRisk(data),
  };
}

function calculateOverallRisk(data) {
  let score = 50; // Base score

  // Threat contributions
  const criticalThreats = data.threats?.filter(t => t.threatLevel === 'critical').length || 0;
  const highThreats = data.threats?.filter(t => t.threatLevel === 'high').length || 0;
  score += criticalThreats * 5 + highThreats * 2;

  // Cyber event contributions
  const criticalCyber = data.cyberEvents?.filter(c => c.severity === 'critical' && c.status === 'active').length || 0;
  score += criticalCyber * 4;

  // Infrastructure incident contributions
  const criticalIncidents = data.incidents?.filter(i => i.severity === 'critical').length || 0;
  score += criticalIncidents * 6;

  // Active influence operations
  const activeInfluence = data.influenceOps?.filter(o => o.status === 'active').length || 0;
  score += activeInfluence * 2;

  return Math.min(100, Math.max(0, score));
}

function calculateAlertLevel(data) {
  const riskScore = calculateOverallRisk(data);

  if (riskScore >= 90) return 'SEVERE';
  if (riskScore >= 75) return 'HIGH';
  if (riskScore >= 55) return 'ELEVATED';
  if (riskScore >= 35) return 'GUARDED';
  return 'LOW';
}

// ==================== TERMINAL COMMAND PROCESSOR ====================

function processTerminalCommand(command, state) {
  const parts = command.trim().toLowerCase().split(/\s+/);
  const cmd = parts[0];
  const args = parts.slice(1);

  const commands = {
    help: () => ({
      type: 'success',
      output: `
SENTINEL COMMAND TERMINAL v3.7.2
================================

Available Commands:
  help                    - Show this help message
  status                  - Display system status
  threats [filter]        - List active threats
  operations [filter]     - List active operations
  assets [filter]         - Query asset database
  intercepts [filter]     - Search intercept database
  cyber [filter]          - List cyber events
  query <entity> <id>     - Query specific entity
  isolate <node>          - Isolate cyber node
  decrypt <intercept_id>  - Attempt intercept decryption
  task <satellite> <area> - Task satellite sweep
  alert <level>           - Set alert level
  scan <network>          - Scan financial network
  extract <asset_id>      - Initiate asset extraction
  clear                   - Clear terminal
  exit                    - Close terminal

Type 'help <command>' for detailed usage.
`,
    }),

    status: () => ({
      type: 'info',
      output: `
SYSTEM STATUS REPORT
====================
Alert Level: ${state.alertLevel}
Overall Risk Score: ${state.globalMetrics.overallRiskScore}%

Active Threats: ${state.globalMetrics.threatCount}
Active Operations: ${state.globalMetrics.activeOperations}
Intercepts (24h): ${state.globalMetrics.interceptsToday}
Cyber Alerts: ${state.globalMetrics.cyberAlerts}
Active Assets: ${state.globalMetrics.assetsActive}
Influence Ops: ${state.globalMetrics.influenceOpsTracked}
Infrastructure Alerts: ${state.globalMetrics.infrastructureAlerts}

System Time: ${new Date().toISOString()}
Simulation: ${state.simulationRunning ? 'ACTIVE' : 'PAUSED'} (${state.simulationSpeed}x)
`,
    }),

    threats: () => {
      const threats = state.threats.slice(0, 10);
      const output = threats.map(t =>
        `[${t.threatLevel.toUpperCase().padEnd(8)}] ${t.id} | ${t.type} | ${t.actor.name}`
      ).join('\n');
      return {
        type: 'info',
        output: `
ACTIVE THREATS (Top 10)
=======================
${output || 'No threats found'}
`,
      };
    },

    operations: () => {
      const ops = state.operations.filter(o => o.status === 'active').slice(0, 10);
      const output = ops.map(o =>
        `[${o.status.toUpperCase().padEnd(8)}] ${o.codeName} | ${o.type} | ${o.leadAgency.id}`
      ).join('\n');
      return {
        type: 'info',
        output: `
ACTIVE OPERATIONS (Top 10)
==========================
${output || 'No active operations'}
`,
      };
    },

    assets: () => {
      const assets = state.assets.filter(a => a.status === 'active').slice(0, 10);
      const output = assets.map(a =>
        `[${a.reliability}] ${a.codeName.padEnd(15)} | ${a.type} | ${a.nationality}`
      ).join('\n');
      return {
        type: 'info',
        output: `
ACTIVE ASSETS (Top 10)
======================
${output || 'No active assets'}
`,
      };
    },

    intercepts: () => {
      const intercepts = state.intercepts.slice(0, 10);
      const output = intercepts.map(i =>
        `[${i.decryptionStatus.toUpperCase().padEnd(10)}] ${i.id} | ${i.protocol} | ${i.suspectedActor.name}`
      ).join('\n');
      return {
        type: 'info',
        output: `
RECENT INTERCEPTS (Top 10)
==========================
${output || 'No intercepts found'}
`,
      };
    },

    cyber: () => {
      const events = state.cyberEvents.filter(c => c.status === 'active').slice(0, 10);
      const output = events.map(e =>
        `[${e.severity.toUpperCase().padEnd(8)}] ${e.id} | ${e.type} | ${e.target}`
      ).join('\n');
      return {
        type: 'info',
        output: `
ACTIVE CYBER EVENTS (Top 10)
============================
${output || 'No active cyber events'}
`,
      };
    },

    query: () => {
      if (args.length < 2) {
        return { type: 'error', output: 'Usage: query <entity_type> <id>\nEntity types: threat, operation, asset, intercept, cyber' };
      }
      const [entityType, id] = args;
      let entity = null;

      switch (entityType) {
        case 'threat':
          entity = state.threats.find(t => t.id.toLowerCase().includes(id));
          break;
        case 'operation':
          entity = state.operations.find(o => o.id.toLowerCase().includes(id) || o.codeName.toLowerCase().includes(id));
          break;
        case 'asset':
          entity = state.assets.find(a => a.id.toLowerCase().includes(id) || a.codeName.toLowerCase().includes(id));
          break;
        case 'intercept':
          entity = state.intercepts.find(i => i.id.toLowerCase().includes(id));
          break;
        case 'cyber':
          entity = state.cyberEvents.find(c => c.id.toLowerCase().includes(id));
          break;
        default:
          return { type: 'error', output: `Unknown entity type: ${entityType}` };
      }

      if (!entity) {
        return { type: 'warning', output: `No ${entityType} found matching: ${id}` };
      }

      return {
        type: 'success',
        output: `
ENTITY DETAILS: ${entity.id}
============================
${JSON.stringify(entity, null, 2).substring(0, 2000)}...
`,
      };
    },

    isolate: () => {
      if (args.length < 1) {
        return { type: 'error', output: 'Usage: isolate <node_id>' };
      }
      const nodeId = args[0].toUpperCase();
      return {
        type: 'success',
        output: `
NETWORK ISOLATION INITIATED
===========================
Target Node: ${nodeId}
Status: ISOLATION COMMAND SENT
Timestamp: ${new Date().toISOString()}

Firewall rules updated.
Network segment quarantined.
Traffic analysis initiated.
`,
        action: (set, get) => {
          const state = get();
          const event = state.cyberEvents.find(e => e.networkNodes.some(n => n.id === nodeId));
          if (event) {
            get().isolateCyberNode(event.id, nodeId);
          }
        },
      };
    },

    decrypt: () => {
      if (args.length < 1) {
        return { type: 'error', output: 'Usage: decrypt <intercept_id>' };
      }
      const interceptId = args[0].toUpperCase();
      const intercept = state.intercepts.find(i => i.id.includes(interceptId));

      if (!intercept) {
        return { type: 'warning', output: `Intercept not found: ${interceptId}` };
      }

      if (intercept.decryptionStatus === 'decrypted') {
        return { type: 'info', output: `Intercept ${interceptId} already decrypted.` };
      }

      const success = Math.random() > 0.3;
      return {
        type: success ? 'success' : 'warning',
        output: success ? `
DECRYPTION SUCCESSFUL
=====================
Intercept: ${intercept.id}
Protocol: ${intercept.protocol}
Encryption: ${intercept.encryption}

Content Preview:
${intercept.content || '[Binary data - requires specialized analysis]'}
` : `
DECRYPTION FAILED
=================
Intercept: ${intercept.id}
Encryption strength exceeds current capability.
Recommendation: Escalate to NSA QUANTUM division.
`,
        action: success ? (set, get) => get().decryptIntercept(intercept.id) : null,
      };
    },

    task: () => {
      if (args.length < 2) {
        return { type: 'error', output: 'Usage: task <satellite> <area>\nSatellites: KEYHOLE-12, LACROSSE-5, ONYX-3, MERCURY-7' };
      }
      const [satellite, ...areaParts] = args;
      const area = areaParts.join(' ');
      return {
        type: 'success',
        output: `
SATELLITE TASKING ORDER SUBMITTED
=================================
Satellite: ${satellite.toUpperCase()}
Target Area: ${area.toUpperCase()}
Priority: ROUTINE
Est. Collection Window: ${new Date(Date.now() + 3600000).toISOString()}

Tasking order queued.
Awaiting orbital window confirmation.
`,
      };
    },

    alert: () => {
      if (args.length < 1) {
        return { type: 'error', output: 'Usage: alert <level>\nLevels: LOW, GUARDED, ELEVATED, HIGH, SEVERE' };
      }
      const level = args[0].toUpperCase();
      const validLevels = ['LOW', 'GUARDED', 'ELEVATED', 'HIGH', 'SEVERE'];
      if (!validLevels.includes(level)) {
        return { type: 'error', output: `Invalid alert level. Valid levels: ${validLevels.join(', ')}` };
      }
      return {
        type: 'success',
        output: `
ALERT LEVEL CHANGE
==================
Previous: ${state.alertLevel}
New: ${level}
Timestamp: ${new Date().toISOString()}

All agencies notified.
Enhanced monitoring protocols activated.
`,
        action: (set) => set({ alertLevel: level }),
      };
    },

    scan: () => {
      if (args.length < 1) {
        return { type: 'error', output: 'Usage: scan <network>\nNetworks: SWIFT, CHIPS, FEDWIRE, CRYPTO, DARKWEB' };
      }
      const network = args[0].toUpperCase();
      return {
        type: 'info',
        output: `
FINANCIAL NETWORK SCAN INITIATED
================================
Network: ${network}
Scan Type: Deep Pattern Analysis
Status: IN PROGRESS

Analyzing transaction patterns...
Cross-referencing with known IOCs...
Estimated completion: ${new Date(Date.now() + 300000).toISOString()}

Results will be delivered to FINANCIAL INTELLIGENCE UNIT.
`,
      };
    },

    extract: () => {
      if (args.length < 1) {
        return { type: 'error', output: 'Usage: extract <asset_id>' };
      }
      const assetId = args[0].toUpperCase();
      const asset = state.assets.find(a => a.id.includes(assetId) || a.codeName.toLowerCase().includes(args[0]));

      if (!asset) {
        return { type: 'warning', output: `Asset not found: ${assetId}` };
      }

      return {
        type: 'warning',
        output: `
EXTRACTION ORDER - REQUIRES AUTHORIZATION
=========================================
Asset: ${asset.codeName} (${asset.id})
Location: ${asset.location.name}, ${asset.nationality}
Current Status: ${asset.status}

WARNING: Extraction operations require:
- Director-level authorization
- SOF team availability
- Diplomatic clearance

Submit EXFIL request through COVERT OPS channel.
`,
      };
    },

    clear: () => ({
      type: 'system',
      output: '',
      action: (set) => set({ terminalHistory: [] }),
    }),

    exit: () => ({
      type: 'system',
      output: 'Terminal session closed.',
    }),
  };

  if (commands[cmd]) {
    return commands[cmd]();
  }

  return {
    type: 'error',
    output: `Unknown command: ${cmd}\nType 'help' for available commands.`,
  };
}

export default useStore;
