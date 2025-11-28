import { useState, useEffect } from 'react';
import { SensorDataSimulator } from './utils/sensorData';
import UrbanMobilityHub from './modules/UrbanMobilityHub';
import EnvironmentalGrid from './modules/EnvironmentalGrid';
import InfrastructureHealth from './modules/InfrastructureHealth';
import UtilityConsumption from './modules/UtilityConsumption';
import PublicSafetyConsole from './modules/PublicSafetyConsole';
import WasteSanitation from './modules/WasteSanitation';
import UrbanPlanning from './modules/UrbanPlanning';
import { Menu, Activity } from 'lucide-react';

const MODULES = [
  { id: 'mobility', name: 'Urban Mobility Hub', component: UrbanMobilityHub },
  { id: 'environment', name: 'Environmental Monitoring', component: EnvironmentalGrid },
  { id: 'infrastructure', name: 'Infrastructure Health', component: InfrastructureHealth },
  { id: 'utilities', name: 'Utility Consumption', component: UtilityConsumption },
  { id: 'safety', name: 'Public Safety Console', component: PublicSafetyConsole },
  { id: 'waste', name: 'Waste & Sanitation', component: WasteSanitation },
  { id: 'planning', name: 'Urban Planning', component: UrbanPlanning }
];

function App() {
  const [activeModule, setActiveModule] = useState('mobility');
  const [sensorData, setSensorData] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    const simulator = new SensorDataSimulator();

    simulator.subscribe((data) => {
      setSensorData(data);
      setLastUpdate(new Date());
      setIsConnected(true);
    });

    simulator.start(5000);

    return () => {
      simulator.stop();
    };
  }, []);

  const ActiveComponent = MODULES.find(m => m.id === activeModule)?.component;

  if (!sensorData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-white text-xl">Initializing City Command Center...</p>
          <p className="text-gray-400 mt-2">Connecting to sensor network</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <Menu className="h-6 w-6 text-foreground" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">City Command Center</h1>
                <p className="text-sm text-muted-foreground">Real-time Operations Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-success' : 'bg-destructive'} animate-pulse`} />
                <span className="text-sm text-muted-foreground">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                Last update: {lastUpdate.toLocaleTimeString()}
              </div>
              <Activity className="h-5 w-5 text-primary animate-pulse-slow" />
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside
          className={`${
            sidebarOpen ? 'w-64' : 'w-0'
          } bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 overflow-hidden`}
        >
          <nav className="p-4 space-y-2">
            {MODULES.map((module) => (
              <button
                key={module.id}
                onClick={() => setActiveModule(module.id)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  activeModule === module.id
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-foreground'
                }`}
              >
                <span className="font-medium">{module.name}</span>
              </button>
            ))}
          </nav>
        </aside>

        <main className={`flex-1 p-6 ${sidebarOpen ? '' : 'ml-0'}`}>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground">
              {MODULES.find(m => m.id === activeModule)?.name}
            </h2>
          </div>
          {ActiveComponent && <ActiveComponent data={sensorData} />}
        </main>
      </div>
    </div>
  );
}

export default App;
