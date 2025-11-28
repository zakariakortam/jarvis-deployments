import { useStore } from '../../store/useStore';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wrench, AlertCircle, CheckCircle, Clock, Package, TrendingUp } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

export default function MaintenancePlanning() {
  const maintenanceData = useStore((state) => state.maintenanceData);
  const machines = useStore((state) => state.machines);
  const [selectedMachine, setSelectedMachine] = useState(null);

  const criticalMaintenance = maintenanceData.filter(m => m.priority === 'high');
  const upcomingMaintenance = maintenanceData.filter(m => m.priority === 'medium');

  const failureRiskData = maintenanceData
    .sort((a, b) => b.failureProbability - a.failureProbability)
    .slice(0, 10)
    .map(m => ({
      name: m.machineName.substring(0, 15),
      risk: m.failureProbability,
      downtime: m.estimatedDowntime
    }));

  const partsData = maintenanceData.flatMap(m =>
    m.criticalParts.map(p => ({
      part: p.name,
      condition: p.condition,
      inStock: p.inStock
    }))
  ).reduce((acc, part) => {
    const existing = acc.find(p => p.part === part.part);
    if (existing) {
      existing.condition = (existing.condition + part.condition) / 2;
      existing.count++;
    } else {
      acc.push({ ...part, count: 1 });
    }
    return acc;
  }, []).sort((a, b) => a.condition - b.condition).slice(0, 8);

  const selected = selectedMachine || (maintenanceData.length > 0 ? maintenanceData[0] : null);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Maintenance Planning Center</h1>
          <p className="text-muted-foreground">Predictive failure analysis and service load optimization</p>
        </div>

        <div className="flex gap-4">
          <motion.div whileHover={{ scale: 1.05 }} className="card p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{criticalMaintenance.length}</p>
                <p className="text-xs text-muted-foreground">Critical</p>
              </div>
            </div>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} className="card p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{upcomingMaintenance.length}</p>
                <p className="text-xs text-muted-foreground">Scheduled</p>
              </div>
            </div>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} className="card p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{maintenanceData.filter(m => m.priority === 'low').length}</p>
                <p className="text-xs text-muted-foreground">On Track</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-4">Predictive Failure Risk Analysis</h2>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={failureRiskData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" angle={-45} textAnchor="end" height={100} />
                <YAxis stroke="hsl(var(--muted-foreground))" label={{ value: 'Failure Probability (%)', angle: -90, position: 'insideLeft' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="risk" name="Failure Risk (%)">
                  {failureRiskData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.risk > 70 ? '#ef4444' : entry.risk > 40 ? '#f59e0b' : '#10b981'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded">
                <p className="text-xs text-muted-foreground mb-1">High Risk</p>
                <p className="text-2xl font-bold text-red-500">{failureRiskData.filter(d => d.risk > 70).length}</p>
              </div>
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded">
                <p className="text-xs text-muted-foreground mb-1">Medium Risk</p>
                <p className="text-2xl font-bold text-yellow-500">{failureRiskData.filter(d => d.risk > 40 && d.risk <= 70).length}</p>
              </div>
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded">
                <p className="text-xs text-muted-foreground mb-1">Low Risk</p>
                <p className="text-2xl font-bold text-green-500">{failureRiskData.filter(d => d.risk <= 40).length}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-bold mb-4">Critical Parts Availability</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={partsData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" label={{ value: 'Condition (%)', position: 'bottom' }} />
                <YAxis type="category" dataKey="part" stroke="hsl(var(--muted-foreground))" width={150} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="condition" name="Condition">
                  {partsData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.inStock ? '#10b981' : '#ef4444'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            <div className="mt-4 flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>In Stock</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span>Out of Stock</span>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-bold mb-4">Maintenance Schedule Overview</h3>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {maintenanceData.slice(0, 15).map((item, idx) => {
                const machine = machines.find(m => m.id === item.machineId);
                const daysUntil = Math.ceil((new Date(item.nextScheduled) - new Date()) / (1000 * 60 * 60 * 24));

                return (
                  <motion.div
                    key={item.machineId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    onClick={() => setSelectedMachine(item)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selected?.machineId === item.machineId
                        ? 'border-primary bg-primary/5'
                        : item.priority === 'high'
                        ? 'border-red-500/30 bg-red-500/5'
                        : item.priority === 'medium'
                        ? 'border-yellow-500/30 bg-yellow-500/5'
                        : 'border-border'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Wrench className={`w-4 h-4 ${
                          item.priority === 'high' ? 'text-red-500' :
                          item.priority === 'medium' ? 'text-yellow-500' :
                          'text-green-500'
                        }`} />
                        <span className="font-medium">{item.machineName}</span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        item.priority === 'high' ? 'bg-red-500 text-white' :
                        item.priority === 'medium' ? 'bg-yellow-500 text-white' :
                        'bg-green-500 text-white'
                      }`}>
                        {item.priority.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Failure Risk</p>
                        <p className="font-bold">{item.failureProbability.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Due In</p>
                        <p className="font-bold">{daysUntil} days</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Downtime</p>
                        <p className="font-bold">{item.estimatedDowntime.toFixed(1)}h</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {selected && (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-6"
              >
                <h3 className="text-lg font-bold mb-4">Maintenance Details</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Machine</p>
                    <p className="font-bold text-lg">{selected.machineName}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Priority</p>
                      <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${
                        selected.priority === 'high' ? 'bg-red-500 text-white' :
                        selected.priority === 'medium' ? 'bg-yellow-500 text-white' :
                        'bg-green-500 text-white'
                      }`}>
                        {selected.priority.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Failure Risk</p>
                      <p className="text-2xl font-bold text-red-500">{selected.failureProbability.toFixed(1)}%</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Last Maintenance</p>
                    <p className="font-medium">{new Date(selected.lastMaintenance).toLocaleDateString()}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Next Scheduled</p>
                    <p className="font-medium">{new Date(selected.nextScheduled).toLocaleDateString()}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Estimated Downtime</p>
                    <p className="text-2xl font-bold">{selected.estimatedDowntime.toFixed(1)} hours</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="card p-6"
              >
                <h3 className="text-lg font-bold mb-4">Critical Parts</h3>
                <div className="space-y-3">
                  {selected.criticalParts.map((part, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="p-3 bg-secondary/20 rounded"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium text-sm">{part.name}</span>
                        </div>
                        {part.inStock ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Condition</span>
                          <span className={part.condition < 30 ? 'text-red-500 font-medium' : ''}>
                            {part.condition.toFixed(0)}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full ${
                              part.condition < 30 ? 'bg-red-500' :
                              part.condition < 60 ? 'bg-yellow-500' :
                              'bg-green-500'
                            }`}
                            initial={{ width: 0 }}
                            animate={{ width: `${part.condition}%` }}
                            transition={{ duration: 1, delay: idx * 0.05 }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {part.inStock ? 'In Stock' : 'Out of Stock - Order Required'}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </>
          )}

          <div className="card p-6">
            <h3 className="text-lg font-bold mb-4">Service Load</h3>
            <div className="space-y-4">
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Emergency</p>
                <p className="text-3xl font-bold">{criticalMaintenance.length}</p>
                <p className="text-xs text-muted-foreground">Immediate attention</p>
              </div>

              <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">This Week</p>
                <p className="text-3xl font-bold">{upcomingMaintenance.length}</p>
                <p className="text-xs text-muted-foreground">Scheduled tasks</p>
              </div>

              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Total Workload</p>
                <p className="text-3xl font-bold">
                  {maintenanceData.reduce((sum, m) => sum + m.estimatedDowntime, 0).toFixed(0)}
                </p>
                <p className="text-xs text-muted-foreground">Hours planned</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-bold mb-4">Recommendations</h3>
            <div className="space-y-3">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-3 bg-red-500/10 border border-red-500/30 rounded"
              >
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Order Critical Parts</p>
                    <p className="text-xs text-muted-foreground">
                      {partsData.filter(p => !p.inStock).length} parts out of stock
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded"
              >
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-yellow-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Schedule Inspections</p>
                    <p className="text-xs text-muted-foreground">
                      {criticalMaintenance.length} high-risk machines
                    </p>
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
                  <TrendingUp className="w-4 h-4 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Optimize Schedule</p>
                    <p className="text-xs text-muted-foreground">
                      Consolidate tasks to reduce downtime
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
