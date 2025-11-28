import { Card, MetricCard } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import useFactoryStore from '../store/useFactoryStore';
import { formatDate, getSeverityColor } from '../utils/formatters';
import { exportAlarmsToPDF, exportKPIsToPDF } from '../utils/exportData';
import {
  BellAlertIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  DocumentArrowDownIcon,
} from '@heroicons/react/24/outline';

export const CommandCenter = () => {
  const machines = useFactoryStore(state => state.machines);
  const alarms = useFactoryStore(state => state.getFilteredAlarms());
  const acknowledgeAlarm = useFactoryStore(state => state.acknowledgeAlarm);
  const getKPIs = useFactoryStore(state => state.getKPIs);
  const getAlarmStats = useFactoryStore(state => state.getAlarmStats);
  const setFilter = useFactoryStore(state => state.setFilter);
  const filters = useFactoryStore(state => state.filters);

  const kpis = getKPIs();
  const alarmStats = getAlarmStats();

  const handleExportAlarms = () => {
    exportAlarmsToPDF(alarms, machines);
  };

  const handleExportKPIs = () => {
    exportKPIsToPDF(kpis, machines, alarms);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Command Center</h1>
          <p className="text-muted-foreground">
            Real-time monitoring and alerting dashboard
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={DocumentArrowDownIcon}
            onClick={handleExportKPIs}
          >
            Export KPIs
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={DocumentArrowDownIcon}
            onClick={handleExportAlarms}
          >
            Export Alarms
          </Button>
        </div>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Machines"
          value={kpis.totalMachines}
          subtitle={`${kpis.runningMachines} active`}
          icon={ChartBarIcon}
          color="primary"
        />
        <MetricCard
          title="Active Alarms"
          value={alarmStats.unacknowledged}
          subtitle={`${alarmStats.total} total`}
          icon={BellAlertIcon}
          color="danger"
        />
        <MetricCard
          title="Critical Issues"
          value={alarmStats.critical}
          subtitle={`${alarmStats.errors} errors`}
          icon={ExclamationTriangleIcon}
          color="danger"
        />
        <MetricCard
          title="Avg Efficiency"
          value={`${kpis.avgEfficiency}%`}
          subtitle="Factory-wide"
          icon={CheckCircleIcon}
          color="success"
        />
      </div>

      {/* Alarm Filters */}
      <Card title="Alarm Filters">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filters.severity === 'all' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('severity', 'all')}
          >
            All
          </Button>
          <Button
            variant={filters.severity === 'critical' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('severity', 'critical')}
          >
            Critical ({alarmStats.critical})
          </Button>
          <Button
            variant={filters.severity === 'error' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('severity', 'error')}
          >
            Errors ({alarmStats.errors})
          </Button>
          <Button
            variant={filters.severity === 'warning' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('severity', 'warning')}
          >
            Warnings ({alarmStats.warnings})
          </Button>
        </div>
      </Card>

      {/* Active Alarms */}
      <Card title="Active Alarms">
        <div className="space-y-2">
          {alarms.slice(0, 50).map((alarm) => {
            const machine = machines.find(m => m.id === alarm.machineId);
            return (
              <div
                key={alarm.id}
                className={`p-4 rounded-lg border transition-colors ${
                  alarm.acknowledged
                    ? 'border-border bg-muted/50'
                    : 'border-destructive bg-destructive/5'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={
                        alarm.severity === 'critical' ? 'danger' :
                        alarm.severity === 'error' ? 'warning' :
                        alarm.severity === 'warning' ? 'warning' : 'info'
                      }>
                        {alarm.severity.toUpperCase()}
                      </Badge>
                      <span className="font-medium">{alarm.errorCode}</span>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(alarm.timestamp)}
                      </span>
                    </div>
                    <div className="mb-2">
                      <span className="font-medium">{machine?.name || alarm.machineId}</span>
                      {' - '}
                      <span>{alarm.message}</span>
                    </div>
                    {alarm.value !== null && (
                      <div className="text-sm text-muted-foreground">
                        Value: {alarm.value.toFixed(2)}
                      </div>
                    )}
                  </div>
                  {!alarm.acknowledged && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => acknowledgeAlarm(alarm.id)}
                    >
                      Acknowledge
                    </Button>
                  )}
                  {alarm.acknowledged && (
                    <Badge variant="success" size="sm">
                      Acknowledged
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
          {alarms.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No alarms match the current filters
            </div>
          )}
        </div>
      </Card>

      {/* KPI Thresholds */}
      <Card title="Performance Thresholds">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border border-border">
            <div>
              <div className="font-medium">Average Efficiency</div>
              <div className="text-sm text-muted-foreground">Target: 85% minimum</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{kpis.avgEfficiency}%</div>
              <Badge variant={parseFloat(kpis.avgEfficiency) >= 85 ? 'success' : 'warning'}>
                {parseFloat(kpis.avgEfficiency) >= 85 ? 'Good' : 'Below Target'}
              </Badge>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border border-border">
            <div>
              <div className="font-medium">Average Uptime</div>
              <div className="text-sm text-muted-foreground">Target: 90% minimum</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{kpis.avgUptime}%</div>
              <Badge variant={parseFloat(kpis.avgUptime) >= 90 ? 'success' : 'warning'}>
                {parseFloat(kpis.avgUptime) >= 90 ? 'Good' : 'Below Target'}
              </Badge>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border border-border">
            <div>
              <div className="font-medium">Average Scrap Rate</div>
              <div className="text-sm text-muted-foreground">Target: 3% maximum</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{kpis.avgScrapRate}%</div>
              <Badge variant={parseFloat(kpis.avgScrapRate) <= 3 ? 'success' : 'danger'}>
                {parseFloat(kpis.avgScrapRate) <= 3 ? 'Good' : 'Above Target'}
              </Badge>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border border-border">
            <div>
              <div className="font-medium">Total Energy Consumption</div>
              <div className="text-sm text-muted-foreground">Target: 150 kW maximum</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{kpis.totalEnergy} kW</div>
              <Badge variant={parseFloat(kpis.totalEnergy) <= 150 ? 'success' : 'warning'}>
                {parseFloat(kpis.totalEnergy) <= 150 ? 'Good' : 'Above Target'}
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Production Summary */}
      <Card title="Production Summary">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <div className="text-sm text-muted-foreground mb-2">Total Throughput</div>
            <div className="text-3xl font-bold">{kpis.totalThroughput}</div>
            <div className="text-sm text-muted-foreground">units produced</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-2">Active Machines</div>
            <div className="text-3xl font-bold">{kpis.runningMachines}</div>
            <div className="text-sm text-muted-foreground">of {kpis.totalMachines}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-2">Overall Efficiency</div>
            <div className="text-3xl font-bold">{kpis.avgEfficiency}%</div>
            <div className="text-sm text-muted-foreground">factory-wide</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-2">Energy Efficiency</div>
            <div className="text-3xl font-bold">
              {(kpis.totalThroughput / parseFloat(kpis.totalEnergy)).toFixed(1)}
            </div>
            <div className="text-sm text-muted-foreground">units/kW</div>
          </div>
        </div>
      </Card>
    </div>
  );
};
