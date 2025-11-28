import { LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Landmark, Activity, AlertTriangle, CheckCircle } from 'lucide-react';

export default function InfrastructureHealth({ data }) {
  const { infrastructure } = data;

  const avgIntegrity = Math.round(infrastructure.reduce((sum, b) => sum + b.health.structuralIntegrity, 0) / infrastructure.length);
  const totalTraffic = infrastructure.reduce((sum, b) => sum + b.traffic.vehicleCount, 0);
  const alertCount = infrastructure.filter(b => b.alerts.length > 0).length;
  const goodStatus = infrastructure.filter(b => b.status === 'Good').length;

  const healthMetrics = infrastructure.map(bridge => ({
    name: bridge.name,
    integrity: Math.round(bridge.health.structuralIntegrity),
    vibration: bridge.health.vibration.toFixed(1),
    stress: Math.round(bridge.health.stress),
    corrosion: Math.round(bridge.health.corrosion),
    strain: Math.round(bridge.health.strain)
  }));

  const getStatusColor = (status) => {
    if (status === 'Good') return 'text-success bg-success/10';
    if (status === 'Fair') return 'text-warning bg-warning/10';
    return 'text-destructive bg-destructive/10';
  };

  const getIntegrityColor = (value) => {
    if (value >= 85) return 'text-success';
    if (value >= 70) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg Structural Integrity</p>
              <p className="text-3xl font-bold text-foreground">{avgIntegrity}%</p>
            </div>
            <Landmark className="h-8 w-8 text-primary" />
          </div>
          <p className={`text-xs mt-2 ${getIntegrityColor(avgIntegrity)}`}>
            {avgIntegrity >= 85 ? 'Excellent' : avgIntegrity >= 70 ? 'Good' : 'Needs Attention'}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Traffic</p>
              <p className="text-3xl font-bold text-foreground">{totalTraffic.toLocaleString()}</p>
            </div>
            <Activity className="h-8 w-8 text-success" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">Vehicles today</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Alerts</p>
              <p className="text-3xl font-bold text-foreground">{alertCount}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <p className="text-xs text-destructive mt-2">Require inspection</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Good Status</p>
              <p className="text-3xl font-bold text-foreground">{goodStatus}/{infrastructure.length}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-success" />
          </div>
          <p className="text-xs text-success mt-2">
            {Math.round((goodStatus / infrastructure.length) * 100)}% compliance
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Structural Integrity Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={healthMetrics}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend />
              <Line type="monotone" dataKey="integrity" stroke="#10b981" strokeWidth={2} name="Structural Integrity %" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Health Metrics Radar</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={healthMetrics.slice(0, 1).map(h => [
              { metric: 'Integrity', value: h.integrity },
              { metric: 'Stress', value: 100 - h.stress },
              { metric: 'Corrosion', value: 100 - h.corrosion },
              { metric: 'Strain', value: 100 - h.strain },
              { metric: 'Vibration', value: 100 - (h.vibration * 20) }
            ])[0]}>
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar name="Health Score" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Bridge Status Overview</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {infrastructure.map(bridge => (
            <div key={bridge.id} className="p-4 bg-secondary rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-semibold text-foreground">{bridge.name}</p>
                  <p className="text-sm text-muted-foreground">{bridge.type} • Built {bridge.yearBuilt}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(bridge.status)}`}>
                  {bridge.status}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-3">
                <div>
                  <p className="text-xs text-muted-foreground">Integrity</p>
                  <p className={`text-lg font-bold ${getIntegrityColor(bridge.health.structuralIntegrity)}`}>
                    {Math.round(bridge.health.structuralIntegrity)}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Traffic</p>
                  <p className="text-lg font-bold text-foreground">
                    {bridge.traffic.vehicleCount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Heavy Vehicles</p>
                  <p className="text-lg font-bold text-foreground">
                    {bridge.traffic.heavyVehicles}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                <div className="flex justify-between p-2 bg-white dark:bg-gray-700 rounded">
                  <span className="text-muted-foreground">Vibration:</span>
                  <span className="font-medium text-foreground">{bridge.health.vibration.toFixed(2)} Hz</span>
                </div>
                <div className="flex justify-between p-2 bg-white dark:bg-gray-700 rounded">
                  <span className="text-muted-foreground">Stress:</span>
                  <span className="font-medium text-foreground">{Math.round(bridge.health.stress)}%</span>
                </div>
                <div className="flex justify-between p-2 bg-white dark:bg-gray-700 rounded">
                  <span className="text-muted-foreground">Corrosion:</span>
                  <span className="font-medium text-foreground">{Math.round(bridge.health.corrosion)}%</span>
                </div>
                <div className="flex justify-between p-2 bg-white dark:bg-gray-700 rounded">
                  <span className="text-muted-foreground">Strain:</span>
                  <span className="font-medium text-foreground">{Math.round(bridge.health.strain)}%</span>
                </div>
              </div>

              {bridge.alerts.length > 0 && (
                <div className="mb-3 p-2 bg-destructive/10 border border-destructive rounded">
                  <p className="text-xs font-medium text-destructive flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    {bridge.alerts.join(', ')}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Last inspection: {new Date(bridge.lastInspection).toLocaleDateString()}</span>
                <span>Next: {new Date(bridge.nextInspection).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
