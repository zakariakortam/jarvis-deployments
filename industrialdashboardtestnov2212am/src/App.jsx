import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import useDashboardStore from './store/dashboardStore';
import Header from './components/Header';
import EquipmentOverview from './components/EquipmentOverview';
import TemperatureChart from './components/TemperatureChart';
import VoltageGauge from './components/VoltageGauge';
import VibrationChart from './components/VibrationChart';
import PowerChart from './components/PowerChart';
import ProductionTable from './components/ProductionTable';
import AlertPanel from './components/AlertPanel';

function App() {
  const { isDarkMode, startStreaming, stopStreaming, currentSnapshot } = useDashboardStore();
  const [selectedEquipmentForCharts, setSelectedEquipmentForCharts] = useState([]);

  useEffect(() => {
    // Apply dark mode class to document
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    // Start streaming data when component mounts
    startStreaming();

    // Cleanup on unmount
    return () => {
      stopStreaming();
    };
  }, [startStreaming, stopStreaming]);

  useEffect(() => {
    // Auto-select first 5 equipment for charts
    if (currentSnapshot.length > 0 && selectedEquipmentForCharts.length === 0) {
      const operational = currentSnapshot.filter(eq => eq.status === 'operational');
      const selected = operational.slice(0, 5).map(eq => eq.equipmentId);
      setSelectedEquipmentForCharts(selected);
    }
  }, [currentSnapshot, selectedEquipmentForCharts.length]);

  // Get voltage gauges for top 6 equipment
  const voltageGauges = currentSnapshot.slice(0, 6);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Equipment Overview Cards */}
        <section>
          <EquipmentOverview />
        </section>

        {/* Charts Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TemperatureChart equipmentIds={selectedEquipmentForCharts} />
          <PowerChart />
        </section>

        {/* Voltage Gauges */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Voltage Monitoring</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {voltageGauges.map((equipment) => (
              <VoltageGauge
                key={equipment.equipmentId}
                voltage={equipment.voltage}
                equipmentName={equipment.name}
                status={equipment.status}
              />
            ))}
          </div>
        </section>

        {/* Vibration Analysis */}
        {selectedEquipmentForCharts.length > 0 && (
          <section>
            <VibrationChart equipmentId={selectedEquipmentForCharts[0]} />
          </section>
        )}

        {/* Alerts and Production Data */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <AlertPanel />
          </div>
          <div className="lg:col-span-2">
            <ProductionTable />
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center text-sm text-muted-foreground py-6 border-t border-border mt-8">
          <p>Industrial Dashboard v1.0.0 - Real-time Factory Monitoring System</p>
          <p className="mt-1">
            Monitoring {currentSnapshot.length} equipment units with live sensor data
          </p>
        </footer>
      </main>
    </div>
  );
}

export default App;
