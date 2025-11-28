import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Car, TrendingUp, Clock, AlertTriangle } from 'lucide-react';

export default function UrbanMobilityHub({ data }) {
  const { traffic, transit } = data;

  const congestionByZone = traffic.reduce((acc, item) => {
    const existing = acc.find(x => x.zone === item.zone);
    if (existing) {
      existing.count += 1;
      existing.avgCongestion += item.congestionLevel;
      existing.avgSpeed += item.averageSpeed;
      existing.vehicles += item.vehicleCount;
    } else {
      acc.push({
        zone: item.zone,
        count: 1,
        avgCongestion: item.congestionLevel,
        avgSpeed: item.averageSpeed,
        vehicles: item.vehicleCount
      });
    }
    return acc;
  }, []).map(item => ({
    zone: item.zone,
    congestion: Math.round(item.avgCongestion / item.count),
    speed: Math.round(item.avgSpeed / item.count),
    vehicles: item.vehicles
  }));

  const transitPerformance = transit.map(t => ({
    name: t.name,
    occupancy: Math.round(t.occupancyRate),
    onTime: Math.round(t.onTimePerformance),
    delay: t.averageDelay
  }));

  const criticalIntersections = traffic
    .filter(t => t.congestionLevel > 70)
    .sort((a, b) => b.congestionLevel - a.congestionLevel)
    .slice(0, 5);

  const getStatusColor = (level) => {
    if (level < 40) return 'text-success bg-success/10';
    if (level < 70) return 'text-warning bg-warning/10';
    return 'text-destructive bg-destructive/10';
  };

  const getSignalColor = (signal) => {
    if (signal === 'green') return 'bg-success';
    if (signal === 'yellow') return 'bg-warning';
    return 'bg-destructive';
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Vehicles</p>
              <p className="text-3xl font-bold text-foreground">
                {traffic.reduce((sum, t) => sum + t.vehicleCount, 0).toLocaleString()}
              </p>
            </div>
            <Car className="h-8 w-8 text-primary" />
          </div>
          <p className="text-xs text-success mt-2">+5.2% from last hour</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg Speed</p>
              <p className="text-3xl font-bold text-foreground">
                {Math.round(traffic.reduce((sum, t) => sum + t.averageSpeed, 0) / traffic.length)} km/h
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-success" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">City-wide average</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg Wait Time</p>
              <p className="text-3xl font-bold text-foreground">
                {Math.round(traffic.reduce((sum, t) => sum + t.waitTime, 0) / traffic.length)}s
              </p>
            </div>
            <Clock className="h-8 w-8 text-warning" />
          </div>
          <p className="text-xs text-warning mt-2">-12% from peak hour</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Congestion Alerts</p>
              <p className="text-3xl font-bold text-foreground">
                {traffic.filter(t => t.congestionLevel > 70).length}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <p className="text-xs text-destructive mt-2">Requires attention</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Congestion by Zone</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={congestionByZone}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="zone" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend />
              <Bar dataKey="congestion" fill="#ef4444" name="Congestion %" />
              <Bar dataKey="speed" fill="#3b82f6" name="Avg Speed (km/h)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Transit Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={transitPerformance}>
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis dataKey="name" tick={{ fontSize: 11 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar name="Occupancy %" dataKey="occupancy" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.5} />
              <Radar name="On-Time %" dataKey="onTime" stroke="#10b981" fill="#10b981" fillOpacity={0.5} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
              />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Critical Intersections</h3>
          <div className="space-y-3">
            {criticalIntersections.map(intersection => (
              <div key={intersection.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getSignalColor(intersection.signalStatus)}`} />
                    <p className="font-medium text-foreground">{intersection.name}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{intersection.zone}</p>
                </div>
                <div className="text-right">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(intersection.congestionLevel)}`}>
                    {Math.round(intersection.congestionLevel)}%
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {intersection.vehicleCount} vehicles
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Transit Status</h3>
          <div className="space-y-3">
            {transit.map(route => (
              <div key={route.id} className="p-3 bg-secondary rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium text-foreground">{route.name}</p>
                    <p className="text-sm text-muted-foreground">{route.type} • {route.location}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    route.status === 'On Time' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                  }`}>
                    {route.status}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-muted-foreground">Occupancy</span>
                      <span className="font-medium text-foreground">{Math.round(route.occupancyRate)}%</span>
                    </div>
                    <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-primary rounded-full h-2"
                        style={{ width: `${route.occupancyRate}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-muted-foreground">Next arrival</p>
                    <p className="font-medium text-foreground">{route.nextArrival} min</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-foreground">All Intersections Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {traffic.map(intersection => (
            <div key={intersection.id} className="p-3 bg-secondary rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-2 h-2 rounded-full ${getSignalColor(intersection.signalStatus)}`} />
                <p className="font-medium text-sm text-foreground">{intersection.name}</p>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Congestion:</span>
                  <span className={`font-medium ${
                    intersection.congestionLevel > 70 ? 'text-destructive' :
                    intersection.congestionLevel > 40 ? 'text-warning' : 'text-success'
                  }`}>
                    {Math.round(intersection.congestionLevel)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Speed:</span>
                  <span className="font-medium text-foreground">{Math.round(intersection.averageSpeed)} km/h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Wait:</span>
                  <span className="font-medium text-foreground">{Math.round(intersection.waitTime)}s</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
