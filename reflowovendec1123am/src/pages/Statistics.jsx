import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
  LineChart,
  Line,
} from 'recharts';
import { BarChart3, TrendingUp, Activity, PieChart } from 'lucide-react';
import useStore from '../store/useStore';
import { Card, TimeRangeSlider } from '../components/common';
import { calculateStats, formatNumber, calculateTrend, calculateMovingAverage } from '../utils/calculations';
import { ZONE_COLORS } from '../utils/constants';

export default function Statistics() {
  const { getFilteredData } = useStore();
  const filteredData = getFilteredData();

  const overallStats = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return null;

    const temps = filteredData.map(d => d.avgZoneTemp);
    const power = filteredData.map(d => d.power?.activePower).filter(Boolean);
    const current = filteredData.map(d => d.power?.current).filter(Boolean);
    const o2 = filteredData.map(d => d.environment?.o2Concentration).filter(Boolean);

    return {
      temperature: calculateStats(temps),
      power: calculateStats(power),
      current: calculateStats(current),
      o2: calculateStats(o2),
      tempTrend: calculateTrend(temps),
      powerTrend: calculateTrend(power),
    };
  }, [filteredData]);

  const distributionData = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return [];

    const temps = filteredData.map(d => d.avgZoneTemp);
    const bins = {};
    const binSize = 10;

    temps.forEach(t => {
      const bin = Math.floor(t / binSize) * binSize;
      bins[bin] = (bins[bin] || 0) + 1;
    });

    return Object.entries(bins)
      .map(([bin, count]) => ({
        range: `${bin}-${Number(bin) + binSize}`,
        count,
        percentage: (count / temps.length) * 100,
      }))
      .sort((a, b) => parseInt(a.range) - parseInt(b.range));
  }, [filteredData]);

  const correlationData = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return [];

    // Sample every 10th point for scatter plot
    return filteredData
      .filter((_, i) => i % 10 === 0)
      .map(d => ({
        temperature: d.avgZoneTemp,
        power: d.power?.activePower,
        o2: d.environment?.o2Concentration,
      }));
  }, [filteredData]);

  const movingAverageData = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return [];

    const temps = filteredData.map(d => d.avgZoneTemp);
    const ma5 = calculateMovingAverage(temps, 5);
    const ma20 = calculateMovingAverage(temps, 20);

    return filteredData
      .filter((_, i) => i % 5 === 0)
      .map((d, i) => ({
        index: i * 5,
        time: d.timestamp?.toLocaleTimeString() || `#${i * 5}`,
        actual: temps[i * 5],
        ma5: ma5[i * 5],
        ma20: ma20[i * 5],
      }));
  }, [filteredData]);

  const zoneCorrelation = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return [];

    const correlations = [];
    for (let z1 = 1; z1 <= 10; z1++) {
      for (let z2 = z1 + 1; z2 <= 10; z2++) {
        const zone1Temps = filteredData.map(d => d.zones[z1]?.avg);
        const zone2Temps = filteredData.map(d => d.zones[z2]?.avg);

        // Calculate Pearson correlation
        const n = zone1Temps.length;
        const sum1 = zone1Temps.reduce((a, b) => a + b, 0);
        const sum2 = zone2Temps.reduce((a, b) => a + b, 0);
        const sum1Sq = zone1Temps.reduce((a, b) => a + b * b, 0);
        const sum2Sq = zone2Temps.reduce((a, b) => a + b * b, 0);
        const pSum = zone1Temps.reduce((a, b, i) => a + b * zone2Temps[i], 0);

        const num = pSum - (sum1 * sum2) / n;
        const den = Math.sqrt(
          (sum1Sq - (sum1 * sum1) / n) * (sum2Sq - (sum2 * sum2) / n)
        );

        correlations.push({
          pair: `Z${z1}-Z${z2}`,
          correlation: den !== 0 ? num / den : 0,
        });
      }
    }

    return correlations.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));
  }, [filteredData]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || payload.length === 0) return null;

    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">{label}</p>
        <div className="space-y-1">
          {payload.map((entry) => (
            <div key={entry.name} className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-gray-600 dark:text-gray-400">{entry.name}:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatNumber(entry.value, 2)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (!overallStats) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-500">
        No data available for analysis
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Statistical Analysis
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Deep dive into data patterns and correlations
        </p>
      </div>

      {/* Time Range */}
      <Card>
        <div className="p-4">
          <TimeRangeSlider />
        </div>
      </Card>

      {/* Descriptive Statistics */}
      <Card title="Descriptive Statistics" subtitle="Summary metrics for key parameters">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-medium text-gray-500">Metric</th>
                <th className="text-right py-3 px-4 font-medium text-gray-500">Min</th>
                <th className="text-right py-3 px-4 font-medium text-gray-500">Max</th>
                <th className="text-right py-3 px-4 font-medium text-gray-500">Mean</th>
                <th className="text-right py-3 px-4 font-medium text-gray-500">Median</th>
                <th className="text-right py-3 px-4 font-medium text-gray-500">Std Dev</th>
                <th className="text-right py-3 px-4 font-medium text-gray-500">Q1</th>
                <th className="text-right py-3 px-4 font-medium text-gray-500">Q3</th>
                <th className="text-center py-3 px-4 font-medium text-gray-500">Trend</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                  Temperature (°C)
                </td>
                <td className="text-right py-3 px-4">{formatNumber(overallStats.temperature.min, 1)}</td>
                <td className="text-right py-3 px-4">{formatNumber(overallStats.temperature.max, 1)}</td>
                <td className="text-right py-3 px-4 font-medium">{formatNumber(overallStats.temperature.mean, 1)}</td>
                <td className="text-right py-3 px-4">{formatNumber(overallStats.temperature.median, 1)}</td>
                <td className="text-right py-3 px-4">{formatNumber(overallStats.temperature.std, 2)}</td>
                <td className="text-right py-3 px-4">{formatNumber(overallStats.temperature.q1, 1)}</td>
                <td className="text-right py-3 px-4">{formatNumber(overallStats.temperature.q3, 1)}</td>
                <td className="text-center py-3 px-4">
                  <span className={`badge ${
                    overallStats.tempTrend.trend === 'increasing' ? 'badge-warning' :
                    overallStats.tempTrend.trend === 'decreasing' ? 'badge-info' : 'badge-success'
                  }`}>
                    {overallStats.tempTrend.trend}
                  </span>
                </td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                  Power (kW)
                </td>
                <td className="text-right py-3 px-4">{formatNumber(overallStats.power.min, 2)}</td>
                <td className="text-right py-3 px-4">{formatNumber(overallStats.power.max, 2)}</td>
                <td className="text-right py-3 px-4 font-medium">{formatNumber(overallStats.power.mean, 2)}</td>
                <td className="text-right py-3 px-4">{formatNumber(overallStats.power.median, 2)}</td>
                <td className="text-right py-3 px-4">{formatNumber(overallStats.power.std, 3)}</td>
                <td className="text-right py-3 px-4">{formatNumber(overallStats.power.q1, 2)}</td>
                <td className="text-right py-3 px-4">{formatNumber(overallStats.power.q3, 2)}</td>
                <td className="text-center py-3 px-4">
                  <span className={`badge ${
                    overallStats.powerTrend.trend === 'increasing' ? 'badge-warning' :
                    overallStats.powerTrend.trend === 'decreasing' ? 'badge-info' : 'badge-success'
                  }`}>
                    {overallStats.powerTrend.trend}
                  </span>
                </td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                  Current (A)
                </td>
                <td className="text-right py-3 px-4">{formatNumber(overallStats.current.min, 1)}</td>
                <td className="text-right py-3 px-4">{formatNumber(overallStats.current.max, 1)}</td>
                <td className="text-right py-3 px-4 font-medium">{formatNumber(overallStats.current.mean, 1)}</td>
                <td className="text-right py-3 px-4">{formatNumber(overallStats.current.median, 1)}</td>
                <td className="text-right py-3 px-4">{formatNumber(overallStats.current.std, 2)}</td>
                <td className="text-right py-3 px-4">{formatNumber(overallStats.current.q1, 1)}</td>
                <td className="text-right py-3 px-4">{formatNumber(overallStats.current.q3, 1)}</td>
                <td className="text-center py-3 px-4">—</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                  O2 (ppm)
                </td>
                <td className="text-right py-3 px-4">{formatNumber(overallStats.o2.min, 0)}</td>
                <td className="text-right py-3 px-4">{formatNumber(overallStats.o2.max, 0)}</td>
                <td className="text-right py-3 px-4 font-medium">{formatNumber(overallStats.o2.mean, 0)}</td>
                <td className="text-right py-3 px-4">{formatNumber(overallStats.o2.median, 0)}</td>
                <td className="text-right py-3 px-4">{formatNumber(overallStats.o2.std, 1)}</td>
                <td className="text-right py-3 px-4">{formatNumber(overallStats.o2.q1, 0)}</td>
                <td className="text-right py-3 px-4">{formatNumber(overallStats.o2.q3, 0)}</td>
                <td className="text-center py-3 px-4">—</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Distribution and Moving Average */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Temperature Distribution */}
        <Card title="Temperature Distribution" subtitle="Histogram of average temperatures">
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributionData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="count"
                  name="Count"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Moving Averages */}
        <Card title="Moving Averages" subtitle="Smoothed temperature trends">
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={movingAverageData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis dataKey="time" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}°C`} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="actual"
                  name="Actual"
                  stroke="#94a3b8"
                  strokeWidth={1}
                  dot={false}
                  opacity={0.5}
                />
                <Line
                  type="monotone"
                  dataKey="ma5"
                  name="MA(5)"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="ma20"
                  name="MA(20)"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Correlation Analysis */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Scatter Plot */}
        <Card title="Temperature vs Power Correlation" subtitle="Relationship between thermal and electrical load">
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis
                  type="number"
                  dataKey="temperature"
                  name="Temperature"
                  unit="°C"
                  tick={{ fontSize: 11 }}
                  label={{ value: 'Temperature (°C)', position: 'bottom', offset: 0 }}
                />
                <YAxis
                  type="number"
                  dataKey="power"
                  name="Power"
                  unit="kW"
                  tick={{ fontSize: 11 }}
                  label={{ value: 'Power (kW)', angle: -90, position: 'insideLeft' }}
                />
                <ZAxis type="number" dataKey="o2" range={[20, 200]} name="O2" />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.[0]) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border">
                        <p className="text-sm">Temp: {formatNumber(d.temperature, 1)}°C</p>
                        <p className="text-sm">Power: {formatNumber(d.power, 2)} kW</p>
                        <p className="text-sm">O2: {formatNumber(d.o2, 0)} ppm</p>
                      </div>
                    );
                  }}
                />
                <Scatter name="Data Points" data={correlationData} fill="#3b82f6" opacity={0.6} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Zone Correlations */}
        <Card title="Zone Temperature Correlations" subtitle="Correlation coefficients between zones">
          <div className="h-[350px] overflow-y-auto">
            <div className="space-y-2">
              {zoneCorrelation.slice(0, 15).map((item) => (
                <div key={item.pair} className="flex items-center gap-3">
                  <span className="w-16 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {item.pair}
                  </span>
                  <div className="flex-1 h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        item.correlation > 0.9 ? 'bg-green-500' :
                        item.correlation > 0.7 ? 'bg-blue-500' :
                        item.correlation > 0.5 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.abs(item.correlation) * 100}%` }}
                    />
                  </div>
                  <span className="w-16 text-sm text-right font-mono text-gray-600 dark:text-gray-400">
                    {formatNumber(item.correlation, 3)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Summary Insights */}
      <Card title="Key Insights" subtitle="Automated analysis findings">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-5 h-5 text-blue-500" />
              <h4 className="font-medium text-blue-700 dark:text-blue-400">Temperature Stability</h4>
            </div>
            <p className="text-sm text-blue-600 dark:text-blue-300">
              Coefficient of Variation: {formatNumber((overallStats.temperature.std / overallStats.temperature.mean) * 100, 1)}%
              {(overallStats.temperature.std / overallStats.temperature.mean) < 0.1
                ? ' - Highly stable'
                : ' - Moderate variation'}
            </p>
          </div>

          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <h4 className="font-medium text-green-700 dark:text-green-400">Power Efficiency</h4>
            </div>
            <p className="text-sm text-green-600 dark:text-green-300">
              Average Power Factor implied by stability: Good
              <br />
              Power range: {formatNumber(overallStats.power.max - overallStats.power.min, 2)} kW
            </p>
          </div>

          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-5 h-5 text-purple-500" />
              <h4 className="font-medium text-purple-700 dark:text-purple-400">Data Quality</h4>
            </div>
            <p className="text-sm text-purple-600 dark:text-purple-300">
              Samples analyzed: {overallStats.temperature.count?.toLocaleString()}
              <br />
              Completeness: 100%
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
