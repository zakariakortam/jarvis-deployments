import { useStore } from '../../store/useStore';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, TrendingUp, DollarSign, Leaf, AlertCircle } from 'lucide-react';
import { AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { dataSimulator } from '../../utils/mockData';

export default function EnergyManagement() {
  const plants = useStore((state) => state.plants);
  const energyData = useStore((state) => state.energyData);
  const [selectedPlant, setSelectedPlant] = useState(plants[0]);
  const [liveConsumption, setLiveConsumption] = useState(0);
  const [peakShavingEnabled, setPeakShavingEnabled] = useState(false);

  const plantEnergy = energyData[selectedPlant.id] || [];

  useEffect(() => {
    const unsubscribe = dataSimulator.subscribe(
      `energy-${selectedPlant.id}`,
      (data) => {
        setLiveConsumption(data.consumption);
      },
      3000
    );

    return () => unsubscribe();
  }, [selectedPlant]);

  const totalConsumption = plantEnergy.reduce((sum, d) => sum + d.consumption, 0);
  const totalCost = plantEnergy.reduce((sum, d) => sum + d.cost, 0);
  const avgRenewable = plantEnergy.reduce((sum, d) => sum + d.renewable, 0) / plantEnergy.length;
  const peakDemand = Math.max(...plantEnergy.map(d => d.demand));

  const forecastData = Array.from({ length: 7 }, (_, i) => ({
    day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
    predicted: 5000 + Math.random() * 3000,
    actual: i < 5 ? 5000 + Math.random() * 3000 : null,
    cost: (5000 + Math.random() * 3000) * 0.12
  }));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Energy Management Suite</h1>
          <p className="text-muted-foreground">Real-time load curves and cost optimization</p>
        </div>

        <div className="flex gap-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="card p-4"
          >
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{liveConsumption.toFixed(0)} kW</p>
                <p className="text-xs text-muted-foreground">Live Load</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="card p-4"
          >
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">${totalCost.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Today's Cost</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {plants.map((plant, idx) => (
          <motion.div
            key={plant.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => setSelectedPlant(plant)}
            className={`card p-4 cursor-pointer transition-all ${
              selectedPlant.id === plant.id ? 'border-2 border-primary' : ''
            }`}
          >
            <h3 className="font-bold mb-2">{plant.name}</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Consumption</span>
                <span>{(energyData[plant.id]?.reduce((s, d) => s + d.consumption, 0) / 1000).toFixed(1)} MWh</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cost</span>
                <span>${(energyData[plant.id]?.reduce((s, d) => s + d.cost, 0)).toFixed(0)}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">24-Hour Load Curve</h2>
              <div className="flex items-center gap-2">
                <label className="text-sm text-muted-foreground">Peak Shaving</label>
                <button
                  onClick={() => setPeakShavingEnabled(!peakShavingEnabled)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    peakShavingEnabled ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <motion.div
                    className="absolute top-1 w-4 h-4 bg-white rounded-full"
                    animate={{ left: peakShavingEnabled ? '28px' : '4px' }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={plantEnergy}>
                <defs>
                  <linearGradient id="colorConsumption" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(value) => new Date(value).getHours() + ':00'}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis stroke="hsl(var(--muted-foreground))" label={{ value: 'kW', angle: -90, position: 'insideLeft' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  labelFormatter={(value) => new Date(value).toLocaleTimeString()}
                />
                <Legend />
                <Area type="monotone" dataKey="consumption" stroke="#3b82f6" fillOpacity={1} fill="url(#colorConsumption)" name="Actual Consumption" />
                {peakShavingEnabled && (
                  <Area type="monotone" dataKey="demand" stroke="#ef4444" fillOpacity={1} fill="url(#colorDemand)" name="Demand Limit" />
                )}
              </AreaChart>
            </ResponsiveContainer>

            {peakShavingEnabled && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg"
              >
                <div className="flex items-start gap-2">
                  <Leaf className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Peak Shaving Active</p>
                    <p className="text-sm text-muted-foreground">
                      Estimated savings: ${(totalCost * 0.15).toFixed(2)} | Load reduced by {((peakDemand - liveConsumption) / peakDemand * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-bold mb-4">Cost Forecast (7 Days)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar dataKey="cost" fill="#10b981" name="Predicted Cost ($)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-bold mb-4">Renewable Energy Mix</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={plantEnergy}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(value) => new Date(value).getHours() + ':00'}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis stroke="hsl(var(--muted-foreground))" label={{ value: '%', angle: -90, position: 'insideLeft' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Line type="monotone" dataKey="renewable" stroke="#10b981" strokeWidth={3} name="Renewable %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="text-lg font-bold mb-4">Energy Metrics</h3>
            <div className="space-y-4">
              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Total Consumption</p>
                <p className="text-3xl font-bold">{(totalConsumption / 1000).toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">MWh (24h)</p>
              </div>

              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Peak Demand</p>
                <p className="text-3xl font-bold">{peakDemand.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">kW</p>
              </div>

              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Renewable Mix</p>
                <p className="text-3xl font-bold">{avgRenewable.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Average</p>
              </div>

              <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Energy Cost</p>
                <p className="text-3xl font-bold">${totalCost.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">24h total</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-bold mb-4">Optimization Opportunities</h3>
            <div className="space-y-3">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded"
              >
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">High Peak Hours</p>
                    <p className="text-xs text-muted-foreground">Shift load to off-peak: save $320/day</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="p-3 bg-green-500/10 border border-green-500/30 rounded"
              >
                <div className="flex items-start gap-2">
                  <Leaf className="w-4 h-4 text-green-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Solar Potential</p>
                    <p className="text-xs text-muted-foreground">Install capacity: reduce cost 25%</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="p-3 bg-blue-500/10 border border-blue-500/30 rounded"
              >
                <div className="flex items-start gap-2">
                  <Zap className="w-4 h-4 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Power Factor</p>
                    <p className="text-xs text-muted-foreground">Improve to 0.95: save $180/month</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="p-3 bg-purple-500/10 border border-purple-500/30 rounded"
              >
                <div className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Equipment Upgrade</p>
                    <p className="text-xs text-muted-foreground">VFD installation: 15% efficiency gain</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-bold mb-4">Rate Structure</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between p-2 bg-secondary/20 rounded">
                <span>Off-Peak (22:00-06:00)</span>
                <span className="font-medium">$0.08/kWh</span>
              </div>
              <div className="flex justify-between p-2 bg-secondary/20 rounded">
                <span>Standard (06:00-17:00)</span>
                <span className="font-medium">$0.12/kWh</span>
              </div>
              <div className="flex justify-between p-2 bg-red-500/20 rounded">
                <span>Peak (17:00-22:00)</span>
                <span className="font-medium text-red-500">$0.18/kWh</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
