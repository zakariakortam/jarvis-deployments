import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import { useEffect } from 'react';
import Layout from './components/Layout';
import GlobalOverview from './pages/GlobalOverview';
import PlantDigitalTwin from './pages/PlantDigitalTwin';
import ProcessLineSimulator from './pages/ProcessLineSimulator';
import EnergyManagement from './pages/EnergyManagement';
import QualityAnalytics from './pages/QualityAnalytics';
import MaintenancePlanning from './pages/MaintenancePlanning';
import ExecutiveControlRoom from './pages/ExecutiveControlRoom';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const theme = useStore((state) => state.theme);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <ErrorBoundary>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/overview" replace />} />
            <Route path="/overview" element={<GlobalOverview />} />
            <Route path="/plant/:plantId" element={<PlantDigitalTwin />} />
            <Route path="/process-lines" element={<ProcessLineSimulator />} />
            <Route path="/energy" element={<EnergyManagement />} />
            <Route path="/quality" element={<QualityAnalytics />} />
            <Route path="/maintenance" element={<MaintenancePlanning />} />
            <Route path="/executive" element={<ExecutiveControlRoom />} />
          </Routes>
        </Layout>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
