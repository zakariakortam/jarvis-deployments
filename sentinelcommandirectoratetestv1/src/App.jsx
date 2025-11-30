import React, { useEffect, useCallback, Component } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from './stores/mainStore';

// Error Boundary to catch and display errors instead of blank screen
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error('Application Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-cmd-darker flex items-center justify-center p-8">
          <div className="bg-cmd-panel border border-threat-critical rounded-lg p-8 max-w-2xl w-full">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-threat-critical/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-threat-critical" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">SYSTEM ERROR</h1>
                <p className="text-gray-400 text-sm">Critical failure detected</p>
              </div>
            </div>
            <div className="bg-cmd-darker rounded p-4 mb-6">
              <p className="text-threat-critical font-mono text-sm mb-2">
                {this.state.error?.toString() || 'Unknown error'}
              </p>
              <details className="text-gray-500 text-xs">
                <summary className="cursor-pointer hover:text-gray-300">Stack Trace</summary>
                <pre className="mt-2 overflow-auto max-h-40 text-xs">
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-threat-critical hover:bg-threat-critical/80 text-white py-3 px-6 rounded font-medium transition-colors"
            >
              REINITIALIZE SYSTEM
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
import { Sidebar, Header } from './components/layout';
import { Dashboard } from './components/dashboard';
import { ThreatFusion } from './components/threats';
import { OperationsCommand } from './components/operations';
import { SigintChamber } from './components/sigint';
import { CyberTheater } from './components/cyber';
import { HumintNexus } from './components/humint';
import { CommandTerminal } from './components/terminal';
import { GeospatialWarRoom } from './components/geospatial';
import { PsyopsMonitor } from './components/psyops';
import { EconomicIntel } from './components/economic';
import { InfrastructureCommand } from './components/infrastructure';
import { DocumentVault } from './components/documents';

const moduleComponents = {
  dashboard: Dashboard,
  threats: ThreatFusion,
  operations: OperationsCommand,
  sigint: SigintChamber,
  cyber: CyberTheater,
  humint: HumintNexus,
  geospatial: GeospatialWarRoom,
  psyops: PsyopsMonitor,
  economic: EconomicIntel,
  infrastructure: InfrastructureCommand,
  documents: DocumentVault,
  terminal: CommandTerminal,
};

export default function App() {
  const {
    activeModule,
    simulationRunning,
    tick,
    startSimulation,
    stopSimulation,
    addNotification,
  } = useStore();

  // Simulation tick
  useEffect(() => {
    let interval;
    if (simulationRunning) {
      interval = setInterval(() => {
        tick();
      }, 3000); // Tick every 3 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [simulationRunning, tick]);

  // Auto-start simulation
  useEffect(() => {
    startSimulation();
    addNotification({
      id: `init-${Date.now()}`,
      type: 'system',
      title: 'System Initialized',
      message: 'Sentinel Command Directorate online. All systems operational.',
      priority: 'info',
      timestamp: new Date().toISOString(),
      read: false,
    });

    // Initial system check notification
    setTimeout(() => {
      addNotification({
        id: `check-${Date.now()}`,
        type: 'system',
        title: 'Security Verification',
        message: 'Biometric authentication confirmed. Clearance level: TOP SECRET//SCI',
        priority: 'info',
        timestamp: new Date().toISOString(),
        read: false,
      });
    }, 2000);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + number to switch modules
      if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '9') {
        e.preventDefault();
        const modules = ['dashboard', 'threats', 'operations', 'sigint', 'cyber', 'humint', 'geospatial', 'psyops', 'economic'];
        const index = parseInt(e.key) - 1;
        if (modules[index]) {
          useStore.getState().setActiveModule(modules[index]);
        }
      }
      // Ctrl/Cmd + T for terminal
      if ((e.ctrlKey || e.metaKey) && e.key === 't') {
        e.preventDefault();
        useStore.getState().setActiveModule('terminal');
      }
      // Escape to go back to dashboard
      if (e.key === 'Escape') {
        useStore.getState().setActiveModule('dashboard');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const ActiveComponent = moduleComponents[activeModule] || Dashboard;

  return (
    <ErrorBoundary>
      <div className="h-screen w-screen flex bg-cmd-darker overflow-hidden">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <Header />

          {/* Module Content */}
          <main className="flex-1 overflow-hidden bg-cmd-darker">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeModule}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <ActiveComponent />
              </motion.div>
            </AnimatePresence>
          </main>
        </div>

        {/* Global Overlays */}
        <AlertOverlay />
        <SystemStatusIndicator />
      </div>
    </ErrorBoundary>
  );
}

// Alert Overlay for critical notifications
function AlertOverlay() {
  const { notifications } = useStore();
  const criticalAlerts = notifications.filter(n => n.priority === 'critical' && !n.read);

  if (criticalAlerts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-md">
      <AnimatePresence>
        {criticalAlerts.slice(0, 3).map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="bg-threat-critical/90 backdrop-blur-sm border border-threat-critical rounded-lg p-4 shadow-xl"
          >
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-white animate-pulse mt-2" />
              <div>
                <h4 className="text-sm font-bold text-white">{alert.title}</h4>
                <p className="text-xs text-white/80 mt-1">{alert.message}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// System Status Indicator
function SystemStatusIndicator() {
  const { isSimulationRunning, simulationSpeed } = useStore();

  return (
    <div className="fixed bottom-4 left-20 z-40">
      <div className="flex items-center gap-2 bg-cmd-panel/90 backdrop-blur-sm border border-cmd-border rounded-lg px-3 py-2">
        <div className={`w-2 h-2 rounded-full ${isSimulationRunning ? 'bg-status-active animate-pulse' : 'bg-status-inactive'}`} />
        <span className="text-xs text-gray-400">
          {isSimulationRunning ? 'LIVE' : 'PAUSED'} | {simulationSpeed}x
        </span>
      </div>
    </div>
  );
}
