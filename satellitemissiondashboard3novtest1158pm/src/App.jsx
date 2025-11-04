import { useEffect, useState, Suspense, lazy } from 'react';
import { Moon, Sun, Activity, BarChart3, Satellite, Globe, List } from 'lucide-react';
import useSatelliteStore from './store/useSatelliteStore';
import clsx from 'clsx';

// Lazy load heavy components
const OrbitVisualization = lazy(() => import('./components/OrbitVisualization'));
const TelemetryCharts = lazy(() => import('./components/TelemetryCharts'));
const SubsystemGauges = lazy(() => import('./components/SubsystemGauges'));
const EventTable = lazy(() => import('./components/EventTable'));
const StatisticsDashboard = lazy(() => import('./components/StatisticsDashboard'));
const SatelliteList = lazy(() => import('./components/SatelliteList'));

// Loading spinner component
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <div className="text-muted-foreground">Loading...</div>
      </div>
    </div>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const isLoading = useSatelliteStore(state => state.isLoading);
  const theme = useSatelliteStore(state => state.theme);
  const toggleTheme = useSatelliteStore(state => state.toggleTheme);
  const initializeSatellites = useSatelliteStore(state => state.initializeSatellites);
  const initializeTheme = useSatelliteStore(state => state.initializeTheme);
  const selectedSatelliteId = useSatelliteStore(state => state.selectedSatellite);
  const getSatelliteById = useSatelliteStore(state => state.getSatelliteById);
  const selectSatellite = useSatelliteStore(state => state.selectSatellite);
  const events = useSatelliteStore(state => state.events);
  const satellites = useSatelliteStore(state => state.satellites);
  const updateTelemetry = useSatelliteStore(state => state.updateTelemetry);

  const selectedSatellite = selectedSatelliteId ? getSatelliteById(selectedSatelliteId) : null;

  // Initialize on mount
  useEffect(() => {
    initializeTheme();
    initializeSatellites();
  }, [initializeSatellites, initializeTheme]);

  // Start real-time updates
  useEffect(() => {
    if (isLoading) return;

    const interval = setInterval(() => {
      // Update only visible satellites for performance
      const visibleIds = activeTab === 'orbit' && selectedSatelliteId
        ? [selectedSatelliteId]
        : [];
      updateTelemetry(visibleIds);
    }, 2000);

    return () => clearInterval(interval);
  }, [isLoading, activeTab, selectedSatelliteId, updateTelemetry]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'orbit', label: 'Orbit View', icon: Globe },
    { id: 'telemetry', label: 'Telemetry', icon: Activity },
    { id: 'subsystems', label: 'Subsystems', icon: Satellite },
    { id: 'events', label: 'Events', icon: List },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <div className="text-xl font-semibold text-foreground">
            Initializing Mission Control
          </div>
          <div className="text-sm text-muted-foreground">
            Loading satellite constellation...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Satellite className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Satellite Mission Dashboard
                </h1>
                <p className="text-sm text-muted-foreground">
                  Real-time telemetry monitoring for {satellites.length.toLocaleString()} satellites
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-muted rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm text-foreground">Live</span>
              </div>

              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-foreground" />
                ) : (
                  <Moon className="w-5 h-5 text-foreground" />
                )}
              </button>

              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
                aria-label="Toggle sidebar"
              >
                <List className="w-5 h-5 text-foreground" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={clsx(
                    'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap',
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted text-muted-foreground'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside
          className={clsx(
            'w-80 border-r border-border bg-background transition-all duration-300',
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
            'absolute lg:relative inset-y-0 left-0 z-40 lg:z-0'
          )}
        >
          <Suspense fallback={<LoadingSpinner />}>
            <SatelliteList />
          </Suspense>
        </aside>

        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Content Area */}
        <main className="flex-1 overflow-auto">
          <Suspense fallback={<LoadingSpinner />}>
            {activeTab === 'overview' && <StatisticsDashboard />}

            {activeTab === 'orbit' && (
              <div className="h-full p-6">
                <OrbitVisualization
                  satellites={satellites}
                  selectedSatelliteId={selectedSatelliteId}
                  onSatelliteClick={selectSatellite}
                />
              </div>
            )}

            {activeTab === 'telemetry' && (
              <TelemetryCharts satellite={selectedSatellite} />
            )}

            {activeTab === 'subsystems' && (
              <SubsystemGauges satellite={selectedSatellite} />
            )}

            {activeTab === 'events' && (
              <div className="h-full p-6">
                <EventTable events={events} />
              </div>
            )}
          </Suspense>
        </main>
      </div>
    </div>
  );
}

export default App;
