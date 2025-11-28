import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Machines } from './pages/Machines';
import { MachineDetail } from './pages/MachineDetail';
import { Comparison } from './pages/Comparison';
import { CommandCenter } from './pages/CommandCenter';
import { useSimulator } from './hooks/useSimulator';
import { useEffect } from 'react';
import useFactoryStore from './store/useFactoryStore';

function App() {
  const darkMode = useFactoryStore(state => state.darkMode);

  // Initialize simulator
  useSimulator(true);

  // Apply dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="machines" element={<Machines />} />
            <Route path="machines/:machineId" element={<MachineDetail />} />
            <Route path="comparison" element={<Comparison />} />
            <Route path="command-center" element={<CommandCenter />} />
          </Route>
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
