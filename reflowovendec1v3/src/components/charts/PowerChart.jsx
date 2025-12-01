import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { POWER_THRESHOLDS } from '../../utils/constants';
import { downsample } from '../../utils/calculations';

export default function PowerChart({ data, height = 300 }) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const processed = data.map((d, i) => ({
      index: i,
      time: d.timestamp?.toLocaleTimeString() || `#${i}`,
      activePower: d.power?.activePower,
      reactivePower: d.power?.reactivePower,
      powerFactor: (d.power?.powerFactor || 0) * 100,
      cumulativeEnergy: d.power?.cumulativeEnergy,
    }));

    return downsample(processed, 200);
  }, [data]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || payload.length === 0) return null;

    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">{label}</p>
        <div className="space-y-1">
          {payload.map((entry) => (
            <div key={entry.name} className="flex items-center gap-2 text-sm">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-600 dark:text-gray-400">{entry.name}:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {entry.value?.toFixed(2)} {entry.name.includes('Power') ? 'kW' : '%'}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="activePowerGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="reactivePowerGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
        <XAxis
          dataKey="time"
          tick={{ fontSize: 12 }}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 12 }}
          tickFormatter={(v) => `${v} kW`}
        />
        <Tooltip content={<CustomTooltip />} />

        <ReferenceLine
          y={POWER_THRESHOLDS.HIGH}
          stroke="#f59e0b"
          strokeDasharray="5 5"
          label={{ value: 'High', fontSize: 10, fill: '#f59e0b' }}
        />

        <Area
          type="monotone"
          dataKey="activePower"
          name="Active Power"
          stroke="#3b82f6"
          fill="url(#activePowerGradient)"
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="reactivePower"
          name="Reactive Power"
          stroke="#f59e0b"
          fill="url(#reactivePowerGradient)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
