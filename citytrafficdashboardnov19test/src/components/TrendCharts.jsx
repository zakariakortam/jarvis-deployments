import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import useTrafficStore from '../store/trafficStore';

export default function TrendCharts() {
  const historicalData = useTrafficStore(state => state.historicalData);
  const darkMode = useTrafficStore(state => state.darkMode);

  // Prepare data for charts
  const chartData = historicalData.timestamps.map((timestamp, index) => ({
    time: format(new Date(timestamp), 'HH:mm:ss'),
    speed: Math.round(historicalData.speed[index]),
    congestion: Math.round(historicalData.congestion[index]),
    emissions: Math.round(historicalData.emissions[index])
  }));

  const chartConfig = {
    stroke: darkMode ? '#94a3b8' : '#64748b',
    fill: darkMode ? '#1e293b' : '#ffffff',
    grid: darkMode ? '#334155' : '#e2e8f0'
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Average Speed Chart */}
      <div className="bg-card p-6 rounded-lg shadow-lg border border-border">
        <h3 className="text-lg font-semibold mb-4 text-card-foreground">Average Speed</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartConfig.grid} />
            <XAxis
              dataKey="time"
              stroke={chartConfig.stroke}
              tick={{ fill: chartConfig.stroke, fontSize: 12 }}
            />
            <YAxis
              stroke={chartConfig.stroke}
              tick={{ fill: chartConfig.stroke, fontSize: 12 }}
              domain={[0, 70]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: chartConfig.fill,
                border: `1px solid ${chartConfig.grid}`,
                borderRadius: '8px'
              }}
            />
            <Line
              type="monotone"
              dataKey="speed"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              name="Speed (mph)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Congestion Level Chart */}
      <div className="bg-card p-6 rounded-lg shadow-lg border border-border">
        <h3 className="text-lg font-semibold mb-4 text-card-foreground">Congestion Level</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartConfig.grid} />
            <XAxis
              dataKey="time"
              stroke={chartConfig.stroke}
              tick={{ fill: chartConfig.stroke, fontSize: 12 }}
            />
            <YAxis
              stroke={chartConfig.stroke}
              tick={{ fill: chartConfig.stroke, fontSize: 12 }}
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: chartConfig.fill,
                border: `1px solid ${chartConfig.grid}`,
                borderRadius: '8px'
              }}
            />
            <Line
              type="monotone"
              dataKey="congestion"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={false}
              name="Congestion (%)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Emissions Chart */}
      <div className="bg-card p-6 rounded-lg shadow-lg border border-border">
        <h3 className="text-lg font-semibold mb-4 text-card-foreground">Emissions</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartConfig.grid} />
            <XAxis
              dataKey="time"
              stroke={chartConfig.stroke}
              tick={{ fill: chartConfig.stroke, fontSize: 12 }}
            />
            <YAxis
              stroke={chartConfig.stroke}
              tick={{ fill: chartConfig.stroke, fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: chartConfig.fill,
                border: `1px solid ${chartConfig.grid}`,
                borderRadius: '8px'
              }}
            />
            <Line
              type="monotone"
              dataKey="emissions"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
              name="Emissions (units)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
