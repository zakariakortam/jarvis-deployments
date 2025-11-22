import { motion } from 'framer-motion';
import { Activity, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import useDashboardStore from '../../store/dashboardStore';
import MetricCard from '../MetricCard';
import { Thermometer, Zap, Gauge } from 'lucide-react';

const EquipmentOverview = () => {
  const { summary } = useDashboardStore();

  if (!summary) return null;

  const healthStatus =
    summary.healthScore >= 80 ? 'success' : summary.healthScore >= 60 ? 'warning' : 'critical';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        icon={Activity}
        title="System Health"
        value={summary.healthScore.toFixed(0)}
        unit="%"
        status={healthStatus}
        trend={summary.healthScore - 85}
      />

      <MetricCard
        icon={Thermometer}
        title="Avg Temperature"
        value={summary.avgTemperature.toFixed(1)}
        unit="°C"
        status={summary.avgTemperature > 80 ? 'warning' : 'success'}
      />

      <MetricCard
        icon={Zap}
        title="Total Power"
        value={summary.avgPower.toFixed(1)}
        unit="kW"
        status="neutral"
      />

      <MetricCard
        icon={TrendingUp}
        title="Avg Efficiency"
        value={summary.avgEfficiency.toFixed(1)}
        unit="%"
        status={summary.avgEfficiency >= 85 ? 'success' : 'warning'}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="metric-card col-span-full lg:col-span-2"
      >
        <h4 className="text-sm font-medium text-muted-foreground mb-4">Equipment Status Distribution</h4>
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-success">{summary.operational}</div>
            <div className="text-xs text-muted-foreground mt-1">Operational</div>
            <div className="text-xs text-success font-semibold">
              {((summary.operational / summary.total) * 100).toFixed(0)}%
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-warning">{summary.warning}</div>
            <div className="text-xs text-muted-foreground mt-1">Warning</div>
            <div className="text-xs text-warning font-semibold">
              {((summary.warning / summary.total) * 100).toFixed(0)}%
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-destructive">{summary.critical}</div>
            <div className="text-xs text-muted-foreground mt-1">Critical</div>
            <div className="text-xs text-destructive font-semibold">
              {((summary.critical / summary.total) * 100).toFixed(0)}%
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-muted-foreground">{summary.offline}</div>
            <div className="text-xs text-muted-foreground mt-1">Offline</div>
            <div className="text-xs text-muted-foreground font-semibold">
              {((summary.offline / summary.total) * 100).toFixed(0)}%
            </div>
          </div>
        </div>
        <div className="mt-4 h-4 bg-muted rounded-full overflow-hidden flex">
          <div
            className="bg-success"
            style={{ width: `${(summary.operational / summary.total) * 100}%` }}
          />
          <div
            className="bg-warning"
            style={{ width: `${(summary.warning / summary.total) * 100}%` }}
          />
          <div
            className="bg-destructive"
            style={{ width: `${(summary.critical / summary.total) * 100}%` }}
          />
          <div
            className="bg-muted-foreground"
            style={{ width: `${(summary.offline / summary.total) * 100}%` }}
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="metric-card col-span-full lg:col-span-2"
      >
        <h4 className="text-sm font-medium text-muted-foreground mb-4">Production Metrics</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Gauge className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Total Throughput</span>
            </div>
            <div className="text-3xl font-bold text-foreground">
              {summary.totalThroughput.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Units produced</div>
          </div>
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-4 h-4 text-success" />
              <span className="text-sm text-muted-foreground">Efficiency Rate</span>
            </div>
            <div className="text-3xl font-bold text-success">
              {summary.avgEfficiency.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground mt-1">Average across all units</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EquipmentOverview;
