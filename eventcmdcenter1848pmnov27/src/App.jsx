import React, { useEffect } from 'react';
import { Header } from './components/Dashboard/Header';
import { BuildingSelector } from './components/Dashboard/BuildingSelector';
import { DashboardView } from './components/Dashboard/DashboardView';
import { useDashboardStore } from './store/dashboardStore';
import dataSimulator from './services/dataSimulator';

function App() {
  const { selectedBuilding, updateRealtimeData, setDarkMode } = useDashboardStore();

  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(prefersDark);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => setDarkMode(e.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [setDarkMode]);

  useEffect(() => {
    const updateInterval = parseInt(import.meta.env.VITE_UPDATE_INTERVAL) || 3000;

    dataSimulator.startRealtimeSimulation((data) => {
      updateRealtimeData(data);
    }, updateInterval);

    return () => {
      dataSimulator.stopRealtimeSimulation();
    };
  }, [updateRealtimeData]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-6">
        {!selectedBuilding ? (
          <BuildingSelector />
        ) : (
          <div className="space-y-6">
            <button
              onClick={() => useDashboardStore.getState().setSelectedBuilding(null)}
              className="text-sm text-primary hover:underline"
            >
              ← Back to all buildings
            </button>
            <DashboardView building={selectedBuilding} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
