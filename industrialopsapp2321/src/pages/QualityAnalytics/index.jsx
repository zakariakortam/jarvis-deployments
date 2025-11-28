import { useStore } from '../../store/useStore';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ClipboardCheck, AlertTriangle, TrendingDown, Package } from 'lucide-react';
import { ScatterChart, Scatter, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function QualityAnalytics() {
  const plants = useStore((state) => state.plants);
  const qualityData = useStore((state) => state.qualityData);
  const [selectedPlant, setSelectedPlant] = useState(plants[0]);

  const plantQuality = qualityData[selectedPlant.id] || [];

  const defectCounts = plantQuality.reduce((acc, d) => {
    if (d.defectType) {
      acc[d.defectType] = (acc[d.defectType] || 0) + 1;
    }
    return acc;
  }, {});

  const defectData = Object.entries(defectCounts).map(([type, count]) => ({
    type,
    count,
    percentage: (count / plantQuality.length * 100).toFixed(2)
  })).sort((a, b) => b.count - a.count);

  const totalDefects = plantQuality.filter(d => d.isDefect).length;
  const defectRate = (totalDefects / plantQuality.length * 100).toFixed(2);

  const mean = 100;
  const stdDev = 2;
  const ucl = mean + 3 * stdDev;
  const lcl = mean - 3 * stdDev;

  const spcData = plantQuality.slice(-50).map((d, idx) => ({
    sample: idx + 1,
    value: d.value,
    ucl,
    lcl,
    mean,
    isDefect: d.isDefect
  }));

  const batchAnalysis = plantQuality.reduce((acc, d) => {
    if (!acc[d.batchId]) {
      acc[d.batchId] = { batchId: d.batchId, total: 0, defects: 0, avgValue: 0, values: [] };
    }
    acc[d.batchId].total++;
    if (d.isDefect) acc[d.batchId].defects++;
    acc[d.batchId].values.push(d.value);
    return acc;
  }, {});

  const batchData = Object.values(batchAnalysis).map(batch => ({
    ...batch,
    avgValue: batch.values.reduce((s, v) => s + v, 0) / batch.values.length,
    defectRate: (batch.defects / batch.total * 100).toFixed(2)
  })).slice(0, 20);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quality & Scrap Analytics Hub</h1>
          <p className="text-muted-foreground">SPC charts, defect clustering, and batch traceability</p>
        </div>

        <div className="flex gap-4">
          <motion.div whileHover={{ scale: 1.05 }} className="card p-4">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{(100 - parseFloat(defectRate)).toFixed(2)}%</p>
                <p className="text-xs text-muted-foreground">Quality Rate</p>
              </div>
            </div>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} className="card p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{totalDefects}</p>
                <p className="text-xs text-muted-foreground">Total Defects</p>
              </div>
            </div>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} className="card p-4">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{plantQuality.length}</p>
                <p className="text-xs text-muted-foreground">Samples</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {plants.map((plant, idx) => {
          const pQuality = qualityData[plant.id] || [];
          const pDefects = pQuality.filter(d => d.isDefect).length;
          const pRate = (pDefects / pQuality.length * 100).toFixed(2);

          return (
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
                  <span className="text-muted-foreground">Defect Rate</span>
                  <span className={parseFloat(pRate) > 5 ? 'text-red-500 font-medium' : 'text-green-500 font-medium'}>
                    {pRate}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Samples</span>
                  <span>{pQuality.length}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-4">Statistical Process Control (SPC) Chart</h2>
            <ResponsiveContainer width="100%" height={400}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="sample" stroke="hsl(var(--muted-foreground))" label={{ value: 'Sample Number', position: 'bottom' }} />
                <YAxis stroke="hsl(var(--muted-foreground))" label={{ value: 'Measurement', angle: -90, position: 'insideLeft' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  cursor={{ strokeDasharray: '3 3' }}
                />
                <ReferenceLine y={ucl} stroke="#ef4444" strokeDasharray="5 5" label={{ value: 'UCL', position: 'right', fill: '#ef4444' }} />
                <ReferenceLine y={mean} stroke="#3b82f6" strokeDasharray="5 5" label={{ value: 'Mean', position: 'right', fill: '#3b82f6' }} />
                <ReferenceLine y={lcl} stroke="#ef4444" strokeDasharray="5 5" label={{ value: 'LCL', position: 'right', fill: '#ef4444' }} />
                <Scatter
                  name="In Control"
                  data={spcData.filter(d => !d.isDefect)}
                  fill="#10b981"
                />
                <Scatter
                  name="Out of Control"
                  data={spcData.filter(d => d.isDefect)}
                  fill="#ef4444"
                />
              </ScatterChart>
            </ResponsiveContainer>

            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded">
                <p className="text-xs text-muted-foreground mb-1">Process Mean</p>
                <p className="text-xl font-bold">{mean.toFixed(2)}</p>
              </div>
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded">
                <p className="text-xs text-muted-foreground mb-1">UCL / LCL</p>
                <p className="text-xl font-bold">{ucl.toFixed(1)} / {lcl.toFixed(1)}</p>
              </div>
              <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded">
                <p className="text-xs text-muted-foreground mb-1">Std Deviation</p>
                <p className="text-xl font-bold">{stdDev.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-bold mb-4">Batch Traceability & Analysis</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={batchData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="batchId" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar dataKey="defects" fill="#ef4444" name="Defects" />
                <Bar dataKey="total" fill="#3b82f6" name="Total Units" />
              </BarChart>
            </ResponsiveContainer>

            <div className="mt-4 max-h-[200px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-card border-b">
                  <tr>
                    <th className="text-left p-2">Batch ID</th>
                    <th className="text-right p-2">Total</th>
                    <th className="text-right p-2">Defects</th>
                    <th className="text-right p-2">Rate</th>
                    <th className="text-right p-2">Avg Value</th>
                  </tr>
                </thead>
                <tbody>
                  {batchData.map((batch, idx) => (
                    <motion.tr
                      key={batch.batchId}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.02 }}
                      className="border-b hover:bg-secondary/20"
                    >
                      <td className="p-2">{batch.batchId}</td>
                      <td className="text-right p-2">{batch.total}</td>
                      <td className="text-right p-2">{batch.defects}</td>
                      <td className={`text-right p-2 font-medium ${
                        parseFloat(batch.defectRate) > 5 ? 'text-red-500' : 'text-green-500'
                      }`}>
                        {batch.defectRate}%
                      </td>
                      <td className="text-right p-2">{batch.avgValue.toFixed(2)}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="text-lg font-bold mb-4">Defect Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={defectData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                <YAxis type="category" dataKey="type" stroke="hsl(var(--muted-foreground))" width={100} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="count" fill="#f97316" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-bold mb-4">Top Offenders</h3>
            <div className="space-y-3">
              {defectData.map((defect, idx) => (
                <motion.div
                  key={defect.type}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-3 bg-secondary/20 rounded"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{defect.type}</span>
                    <span className="text-sm text-red-500">{defect.count}</span>
                  </div>
                  <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-red-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${defect.percentage}%` }}
                      transition={{ duration: 1, delay: idx * 0.1 }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{defect.percentage}% of total defects</p>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-bold mb-4">Quality Metrics</h3>
            <div className="space-y-4">
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <ClipboardCheck className="w-4 h-4 text-green-500" />
                  <p className="text-sm text-muted-foreground">First Pass Yield</p>
                </div>
                <p className="text-3xl font-bold">{(100 - parseFloat(defectRate)).toFixed(2)}%</p>
              </div>

              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingDown className="w-4 h-4 text-red-500" />
                  <p className="text-sm text-muted-foreground">Scrap Rate</p>
                </div>
                <p className="text-3xl font-bold">{defectRate}%</p>
              </div>

              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Package className="w-4 h-4 text-blue-500" />
                  <p className="text-sm text-muted-foreground">Process Capability</p>
                </div>
                <p className="text-3xl font-bold">1.67 Cpk</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-bold mb-4">Control Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/30 rounded">
                <span className="text-sm">In Control</span>
                <span className="font-bold text-green-500">{spcData.filter(d => !d.isDefect).length}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/30 rounded">
                <span className="text-sm">Out of Control</span>
                <span className="font-bold text-red-500">{spcData.filter(d => d.isDefect).length}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-500/10 border border-blue-500/30 rounded">
                <span className="text-sm">Process Sigma</span>
                <span className="font-bold text-blue-500">4.5σ</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
