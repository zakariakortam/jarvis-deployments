import { useMemo } from 'react';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { LineChartComponent } from '../components/Charts/LineChartComponent';
import { BarChartComponent } from '../components/Charts/BarChartComponent';
import useFactoryStore from '../store/useFactoryStore';
import { useHistoricalData } from '../hooks/useHistoricalData';
import {
  formatTemperature,
  formatPercentage,
  getStatusColor,
} from '../utils/formatters';
import { XMarkIcon } from '@heroicons/react/24/outline';

export const Comparison = () => {
  const machines = useFactoryStore(state => state.machines);
  const comparisonMachineIds = useFactoryStore(state => state.comparisonMachineIds);
  const toggleComparison = useFactoryStore(state => state.toggleComparison);
  const clearComparison = useFactoryStore(state => state.clearComparison);

  const comparisonMachines = machines.filter(m => comparisonMachineIds.includes(m.id));

  // Get historical data for each comparison machine
  const historicalDataSets = comparisonMachineIds.map(machineId => {
    const { data } = useHistoricalData(machineId, Date.now() - 1800000, Date.now());
    return { machineId, data };
  });

  // Prepare comparison chart data
  const comparisonData = useMemo(() => {
    return comparisonMachines.map(m => ({
      name: m.id,
      temperature: m.temperature,
      efficiency: m.efficiency,
      throughput: m.throughput,
      energy: m.energyUsage,
      scrapRate: m.scrapRate,
      uptime: m.uptime,
    }));
  }, [comparisonMachines]);

  // Prepare time-series data for overlay
  const timeSeriesData = useMemo(() => {
    if (historicalDataSets.length === 0 || historicalDataSets[0].data.length === 0) {
      return [];
    }

    const timestamps = historicalDataSets[0].data.slice(-30).map(p => p.timestamp);

    return timestamps.map(timestamp => {
      const dataPoint = { timestamp };

      historicalDataSets.forEach(({ machineId, data }) => {
        const point = data.find(p => p.timestamp === timestamp);
        if (point) {
          dataPoint[`${machineId}_temp`] = point.temperature;
          dataPoint[`${machineId}_eff`] = point.efficiency;
          dataPoint[`${machineId}_energy`] = point.energyUsage;
        }
      });

      return dataPoint;
    });
  }, [historicalDataSets]);

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Machine Comparison</h1>
          <p className="text-muted-foreground">
            Compare up to 4 machines side-by-side
          </p>
        </div>
        {comparisonMachineIds.length > 0 && (
          <Button variant="outline" onClick={clearComparison}>
            Clear All
          </Button>
        )}
      </div>

      {/* Machine Selection */}
      <Card title="Select Machines to Compare">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {machines.map((machine) => (
            <button
              key={machine.id}
              onClick={() => toggleComparison(machine.id)}
              disabled={
                !comparisonMachineIds.includes(machine.id) &&
                comparisonMachineIds.length >= 4
              }
              className={`p-4 rounded-lg border-2 transition-all ${
                comparisonMachineIds.includes(machine.id)
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="font-medium text-sm">{machine.id}</div>
              <div className="text-xs text-muted-foreground">{machine.name}</div>
              {comparisonMachineIds.includes(machine.id) && (
                <Badge variant="success" size="sm" className="mt-2">
                  Selected
                </Badge>
              )}
            </button>
          ))}
        </div>
      </Card>

      {comparisonMachineIds.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg mb-4">
              Select machines above to start comparing
            </p>
            <p className="text-sm text-muted-foreground">
              You can select up to 4 machines for side-by-side comparison
            </p>
          </div>
        </Card>
      )}

      {comparisonMachineIds.length > 0 && (
        <>
          {/* Side-by-side Machine Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {comparisonMachines.map((machine) => (
              <Card key={machine.id}>
                <div className="relative">
                  <button
                    onClick={() => toggleComparison(machine.id)}
                    className="absolute top-0 right-0 p-1 rounded-full hover:bg-accent"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>

                  <div className="mb-4">
                    <h3 className="font-bold text-lg">{machine.id}</h3>
                    <p className="text-sm text-muted-foreground">{machine.name}</p>
                    <Badge
                      variant={machine.status === 'running' ? 'success' : 'secondary'}
                      size="sm"
                      className="mt-2"
                    >
                      {machine.status}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Temperature</span>
                      <span className="font-medium">{formatTemperature(machine.temperature)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Efficiency</span>
                      <span className="font-medium">{formatPercentage(machine.efficiency)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Throughput</span>
                      <span className="font-medium">{machine.throughput} units</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Energy</span>
                      <span className="font-medium">{machine.energyUsage.toFixed(1)} kW</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Scrap Rate</span>
                      <span className="font-medium">{formatPercentage(machine.scrapRate)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Uptime</span>
                      <span className="font-medium">{formatPercentage(machine.uptime)}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Comparison Bar Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Performance Comparison">
              <BarChartComponent
                data={comparisonData}
                bars={[
                  { key: 'efficiency', name: 'Efficiency (%)', color: '#10b981' },
                  { key: 'uptime', name: 'Uptime (%)', color: '#3b82f6' },
                ]}
                xAxisKey="name"
                height={300}
              />
            </Card>

            <Card title="Production Metrics">
              <BarChartComponent
                data={comparisonData}
                bars={[
                  { key: 'throughput', name: 'Throughput (units)', color: '#3b82f6' },
                  { key: 'scrapRate', name: 'Scrap Rate (%)', color: '#ef4444' },
                ]}
                xAxisKey="name"
                height={300}
              />
            </Card>
          </div>

          {/* Time Series Overlay */}
          {timeSeriesData.length > 0 && (
            <>
              <Card title="Temperature Overlay">
                <LineChartComponent
                  data={timeSeriesData}
                  lines={comparisonMachineIds.map((id, index) => ({
                    key: `${id}_temp`,
                    name: `${id} Temp (°C)`,
                    color: colors[index],
                  }))}
                  height={300}
                />
              </Card>

              <Card title="Efficiency Overlay">
                <LineChartComponent
                  data={timeSeriesData}
                  lines={comparisonMachineIds.map((id, index) => ({
                    key: `${id}_eff`,
                    name: `${id} Efficiency (%)`,
                    color: colors[index],
                  }))}
                  height={300}
                />
              </Card>

              <Card title="Energy Consumption Overlay">
                <LineChartComponent
                  data={timeSeriesData}
                  lines={comparisonMachineIds.map((id, index) => ({
                    key: `${id}_energy`,
                    name: `${id} Energy (kW)`,
                    color: colors[index],
                  }))}
                  height={300}
                />
              </Card>
            </>
          )}

          {/* Statistical Comparison */}
          <Card title="Statistical Summary">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium">Metric</th>
                    {comparisonMachines.map(m => (
                      <th key={m.id} className="text-right py-3 px-4 font-medium">{m.id}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border">
                    <td className="py-3 px-4 text-muted-foreground">Avg Temperature</td>
                    {comparisonMachines.map(m => (
                      <td key={m.id} className="text-right py-3 px-4">{formatTemperature(m.temperature)}</td>
                    ))}
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-3 px-4 text-muted-foreground">Efficiency</td>
                    {comparisonMachines.map(m => (
                      <td key={m.id} className="text-right py-3 px-4">{formatPercentage(m.efficiency)}</td>
                    ))}
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-3 px-4 text-muted-foreground">Throughput</td>
                    {comparisonMachines.map(m => (
                      <td key={m.id} className="text-right py-3 px-4">{m.throughput} units</td>
                    ))}
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-3 px-4 text-muted-foreground">Energy Usage</td>
                    {comparisonMachines.map(m => (
                      <td key={m.id} className="text-right py-3 px-4">{m.energyUsage.toFixed(1)} kW</td>
                    ))}
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-3 px-4 text-muted-foreground">Scrap Rate</td>
                    {comparisonMachines.map(m => (
                      <td key={m.id} className="text-right py-3 px-4">{formatPercentage(m.scrapRate)}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-muted-foreground">Uptime</td>
                    {comparisonMachines.map(m => (
                      <td key={m.id} className="text-right py-3 px-4">{formatPercentage(m.uptime)}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};
