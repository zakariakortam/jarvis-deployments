import { useParams } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Thermometer, Zap, Gauge, TrendingUp, AlertCircle } from 'lucide-react';
import { dataSimulator } from '../../utils/mockData';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function PlantDigitalTwin() {
  const { plantId } = useParams();
  const plants = useStore((state) => state.plants);
  const getMachinesByPlant = useStore((state) => state.getMachinesByPlant);
  const [machines, setMachines] = useState([]);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [machineData, setMachineData] = useState({});
  const [historicalData, setHistoricalData] = useState([]);

  const plant = plants.find(p => p.id === plantId);

  useEffect(() => {
    const plantMachines = getMachinesByPlant(plantId);
    setMachines(plantMachines);
    if (plantMachines.length > 0 && !selectedMachine) {
      setSelectedMachine(plantMachines[0]);
    }
  }, [plantId, getMachinesByPlant]);

  useEffect(() => {
    if (!selectedMachine) return;

    const history = Array.from({ length: 20 }, (_, i) => ({
      time: new Date(Date.now() - (19 - i) * 3000).toLocaleTimeString(),
      temperature: 45 + Math.random() * 40,
      vibration: Math.random() * 10,
      power: 50 + Math.random() * 200,
      efficiency: 65 + Math.random() * 30
    }));
    setHistoricalData(history);

    const unsubscribe = dataSimulator.subscribe(
      `machine-${selectedMachine.id}`,
      (data) => {
        setMachineData(prev => ({ ...prev, [selectedMachine.id]: data }));
        setHistoricalData(prev => {
          const newData = [...prev.slice(1), {
            time: new Date().toLocaleTimeString(),
            ...data
          }];
          return newData;
        });
      },
      1000
    );

    return () => unsubscribe();
  }, [selectedMachine]);

  if (!plant) {
    return (
      <div className="p-6">
        <div className="card p-8 text-center">
          <p className="text-muted-foreground">Plant not found</p>
        </div>
      </div>
    );
  }

  const liveData = machineData[selectedMachine?.id] || selectedMachine || {};

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{plant.name} - Digital Twin</h1>
          <p className="text-muted-foreground">{plant.region} | {plant.type} Facility</p>
        </div>

        <div className="flex gap-4">
          <div className="card p-3">
            <p className="text-xs text-muted-foreground">Active Machines</p>
            <p className="text-2xl font-bold">{machines.filter(m => m.status === 'operational').length}/{machines.length}</p>
          </div>
          <div className="card p-3">
            <p className="text-xs text-muted-foreground">Avg Efficiency</p>
            <p className="text-2xl font-bold">
              {(machines.reduce((sum, m) => sum + m.efficiency, 0) / machines.length).toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6">
          <h2 className="text-xl font-bold mb-4">Machine Room Layout</h2>
          <div className="relative bg-secondary/10 rounded-lg border-2 border-dashed border-border overflow-hidden" style={{ height: '600px' }}>
            <svg className="w-full h-full" viewBox="0 0 800 600">
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              <rect x="0" y="0" width="800" height="600" fill="hsl(var(--secondary))" fillOpacity="0.05" />

              <line x1="0" y1="150" x2="800" y2="150" stroke="hsl(var(--border))" strokeWidth="1" strokeDasharray="5,5" />
              <line x1="0" y1="300" x2="800" y2="300" stroke="hsl(var(--border))" strokeWidth="1" strokeDasharray="5,5" />
              <line x1="0" y1="450" x2="800" y2="450" stroke="hsl(var(--border))" strokeWidth="1" strokeDasharray="5,5" />

              <line x1="200" y1="0" x2="200" y2="600" stroke="hsl(var(--border))" strokeWidth="1" strokeDasharray="5,5" />
              <line x1="400" y1="0" x2="400" y2="600" stroke="hsl(var(--border))" strokeWidth="1" strokeDasharray="5,5" />
              <line x1="600" y1="0" x2="600" y2="600" stroke="hsl(var(--border))" strokeWidth="1" strokeDasharray="5,5" />

              {machines.map((machine, idx) => {
                const isSelected = selectedMachine?.id === machine.id;
                const data = machineData[machine.id] || machine;

                return (
                  <g key={machine.id}>
                    <motion.rect
                      x={machine.x}
                      y={machine.y}
                      width="60"
                      height="60"
                      rx="4"
                      className={`cursor-pointer ${
                        data.status === 'critical' ? 'fill-red-500/20 stroke-red-500' :
                        data.status === 'warning' ? 'fill-yellow-500/20 stroke-yellow-500' :
                        'fill-green-500/20 stroke-green-500'
                      }`}
                      strokeWidth={isSelected ? "3" : "2"}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: idx * 0.02 }}
                      onClick={() => setSelectedMachine(machine)}
                      filter={isSelected ? "url(#glow)" : "none"}
                    />

                    <motion.circle
                      cx={machine.x + 30}
                      cy={machine.y + 30}
                      r="20"
                      className={
                        data.status === 'critical' ? 'fill-red-500' :
                        data.status === 'warning' ? 'fill-yellow-500' :
                        'fill-green-500'
                      }
                      fillOpacity="0.3"
                      initial={{ scale: 0 }}
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{
                        delay: idx * 0.02,
                        repeat: Infinity,
                        duration: 2,
                        ease: "easeInOut"
                      }}
                    />

                    <text
                      x={machine.x + 30}
                      y={machine.y + 35}
                      className="text-xs font-bold fill-foreground"
                      textAnchor="middle"
                    >
                      {machine.category.split(' ')[0]}
                    </text>

                    {(data.status === 'critical' || data.status === 'warning') && (
                      <motion.circle
                        cx={machine.x + 55}
                        cy={machine.y + 5}
                        r="5"
                        className={data.status === 'critical' ? 'fill-red-500' : 'fill-yellow-500'}
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                      />
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="mt-4 grid grid-cols-4 gap-2">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Operational</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span>Warning</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>Critical</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 bg-gray-500 rounded"></div>
              <span>Offline</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {selectedMachine && (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-6"
              >
                <h3 className="text-lg font-bold mb-4">{selectedMachine.name}</h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-secondary/20 rounded">
                    <div className="flex items-center gap-2">
                      <Thermometer className="w-5 h-5 text-orange-500" />
                      <span className="text-sm">Temperature</span>
                    </div>
                    <span className="font-bold">{liveData.temperature?.toFixed(1) || '0.0'}°C</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-secondary/20 rounded">
                    <div className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-blue-500" />
                      <span className="text-sm">Vibration</span>
                    </div>
                    <span className="font-bold">{liveData.vibration?.toFixed(2) || '0.00'} mm/s</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-secondary/20 rounded">
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-yellow-500" />
                      <span className="text-sm">Power</span>
                    </div>
                    <span className="font-bold">{liveData.power?.toFixed(0) || '0'} kW</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-secondary/20 rounded">
                    <div className="flex items-center gap-2">
                      <Gauge className="w-5 h-5 text-purple-500" />
                      <span className="text-sm">RPM</span>
                    </div>
                    <span className="font-bold">{selectedMachine.rpm?.toFixed(0) || '0'}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-secondary/20 rounded">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-500" />
                      <span className="text-sm">Efficiency</span>
                    </div>
                    <span className="font-bold">{liveData.efficiency?.toFixed(1) || '0.0'}%</span>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-primary/10 border border-primary/30 rounded">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Status: {liveData.status || selectedMachine.status}</p>
                      <p className="text-xs text-muted-foreground">
                        Cycle Time: {selectedMachine.cycleTime?.toFixed(1)}s
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="card p-6"
              >
                <h3 className="text-lg font-bold mb-4">Temperature Trend</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={historicalData}>
                    <defs>
                      <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="temperature"
                      stroke="#f97316"
                      fillOpacity={1}
                      fill="url(#colorTemp)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>
            </>
          )}
        </div>
      </div>

      <div className="card p-6">
        <h3 className="text-lg font-bold mb-4">Machine List</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {machines.map((machine, idx) => {
            const data = machineData[machine.id] || machine;
            return (
              <motion.div
                key={machine.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.03 }}
                onClick={() => setSelectedMachine(machine)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedMachine?.id === machine.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{machine.name}</span>
                  <span className={`status-indicator ${
                    data.status === 'critical' ? 'status-critical' :
                    data.status === 'warning' ? 'status-warning' :
                    'status-operational'
                  }`}></span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{machine.category}</p>
                <div className="flex justify-between text-xs">
                  <span>Eff: {data.efficiency?.toFixed(0) || machine.efficiency.toFixed(0)}%</span>
                  <span>Temp: {data.temperature?.toFixed(0) || machine.temperature.toFixed(0)}°C</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
