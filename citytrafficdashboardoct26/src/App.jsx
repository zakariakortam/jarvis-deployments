import { useEffect, useRef } from 'react';
import useTrafficStore from './store/trafficStore';
import TrafficSimulation from './services/trafficSimulation';
import Header from './components/Header';
import TrafficMap from './components/TrafficMap';
import TrendCharts from './components/TrendCharts';
import CongestionGauges from './components/CongestionGauges';
import EventTable from './components/EventTable';
import AlertPanel from './components/AlertPanel';

function App() {
  const darkMode = useTrafficStore(state => state.darkMode);
  const setSensors = useTrafficStore(state => state.setSensors);
  const setVehicles = useTrafficStore(state => state.setVehicles);
  const addEvent = useTrafficStore(state => state.addEvent);
  const addAlert = useTrafficStore(state => state.addAlert);
  const updateHistoricalData = useTrafficStore(state => state.updateHistoricalData);
  const updateStats = useTrafficStore(state => state.updateStats);

  const simulationRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    // Initialize simulation
    simulationRef.current = new TrafficSimulation();
    const initialSensors = simulationRef.current.initializeSensors();
    const initialVehicles = simulationRef.current.initializeVehicles();

    setSensors(initialSensors);
    setVehicles(initialVehicles);

    // Calculate initial stats
    const initialStats = simulationRef.current.calculateStats();
    updateStats(initialStats);
    updateHistoricalData({
      speed: initialStats.avgSpeed,
      congestion: initialStats.avgCongestion,
      emissions: initialStats.totalEmissions,
      timestamp: new Date().toISOString()
    });

    // Start real-time updates
    intervalRef.current = setInterval(() => {
      if (!simulationRef.current) return;

      // Update sensors and vehicles
      const updatedSensors = simulationRef.current.updateSensors();
      const updatedVehicles = simulationRef.current.updateVehicles();

      setSensors(updatedSensors);
      setVehicles(updatedVehicles);

      // Generate events
      const newEvents = simulationRef.current.generateEvents();
      newEvents.forEach(event => addEvent(event));

      // Generate alerts
      const newAlerts = simulationRef.current.generateAlerts();
      newAlerts.forEach(alert => addAlert(alert));

      // Update statistics
      const stats = simulationRef.current.calculateStats();
      updateStats(stats);

      // Update historical data
      updateHistoricalData({
        speed: stats.avgSpeed,
        congestion: stats.avgCongestion,
        emissions: stats.totalEmissions,
        timestamp: new Date().toISOString()
      });
    }, 2000); // Update every 2 seconds

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Apply dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <AlertPanel />

      <main className="p-4 lg:p-6 space-y-6">
        {/* Gauges Section */}
        <section>
          <CongestionGauges />
        </section>

        {/* Map and Charts Section */}
        <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Map */}
          <div className="h-[500px]">
            <TrafficMap />
          </div>

          {/* Charts */}
          <div className="h-[500px] flex items-center">
            <TrendCharts />
          </div>
        </section>

        {/* Events Table Section */}
        <section>
          <EventTable />
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-12 py-6 px-4 lg:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            City Traffic Dashboard v1.0.0 - Real-time traffic monitoring system
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>300 Active Sensors</span>
            <span className="hidden md:inline">•</span>
            <span>~1000 Vehicles Tracked</span>
            <span className="hidden md:inline">•</span>
            <span>Updates every 2s</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
