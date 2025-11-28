import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Wind, Droplet, Volume2, AlertCircle } from 'lucide-react';

export default function EnvironmentalGrid({ data }) {
  const { environment } = data;

  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const airQualityData = environment.map(e => ({
    zone: e.zone,
    aqi: e.airQuality.aqi,
    pm25: Math.round(e.airQuality.pm25),
    pm10: Math.round(e.airQuality.pm10),
    co2: Math.round(e.airQuality.co2)
  }));

  const waterQualityData = environment.map(e => ({
    zone: e.zone,
    ph: e.waterQuality.ph.toFixed(1),
    turbidity: e.waterQuality.turbidity.toFixed(1),
    dissolvedOxygen: e.waterQuality.dissolvedOxygen.toFixed(1)
  }));

  const noiseData = environment.map(e => ({
    zone: e.zone,
    level: Math.round(e.noise.level),
    peak: Math.round(e.noise.peak),
    violations: e.noise.violations
  }));

  const statusDistribution = {
    air: environment.reduce((acc, e) => {
      acc[e.airQuality.status] = (acc[e.airQuality.status] || 0) + 1;
      return acc;
    }, {}),
    water: environment.reduce((acc, e) => {
      acc[e.waterQuality.status] = (acc[e.waterQuality.status] || 0) + 1;
      return acc;
    }, {}),
    noise: environment.reduce((acc, e) => {
      acc[e.noise.status] = (acc[e.noise.status] || 0) + 1;
      return acc;
    }, {})
  };

  const airPieData = Object.entries(statusDistribution.air).map(([name, value]) => ({
    name, value
  }));

  const avgAQI = Math.round(environment.reduce((sum, e) => sum + e.airQuality.aqi, 0) / environment.length);
  const avgNoise = Math.round(environment.reduce((sum, e) => sum + e.noise.level, 0) / environment.length);
  const safeWaterZones = environment.filter(e => e.waterQuality.status === 'Safe').length;
  const totalViolations = environment.reduce((sum, e) => sum + e.noise.violations, 0);

  const getAQIColor = (aqi) => {
    if (aqi <= 50) return 'text-success bg-success/10';
    if (aqi <= 100) return 'text-warning bg-warning/10';
    return 'text-destructive bg-destructive/10';
  };

  const getAQIStatus = (aqi) => {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive';
    return 'Unhealthy';
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg AQI</p>
              <p className="text-3xl font-bold text-foreground">{avgAQI}</p>
            </div>
            <Wind className="h-8 w-8 text-primary" />
          </div>
          <p className={`text-xs mt-2 ${
            avgAQI <= 50 ? 'text-success' : avgAQI <= 100 ? 'text-warning' : 'text-destructive'
          }`}>
            {getAQIStatus(avgAQI)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Safe Water Zones</p>
              <p className="text-3xl font-bold text-foreground">{safeWaterZones}/{environment.length}</p>
            </div>
            <Droplet className="h-8 w-8 text-success" />
          </div>
          <p className="text-xs text-success mt-2">
            {Math.round((safeWaterZones / environment.length) * 100)}% compliance
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg Noise Level</p>
              <p className="text-3xl font-bold text-foreground">{avgNoise} dB</p>
            </div>
            <Volume2 className="h-8 w-8 text-warning" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">City-wide average</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Noise Violations</p>
              <p className="text-3xl font-bold text-foreground">{totalViolations}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <p className="text-xs text-destructive mt-2">Requires investigation</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Air Quality Index by Zone</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={airQualityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="zone" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend />
              <Area type="monotone" dataKey="aqi" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} name="AQI" />
              <Area type="monotone" dataKey="pm25" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} name="PM2.5" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Air Quality Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={airPieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {airPieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Water Quality Metrics</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={waterQualityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="zone" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend />
              <Bar dataKey="ph" fill="#10b981" name="pH Level" />
              <Bar dataKey="dissolvedOxygen" fill="#3b82f6" name="Dissolved O2 (mg/L)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Noise Levels by Zone</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={noiseData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="zone" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend />
              <Bar dataKey="level" fill="#f59e0b" name="Avg Level (dB)" />
              <Bar dataKey="peak" fill="#ef4444" name="Peak Level (dB)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Air Quality Details</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin">
            {environment.map((zone, idx) => (
              <div key={idx} className="p-3 bg-secondary rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-foreground">{zone.zone}</p>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${getAQIColor(zone.airQuality.aqi)}`}>
                    {zone.airQuality.status}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-muted-foreground">AQI</p>
                    <p className="font-medium text-foreground">{zone.airQuality.aqi}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">PM2.5</p>
                    <p className="font-medium text-foreground">{zone.airQuality.pm25.toFixed(1)} μg/m³</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">PM10</p>
                    <p className="font-medium text-foreground">{zone.airQuality.pm10.toFixed(1)} μg/m³</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">CO2</p>
                    <p className="font-medium text-foreground">{zone.airQuality.co2.toFixed(0)} ppm</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Water Quality Details</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin">
            {environment.map((zone, idx) => (
              <div key={idx} className="p-3 bg-secondary rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-foreground">{zone.zone}</p>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    zone.waterQuality.status === 'Safe' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                  }`}>
                    {zone.waterQuality.status}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-muted-foreground">pH</p>
                    <p className="font-medium text-foreground">{zone.waterQuality.ph.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Turbidity</p>
                    <p className="font-medium text-foreground">{zone.waterQuality.turbidity.toFixed(2)} NTU</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">DO</p>
                    <p className="font-medium text-foreground">{zone.waterQuality.dissolvedOxygen.toFixed(1)} mg/L</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Temp</p>
                    <p className="font-medium text-foreground">{zone.waterQuality.temperature.toFixed(1)}°C</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Noise Monitoring Details</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin">
            {environment.map((zone, idx) => (
              <div key={idx} className="p-3 bg-secondary rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-foreground">{zone.zone}</p>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    zone.noise.status === 'Acceptable' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                  }`}>
                    {zone.noise.status}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-muted-foreground">Current</p>
                    <p className="font-medium text-foreground">{zone.noise.level.toFixed(1)} dB</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Peak</p>
                    <p className="font-medium text-foreground">{zone.noise.peak.toFixed(1)} dB</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Average</p>
                    <p className="font-medium text-foreground">{zone.noise.average.toFixed(1)} dB</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Violations</p>
                    <p className={`font-medium ${zone.noise.violations > 0 ? 'text-destructive' : 'text-success'}`}>
                      {zone.noise.violations}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
