import { useStore } from '../../store/useStore';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, TrendingUp, Clock, AlertTriangle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { dataSimulator } from '../../utils/mockData';

export default function ProcessLineSimulator() {
  const processLines = useStore((state) => state.processLines);
  const plants = useStore((state) => state.plants);
  const [selectedLine, setSelectedLine] = useState(processLines[0]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [liveData, setLiveData] = useState({});
  const [timelineData, setTimelineData] = useState([]);

  useEffect(() => {
    if (!selectedLine) return;

    const initialTimeline = Array.from({ length: 24 }, (_, i) => ({
      hour: `${i}:00`,
      throughput: 50 + Math.random() * 70,
      target: 100,
      downtime: Math.random() * 20,
      temperature: 60 + Math.random() * 25,
      efficiency: 70 + Math.random() * 25
    }));
    setTimelineData(initialTimeline);

    const unsubscribe = dataSimulator.subscribe(
      `line-${selectedLine.id}`,
      (data) => {
        setLiveData(data);
      },
      2000
    );

    return () => unsubscribe();
  }, [selectedLine]);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentTime(prev => (prev + 1) % 100);
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying]);

  if (!selectedLine) return null;

  const plant = plants.find(p => p.id === selectedLine.plantId);
  const currentThroughput = liveData.throughput || selectedLine.throughput;
  const currentEfficiency = liveData.efficiency || selectedLine.efficiency;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Process Line Simulator</h1>
          <p className="text-muted-foreground">Timeline playback and real-time monitoring</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="btn btn-primary px-4 py-2"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setCurrentTime(0)}
            className="btn btn-secondary px-4 py-2"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {processLines.slice(0, 8).map((line, idx) => {
          const linePlant = plants.find(p => p.id === line.plantId);
          return (
            <motion.div
              key={line.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => setSelectedLine(line)}
              className={`card p-4 cursor-pointer transition-all ${
                selectedLine.id === line.id ? 'border-2 border-primary' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold">{line.name}</h3>
                <span className={`status-indicator ${
                  line.status === 'running' ? 'status-operational' : 'status-warning'
                }`}></span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">{linePlant?.name}</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Throughput</span>
                  <span className="font-medium">{line.throughput.toFixed(0)} u/h</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Efficiency</span>
                  <span className="font-medium">{line.efficiency.toFixed(1)}%</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{selectedLine.name} - Process Flow</h2>
              <span className="text-sm text-muted-foreground">{plant?.name}</span>
            </div>

            <div className="relative mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Timeline Position</span>
                <span className="text-sm font-medium">{currentTime}%</span>
              </div>
              <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary"
                  style={{ width: `${currentTime}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
            </div>

            <div className="space-y-4">
              {selectedLine.stages.map((stage, idx) => {
                const isActive = ((currentTime / 100) * selectedLine.stages.length) >= idx;
                const progress = Math.min(100, Math.max(0, ((currentTime / 100) * selectedLine.stages.length - idx) * 100));

                return (
                  <motion.div
                    key={stage.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="relative"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                        isActive ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                      }`}>
                        {idx + 1}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-bold">{stage.name}</h3>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{stage.duration.toFixed(1)}s</span>
                          </div>
                        </div>

                        <div className="relative w-full h-3 bg-secondary rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full ${isActive ? 'bg-green-500' : 'bg-gray-400'}`}
                            initial={{ width: 0 }}
                            animate={{ width: isActive ? `${progress}%` : '0%' }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                      </div>
                    </div>

                    {idx < selectedLine.stages.length - 1 && (
                      <div className="ml-6 h-6 w-0.5 bg-border"></div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-bold mb-4">24-Hour Throughput Analysis</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar dataKey="throughput" fill="#3b82f6" name="Actual" />
                <Bar dataKey="target" fill="#10b981" name="Target" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-bold mb-4">Temperature & Efficiency Trends</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="temperature" stroke="#f97316" name="Temperature (°C)" strokeWidth={2} />
                <Line type="monotone" dataKey="efficiency" stroke="#8b5cf6" name="Efficiency (%)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="text-lg font-bold mb-4">Live Metrics</h3>
            <div className="space-y-4">
              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Throughput</span>
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                </div>
                <p className="text-3xl font-bold">{currentThroughput.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">units/hour</p>
              </div>

              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Efficiency</span>
                  <TrendingUp className="w-4 h-4 text-green-500" />
                </div>
                <p className="text-3xl font-bold">{currentEfficiency.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">vs target: {selectedLine.targetThroughput}</p>
              </div>

              <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Temperature</span>
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                </div>
                <p className="text-3xl font-bold">{(liveData.temperature || selectedLine.temperature).toFixed(1)}°C</p>
                <p className="text-xs text-muted-foreground">optimal: 60-80°C</p>
              </div>

              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Downtime</span>
                  <Clock className="w-4 h-4 text-red-500" />
                </div>
                <p className="text-3xl font-bold">{selectedLine.downtime.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">minutes today</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-bold mb-4">Cycle Time Analysis</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Current</span>
                <span className="font-bold">{selectedLine.cycleTime.toFixed(1)}s</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Average</span>
                <span className="font-bold">{(selectedLine.cycleTime * 1.05).toFixed(1)}s</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Best</span>
                <span className="font-bold text-green-500">{(selectedLine.cycleTime * 0.85).toFixed(1)}s</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Target</span>
                <span className="font-bold text-blue-500">{(selectedLine.cycleTime * 0.9).toFixed(1)}s</span>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-bold mb-4">Stage Performance</h3>
            <div className="space-y-3">
              {selectedLine.stages.map((stage, idx) => (
                <div key={idx} className="border-b pb-2 last:border-b-0">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">{stage.name}</span>
                    <span className="text-xs text-muted-foreground">{stage.duration.toFixed(1)}s</span>
                  </div>
                  <div className="w-full h-2 bg-secondary rounded-full">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${(stage.duration / selectedLine.cycleTime) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
