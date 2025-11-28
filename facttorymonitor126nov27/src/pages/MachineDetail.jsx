import { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { LineChartComponent } from '../components/Charts/LineChartComponent';
import { GaugeChart } from '../components/Charts/GaugeChart';
import useFactoryStore from '../store/useFactoryStore';
import { useHistoricalData } from '../hooks/useHistoricalData';
import { useMaintenanceHistory } from '../hooks/useMaintenanceHistory';
import {
  formatTemperature,
  formatVoltage,
  formatPercentage,
  formatDate,
  formatTimeAgo,
  formatCurrency,
  formatDuration,
  getStatusColor,
  getHealthColor,
} from '../utils/formatters';
import { exportMachineReportToPDF } from '../utils/exportData';
import {
  ArrowLeftIcon,
  DocumentArrowDownIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';

export const MachineDetail = () => {
  const { machineId } = useParams();
  const navigate = useNavigate();

  const machine = useFactoryStore(state => state.getMachineById(machineId));
  const selectMachine = useFactoryStore(state => state.selectMachine);

  useEffect(() => {
    selectMachine(machineId);
  }, [machineId, selectMachine]);

  const { data: historicalData } = useHistoricalData(
    machineId,
    Date.now() - 3600000,
    Date.now()
  );

  const { history: maintenanceHistory } = useMaintenanceHistory(machineId);

  const chartData = useMemo(() => {
    if (historicalData.length === 0) return [];
    return historicalData.slice(-50).map(point => ({
      timestamp: point.timestamp,
      temperature: point.temperature,
      vibration: point.vibration * 100,
      efficiency: point.efficiency,
      voltage: point.voltage,
      energy: point.energyUsage,
    }));
  }, [historicalData]);

  const handleExport = () => {
    if (machine) {
      exportMachineReportToPDF(machine, historicalData, maintenanceHistory);
    }
  };

  if (!machine) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Machine Not Found</h2>
          <p className="text-muted-foreground mb-4">The requested machine does not exist.</p>
          <Button onClick={() => navigate('/machines')}>Back to Machines</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            icon={ArrowLeftIcon}
            onClick={() => navigate('/machines')}
          >
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{machine.name}</h1>
            <p className="text-muted-foreground">
              {machine.id} • {machine.type} • {machine.location}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          icon={DocumentArrowDownIcon}
          onClick={handleExport}
        >
          Export Report
        </Button>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Status</div>
            <Badge
              variant={
                machine.status === 'running' ? 'success' :
                machine.status === 'idle' ? 'secondary' : 'danger'
              }
              size="lg"
            >
              {machine.status.toUpperCase()}
            </Badge>
            <div className="text-xs text-muted-foreground mt-2">
              Uptime: {formatPercentage(machine.uptime)}
            </div>
          </div>
        </Card>

        <Card>
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Temperature</div>
            <div className="text-2xl font-bold">{formatTemperature(machine.temperature)}</div>
            <div className="text-xs text-muted-foreground">
              Baseline: {formatTemperature(machine.baseTemp)}
            </div>
          </div>
        </Card>

        <Card>
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Efficiency</div>
            <div className="text-2xl font-bold">{formatPercentage(machine.efficiency)}</div>
            <div className="text-xs text-muted-foreground">
              Throughput: {machine.throughput} units
            </div>
          </div>
        </Card>

        <Card>
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Energy Usage</div>
            <div className="text-2xl font-bold">{machine.energyUsage.toFixed(1)} kW</div>
            <div className="text-xs text-muted-foreground">
              Operating: {machine.operatingHours.toFixed(0)} hrs
            </div>
          </div>
        </Card>
      </div>

      {/* Performance Gauges */}
      <Card title="Real-time Performance Metrics">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <GaugeChart
            value={machine.temperature}
            max={machine.baseTemp + 30}
            title="Temperature"
            unit="°C"
            color={machine.temperature > machine.baseTemp + 15 ? 'danger' : 'success'}
          />
          <GaugeChart
            value={machine.vibration * 100}
            max={100}
            title="Vibration"
            unit=""
            color={machine.vibration > machine.baseVib + 0.2 ? 'warning' : 'success'}
          />
          <GaugeChart
            value={machine.efficiency}
            max={100}
            title="Efficiency"
            unit="%"
            color={machine.efficiency > 80 ? 'success' : 'warning'}
          />
          <GaugeChart
            value={machine.speed}
            max={100}
            title="Speed"
            unit="%"
            color="primary"
          />
        </div>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Temperature & Vibration Trend">
          {chartData.length > 0 ? (
            <LineChartComponent
              data={chartData}
              lines={[
                { key: 'temperature', name: 'Temperature (°C)', color: '#ef4444' },
                { key: 'vibration', name: 'Vibration (x100)', color: '#f59e0b' },
              ]}
              height={300}
            />
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Collecting data...
            </div>
          )}
        </Card>

        <Card title="Efficiency & Energy">
          {chartData.length > 0 ? (
            <LineChartComponent
              data={chartData}
              lines={[
                { key: 'efficiency', name: 'Efficiency (%)', color: '#10b981' },
                { key: 'energy', name: 'Energy (kW)', color: '#3b82f6' },
              ]}
              height={300}
            />
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Collecting data...
            </div>
          )}
        </Card>
      </div>

      {/* Electrical Metrics */}
      <Card title="Electrical Parameters">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <div className="text-sm text-muted-foreground mb-2">Voltage</div>
            <div className="text-2xl font-bold">{formatVoltage(machine.voltage)}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-2">Current</div>
            <div className="text-2xl font-bold">{machine.current.toFixed(1)} A</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-2">Power</div>
            <div className="text-2xl font-bold">
              {((machine.voltage * machine.current) / 1000).toFixed(1)} kW
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-2">Power Factor</div>
            <div className="text-2xl font-bold">0.92</div>
          </div>
        </div>
      </Card>

      {/* Component Health */}
      <Card title="Component Health Status">
        <div className="space-y-3">
          {machine.components.map((component) => (
            <div
              key={component.name}
              className="flex items-center justify-between p-4 rounded-lg border border-border"
            >
              <div className="flex items-center gap-4 flex-1">
                <WrenchScrewdriverIcon className="w-5 h-5 text-muted-foreground" />
                <div className="flex-1">
                  <div className="font-medium">{component.name}</div>
                  <div className="text-sm text-muted-foreground">
                    Last replaced: {formatTimeAgo(component.lastReplaced)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="font-medium">{component.health.toFixed(0)}%</div>
                  <div className="text-xs text-muted-foreground">
                    {component.expectedLife} days expected
                  </div>
                </div>
                <Badge
                  variant={
                    component.status === 'good' ? 'success' :
                    component.status === 'warning' ? 'warning' : 'danger'
                  }
                >
                  {component.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Maintenance History */}
      <Card title="Maintenance History">
        <div className="space-y-2">
          {maintenanceHistory.slice(0, 10).map((maintenance, index) => (
            <div
              key={index}
              className="flex items-start justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={
                    maintenance.type === 'Preventive' ? 'success' :
                    maintenance.type === 'Corrective' ? 'warning' : 'info'
                  }>
                    {maintenance.type}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(maintenance.date)}
                  </span>
                </div>
                <div className="font-medium mb-1">{maintenance.description}</div>
                <div className="text-sm text-muted-foreground">
                  Technician: {maintenance.technician} • Duration: {formatDuration(maintenance.duration)}
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium">{formatCurrency(maintenance.cost)}</div>
              </div>
            </div>
          ))}
          {maintenanceHistory.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No maintenance history available
            </div>
          )}
        </div>
      </Card>

      {/* Production Metrics */}
      <Card title="Production Metrics">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <div className="text-sm text-muted-foreground mb-2">Cycle Time</div>
            <div className="text-2xl font-bold">{machine.cycleTime.toFixed(1)}s</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-2">Total Throughput</div>
            <div className="text-2xl font-bold">{machine.throughput} units</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-2">Scrap Rate</div>
            <div className="text-2xl font-bold">{machine.scrapRate.toFixed(2)}%</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-2">OEE</div>
            <div className="text-2xl font-bold">{(machine.efficiency * 0.92).toFixed(1)}%</div>
          </div>
        </div>
      </Card>
    </div>
  );
};
