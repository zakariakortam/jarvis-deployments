import { useEffect, useMemo } from 'react';
import useDataStore from './store/useDataStore';
import Header from './components/Header';
import StatCard from './components/StatCard';
import TimeSeriesChart from './components/TimeSeriesChart';
import HeatMap from './components/HeatMap';
import SustainabilityGauge from './components/SustainabilityGauge';
import DataTable from './components/DataTable';
import AlertPanel from './components/AlertPanel';
import FilterBar from './components/FilterBar';
import { Wind, Droplets, Thermometer, Activity, Zap } from 'lucide-react';

function App() {
  const {
    realtimeData,
    latestReadings,
    isStreaming,
    darkMode,
    selectedType,
    timeRange,
    searchQuery,
    sortBy,
    sortOrder,
    alerts,
    startStreaming,
    stopStreaming,
    toggleDarkMode,
    setSelectedType,
    setTimeRange,
    setSearchQuery,
    setSorting,
    dismissAlert,
    clearAlerts,
    exportData,
    getFilteredData,
  } = useDataStore();

  // Initialize streaming on mount
  useEffect(() => {
    startStreaming();
    return () => stopStreaming();
  }, []);

  // Apply dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (latestReadings.length === 0) {
      return {
        avgCO2: 0,
        avgTemp: 0,
        avgHumidity: 0,
        totalStations: 0,
        activeAlerts: alerts.length,
      };
    }

    const airStations = latestReadings.filter((r) => r.type === 'air');
    const weatherStations = latestReadings.filter((r) => r.type === 'weather');

    const avgCO2 =
      airStations.reduce((sum, r) => sum + (r.readings.co2 || 0), 0) / (airStations.length || 1);

    const avgTemp =
      weatherStations.reduce((sum, r) => sum + (r.readings.temperature || 0), 0) /
      (weatherStations.length || 1);

    const avgHumidity =
      weatherStations.reduce((sum, r) => sum + (r.readings.humidity || 0), 0) /
      (weatherStations.length || 1);

    return {
      avgCO2,
      avgTemp,
      avgHumidity,
      totalStations: latestReadings.length,
      activeAlerts: alerts.length,
    };
  }, [latestReadings, alerts]);

  // Get chart data (last 50 points)
  const chartData = useMemo(() => {
    return realtimeData.slice(-50);
  }, [realtimeData]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    if (key === 'type') setSelectedType(value);
    if (key === 'timeRange') setTimeRange(value);
    if (key === 'search') setSearchQuery(value);
  };

  // Handle export
  const handleExport = (format) => {
    exportData(format);
  };

  // Toggle streaming
  const handleToggleStreaming = () => {
    if (isStreaming) {
      stopStreaming();
    } else {
      startStreaming();
    }
  };

  // Get filtered data for table
  const filteredData = getFilteredData();

  return (
    <div className="min-h-screen bg-background">
      <Header
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        isStreaming={isStreaming}
        onToggleStreaming={handleToggleStreaming}
      />

      <main className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatCard
            title="Average CO₂"
            value={stats.avgCO2}
            unit="ppm"
            icon={Wind}
            trend="up"
            change={2.3}
          />
          <StatCard
            title="Average Temperature"
            value={stats.avgTemp}
            unit="°C"
            icon={Thermometer}
            trend="down"
            change={1.2}
          />
          <StatCard
            title="Average Humidity"
            value={stats.avgHumidity}
            unit="%"
            icon={Droplets}
            trend="up"
            change={0.8}
          />
          <StatCard
            title="Active Stations"
            value={stats.totalStations}
            icon={Activity}
          />
          <StatCard
            title="Active Alerts"
            value={stats.activeAlerts}
            icon={Zap}
          />
        </div>

        {/* Filter Bar */}
        <div className="mb-8">
          <FilterBar
            onFilterChange={handleFilterChange}
            onExport={handleExport}
            filters={{
              type: selectedType,
              timeRange,
              search: searchQuery,
            }}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <TimeSeriesChart
            data={chartData.filter((d) => d.type === 'air')}
            dataKeys={['co2', 'temperature', 'humidity']}
            title="Air Quality Metrics"
            yAxisLabel="Value"
            colors={['#3b82f6', '#ef4444', '#10b981']}
          />
          <TimeSeriesChart
            data={chartData.filter((d) => d.type === 'weather')}
            dataKeys={['temperature', 'humidity', 'rainfall']}
            title="Weather Conditions"
            yAxisLabel="Value"
            colors={['#f59e0b', '#8b5cf6', '#06b6d4']}
          />
        </div>

        {/* Heatmap */}
        <div className="mb-8">
          <HeatMap data={latestReadings} metric="co2" />
        </div>

        {/* Gauges */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <SustainabilityGauge
            value={stats.avgCO2}
            max={1000}
            label="CO₂ Level"
            unit="ppm"
            thresholds={{ warning: 600, danger: 800 }}
          />
          <SustainabilityGauge
            value={stats.avgTemp}
            max={50}
            label="Temperature"
            unit="°C"
            thresholds={{ warning: 30, danger: 35 }}
          />
          <SustainabilityGauge
            value={stats.avgHumidity}
            max={100}
            label="Humidity"
            unit="%"
            thresholds={{ warning: 70, danger: 80 }}
          />
          <SustainabilityGauge
            value={
              latestReadings
                .filter((r) => r.type === 'air')
                .reduce((sum, r) => sum + (r.readings.aqi || 0), 0) /
              (latestReadings.filter((r) => r.type === 'air').length || 1)
            }
            max={200}
            label="Air Quality Index"
            unit="AQI"
            thresholds={{ warning: 100, danger: 150 }}
          />
        </div>

        {/* Alerts */}
        <div className="mb-8">
          <AlertPanel
            alerts={alerts}
            onDismiss={dismissAlert}
            onClearAll={clearAlerts}
          />
        </div>

        {/* Data Table */}
        <DataTable
          data={filteredData}
          onSort={setSorting}
          sortBy={sortBy}
          sortOrder={sortOrder}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 mt-12">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>Environmental Monitoring Dashboard v1.0.0</p>
          <p className="mt-1">
            Processing {realtimeData.length} datapoints from {latestReadings.length} sensors
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
