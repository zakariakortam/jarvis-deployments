import { useMemo } from 'react';
import { Satellite, AlertTriangle, CheckCircle, XCircle, DollarSign, Gauge } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import useSatelliteStore from '../../store/useSatelliteStore';

function StatCard({ icon: Icon, title, value, subtitle, color = 'bg-primary' }) {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <div className="text-3xl font-bold text-foreground mb-1">{value}</div>
      <div className="text-sm font-medium text-foreground mb-1">{title}</div>
      {subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}
    </div>
  );
}

function StatisticsDashboard() {
  const statistics = useSatelliteStore(state => state.getStatistics());

  const statusData = useMemo(() => [
    { name: 'Nominal', value: statistics.nominal, color: '#10b981' },
    { name: 'Warning', value: statistics.warning, color: '#f59e0b' },
    { name: 'Critical', value: statistics.critical, color: '#ef4444' },
    { name: 'Offline', value: statistics.offline, color: '#6b7280' },
  ], [statistics]);

  const typeData = useMemo(() =>
    Object.entries(statistics.byType).map(([type, count]) => ({
      type,
      count,
    })),
    [statistics.byType]
  );

  const missionData = useMemo(() =>
    Object.entries(statistics.byMission).map(([mission, count]) => ({
      mission,
      count,
    })),
    [statistics.byMission]
  );

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-foreground">
            {payload[0].name}: {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Satellite}
          title="Total Satellites"
          value={statistics.total.toLocaleString()}
          subtitle="Active in orbit"
          color="bg-blue-500"
        />
        <StatCard
          icon={CheckCircle}
          title="Nominal Status"
          value={statistics.nominal.toLocaleString()}
          subtitle={`${((statistics.nominal / statistics.total) * 100).toFixed(1)}% of fleet`}
          color="bg-green-500"
        />
        <StatCard
          icon={AlertTriangle}
          title="Warnings"
          value={statistics.warning + statistics.critical}
          subtitle="Requiring attention"
          color="bg-yellow-500"
        />
        <StatCard
          icon={DollarSign}
          title="Total Cost"
          value={`$${(statistics.totalCost / 1000000).toFixed(1)}M`}
          subtitle="Fleet investment"
          color="bg-purple-500"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {statusData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <div>
                  <div className="text-sm font-medium text-foreground">{item.value}</div>
                  <div className="text-xs text-muted-foreground">{item.name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Satellite Types */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Satellites by Type</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={typeData}>
              <XAxis
                dataKey="type"
                stroke="hsl(var(--muted-foreground))"
                tick={{ fontSize: 12 }}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mission Distribution */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Mission Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={missionData} layout="horizontal">
              <XAxis
                type="number"
                stroke="hsl(var(--muted-foreground))"
                tick={{ fontSize: 12 }}
              />
              <YAxis
                dataKey="mission"
                type="category"
                stroke="hsl(var(--muted-foreground))"
                tick={{ fontSize: 12 }}
                width={150}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="#10b981" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Fleet Health */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Fleet Health Metrics</h3>
          <div className="space-y-6">
            {/* Overall Health */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-foreground">Overall Health</span>
                <span className="text-sm font-bold text-foreground">
                  {((statistics.nominal / statistics.total) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
                <div
                  className="h-full bg-green-500 transition-all duration-500"
                  style={{ width: `${(statistics.nominal / statistics.total) * 100}%` }}
                />
              </div>
            </div>

            {/* Average Fuel */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-foreground">Average Fuel</span>
                <span className="text-sm font-bold text-foreground">
                  {statistics.averageFuel.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
                <div
                  className="h-full bg-purple-500 transition-all duration-500"
                  style={{ width: `${statistics.averageFuel}%` }}
                />
              </div>
            </div>

            {/* Critical Alerts */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">{statistics.nominal}</div>
                <div className="text-xs text-muted-foreground">Nominal</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-500">{statistics.warning}</div>
                <div className="text-xs text-muted-foreground">Warning</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-500">{statistics.critical}</div>
                <div className="text-xs text-muted-foreground">Critical</div>
              </div>
            </div>

            {/* Operational Cost */}
            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">Daily Operational Cost</div>
                  <div className="text-2xl font-bold text-foreground">
                    ${((statistics.totalCost * 0.01) / 1000).toFixed(0)}K
                  </div>
                </div>
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StatisticsDashboard;
