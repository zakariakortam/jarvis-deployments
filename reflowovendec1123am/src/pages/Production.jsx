import { useMemo } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Factory, Package, Clock, AlertTriangle, TrendingUp, Gauge } from 'lucide-react';
import useStore from '../store/useStore';
import { Card, StatCard, TimeRangeSlider } from '../components/common';
import { calculateStats, formatNumber, downsample } from '../utils/calculations';

const STATUS_COLORS = {
  Operating: '#10b981',
  Idle: '#6b7280',
  Maintenance: '#f59e0b',
  Error: '#ef4444',
};

export default function Production() {
  const { getFilteredData, metadata } = useStore();
  const filteredData = getFilteredData();

  const stats = useMemo(() => {
    if (!filteredData || filteredData.length === 0) {
      return {
        totalBoards: 0,
        boardsInRange: 0,
        avgBoardsInside: 0,
        totalAlarms: 0,
        avgConveyorSpeed: 0,
        uptime: 0,
        products: [],
      };
    }

    const last = filteredData[filteredData.length - 1];
    const first = filteredData[0];

    const operatingCount = filteredData.filter(d => d.equipment?.status === 'Operating').length;

    return {
      totalBoards: last.production?.boardsProduced || 0,
      boardsInRange: (last.production?.boardsProduced || 0) - (first.production?.boardsProduced || 0),
      avgBoardsInside: calculateStats(filteredData.map(d => d.production?.boardsInside).filter(Boolean)).mean,
      totalAlarms: filteredData.reduce((sum, d) => sum + (d.equipment?.alarms || 0), 0),
      avgConveyorSpeed: calculateStats(filteredData.map(d => d.equipment?.conveyorSpeed).filter(Boolean)).mean,
      uptime: (operatingCount / filteredData.length) * 100,
      products: [...new Set(filteredData.map(d => d.production?.productNumber).filter(Boolean))],
    };
  }, [filteredData]);

  const productionOverTime = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return [];

    const processed = filteredData.map((d, i) => ({
      index: i,
      time: d.timestamp?.toLocaleTimeString() || `#${i}`,
      boardsProduced: d.production?.boardsProduced,
      boardsInside: d.production?.boardsInside,
      alarms: d.equipment?.alarms,
      conveyorSpeed: d.equipment?.conveyorSpeed,
    }));

    return downsample(processed, 200);
  }, [filteredData]);

  const statusDistribution = useMemo(() => {
    const counts = {};
    filteredData.forEach(d => {
      const status = d.equipment?.status || 'Unknown';
      counts[status] = (counts[status] || 0) + 1;
    });

    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      percentage: (value / filteredData.length) * 100,
      color: STATUS_COLORS[name] || '#6b7280',
    }));
  }, [filteredData]);

  const hourlyProduction = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return [];

    const hourly = {};
    filteredData.forEach((d, index) => {
      const hour = d.timestamp?.getHours() || 0;
      if (!hourly[hour]) {
        hourly[hour] = {
          hour: `${hour}:00`,
          boards: 0,
          alarms: 0,
          firstBoards: d.production?.boardsProduced || 0,
          lastBoards: d.production?.boardsProduced || 0,
        };
      }
      hourly[hour].lastBoards = d.production?.boardsProduced || 0;
      hourly[hour].alarms += d.equipment?.alarms || 0;
    });

    return Object.values(hourly).map(h => ({
      ...h,
      boards: h.lastBoards - h.firstBoards,
    }));
  }, [filteredData]);

  const alarmTrend = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return [];

    const step = Math.max(1, Math.floor(filteredData.length / 50));
    const trend = [];

    for (let i = 0; i < filteredData.length; i += step) {
      const slice = filteredData.slice(i, i + step);
      const totalAlarms = slice.reduce((sum, d) => sum + (d.equipment?.alarms || 0), 0);
      trend.push({
        time: filteredData[i]?.timestamp?.toLocaleTimeString() || `#${i}`,
        alarms: totalAlarms,
        cumulative: (trend[trend.length - 1]?.cumulative || 0) + totalAlarms,
      });
    }

    return trend;
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
              <span className="font-medium text-gray-900 dark:text-white">{formatNumber(entry.value, 1)}</span>
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
          Production Metrics
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Manufacturing output and equipment performance
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
          title="Total Boards"
          value={stats.totalBoards}
          icon={Factory}
          iconColor="text-blue-500"
        />
        <StatCard
          title="Boards in Range"
          value={stats.boardsInRange}
          icon={Package}
          iconColor="text-green-500"
          trend="up"
        />
        <StatCard
          title="Uptime"
          value={formatNumber(stats.uptime, 1)}
          unit="%"
          icon={Clock}
          iconColor="text-purple-500"
          changeType={stats.uptime > 90 ? 'positive' : 'negative'}
        />
        <StatCard
          title="Total Alarms"
          value={stats.totalAlarms}
          icon={AlertTriangle}
          iconColor={stats.totalAlarms > 50 ? 'text-red-500' : 'text-yellow-500'}
          changeType={stats.totalAlarms > 50 ? 'negative' : 'positive'}
        />
      </div>

      {/* Production Over Time */}
      <Card title="Production Timeline" subtitle="Boards produced and in-process over time">
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={productionOverTime}>
              <defs>
                <linearGradient id="boardsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis dataKey="time" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="boardsProduced"
                name="Boards Produced"
                stroke="#3b82f6"
                fill="url(#boardsGradient)"
                strokeWidth={2}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="boardsInside"
                name="Boards Inside"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Status and Hourly Production */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card title="Equipment Status" subtitle="Time distribution by status">
          <div className="flex items-center justify-center gap-8">
            <div className="h-[250px] w-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.[0]) return null;
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border">
                          <p className="font-medium" style={{ color: data.color }}>{data.name}</p>
                          <p className="text-sm text-gray-500">{formatNumber(data.percentage, 1)}%</p>
                        </div>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              {statusDistribution.map((status) => (
                <div key={status.name} className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: status.color }} />
                  <span className="text-sm text-gray-600 dark:text-gray-400 w-24">{status.name}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatNumber(status.percentage, 1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Hourly Production */}
        <Card title="Hourly Production" subtitle="Boards produced per hour">
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyProduction}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="boards" name="Boards" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Alarms */}
      <Card title="Alarm Trend" subtitle="Alarm occurrences over time">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={alarmTrend}>
              <defs>
                <linearGradient id="alarmGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis dataKey="time" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="alarms"
                name="Alarms"
                stroke="#ef4444"
                fill="url(#alarmGradient)"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="cumulative"
                name="Cumulative"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Production Details */}
      <Card title="Production Details" subtitle="Current operational parameters">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400">Conveyor Speed</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {formatNumber(stats.avgConveyorSpeed, 2)} m/min
            </p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400">Avg Boards Inside</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {formatNumber(stats.avgBoardsInside, 1)}
            </p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400">Active Products</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {stats.products.length}
            </p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400">Product Numbers</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white mt-2">
              {stats.products.join(', ') || '—'}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
