import { Trash2, TrendingUp, MapPin, Clock } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatDistanceToNow } from 'date-fns';

export default function WasteSanitation({ data }) {
  const { waste, routes } = data;

  const urgentBins = waste.filter(b => b.status === 'Urgent').length;
  const avgFillLevel = Math.round(waste.reduce((sum, b) => sum + b.fillLevel, 0) / waste.length);
  const activeRoutes = routes.filter(r => r.status === 'In Progress').length;
  const efficiency = Math.round(routes.reduce((sum, r) => sum + r.efficiency, 0) / routes.length);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'];

  const binsByType = waste.reduce((acc, bin) => {
    acc[bin.type] = (acc[bin.type] || 0) + 1;
    return acc;
  }, {});

  const typeData = Object.entries(binsByType).map(([name, value]) => ({
    name, value
  }));

  const fillLevelsByZone = Object.values(
    waste.reduce((acc, bin) => {
      if (!acc[bin.zone]) {
        acc[bin.zone] = { zone: bin.zone, avgFill: 0, count: 0, urgent: 0 };
      }
      acc[bin.zone].avgFill += bin.fillLevel;
      acc[bin.zone].count += 1;
      if (bin.status === 'Urgent') acc[bin.zone].urgent += 1;
      return acc;
    }, {})
  ).map(z => ({
    zone: z.zone,
    avgFill: Math.round(z.avgFill / z.count),
    urgent: z.urgent
  }));

  const getStatusColor = (status) => {
    if (status === 'Urgent') return 'text-destructive bg-destructive/10';
    if (status === 'Scheduled') return 'text-warning bg-warning/10';
    return 'text-success bg-success/10';
  };

  const getRouteStatusColor = (status) => {
    if (status === 'In Progress') return 'text-primary bg-primary/10';
    if (status === 'Delayed') return 'text-destructive bg-destructive/10';
    if (status === 'Completed') return 'text-success bg-success/10';
    return 'text-muted-foreground bg-muted';
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Urgent Bins</p>
              <p className="text-3xl font-bold text-foreground">{urgentBins}</p>
            </div>
            <Trash2 className="h-8 w-8 text-destructive" />
          </div>
          <p className="text-xs text-destructive mt-2">Require immediate pickup</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg Fill Level</p>
              <p className="text-3xl font-bold text-foreground">{avgFillLevel}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-warning" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">City-wide average</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Routes</p>
              <p className="text-3xl font-bold text-foreground">{activeRoutes}</p>
            </div>
            <MapPin className="h-8 w-8 text-primary" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">Collection in progress</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Efficiency</p>
              <p className="text-3xl font-bold text-foreground">{efficiency}%</p>
            </div>
            <Clock className="h-8 w-8 text-success" />
          </div>
          <p className="text-xs text-success mt-2">Above target</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Bins by Type</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={typeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {typeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Fill Levels by Zone</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={fillLevelsByZone}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="zone" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend />
              <Bar dataKey="avgFill" fill="#3b82f6" name="Avg Fill %" />
              <Bar dataKey="urgent" fill="#ef4444" name="Urgent Bins" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Collection Routes Status</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {routes.map(route => (
            <div key={route.id} className="p-4 bg-secondary rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-semibold text-foreground">{route.id}</p>
                  <p className="text-sm text-muted-foreground">{route.zone} • {route.vehicleId}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${getRouteStatusColor(route.status)}`}>
                  {route.status}
                </div>
              </div>

              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-muted-foreground">Progress</span>
                  <span className="text-sm font-medium text-foreground">{Math.round(route.progress)}%</span>
                </div>
                <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-primary rounded-full h-2"
                    style={{ width: `${route.progress}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="p-2 bg-white dark:bg-gray-700 rounded">
                  <p className="text-muted-foreground">Collected</p>
                  <p className="font-medium text-foreground">{route.binsCollected}</p>
                </div>
                <div className="p-2 bg-white dark:bg-gray-700 rounded">
                  <p className="text-muted-foreground">Remaining</p>
                  <p className="font-medium text-foreground">{route.binsRemaining}</p>
                </div>
                <div className="p-2 bg-white dark:bg-gray-700 rounded">
                  <p className="text-muted-foreground">Efficiency</p>
                  <p className="font-medium text-success">{Math.round(route.efficiency)}%</p>
                </div>
              </div>

              <div className="mt-2 text-xs text-muted-foreground">
                Est. completion: {formatDistanceToNow(new Date(route.estimatedCompletion), { addSuffix: true })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Bin Status Overview</h3>
        <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-thin">
          {waste.filter(b => b.status !== 'Normal').slice(0, 20).map(bin => (
            <div key={bin.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm text-foreground">{bin.id}</p>
                  <span className="text-xs text-muted-foreground">{bin.type}</span>
                </div>
                <p className="text-xs text-muted-foreground">{bin.zone}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">{Math.round(bin.fillLevel)}%</p>
                  <p className="text-xs text-muted-foreground">Fill level</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(bin.status)}`}>
                  {bin.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
