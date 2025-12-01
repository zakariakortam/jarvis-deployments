import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import {
  Dashboard,
  TemperatureProfile,
  PowerAnalytics,
  ZoneAnalysis,
  Production,
  DataExplorer,
  Simulator,
  Alerts,
  Statistics,
  Settings,
} from './pages';
import useStore from './store/useStore';

function AppContent() {
  const { darkMode, loadDataFromString, isLoading, loadProgress, isUsingMockData, data } = useStore();
  const [loadingStatus, setLoadingStatus] = useState('idle');
  const [loadError, setLoadError] = useState(null);

  // Auto-load CSV data on startup
  useEffect(() => {
    const loadCSVData = async () => {
      // Only load if still using mock data
      if (!isUsingMockData) return;

      setLoadingStatus('loading');
      try {
        const response = await fetch('./data/reflow_data.csv');
        if (!response.ok) {
          throw new Error('CSV file not found');
        }
        const csvText = await response.text();
        await loadDataFromString(csvText);
        setLoadingStatus('loaded');
      } catch (error) {
        console.error('Failed to auto-load CSV:', error);
        setLoadError(error.message);
        setLoadingStatus('error');
        // App continues with mock data
      }
    };

    loadCSVData();
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Show loading screen while loading large CSV
  if (isLoading || loadingStatus === 'loading') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl text-white mb-2">Loading Reflow Oven Data</h2>
          <p className="text-gray-400 mb-4">Processing 60,480 records...</p>
          <div className="w-64 bg-gray-700 rounded-full h-3 mx-auto">
            <div
              className="bg-blue-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${loadProgress}%` }}
            ></div>
          </div>
          <p className="text-gray-500 mt-2">{Math.round(loadProgress)}%</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="temperature" element={<TemperatureProfile />} />
          <Route path="power" element={<PowerAnalytics />} />
          <Route path="zones" element={<ZoneAnalysis />} />
          <Route path="production" element={<Production />} />
          <Route path="explorer" element={<DataExplorer />} />
          <Route path="simulator" element={<Simulator />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="statistics" element={<Statistics />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

export default App;
