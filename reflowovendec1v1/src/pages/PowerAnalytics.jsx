import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  Bar,
  ReferenceLine,
} from 'recharts';
import { Zap, Activity, Gauge, TrendingUp, Battery, Clock } from 'lucide-react';
import useStore from '../store/useStore';
import { Card, StatCard, TimeRangeSlider } from '../components/common';
import { calculateStats, downsample, formatNumber } from '../utils/calculations';

const POWER_COLORS = {
  active: '#3b82f6',
  reactive: '#f59e0b',
  apparent: '#8b5cf6',
};

export default function PowerAnalytics() {
  const { getFilteredData } = useStore();
  const filteredData = getFilteredData();

  const chartData = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return [];

    const processed = filteredData.map((d, i) => ({
      index: i,
      time: d.timestamp?.toLocaleTimeString() || `#${i}`,
      activePower: d.power?.activePower,
      reactivePower: d.power?.reactivePower,
      apparentPower: d.power?.apparentPower,
      powerFactor: (d.power?.powerFactor || 0) * 100,
      current: d.power?.current,
      voltage: d.power?.voltage,
      cumulativeEnergy: d.power?.cumulativeEnergy,
      frequency: d.power?.frequency,
    }));

    return downsample(processed, 200);
  }, [filteredData]);

  const stats = useMemo(() => {
    if (!filteredData || filteredData.length === 0) {
      return {
        activePower: { mean: 0, max: 0, min: 0 },
        reactivePower: { mean: 0 },
        powerFactor: { mean: 0 },
        current: { mean: 0, max: 0 },
        totalEnergy: 0,
        energyRate: 0,
      };
    }

    const first = filteredData[0];
    const last = filteredData[filteredData.length - 1];
    const duration = (last.timestamp - first.timestamp) / (1000 * 60 * 60); // hours

    return {
      activePower: calculateStats(filteredData.map(d => d.power?.activePower).filter(Boolean)),
      reactivePower: calculateStats(filteredData.map(d => d.power?.reactivePower).filter(Boolean)),
      powerFactor: calculateStats(filteredData.map(d => d.power?.powerFactor).filter(Boolean)),
      current: calculateStats(filteredData.map(d => d.power?.current).filter(Boolean)),
      totalEnergy: last.power?.cumulativeEnergy - first.power?.cumulativeEnergy,
      energyRate: duration > 0 ? (last.power?.cumulativeEnergy - first.power?.cumulativeEnergy) / duration : 0,
    };
  }, [filteredData]);

  const powerDistribution = useMemo(() => {
    return [
      { name: 'Active Power', value: stats.activePower.mean, color: POWER_COLORS.active },
      { name: 'Reactive Power', value: stats.reactivePower.mean, color: POWER_COLORS.reactive },
    ];
  }, [stats]);

  const hourlyConsumption = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return [];

    const hourly = {};
    filteredData.forEach((d) => {
      const hour = d.timestamp?.getHours() || 0;
      if (!hourly[hour]) {
        hourly[hour] = { hour: `${hour}:00`, totalPower: 0, count: 0, energy: 0 };
      }
      hourly[hour].totalPower += d.power?.activePower || 0;
      hourly[hour].count++;
    });

    return Object.values(hourly).map(h => ({
      ...h,
      avgPower: h.totalPower / h.count,
    }));
  }, [filteredData]);

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
                {formatNumber(entry.value, 2)}
                {entry.name.includes('Power') ? ' kW' : entry.name.includes('Factor') ? '%' : ''}
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Power Analytics
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Energy consumption and electrical parameters analysis
        </p>
      </div>

      {/* Time Range */}
      <Card>
        <div className="p-4">
          <TimeRangeSlider />
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Avg Active Power"
          value={formatNumber(stats.activePower.mean, 2)}
          unit="kW"
          icon={Zap}
          iconColor="text-blue-500"
        />
        <StatCard
          title="Peak Power"
          value={formatNumber(stats.activePower.max, 2)}
          unit="kW"
          icon={Activity}
          iconColor="text-red-500"
        />
        <StatCard
          title="Power Factor"
          value={formatNumber(stats.powerFactor.mean * 100, 1)}
          unit="%"
          icon={Gauge}
          iconColor="text-purple-500"
          changeType={stats.powerFactor.mean > 0.9 ? 'positive' : 'negative'}
        />
        <StatCard
          title="Total Energy"
          value={formatNumber(stats.totalEnergy, 2)}
          unit="kWh"
          icon={Battery}
          iconColor="text-green-500"
        />
      </div>

      {/* Power Over Time */}
      <Card title="Power Consumption Over Time" subtitle="Active, reactive, and apparent power">
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="activeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={POWER_COLORS.active} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={POWER_COLORS.active} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="reactiveGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={POWER_COLORS.reactive} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={POWER_COLORS.reactive} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis dataKey="time" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v} kW`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <ReferenceLine y={50} stroke="#ef4444" strokeDasharray="5 5" label="High" />
              <Area
                type="monotone"
                dataKey="activePower"
                name="Active Power"
                stroke={POWER_COLORS.active}
                fill="url(#activeGradient)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="reactivePower"
                name="Reactive Power"
                stroke={POWER_COLORS.reactive}
                fill="url(#reactiveGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Power Factor and Current */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card title="Power Factor" subtitle="Efficiency indicator (target > 90%)">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis dataKey="time" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                <YAxis domain={[90, 100]} tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={95} stroke="#10b981" strokeDasharray="5 5" label="Target" />
                <ReferenceLine y={90} stroke="#f59e0b" strokeDasharray="5 5" label="Min" />
                <Line
                  type="monotone"
                  dataKey="powerFactor"
                  name="Power Factor"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Current Draw" subtitle="Electrical current over time">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="currentGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis dataKey="time" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v} A`} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.[0]) return null;
                    return (
                      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border">
                        <p className="text-sm text-gray-500">{label}</p>
                        <p className="text-lg font-medium">{formatNumber(payload[0].value, 2)} A</p>
                      </div>
                    );
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="current"
                  name="Current"
                  stroke="#10b981"
                  fill="url(#currentGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Cumulative Energy and Hourly */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card title="Cumulative Energy" subtitle="Total energy consumption over time">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis dataKey="time" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v.toFixed(1)} kWh`} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.[0]) return null;
                    return (
                      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border">
                        <p className="text-sm text-gray-500">{label}</p>
                        <p className="text-lg font-medium">{formatNumber(payload[0].value, 3)} kWh</p>
                      </div>
                    );
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="cumulativeEnergy"
                  name="Cumulative Energy"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Hourly Power Profile" subtitle="Average power consumption by hour">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={hourlyConsumption}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v.toFixed(0)} kW`} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.[0]) return null;
                    return (
                      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border">
                        <p className="text-sm text-gray-500">{label}</p>
                        <p className="text-lg font-medium">{formatNumber(payload[0].value, 2)} kW avg</p>
                        <p className="text-xs text-gray-400">{payload[0].payload.count} samples</p>
                      </div>
                    );
                  }}
                />
                <Bar
                  dataKey="avgPower"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                  name="Avg Power"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Power Quality Metrics */}
      <Card title="Power Quality Summary" subtitle="Key electrical parameters">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">Voltage</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {filteredData[filteredData.length - 1]?.power?.voltage || 0} V
            </p>
            <p className="text-xs text-green-500 mt-1">Stable</p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">Frequency</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {filteredData[filteredData.length - 1]?.power?.frequency || 0} Hz
            </p>
            <p className="text-xs text-green-500 mt-1">Normal</p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">Max Current</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {formatNumber(stats.current.max, 1)} A
            </p>
            <p className="text-xs text-gray-400 mt-1">Peak</p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">Energy Rate</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {formatNumber(stats.energyRate, 2)}
            </p>
            <p className="text-xs text-gray-400 mt-1">kWh/hr</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
