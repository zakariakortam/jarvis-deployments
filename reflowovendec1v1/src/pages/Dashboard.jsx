import { useMemo } from 'react';
import {
  Thermometer,
  Zap,
  Factory,
  AlertTriangle,
  Activity,
  Clock,
  TrendingUp,
  Gauge,
} from 'lucide-react';
import useStore from '../store/useStore';
import { Card, StatCard, TimeRangeSlider } from '../components/common';
import {
  TemperatureLineChart,
  PowerChart,
  ZoneHeatmap,
  GaugeChart,
} from '../components/charts';
import { calculateStats, formatNumber, formatTemperature } from '../utils/calculations';

export default function Dashboard() {
  const {
    data,
    metadata,
    selectedTimeRange,
    selectedZones,
    getFilteredData,
    isUsingMockData,
  } = useStore();

  const filteredData = getFilteredData();

  const stats = useMemo(() => {
    if (!filteredData || filteredData.length === 0) {
      return {
        avgTemp: 0,
        maxTemp: 0,
        avgPower: 0,
        totalEnergy: 0,
        boardsProduced: 0,
        alarms: 0,
        powerFactor: 0,
        efficiency: 0,
      };
    }

    const temps = filteredData.map((d) => d.avgZoneTemp);
    const power = filteredData.map((d) => d.power?.activePower || 0);
    const pf = filteredData.map((d) => d.power?.powerFactor || 0);

    const last = filteredData[filteredData.length - 1];
    const first = filteredData[0];

    return {
      avgTemp: calculateStats(temps).mean,
      maxTemp: calculateStats(temps).max,
      avgPower: calculateStats(power).mean,
      totalEnergy: last?.power?.cumulativeEnergy - (first?.power?.cumulativeEnergy || 0),
      boardsProduced: last?.production?.boardsProduced || 0,
      alarms: filteredData.reduce((sum, d) => sum + (d.equipment?.alarms || 0), 0),
      powerFactor: calculateStats(pf).mean,
      efficiency: last?.production?.boardsProduced
        ? (last.power.cumulativeEnergy / last.production.boardsProduced).toFixed(3)
        : 0,
    };
  }, [filteredData]);

  const currentData = filteredData[filteredData.length - 1];

  return (
    <div className="space-y-6 animate-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Real-time reflow oven monitoring and analytics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${currentData?.equipment?.status === 'Operating' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
            {currentData?.equipment?.status || 'Unknown'}
          </span>
        </div>
      </div>

      {/* Time Range Selector */}
      <Card>
        <div className="p-4">
          <TimeRangeSlider />
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Avg Temperature"
          value={formatNumber(stats.avgTemp, 1)}
          unit="°C"
          icon={Thermometer}
          iconColor="text-orange-500"
          trend={stats.avgTemp > 180 ? 'up' : 'stable'}
        />
        <StatCard
          title="Max Temperature"
          value={formatNumber(stats.maxTemp, 1)}
          unit="°C"
          icon={Activity}
          iconColor="text-red-500"
          changeType={stats.maxTemp > 250 ? 'negative' : 'positive'}
        />
        <StatCard
          title="Avg Power"
          value={formatNumber(stats.avgPower, 2)}
          unit="kW"
          icon={Zap}
          iconColor="text-yellow-500"
        />
        <StatCard
          title="Total Energy"
          value={formatNumber(stats.totalEnergy, 2)}
          unit="kWh"
          icon={Gauge}
          iconColor="text-blue-500"
        />
      </div>

      {/* Second Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Boards Produced"
          value={stats.boardsProduced}
          icon={Factory}
          iconColor="text-green-500"
          trend="up"
        />
        <StatCard
          title="Alarms"
          value={stats.alarms}
          icon={AlertTriangle}
          iconColor={stats.alarms > 10 ? 'text-red-500' : 'text-gray-500'}
          changeType={stats.alarms > 10 ? 'negative' : 'positive'}
        />
        <StatCard
          title="Power Factor"
          value={formatNumber(stats.powerFactor, 3)}
          icon={TrendingUp}
          iconColor="text-purple-500"
          changeType={stats.powerFactor > 0.9 ? 'positive' : 'negative'}
        />
        <StatCard
          title="Energy/Board"
          value={stats.efficiency}
          unit="kWh"
          icon={Clock}
          iconColor="text-cyan-500"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Temperature Chart */}
        <Card title="Temperature Profile" subtitle="All zones over time">
          <TemperatureLineChart
            data={filteredData}
            selectedZones={selectedZones.slice(0, 5)}
            height={350}
          />
        </Card>

        {/* Power Chart */}
        <Card title="Power Consumption" subtitle="Active and reactive power">
          <PowerChart data={filteredData} height={350} />
        </Card>
      </div>

      {/* Heatmap and Gauges */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Zone Heatmap */}
        <Card
          title="Zone Temperature Heatmap"
          subtitle="Temperature distribution across zones"
          className="xl:col-span-2"
        >
          <ZoneHeatmap data={filteredData} height={200} />
        </Card>

        {/* Current Readings Gauges */}
        <Card title="Current Readings" subtitle="Real-time values">
          <div className="flex flex-wrap justify-center gap-4">
            <GaugeChart
              value={currentData?.avgZoneTemp || 0}
              min={0}
              max={300}
              thresholds={{ warning: 220, danger: 260 }}
              label="Avg Temp"
              unit="°C"
              size={140}
            />
            <GaugeChart
              value={currentData?.power?.activePower || 0}
              min={0}
              max={60}
              thresholds={{ warning: 40, danger: 50 }}
              label="Power"
              unit="kW"
              size={140}
            />
            <GaugeChart
              value={(currentData?.power?.powerFactor || 0) * 100}
              min={0}
              max={100}
              thresholds={{ warning: 95, danger: 90 }}
              label="PF"
              unit="%"
              size={140}
            />
          </div>
        </Card>
      </div>

      {/* Equipment Status */}
      <Card title="Equipment Status" subtitle="Current operational parameters">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400">Conveyor Speed</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
              {currentData?.equipment?.conveyorSpeed || 0} m/min
            </p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400">Conveyor Width</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
              {currentData?.equipment?.conveyorWidth || 0} mm
            </p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400">Boards Inside</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
              {currentData?.production?.boardsInside || 0}
            </p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400">O2 Concentration</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
              {formatNumber(currentData?.environment?.o2Concentration, 0) || 0} ppm
            </p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400">Flow Rate</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
              {formatNumber(currentData?.environment?.flowRate, 1) || 0} L/min
            </p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400">Product</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
              {currentData?.production?.productNumber || '—'}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
