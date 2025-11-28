import { useMemo } from 'react';
import { Card, MetricCard } from '../components/Card';
import { LineChartComponent } from '../components/Charts/LineChartComponent';
import { BarChartComponent } from '../components/Charts/BarChartComponent';
import { GaugeChart } from '../components/Charts/GaugeChart';
import { Badge } from '../components/Badge';
import useFactoryStore from '../store/useFactoryStore';
import { useHistoricalData } from '../hooks/useHistoricalData';
import { formatTemperature, formatPercentage, getStatusColor } from '../utils/formatters';
import {
  CpuChipIcon,
  BoltIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

export const Dashboard = () => {
  const machines = useFactoryStore(state => state.machines);
  const getKPIs = useFactoryStore(state => state.getKPIs);
  const getAlarmStats = useFactoryStore(state => state.getAlarmStats);
  const selectMachine = useFactoryStore(state => state.selectMachine);

  const kpis = getKPIs();
  const alarmStats = getAlarmStats();

  // Get historical data for the first machine for demo
  const firstMachine = machines[0];
  const { data: historicalData } = useHistoricalData(
    firstMachine?.id,
    Date.now() - 3600000,
    Date.now()
  );

  // Prepare data for comparison chart
  const comparisonData = useMemo(() => {
    return machines.map(m => ({
      name: m.id,
      efficiency: m.efficiency,
      throughput: m.throughput / 10,
      energy: m.energyUsage,
    }));
  }, [machines]);

  // Prepare real-time data
  const realtimeData = useMemo(() => {
    if (historicalData.length === 0) return [];
    return historicalData.slice(-20).map(point => ({
      timestamp: point.timestamp,
      temp: point.temperature,
      efficiency: point.efficiency,
      energy: point.energyUsage,
    }));
  }, [historicalData]);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Machines"
          value={kpis.totalMachines}
          subtitle={`${kpis.runningMachines} running, ${kpis.idleMachines} idle`}
          icon={CpuChipIcon}
          color="primary"
        />
        <MetricCard
          title="Average Efficiency"
          value={`${kpis.avgEfficiency}%`}
          subtitle="Across all machines"
          icon={ChartBarIcon}
          color="success"
        />
        <MetricCard
          title="Total Energy"
          value={`${kpis.totalEnergy} kW`}
          subtitle="Current consumption"
          icon={BoltIcon}
          color="warning"
        />
        <MetricCard
          title="Active Alarms"
          value={alarmStats.unacknowledged}
          subtitle={`${alarmStats.critical} critical`}
          icon={ExclamationTriangleIcon}
          color="danger"
        />
      </div>

      {/* Real-time Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Real-time Sensor Data">
          {realtimeData.length > 0 ? (
            <LineChartComponent
              data={realtimeData}
              lines={[
                { key: 'temp', name: 'Temperature (°C)', color: '#ef4444' },
                { key: 'efficiency', name: 'Efficiency (%)', color: '#10b981' },
              ]}
              height={300}
            />
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Collecting data...
            </div>
          )}
        </Card>

        <Card title="Machine Comparison">
          <BarChartComponent
            data={comparisonData}
            bars={[
              { key: 'efficiency', name: 'Efficiency (%)', color: '#3b82f6' },
              { key: 'energy', name: 'Energy (kW)', color: '#f59e0b' },
            ]}
            xAxisKey="name"
            height={300}
          />
        </Card>
      </div>

      {/* Performance Gauges */}
      <Card title="Key Performance Indicators">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <GaugeChart
            value={parseFloat(kpis.avgEfficiency)}
            max={100}
            title="Avg Efficiency"
            unit="%"
            color={parseFloat(kpis.avgEfficiency) > 80 ? 'success' : 'warning'}
          />
          <GaugeChart
            value={parseFloat(kpis.avgUptime)}
            max={100}
            title="Avg Uptime"
            unit="%"
            color={parseFloat(kpis.avgUptime) > 85 ? 'success' : 'warning'}
          />
          <GaugeChart
            value={parseFloat(kpis.avgScrapRate)}
            max={10}
            title="Scrap Rate"
            unit="%"
            color={parseFloat(kpis.avgScrapRate) < 3 ? 'success' : 'danger'}
          />
          <GaugeChart
            value={parseFloat(kpis.totalEnergy)}
            max={200}
            title="Energy Usage"
            unit=" kW"
            color="primary"
          />
        </div>
      </Card>

      {/* Machine Status Grid */}
      <Card title="Machine Status Overview">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {machines.map((machine) => (
            <div
              key={machine.id}
              onClick={() => selectMachine(machine.id)}
              className="p-4 rounded-lg border border-border hover:border-primary cursor-pointer transition-colors bg-card"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">{machine.id}</span>
                <Badge
                  variant={
                    machine.status === 'running' ? 'success' :
                    machine.status === 'idle' ? 'secondary' : 'danger'
                  }
                  size="sm"
                >
                  {machine.status}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground mb-3">{machine.name}</div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Temp:</span>
                  <span className="font-medium">{formatTemperature(machine.temperature)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Efficiency:</span>
                  <span className="font-medium">{formatPercentage(machine.efficiency)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Throughput:</span>
                  <span className="font-medium">{machine.throughput}</span>
                </div>
              </div>
              {/* Mini trend indicator */}
              <div className="mt-3 h-8">
                <div className="w-full h-full bg-primary/10 rounded relative overflow-hidden">
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-primary transition-all duration-500"
                    style={{ height: `${machine.efficiency}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Energy Consumption Trend */}
      <Card title="Energy Consumption Trend">
        {realtimeData.length > 0 ? (
          <LineChartComponent
            data={realtimeData}
            lines={[
              { key: 'energy', name: 'Energy (kW)', color: '#f59e0b' },
            ]}
            height={250}
          />
        ) : (
          <div className="h-[250px] flex items-center justify-center text-muted-foreground">
            Collecting data...
          </div>
        )}
      </Card>
    </div>
  );
};
