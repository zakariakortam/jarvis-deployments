import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ComposedChart,
  Line,
} from 'recharts';
import { downsample } from '../../utils/calculations';

export default function ProductionChart({ data, height = 300 }) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Group by hour or product
    const hourlyData = {};
    data.forEach((d) => {
      const hour = d.timestamp?.getHours() || 0;
      const key = `${hour}:00`;

      if (!hourlyData[key]) {
        hourlyData[key] = {
          time: key,
          boardsProduced: 0,
          alarms: 0,
          avgPower: 0,
          count: 0,
        };
      }

      hourlyData[key].boardsProduced = Math.max(
        hourlyData[key].boardsProduced,
        d.production?.boardsProduced || 0
      );
      hourlyData[key].alarms += d.equipment?.alarms || 0;
      hourlyData[key].avgPower += d.power?.activePower || 0;
      hourlyData[key].count++;
    });

    return Object.values(hourlyData).map((h) => ({
      ...h,
      avgPower: h.avgPower / h.count,
    }));
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
                {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
        <XAxis dataKey="time" tick={{ fontSize: 12 }} />
        <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar
          yAxisId="left"
          dataKey="boardsProduced"
          name="Boards Produced"
          fill="#3b82f6"
          radius={[4, 4, 0, 0]}
        />
        <Bar
          yAxisId="left"
          dataKey="alarms"
          name="Alarms"
          fill="#ef4444"
          radius={[4, 4, 0, 0]}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="avgPower"
          name="Avg Power (kW)"
          stroke="#f59e0b"
          strokeWidth={2}
          dot={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
