import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { ZONE_COLORS, TEMPERATURE_LIMITS } from '../../utils/constants';
import { downsample } from '../../utils/calculations';

export default function TemperatureLineChart({
  data,
  selectedZones = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  showBlowers = false,
  showReferenceLine = true,
  height = 400,
}) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const processed = data.map((d, i) => {
      const point = {
        index: i,
        time: d.timestamp?.toLocaleTimeString() || `#${i}`,
      };

      selectedZones.forEach((z) => {
        point[`zone${z}`] = d.zones[z]?.avg;
        if (showBlowers) {
          point[`blower${z}`] = d.zones[z]?.blowerAvg;
        }
      });

      return point;
    });

    // Downsample if too many data points
    return downsample(processed, 200);
  }, [data, selectedZones, showBlowers]);

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
                {entry.value?.toFixed(1)}°C
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
        <XAxis
          dataKey="time"
          tick={{ fontSize: 12 }}
          interval="preserveStartEnd"
          className="text-gray-600 dark:text-gray-400"
        />
        <YAxis
          domain={['auto', 'auto']}
          tick={{ fontSize: 12 }}
          tickFormatter={(v) => `${v}°C`}
          className="text-gray-600 dark:text-gray-400"
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />

        {showReferenceLine && (
          <>
            <ReferenceLine
              y={TEMPERATURE_LIMITS.IDEAL_PEAK.min}
              stroke="#f59e0b"
              strokeDasharray="5 5"
              label={{ value: 'Peak Min', fontSize: 10, fill: '#f59e0b' }}
            />
            <ReferenceLine
              y={TEMPERATURE_LIMITS.IDEAL_PEAK.max}
              stroke="#ef4444"
              strokeDasharray="5 5"
              label={{ value: 'Peak Max', fontSize: 10, fill: '#ef4444' }}
            />
          </>
        )}

        {selectedZones.map((z) => (
          <Line
            key={`zone${z}`}
            type="monotone"
            dataKey={`zone${z}`}
            name={`Zone ${z}`}
            stroke={ZONE_COLORS[z]}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        ))}

        {showBlowers &&
          selectedZones.map((z) => (
            <Line
              key={`blower${z}`}
              type="monotone"
              dataKey={`blower${z}`}
              name={`Blower ${z}`}
              stroke={ZONE_COLORS[z]}
              strokeWidth={1}
              strokeDasharray="5 5"
              dot={false}
              opacity={0.6}
            />
          ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
