import { useState, useMemo } from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ScatterChart,
  Scatter,
  ZAxis,
} from 'recharts';
import { Grid3X3, Thermometer, ArrowUpDown, BarChart3 } from 'lucide-react';
import useStore from '../store/useStore';
import { Card, TimeRangeSlider } from '../components/common';
import { ZoneHeatmap } from '../components/charts';
import { ZONE_COLORS } from '../utils/constants';
import { calculateStats, formatNumber, calculateZoneBalance } from '../utils/calculations';

export default function ZoneAnalysis() {
  const { getFilteredData, selectedZones } = useStore();
  const filteredData = getFilteredData();
  const [comparisonMode, setComparisonMode] = useState('average');

  const zoneStats = useMemo(() => {
    const stats = [];
    for (let z = 1; z <= 10; z++) {
      const upperTemps = filteredData.map(d => d.zones[z]?.upper).filter(Boolean);
      const lowerTemps = filteredData.map(d => d.zones[z]?.lower).filter(Boolean);
      const avgTemps = filteredData.map(d => d.zones[z]?.avg).filter(Boolean);
      const blowerTemps = filteredData.map(d => d.zones[z]?.blowerAvg).filter(Boolean);

      stats.push({
        zone: z,
        zoneName: `Zone ${z}`,
        upper: calculateStats(upperTemps),
        lower: calculateStats(lowerTemps),
        avg: calculateStats(avgTemps),
        blower: calculateStats(blowerTemps),
        delta: calculateStats(upperTemps.map((u, i) => u - lowerTemps[i])),
        color: ZONE_COLORS[z],
      });
    }
    return stats;
  }, [filteredData]);

  const radarData = useMemo(() => {
    return zoneStats.map(s => ({
      zone: `Z${s.zone}`,
      average: s.avg.mean,
      upper: s.upper.mean,
      lower: s.lower.mean,
      blower: s.blower.mean,
      fullMark: 300,
    }));
  }, [zoneStats]);

  const comparisonData = useMemo(() => {
    return zoneStats.map(s => ({
      zone: `Zone ${s.zone}`,
      upper: s.upper[comparisonMode] || s.upper.mean,
      lower: s.lower[comparisonMode] || s.lower.mean,
      delta: s.delta.mean,
      color: s.color,
    }));
  }, [zoneStats, comparisonMode]);

  const balanceScore = useMemo(() => {
    const lastData = filteredData[filteredData.length - 1];
    if (!lastData) return 0;
    const temps = {};
    for (let z = 1; z <= 10; z++) {
      temps[z] = lastData.zones[z]?.avg || 0;
    }
    return calculateZoneBalance(temps);
  }, [filteredData]);

  const scatterData = useMemo(() => {
    return zoneStats.map(s => ({
      zone: s.zone,
      zoneName: `Zone ${s.zone}`,
      x: s.avg.mean,
      y: s.delta.mean,
      z: s.avg.std,
      color: s.color,
    }));
  }, [zoneStats]);

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || payload.length === 0) return null;

    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="font-medium text-gray-900 dark:text-white mb-2">{data.zone || data.zoneName}</p>
        <div className="space-y-1 text-sm">
          {payload.map((entry) => (
            <div key={entry.name} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-gray-500">{entry.name}:</span>
              <span className="font-medium">{formatNumber(entry.value, 1)}°C</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Zone Analysis
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Temperature distribution and balance across zones
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-gray-500">Balance Score</p>
            <p className={`text-2xl font-bold ${
              balanceScore > 80 ? 'text-green-500' :
              balanceScore > 60 ? 'text-yellow-500' : 'text-red-500'
            }`}>
              {formatNumber(balanceScore, 0)}%
            </p>
          </div>
        </div>
      </div>

      {/* Time Range */}
      <Card>
        <div className="p-4">
          <TimeRangeSlider />
        </div>
      </Card>

      {/* Zone Heatmap */}
      <Card title="Temperature Heatmap" subtitle="Thermal distribution over time">
        <ZoneHeatmap data={filteredData} height={300} />
      </Card>

      {/* Zone Comparison */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <Card title="Zone Temperature Radar" subtitle="Multi-dimensional zone comparison">
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid className="stroke-gray-200 dark:stroke-gray-700" />
                <PolarAngleAxis dataKey="zone" tick={{ fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 300]} tick={{ fontSize: 10 }} />
                <Radar
                  name="Average"
                  dataKey="average"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                />
                <Radar
                  name="Upper"
                  dataKey="upper"
                  stroke="#ef4444"
                  fill="#ef4444"
                  fillOpacity={0.1}
                />
                <Radar
                  name="Lower"
                  dataKey="lower"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.1}
                />
                <Legend />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Upper/Lower Comparison */}
        <Card
          title="Upper vs Lower Temperature"
          subtitle="Temperature differential by zone"
          headerAction={
            <select
              value={comparisonMode}
              onChange={(e) => setComparisonMode(e.target.value)}
              className="select text-sm w-auto"
            >
              <option value="mean">Average</option>
              <option value="max">Maximum</option>
              <option value="min">Minimum</option>
            </select>
          }
        >
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}°C`} />
                <YAxis type="category" dataKey="zone" tick={{ fontSize: 11 }} width={60} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="upper" name="Upper" fill="#ef4444" radius={[0, 4, 4, 0]} />
                <Bar dataKey="lower" name="Lower" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Zone Statistics Table */}
      <Card title="Zone Statistics Summary" subtitle="Detailed metrics for all zones">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-medium text-gray-500">Zone</th>
                <th className="text-right py-3 px-4 font-medium text-gray-500">Upper Mean</th>
                <th className="text-right py-3 px-4 font-medium text-gray-500">Lower Mean</th>
                <th className="text-right py-3 px-4 font-medium text-gray-500">Delta</th>
                <th className="text-right py-3 px-4 font-medium text-gray-500">Blower Mean</th>
                <th className="text-right py-3 px-4 font-medium text-gray-500">Std Dev</th>
                <th className="text-center py-3 px-4 font-medium text-gray-500">Stability</th>
              </tr>
            </thead>
            <tbody>
              {zoneStats.map((zone) => {
                const stability = 100 - Math.min(100, zone.avg.std * 2);
                return (
                  <tr
                    key={zone.zone}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: zone.color }}
                        />
                        <span className="font-medium text-gray-900 dark:text-white">
                          Zone {zone.zone}
                        </span>
                      </div>
                    </td>
                    <td className="text-right py-3 px-4 text-red-500">
                      {formatNumber(zone.upper.mean, 1)}°C
                    </td>
                    <td className="text-right py-3 px-4 text-blue-500">
                      {formatNumber(zone.lower.mean, 1)}°C
                    </td>
                    <td className="text-right py-3 px-4 text-gray-600 dark:text-gray-400">
                      {formatNumber(zone.delta.mean, 1)}°C
                    </td>
                    <td className="text-right py-3 px-4 text-purple-500">
                      {formatNumber(zone.blower.mean, 1)}°C
                    </td>
                    <td className="text-right py-3 px-4 text-gray-600 dark:text-gray-400">
                      ±{formatNumber(zone.avg.std, 2)}°C
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 justify-center">
                        <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              stability > 80 ? 'bg-green-500' :
                              stability > 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${stability}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">{formatNumber(stability, 0)}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Scatter Plot Analysis */}
      <Card title="Temperature vs Delta Analysis" subtitle="Zone temperature correlation with upper-lower differential">
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis
                type="number"
                dataKey="x"
                name="Avg Temp"
                unit="°C"
                tick={{ fontSize: 11 }}
                label={{ value: 'Average Temperature (°C)', position: 'bottom', offset: 0 }}
              />
              <YAxis
                type="number"
                dataKey="y"
                name="Delta"
                unit="°C"
                tick={{ fontSize: 11 }}
                label={{ value: 'Temperature Delta (°C)', angle: -90, position: 'insideLeft' }}
              />
              <ZAxis type="number" dataKey="z" range={[100, 500]} name="Variation" />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.[0]) return null;
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border">
                      <p className="font-medium" style={{ color: data.color }}>{data.zoneName}</p>
                      <p className="text-sm text-gray-500">Avg: {formatNumber(data.x, 1)}°C</p>
                      <p className="text-sm text-gray-500">Delta: {formatNumber(data.y, 1)}°C</p>
                      <p className="text-sm text-gray-500">Std: {formatNumber(data.z, 2)}°C</p>
                    </div>
                  );
                }}
              />
              {scatterData.map((entry, index) => (
                <Scatter
                  key={entry.zone}
                  name={entry.zoneName}
                  data={[entry]}
                  fill={entry.color}
                >
                </Scatter>
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
