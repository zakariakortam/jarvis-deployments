import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import useStore from './store/useStore';
import websocketService from './services/websocket';
import { getMockInitialData, createMockUpdates } from './services/mockData';
import audioService from './services/audio';

// Components
import ErrorBoundary from './components/ErrorBoundary';
import ParticleBackground from './components/ParticleBackground';
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import FleetPanel from './components/FleetPanel';
import GalacticMap from './components/GalacticMap';
import MissionTimeline from './components/MissionTimeline';
import CrewPanel from './components/CrewPanel';
import EngineeringPanel from './components/EngineeringPanel';
import CommandTerminal from './components/CommandTerminal';
import AlertsPanel from './components/AlertsPanel';

// Panel components map
const panels = {
  fleet: FleetPanel,
  map: GalacticMap,
  missions: MissionTimeline,
  crew: CrewPanel,
  engineering: EngineeringPanel,
  terminal: CommandTerminal,
  alerts: AlertsPanel,
};

// Panel transition variants
const panelVariants = {
  initial: {
    opacity: 0,
    scale: 0.98,
    filter: 'blur(10px)'
  },
  animate: {
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  exit: {
    opacity: 0,
    scale: 1.02,
    filter: 'blur(10px)',
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 1, 1]
    }
  }
};

function App() {
  const store = useStore();
  const { activePanel, connected } = store;

  const [bootSequence, setBootSequence] = useState(true);
  const [bootPhase, setBootPhase] = useState(0);
  const [useMockData, setUseMockData] = useState(false);

  // Boot sequence messages
  const bootMessages = [
    'INITIALIZING COSMOS OMNI-COMMAND SYSTEM...',
    'ESTABLISHING QUANTUM ENTANGLEMENT LINK...',
    'LOADING FLEET TELEMETRY MODULES...',
    'CALIBRATING HOLOGRAPHIC DISPLAY MATRIX...',
    'SYNCHRONIZING TEMPORAL DATABASES...',
    'CONNECTING TO GALACTIC COMMAND NETWORK...',
    'SYSTEM READY - WELCOME, COMMANDER'
  ];

  // Initialize connection
  useEffect(() => {
    // Initialize audio service on user interaction
    const initAudio = () => {
      audioService.init();
      document.removeEventListener('click', initAudio);
    };
    document.addEventListener('click', initAudio);

    // Try WebSocket connection
    websocketService.connect(store);

    // Set up connection listener
    const unsubConnect = websocketService.on('connected', () => {
      audioService.playNotification();
    });

    // Fallback to mock data after timeout
    const fallbackTimeout = setTimeout(() => {
      if (!websocketService.isConnected()) {
        console.log('WebSocket connection failed, using mock data');
        setUseMockData(true);

        // Initialize with mock data
        const mockData = getMockInitialData();
        store.initializeData(mockData);

        // Start mock updates
        createMockUpdates((updates) => {
          store.updateData(updates);
        });
      }
    }, 3000);

    return () => {
      clearTimeout(fallbackTimeout);
      websocketService.disconnect();
      unsubConnect?.();
      document.removeEventListener('click', initAudio);
    };
  }, []);

  // Boot sequence animation
  useEffect(() => {
    if (bootSequence) {
      const bootInterval = setInterval(() => {
        setBootPhase(prev => {
          if (prev >= bootMessages.length - 1) {
            clearInterval(bootInterval);
            setTimeout(() => setBootSequence(false), 1000);
            return prev;
          }
          audioService.playClick();
          return prev + 1;
        });
      }, 600);

      return () => clearInterval(bootInterval);
    }
  }, [bootSequence, bootMessages.length]);

  // Render boot sequence
  if (bootSequence) {
    return (
      <div className="min-h-screen bg-space-darker flex items-center justify-center overflow-hidden">
        <ParticleBackground />
        <div className="relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8"
          >
            <div className="w-32 h-32 mx-auto relative">
              {/* Animated rings */}
              <motion.div
                className="absolute inset-0 border-2 border-holo-blue rounded-full"
                animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              />
              <motion.div
                className="absolute inset-4 border border-holo-cyan rounded-full"
                animate={{ rotate: -360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              />
              <motion.div
                className="absolute inset-8 border border-holo-purple rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              />
              {/* Center dot */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <div className="w-4 h-4 bg-holo-blue rounded-full shadow-holo" />
              </motion.div>
            </div>
          </motion.div>

          {/* Boot messages */}
          <div className="space-y-2">
            {bootMessages.slice(0, bootPhase + 1).map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`font-mono text-sm ${
                  index === bootPhase ? 'text-holo-blue' : 'text-holo-cyan/50'
                }`}
              >
                {index < bootPhase ? '✓ ' : '> '}{message}
              </motion.div>
            ))}
          </div>

          {/* Progress bar */}
          <motion.div
            className="mt-8 w-64 mx-auto h-1 bg-space-dark rounded-full overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="h-full bg-gradient-to-r from-holo-blue to-holo-cyan"
              initial={{ width: '0%' }}
              animate={{ width: `${((bootPhase + 1) / bootMessages.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>
        </div>
      </div>
    );
  }

  const ActivePanel = panels[activePanel] || FleetPanel;
  const connectionStatus = connected ? 'connected' : useMockData ? 'mock' : 'offline';

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-space-darker text-gray-100 overflow-hidden">
        {/* Background effects */}
        <ParticleBackground />

        {/* Scanline overlay */}
        <div className="fixed inset-0 pointer-events-none z-50 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-holo-blue/5 to-transparent animate-scan-line" />
        </div>

        {/* Noise texture overlay */}
        <div className="noise-overlay fixed inset-0 z-40" />

        {/* Main layout */}
        <div className="relative z-10 flex flex-col h-screen">
          {/* Top bar */}
          <TopBar />

          {/* Main content area */}
          <div className="flex-1 flex overflow-hidden">
            {/* Sidebar */}
            <Sidebar />

            {/* Panel content */}
            <main className="flex-1 overflow-hidden p-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activePanel}
                  variants={panelVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="h-full"
                >
                  <ActivePanel />
                </motion.div>
              </AnimatePresence>
            </main>
          </div>

          {/* Connection status indicator */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-4 right-4 z-50"
          >
            <div className={`
              px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider
              backdrop-blur-md border
              ${connectionStatus === 'connected'
                ? 'bg-holo-green/10 border-holo-green/50 text-holo-green'
                : connectionStatus === 'mock'
                ? 'bg-holo-orange/10 border-holo-orange/50 text-holo-orange'
                : 'bg-holo-red/10 border-holo-red/50 text-holo-red'
              }
            `}>
              <span className={`
                inline-block w-2 h-2 rounded-full mr-2
                ${connectionStatus === 'connected'
                  ? 'bg-holo-green animate-pulse'
                  : connectionStatus === 'mock'
                  ? 'bg-holo-orange animate-pulse'
                  : 'bg-holo-red'
                }
              `} />
              {connectionStatus === 'connected'
                ? 'LIVE CONNECTION'
                : connectionStatus === 'mock'
                ? 'SIMULATION MODE'
                : 'OFFLINE'
              }
            </div>
          </motion.div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
