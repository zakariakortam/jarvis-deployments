import { useMemo } from 'react';
import { getTemperatureGradient } from '../../utils/calculations';
import { ZONE_COLORS } from '../../utils/constants';

export default function ZoneHeatmap({ data, height = 200 }) {
  const heatmapData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Sample data at regular intervals
    const step = Math.max(1, Math.floor(data.length / 50));
    const sampled = [];

    for (let i = 0; i < data.length; i += step) {
      const row = [];
      for (let z = 1; z <= 10; z++) {
        row.push({
          zone: z,
          temp: data[i]?.zones[z]?.avg || 0,
          upper: data[i]?.zones[z]?.upper || 0,
          lower: data[i]?.zones[z]?.lower || 0,
        });
      }
      sampled.push({
        time: data[i]?.timestamp?.toLocaleTimeString() || `#${i}`,
        zones: row,
      });
    }

    return sampled;
  }, [data]);

  const getColor = (temp) => {
    if (temp < 100) return '#3b82f6';
    if (temp < 150) return '#06b6d4';
    if (temp < 180) return '#10b981';
    if (temp < 200) return '#84cc16';
    if (temp < 220) return '#eab308';
    if (temp < 240) return '#f97316';
    if (temp < 260) return '#ef4444';
    return '#dc2626';
  };

  const getOpacity = (temp) => {
    return Math.min(1, Math.max(0.3, temp / 300));
  };

  return (
    <div className="w-full overflow-x-auto">
      {/* Zone labels */}
      <div className="flex mb-2 pl-16">
        {Array.from({ length: 10 }, (_, i) => (
          <div
            key={i}
            className="flex-1 text-xs text-center font-medium text-gray-500 dark:text-gray-400"
            style={{ minWidth: 40 }}
          >
            Z{i + 1}
          </div>
        ))}
      </div>

      {/* Heatmap grid */}
      <div className="space-y-0.5" style={{ height }}>
        {heatmapData.map((row, rowIndex) => (
          <div key={rowIndex} className="flex items-center gap-0.5">
            <div className="w-16 text-xs text-gray-400 truncate">{row.time}</div>
            {row.zones.map((cell) => (
              <div
                key={cell.zone}
                className="flex-1 h-4 rounded-sm transition-all hover:scale-110 cursor-pointer"
                style={{
                  backgroundColor: getColor(cell.temp),
                  opacity: getOpacity(cell.temp),
                  minWidth: 40,
                }}
                title={`Zone ${cell.zone}: ${cell.temp.toFixed(1)}°C\nUpper: ${cell.upper.toFixed(1)}°C\nLower: ${cell.lower.toFixed(1)}°C`}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Temperature legend */}
      <div className="flex items-center justify-center gap-4 mt-4">
        <span className="text-xs text-gray-500">Cold</span>
        <div className="flex h-3 w-48 rounded overflow-hidden">
          <div className="flex-1" style={{ backgroundColor: '#3b82f6' }} />
          <div className="flex-1" style={{ backgroundColor: '#06b6d4' }} />
          <div className="flex-1" style={{ backgroundColor: '#10b981' }} />
          <div className="flex-1" style={{ backgroundColor: '#eab308' }} />
          <div className="flex-1" style={{ backgroundColor: '#f97316' }} />
          <div className="flex-1" style={{ backgroundColor: '#ef4444' }} />
        </div>
        <span className="text-xs text-gray-500">Hot</span>
      </div>
    </div>
  );
}
