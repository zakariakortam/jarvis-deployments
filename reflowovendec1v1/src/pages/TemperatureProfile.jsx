import { useState, useMemo } from 'react';
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
  ReferenceArea,
  Brush,
  AreaChart,
  Area,
} from 'recharts';
import { Thermometer, Settings, Eye, EyeOff, TrendingUp, TrendingDown } from 'lucide-react';
import useStore from '../store/useStore';
import { Card, StatCard, TimeRangeSlider } from '../components/common';
import { ZONE_COLORS, TEMPERATURE_LIMITS, REFLOW_PROFILE_STAGES } from '../utils/constants';
import { calculateStats, calculateRateOfChange, downsample, formatNumber } from '../utils/calculations';

export default function TemperatureProfile() {
  const { getFilteredData, selectedZones, setSelectedZones } = useStore();
  const filteredData = getFilteredData();

  const [showBlowers, setShowBlowers] = useState(false);
  const [showUpperLower, setShowUpperLower] = useState(false);
  const [showReflowZones, setShowReflowZones] = useState(true);
  const [selectedZone, setSelectedZone] = useState(null);

  const chartData = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return [];

    const processed = filteredData.map((d, i) => {
      const point = {
        index: i,
        time: d.timestamp?.toLocaleTimeString() || `#${i}`,
        avgTemp: d.avgZoneTemp,
        maxTemp: d.maxZoneTemp,
        minTemp: d.minZoneTemp,
      };

      for (let z = 1; z <= 10; z++) {
        point[`zone${z}`] = d.zones[z]?.avg;
        point[`zone${z}Upper`] = d.zones[z]?.upper;
        point[`zone${z}Lower`] = d.zones[z]?.lower;
        point[`blower${z}`] = d.zones[z]?.blowerAvg;
      }

      return point;
    });

    return downsample(processed, 300);
  }, [filteredData]);

  const zoneStats = useMemo(() => {
    const stats = {};
    for (let z = 1; z <= 10; z++) {
      const temps = filteredData.map(d => d.zones[z]?.avg).filter(Boolean);
      stats[z] = calculateStats(temps);
    }
    return stats;
  }, [filteredData]);

  const rateOfChange = useMemo(() => {
    const avgTemps = filteredData.map(d => d.avgZoneTemp);
    return calculateRateOfChange(avgTemps);
  }, [filteredData]);

  const toggleZone = (zone) => {
    if (selectedZones.includes(zone)) {
      setSelectedZones(selectedZones.filter(z => z !== zone));
    } else {
      setSelectedZones([...selectedZones, zone]);
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || payload.length === 0) return null;

    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-80 overflow-y-auto">
        <p className="text-sm font-medium text-gray-900 dark:text-white mb-3 border-b border-gray-200 dark:border-gray-700 pb-2">
          {label}
        </p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          {payload.map((entry) => (
            <div key={entry.name} className="flex items-center gap-2 text-xs">
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-500 dark:text-gray-400 truncate">{entry.name}:</span>
              <span className="font-medium text-gray-900 dark:text-white ml-auto">
                {entry.value?.toFixed(1)}°C
              </span>
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
            Temperature Profile
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Detailed thermal analysis across all zones
          </p>
        </div>
      </div>

      {/* Time Range */}
      <Card>
        <div className="p-4">
          <TimeRangeSlider />
        </div>
      </Card>

      {/* Zone Selector */}
      <Card title="Zone Selection" subtitle="Click to toggle zones on/off">
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((zone) => (
            <button
              key={zone}
              onClick={() => toggleZone(zone)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedZones.includes(zone)
                  ? 'text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              style={{
                backgroundColor: selectedZones.includes(zone) ? ZONE_COLORS[zone] : undefined,
              }}
            >
              Zone {zone}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
            <input
              type="checkbox"
              checked={showBlowers}
              onChange={(e) => setShowBlowers(e.target.checked)}
              className="rounded text-primary-500 focus:ring-primary-500"
            />
            Show Blower Temps
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
            <input
              type="checkbox"
              checked={showUpperLower}
              onChange={(e) => setShowUpperLower(e.target.checked)}
              className="rounded text-primary-500 focus:ring-primary-500"
            />
            Show Upper/Lower
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
            <input
              type="checkbox"
              checked={showReflowZones}
              onChange={(e) => setShowReflowZones(e.target.checked)}
              className="rounded text-primary-500 focus:ring-primary-500"
            />
            Show Reflow Zones
          </label>
        </div>
      </Card>

      {/* Main Temperature Chart */}
      <Card title="Temperature Over Time" subtitle="All selected zones">
        <div className="h-[500px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis dataKey="time" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
              <YAxis
                domain={['auto', 'auto']}
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => `${v}°C`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />

              {showReflowZones && (
                <>
                  <ReferenceArea
                    y1={TEMPERATURE_LIMITS.IDEAL_PREHEAT.min}
                    y2={TEMPERATURE_LIMITS.IDEAL_PREHEAT.max}
                    fill="#3b82f6"
                    fillOpacity={0.1}
                    label={{ value: 'Preheat', position: 'insideTopRight', fontSize: 10 }}
                  />
                  <ReferenceArea
                    y1={TEMPERATURE_LIMITS.IDEAL_SOAK.min}
                    y2={TEMPERATURE_LIMITS.IDEAL_SOAK.max}
                    fill="#f59e0b"
                    fillOpacity={0.1}
                    label={{ value: 'Soak', position: 'insideTopRight', fontSize: 10 }}
                  />
                  <ReferenceArea
                    y1={TEMPERATURE_LIMITS.IDEAL_PEAK.min}
                    y2={TEMPERATURE_LIMITS.IDEAL_PEAK.max}
                    fill="#ef4444"
                    fillOpacity={0.1}
                    label={{ value: 'Peak', position: 'insideTopRight', fontSize: 10 }}
                  />
                </>
              )}

              <ReferenceLine
                y={TEMPERATURE_LIMITS.WARNING_HIGH}
                stroke="#ef4444"
                strokeDasharray="5 5"
                label={{ value: 'Max', fontSize: 10, fill: '#ef4444' }}
              />

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

              {showUpperLower &&
                selectedZones.map((z) => (
                  <>
                    <Line
                      key={`zone${z}Upper`}
                      type="monotone"
                      dataKey={`zone${z}Upper`}
                      name={`Z${z} Upper`}
                      stroke={ZONE_COLORS[z]}
                      strokeWidth={1}
                      strokeDasharray="3 3"
                      dot={false}
                      opacity={0.5}
                    />
                    <Line
                      key={`zone${z}Lower`}
                      type="monotone"
                      dataKey={`zone${z}Lower`}
                      name={`Z${z} Lower`}
                      stroke={ZONE_COLORS[z]}
                      strokeWidth={1}
                      strokeDasharray="3 3"
                      dot={false}
                      opacity={0.5}
                    />
                  </>
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
                    strokeDasharray="8 4"
                    dot={false}
                    opacity={0.7}
                  />
                ))}

              <Brush
                dataKey="time"
                height={30}
                stroke="#3b82f6"
                fill="#f3f4f6"
                className="dark:fill-gray-700"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Zone Statistics */}
      <Card title="Zone Statistics" subtitle="Statistical summary for each zone">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-medium text-gray-500">Zone</th>
                <th className="text-right py-3 px-4 font-medium text-gray-500">Min</th>
                <th className="text-right py-3 px-4 font-medium text-gray-500">Max</th>
                <th className="text-right py-3 px-4 font-medium text-gray-500">Mean</th>
                <th className="text-right py-3 px-4 font-medium text-gray-500">Std Dev</th>
                <th className="text-right py-3 px-4 font-medium text-gray-500">Range</th>
                <th className="text-center py-3 px-4 font-medium text-gray-500">Distribution</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 10 }, (_, i) => i + 1).map((zone) => {
                const stats = zoneStats[zone] || {};
                const range = (stats.max || 0) - (stats.min || 0);
                const normalizedMean = ((stats.mean - stats.min) / range) * 100 || 50;

                return (
                  <tr
                    key={zone}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: ZONE_COLORS[zone] }}
                        />
                        <span className="font-medium text-gray-900 dark:text-white">Zone {zone}</span>
                      </div>
                    </td>
                    <td className="text-right py-3 px-4 text-gray-600 dark:text-gray-400">
                      {formatNumber(stats.min, 1)}°C
                    </td>
                    <td className="text-right py-3 px-4 text-gray-600 dark:text-gray-400">
                      {formatNumber(stats.max, 1)}°C
                    </td>
                    <td className="text-right py-3 px-4 font-medium text-gray-900 dark:text-white">
                      {formatNumber(stats.mean, 1)}°C
                    </td>
                    <td className="text-right py-3 px-4 text-gray-600 dark:text-gray-400">
                      ±{formatNumber(stats.std, 2)}°C
                    </td>
                    <td className="text-right py-3 px-4 text-gray-600 dark:text-gray-400">
                      {formatNumber(range, 1)}°C
                    </td>
                    <td className="py-3 px-4">
                      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${normalizedMean}%`,
                            backgroundColor: ZONE_COLORS[zone],
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Rate of Change Chart */}
      <Card title="Temperature Rate of Change" subtitle="Heating/cooling rate over time (°C/min)">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData.map((d, i) => ({
                ...d,
                rateOfChange: rateOfChange[Math.floor((i / chartData.length) * rateOfChange.length)] || 0,
              }))}
            >
              <defs>
                <linearGradient id="rateGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis dataKey="time" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v.toFixed(1)}`} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.[0]) return null;
                  const value = payload[0].value;
                  return (
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-500">{label}</p>
                      <p className="text-lg font-medium flex items-center gap-2">
                        {value > 0 ? (
                          <TrendingUp className="w-4 h-4 text-red-500" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-blue-500" />
                        )}
                        {value?.toFixed(2)}°C/min
                      </p>
                    </div>
                  );
                }}
              />
              <ReferenceLine y={0} stroke="#666" />
              <ReferenceLine
                y={3}
                stroke="#f59e0b"
                strokeDasharray="5 5"
                label={{ value: 'Max Rate', fontSize: 10 }}
              />
              <ReferenceLine
                y={-6}
                stroke="#3b82f6"
                strokeDasharray="5 5"
                label={{ value: 'Max Cooling', fontSize: 10 }}
              />
              <Area
                type="monotone"
                dataKey="rateOfChange"
                stroke="#3b82f6"
                fill="url(#rateGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
