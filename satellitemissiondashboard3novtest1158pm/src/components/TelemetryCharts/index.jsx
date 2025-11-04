import { useMemo, useState, useEffect } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format } from 'date-fns';

function TelemetryCharts({ satellite }) {
  const [historicalData, setHistoricalData] = useState([]);

  // Generate historical telemetry data
  useEffect(() => {
    if (!satellite) return;

    const generateHistory = () => {
      const data = [];
      const now = Date.now();
      const points = 30;

      for (let i = points - 1; i >= 0; i--) {
        const timestamp = now - i * 2000; // Every 2 seconds
        data.push({
          timestamp,
          time: format(new Date(timestamp), 'HH:mm:ss'),
          power: 85 + Math.random() * 15,
          battery: 60 + Math.random() * 40,
          temp: -20 + Math.random() * 80,
          fuel: satellite.telemetry.propulsion.fuel + (Math.random() - 0.5) * 5,
          signal: -80 + Math.random() * 40,
        });
      }
      return data;
    };

    setHistoricalData(generateHistory());

    const interval = setInterval(() => {
      setHistoricalData(prev => {
        const newData = [...prev.slice(1)];
        const lastTimestamp = prev[prev.length - 1]?.timestamp || Date.now();
        newData.push({
          timestamp: lastTimestamp + 2000,
          time: format(new Date(lastTimestamp + 2000), 'HH:mm:ss'),
          power: satellite.telemetry.power.solarPanel + (Math.random() - 0.5) * 5,
          battery: satellite.telemetry.power.battery + (Math.random() - 0.5) * 5,
          temp: satellite.telemetry.thermal.core + (Math.random() - 0.5) * 5,
          fuel: satellite.telemetry.propulsion.fuel + (Math.random() - 0.5) * 2,
          signal: satellite.telemetry.communication.signalStrength + (Math.random() - 0.5) * 5,
        });
        return newData;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [satellite]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-xs text-muted-foreground mb-2">{payload[0]?.payload.time}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-foreground">
                {entry.name}: {entry.value.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  if (!satellite || historicalData.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-muted-foreground">Loading telemetry data...</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
      {/* Power Systems */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-lg font-semibold text-foreground mb-4">Power Systems</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={historicalData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="time"
              stroke="hsl(var(--muted-foreground))"
              tick={{ fontSize: 12 }}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              tick={{ fontSize: 12 }}
              domain={[0, 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="power"
              stroke="#10b981"
              strokeWidth={2}
              name="Solar Panel %"
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="battery"
              stroke="#3b82f6"
              strokeWidth={2}
              name="Battery %"
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Thermal Systems */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-lg font-semibold text-foreground mb-4">Thermal Systems</h3>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={historicalData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="time"
              stroke="hsl(var(--muted-foreground))"
              tick={{ fontSize: 12 }}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              tick={{ fontSize: 12 }}
              domain={[-40, 80]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              type="monotone"
              dataKey="temp"
              stroke="#f59e0b"
              fill="#f59e0b"
              fillOpacity={0.3}
              strokeWidth={2}
              name="Core Temp °C"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Propulsion Systems */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-lg font-semibold text-foreground mb-4">Propulsion Systems</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={historicalData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="time"
              stroke="hsl(var(--muted-foreground))"
              tick={{ fontSize: 12 }}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              tick={{ fontSize: 12 }}
              domain={[0, 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="fuel"
              stroke="#8b5cf6"
              strokeWidth={2}
              name="Fuel %"
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Communication Systems */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-lg font-semibold text-foreground mb-4">Communication Systems</h3>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={historicalData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="time"
              stroke="hsl(var(--muted-foreground))"
              tick={{ fontSize: 12 }}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              tick={{ fontSize: 12 }}
              domain={[-100, 0]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              type="monotone"
              dataKey="signal"
              stroke="#06b6d4"
              fill="#06b6d4"
              fillOpacity={0.3}
              strokeWidth={2}
              name="Signal dBm"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default TelemetryCharts;
