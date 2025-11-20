import { motion } from 'framer-motion';
import useTrafficStore from '../store/trafficStore';
import { Activity, Car, Wind, AlertTriangle } from 'lucide-react';

function GaugeCard({ title, value, maxValue, unit, icon: Icon, color }) {
  const percentage = (value / maxValue) * 100;

  return (
    <div className="bg-card p-6 rounded-lg shadow-lg border border-border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon className={`w-5 h-5 ${color}`} />
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        </div>
        <div className="text-2xl font-bold text-card-foreground">
          {typeof value === 'number' ? value.toFixed(1) : value}
          <span className="text-sm font-normal text-muted-foreground ml-1">{unit}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative w-full h-3 bg-secondary rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color.replace('text-', 'bg-')}`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(percentage, 100)}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>

      <div className="mt-2 text-xs text-muted-foreground">
        {percentage.toFixed(0)}% of max ({maxValue} {unit})
      </div>
    </div>
  );
}

function CircularGauge({ value, maxValue, label, color }) {
  const percentage = (value / maxValue) * 100;
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="64"
            cy="64"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-secondary"
          />
          {/* Progress circle */}
          <motion.circle
            cx="64"
            cy="64"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            className={color}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: 'easeInOut' }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-card-foreground">{value}</div>
            <div className="text-xs text-muted-foreground">{percentage.toFixed(0)}%</div>
          </div>
        </div>
      </div>
      <div className="mt-2 text-sm font-medium text-muted-foreground">{label}</div>
    </div>
  );
}

export default function CongestionGauges() {
  const stats = useTrafficStore(state => state.stats);

  return (
    <div className="space-y-6">
      {/* Linear gauges */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <GaugeCard
          title="Avg Speed"
          value={stats.avgSpeed}
          maxValue={65}
          unit="mph"
          icon={Activity}
          color="text-traffic-blue"
        />
        <GaugeCard
          title="Total Vehicles"
          value={stats.totalVehicles}
          maxValue={15000}
          unit="vehicles"
          icon={Car}
          color="text-traffic-green"
        />
        <GaugeCard
          title="Emissions"
          value={stats.totalEmissions}
          maxValue={30000}
          unit="units"
          icon={Wind}
          color="text-traffic-yellow"
        />
        <GaugeCard
          title="Active Alerts"
          value={stats.activeAlerts}
          maxValue={50}
          unit="alerts"
          icon={AlertTriangle}
          color="text-traffic-red"
        />
      </div>

      {/* Circular gauges for key metrics */}
      <div className="bg-card p-6 rounded-lg shadow-lg border border-border">
        <h3 className="text-lg font-semibold mb-6 text-card-foreground">Real-Time Metrics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 justify-items-center">
          <CircularGauge
            value={Math.round(stats.avgSpeed)}
            maxValue={65}
            label="Speed (mph)"
            color="text-blue-500"
          />
          <CircularGauge
            value={stats.avgCongestion}
            maxValue={100}
            label="Congestion (%)"
            color={
              stats.avgCongestion < 30
                ? 'text-green-500'
                : stats.avgCongestion < 60
                ? 'text-yellow-500'
                : 'text-red-500'
            }
          />
          <CircularGauge
            value={Math.round((stats.totalVehicles / 15000) * 100)}
            maxValue={100}
            label="Traffic Volume"
            color="text-purple-500"
          />
          <CircularGauge
            value={Math.round((stats.totalEmissions / 30000) * 100)}
            maxValue={100}
            label="Emissions"
            color="text-orange-500"
          />
        </div>
      </div>
    </div>
  );
}
