import { useEffect, useState } from 'react'
import useTelemetryStore from './store/useTelemetryStore'
import Header from './components/Header'
import SatelliteList from './components/SatelliteList'
import OrbitVisualization from './components/OrbitVisualization'
import FleetStats from './components/FleetStats'
import SubsystemGauges from './components/SubsystemGauges'
import EventTable, { CompactEventList } from './components/EventTable'
import AlertPanel from './components/AlertPanel'
import {
  PowerChart,
  CommunicationsChart,
  ThermalChart,
  FleetStatusChart,
  OrbitDistributionChart,
} from './components/TelemetryCharts'
import { CompactStats } from './components/FleetStats'

function App() {
  const {
    satellites,
    selectedSatellite,
    fleetStats,
    events,
    alerts,
    filters,
    darkMode,
    sidebarOpen,
    isStreaming,
    initializeFleet,
    initializeWorker,
    startStreaming,
    stopStreaming,
    selectSatellite,
    clearSelection,
    setFilter,
    toggleDarkMode,
    toggleSidebar,
    acknowledgeAlert,
    clearAlerts,
    exportData,
  } = useTelemetryStore()

  const [showAlerts, setShowAlerts] = useState(false)
  const [fleetSize, setFleetSize] = useState(100)

  // Initialize on mount
  useEffect(() => {
    initializeFleet(fleetSize)
    const worker = initializeWorker()

    return () => {
      stopStreaming()
      if (worker) worker.terminate()
    }
  }, [])

  const handleSelectSatellite = (satelliteId) => {
    selectSatellite(satelliteId)
  }

  const handleFilterChange = (filterType, value) => {
    setFilter(filterType, value)
  }

  const handleToggleStreaming = () => {
    if (isStreaming) {
      stopStreaming()
    } else {
      startStreaming()
    }
  }

  const unacknowledgedAlerts = alerts.filter((a) => !a.acknowledged).length

  return (
    <div className="min-h-screen bg-background">
      <Header
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        isStreaming={isStreaming}
        onToggleStreaming={handleToggleStreaming}
        onExport={exportData}
        alertCount={unacknowledgedAlerts}
        onShowAlerts={() => setShowAlerts(!showAlerts)}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={toggleSidebar}
      />

      <div className="flex h-[calc(100vh-73px)]">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 fixed lg:relative z-40 w-80 bg-card border-r border-border overflow-y-auto scrollbar-thin transition-transform duration-300`}
        >
          <div className="p-4 space-y-6">
            {/* Fleet stats summary */}
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">Fleet Overview</h3>
              <CompactStats fleetStats={fleetStats} />
            </div>

            {/* Recent events */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Recent Events</h3>
              <CompactEventList
                events={events}
                limit={5}
                onSelectSatellite={handleSelectSatellite}
              />
            </div>

            {/* Fleet size control */}
            <div className="bg-muted/50 rounded-lg p-4">
              <label className="text-xs font-medium text-foreground mb-2 block">
                Fleet Size: {fleetSize} satellites
              </label>
              <input
                type="range"
                min="10"
                max="10000"
                step="10"
                value={fleetSize}
                onChange={(e) => setFleetSize(Number(e.target.value))}
                className="w-full"
              />
              <button
                onClick={() => {
                  stopStreaming()
                  initializeFleet(fleetSize)
                }}
                className="w-full mt-2 px-3 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Reinitialize Fleet
              </button>
              <p className="text-xs text-muted-foreground mt-2">
                Note: Large fleets may impact performance
              </p>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          {/* Alert panel overlay */}
          {showAlerts && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
                <AlertPanel
                  alerts={alerts}
                  onAcknowledge={acknowledgeAlert}
                  onClearAll={() => {
                    clearAlerts()
                    setShowAlerts(false)
                  }}
                />
                <button
                  onClick={() => setShowAlerts(false)}
                  className="mt-4 w-full px-4 py-2 bg-card text-foreground border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {!selectedSatellite ? (
            /* Overview view */
            <div className="p-6 space-y-6">
              {/* Fleet statistics */}
              <FleetStats fleetStats={fleetStats} />

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FleetStatusChart fleetStats={fleetStats} />
                <OrbitDistributionChart fleetStats={fleetStats} />
              </div>

              {/* 3D Visualization */}
              <div className="bg-card rounded-lg border border-border overflow-hidden">
                <div className="p-4 border-b border-border">
                  <h3 className="text-sm font-semibold text-foreground">
                    Orbit Visualization
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Showing first 500 satellites for performance. Click to select.
                  </p>
                </div>
                <div className="h-[600px]">
                  <OrbitVisualization
                    satellites={satellites}
                    selectedSatellite={selectedSatellite}
                    onSelectSatellite={handleSelectSatellite}
                    maxDisplay={500}
                  />
                </div>
              </div>

              {/* Satellite list */}
              <SatelliteList
                satellites={satellites}
                selectedSatelliteId={selectedSatellite?.id}
                onSelectSatellite={handleSelectSatellite}
                filters={filters}
                onFilterChange={handleFilterChange}
              />

              {/* Event table */}
              <EventTable
                events={events}
                onSelectSatellite={handleSelectSatellite}
              />
            </div>
          ) : (
            /* Satellite detail view */
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    {selectedSatellite.id}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {selectedSatellite.mission.missionType} - {selectedSatellite.orbitType}
                  </p>
                </div>
                <button
                  onClick={clearSelection}
                  className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors"
                >
                  Back to Overview
                </button>
              </div>

              {/* 3D Visualization */}
              <div className="bg-card rounded-lg border border-border overflow-hidden">
                <div className="h-[400px]">
                  <OrbitVisualization
                    satellites={[selectedSatellite]}
                    selectedSatellite={selectedSatellite}
                    onSelectSatellite={handleSelectSatellite}
                    showOrbits={true}
                    maxDisplay={1}
                  />
                </div>
              </div>

              {/* Subsystem gauges */}
              <SubsystemGauges satellite={selectedSatellite} />

              {/* Telemetry charts */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-foreground">
                  Historical Telemetry
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <PowerChart satellite={selectedSatellite} />
                  <CommunicationsChart satellite={selectedSatellite} />
                </div>
                <ThermalChart satellite={selectedSatellite} />
              </div>

              {/* Mission info */}
              <div className="bg-card rounded-lg p-6 border border-border">
                <h3 className="text-sm font-semibold text-foreground mb-4">
                  Mission Information
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Launch Date</p>
                    <p className="text-sm font-medium text-foreground mt-1">
                      {new Date(selectedSatellite.mission.launchDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Expected Lifetime</p>
                    <p className="text-sm font-medium text-foreground mt-1">
                      {selectedSatellite.mission.expectedLifetime} years
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Coverage</p>
                    <p className="text-sm font-medium text-foreground mt-1">
                      {selectedSatellite.mission.coverage}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Daily Cost</p>
                    <p className="text-sm font-medium text-foreground mt-1">
                      ${selectedSatellite.costs.dailyOperational.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default App
