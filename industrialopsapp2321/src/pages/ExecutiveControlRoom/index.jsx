import { useStore } from '../../store/useStore';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, Users, Factory, Zap, Package, Target } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function ExecutiveControlRoom() {
  const kpiData = useStore((state) => state.kpiData);
  const plants = useStore((state) => state.plants);
  const machines = useStore((state) => state.machines);
  const alerts = useStore((state) => state.alerts);

  const productionByRegion = kpiData.byRegion.map(r => ({
    name: r.region.split(' ')[0],
    throughput: r.throughput,
    cost: r.energyCost
  }));

  const statusDistribution = [
    { name: 'Operational', value: machines.filter(m => m.status === 'operational').length },
    { name: 'Warning', value: machines.filter(m => m.status === 'warning').length },
    { name: 'Critical', value: machines.filter(m => m.status === 'critical').length }
  ];

  const performanceTrend = kpiData.trends.daily.slice(-14);

  const costBreakdown = [
    { category: 'Labor', amount: 450000, percentage: 35 },
    { category: 'Materials', amount: 520000, percentage: 40 },
    { category: 'Energy', amount: 195000, percentage: 15 },
    { category: 'Maintenance', amount: 130000, percentage: 10 }
  ];

  const totalProduction = kpiData.byRegion.reduce((sum, r) => sum + r.throughput, 0);
  const totalCost = costBreakdown.reduce((sum, c) => sum + c.amount, 0);
  const avgOEE = kpiData.overall.oee;

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-background to-secondary/20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Executive Control Room</h1>
          <p className="text-muted-foreground">Real-time enterprise performance overview</p>
        </div>

        <div className="flex gap-2">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="card p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/30"
          >
            <div className="flex items-center gap-2">
              <Factory className="w-6 h-6 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{plants.length}</p>
                <p className="text-xs text-muted-foreground">Facilities</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="card p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/30"
          >
            <div className="flex items-center gap-2">
              <Package className="w-6 h-6 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{totalProduction.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Units/Day</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="card p-4 bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/30"
          >
            <div className="flex items-center gap-2">
              <Target className="w-6 h-6 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{avgOEE.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">OEE</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Overall Equipment Effectiveness', value: kpiData.overall.oee, unit: '%', icon: Target, color: 'blue', trend: 2.3 },
          { label: 'Production Throughput', value: totalProduction, unit: ' u/d', icon: TrendingUp, color: 'green', trend: 5.7 },
          { label: 'Operating Cost', value: totalCost / 1000, unit: 'K', icon: DollarSign, color: 'red', trend: -1.2 },
          { label: 'Energy Efficiency', value: kpiData.overall.energyEfficiency, unit: '%', icon: Zap, color: 'yellow', trend: 3.1 },
          { label: 'Quality Rate', value: kpiData.overall.quality, unit: '%', icon: Package, color: 'purple', trend: 1.5 },
          { label: 'Labor Productivity', value: kpiData.overall.laborProductivity, unit: '%', icon: Users, color: 'pink', trend: 4.2 },
          { label: 'Asset Availability', value: kpiData.overall.availability, unit: '%', icon: Factory, color: 'indigo', trend: 2.8 },
          { label: 'Cost per Unit', value: kpiData.overall.costPerUnit, unit: '$', icon: DollarSign, color: 'orange', trend: -2.1 }
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className={`card p-6 bg-gradient-to-br from-${kpi.color}-500/10 to-${kpi.color}-500/5 border-${kpi.color}-500/30`}
            >
              <div className="flex items-start justify-between mb-3">
                <Icon className={`w-8 h-8 text-${kpi.color}-500`} />
                <div className={`flex items-center gap-1 text-xs ${kpi.trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {kpi.trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  <span>{Math.abs(kpi.trend)}%</span>
                </div>
              </div>
              <p className="text-3xl font-bold mb-1">
                {kpi.unit === '$' ? '$' : ''}{kpi.value.toFixed(kpi.unit === '$' ? 2 : 1)}{kpi.unit !== '$' ? kpi.unit : ''}
              </p>
              <p className="text-xs text-muted-foreground">{kpi.label}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-4">Performance Trends (14 Days)</h2>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={performanceTrend}>
                <defs>
                  <linearGradient id="colorOEE" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorThroughput" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorQuality" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" tickFormatter={(date) => date.split('-')[2]} />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Area type="monotone" dataKey="oee" stroke="#3b82f6" fillOpacity={1} fill="url(#colorOEE)" name="OEE (%)" />
                <Area type="monotone" dataKey="quality" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorQuality)" name="Quality (%)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="text-lg font-bold mb-4">Production by Region</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={productionByRegion}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="throughput" fill="#10b981" name="Units" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-bold mb-4">Machine Status</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-bold mb-4">Cost Breakdown</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={costBreakdown} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                <YAxis type="category" dataKey="category" stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value) => `$${value.toLocaleString()}`}
                />
                <Bar dataKey="amount" name="Monthly Cost">
                  {costBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="text-lg font-bold mb-4">Regional Performance</h3>
            <div className="space-y-4">
              {kpiData.byRegion.map((region, idx) => (
                <motion.div
                  key={region.region}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="p-4 bg-secondary/20 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold">{region.region}</span>
                    <span className={`text-sm ${region.oee > 75 ? 'text-green-500' : 'text-yellow-500'}`}>
                      {region.oee.toFixed(1)}% OEE
                    </span>
                  </div>
                  <div className="w-full h-2 bg-secondary rounded-full overflow-hidden mb-2">
                    <motion.div
                      className="h-full bg-gradient-to-r from-blue-500 to-green-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${region.oee}%` }}
                      transition={{ duration: 1, delay: idx * 0.05 }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">Throughput</p>
                      <p className="font-medium">{region.throughput.toFixed(0)} u/d</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Defects</p>
                      <p className="font-medium">{region.defectRate.toFixed(2)}%</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-bold mb-4">Key Insights</h3>
            <div className="space-y-3">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-green-500/10 border border-green-500/30 rounded"
              >
                <div className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-green-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Production Ahead</p>
                    <p className="text-xs text-muted-foreground">5.7% above target this month</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-3 bg-blue-500/10 border border-blue-500/30 rounded"
              >
                <div className="flex items-start gap-2">
                  <Target className="w-4 h-4 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Quality Improved</p>
                    <p className="text-xs text-muted-foreground">Defect rate down 1.5% vs last quarter</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-3 bg-purple-500/10 border border-purple-500/30 rounded"
              >
                <div className="flex items-start gap-2">
                  <Zap className="w-4 h-4 text-purple-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Energy Optimized</p>
                    <p className="text-xs text-muted-foreground">$45K saved through peak shaving</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded"
              >
                <div className="flex items-start gap-2">
                  <DollarSign className="w-4 h-4 text-yellow-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Cost Reduction</p>
                    <p className="text-xs text-muted-foreground">Operating cost down 2.1% per unit</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-bold mb-4">Alert Summary</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/30 rounded">
                <span className="text-sm">Critical</span>
                <span className="font-bold text-red-500">{alerts.filter(a => a.type === 'critical' && !a.acknowledged).length}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-500/10 border border-yellow-500/30 rounded">
                <span className="text-sm">Warnings</span>
                <span className="font-bold text-yellow-500">{alerts.filter(a => a.type === 'warning' && !a.acknowledged).length}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-500/10 border border-blue-500/30 rounded">
                <span className="text-sm">Info</span>
                <span className="font-bold text-blue-500">{alerts.filter(a => a.type === 'info' && !a.acknowledged).length}</span>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-bold mb-4">Targets vs Actuals</h3>
            <div className="space-y-4">
              {[
                { metric: 'OEE', target: 85, actual: avgOEE },
                { metric: 'Quality', target: 98, actual: kpiData.overall.quality },
                { metric: 'Availability', target: 90, actual: kpiData.overall.availability },
                { metric: 'Performance', target: 85, actual: kpiData.overall.performance }
              ].map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{item.metric}</span>
                    <span className={item.actual >= item.target ? 'text-green-500' : 'text-yellow-500'}>
                      {item.actual.toFixed(1)}% / {item.target}%
                    </span>
                  </div>
                  <div className="relative w-full h-2 bg-secondary rounded-full overflow-hidden">
                    <motion.div
                      className={item.actual >= item.target ? 'bg-green-500' : 'bg-yellow-500'}
                      initial={{ width: 0 }}
                      animate={{ width: `${(item.actual / item.target) * 100}%` }}
                      transition={{ duration: 1, delay: idx * 0.1 }}
                      style={{ height: '100%' }}
                    />
                    <div
                      className="absolute top-0 h-full w-0.5 bg-foreground"
                      style={{ left: '100%' }}
                    />
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
