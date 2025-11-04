import { useMemo } from 'react';
import { AlertTriangle, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

function CircularGauge({ value, label, unit, status, max = 100 }) {
  const percentage = (value / max) * 100;
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const statusColor = useMemo(() => {
    switch (status) {
      case 'critical':
        return 'text-red-500';
      case 'warning':
        return 'text-yellow-500';
      case 'offline':
        return 'text-gray-500';
      default:
        return 'text-green-500';
    }
  }, [status]);

  const strokeColor = useMemo(() => {
    switch (status) {
      case 'critical':
        return '#ef4444';
      case 'warning':
        return '#f59e0b';
      case 'offline':
        return '#6b7280';
      default:
        return '#10b981';
    }
  }, [status]);

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-28 h-28">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="56"
            cy="56"
            r="45"
            stroke="hsl(var(--muted))"
            strokeWidth="8"
            fill="none"
          />
          <circle
            cx="56"
            cy="56"
            r="45"
            stroke={strokeColor}
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={clsx('text-2xl font-bold', statusColor)}>
            {value.toFixed(1)}
          </span>
          <span className="text-xs text-muted-foreground">{unit}</span>
        </div>
      </div>
      <div className="mt-2 text-sm text-center">
        <div className="font-medium text-foreground">{label}</div>
      </div>
    </div>
  );
}

function LinearGauge({ value, label, unit, status, min = 0, max = 100 }) {
  const percentage = ((value - min) / (max - min)) * 100;

  const statusColor = useMemo(() => {
    switch (status) {
      case 'critical':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'offline':
        return 'bg-gray-500';
      default:
        return 'bg-green-500';
    }
  }, [status]);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="text-sm font-bold text-foreground">
          {value.toFixed(1)} {unit}
        </span>
      </div>
      <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
        <div
          className={clsx('h-full transition-all duration-500 rounded-full', statusColor)}
          style={{ width: `${Math.max(0, Math.min(100, percentage))}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const config = useMemo(() => {
    switch (status) {
      case 'critical':
        return {
          icon: XCircle,
          text: 'Critical',
          className: 'bg-red-500/10 text-red-500 border-red-500/20 status-critical',
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          text: 'Warning',
          className: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
        };
      case 'offline':
        return {
          icon: AlertCircle,
          text: 'Offline',
          className: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
        };
      default:
        return {
          icon: CheckCircle,
          text: 'Nominal',
          className: 'bg-green-500/10 text-green-500 border-green-500/20',
        };
    }
  }, [status]);

  const Icon = config.icon;

  return (
    <div className={clsx('inline-flex items-center gap-2 px-3 py-1 rounded-full border', config.className)}>
      <Icon className="w-4 h-4" />
      <span className="text-sm font-medium">{config.text}</span>
    </div>
  );
}

function SubsystemGauges({ satellite }) {
  if (!satellite) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-muted-foreground">No satellite selected</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Overall Status */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-foreground">Overall Status</h3>
          <StatusBadge status={satellite.overallStatus} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{satellite.type}</div>
            <div className="text-sm text-muted-foreground">Type</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">
              {satellite.orbit.altitude.toFixed(0)} km
            </div>
            <div className="text-sm text-muted-foreground">Altitude</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">
              {satellite.orbit.velocity.toFixed(2)} km/s
            </div>
            <div className="text-sm text-muted-foreground">Velocity</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{satellite.mission}</div>
            <div className="text-sm text-muted-foreground">Mission</div>
          </div>
        </div>
      </div>

      {/* Power Systems */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
          Power Systems
          <StatusBadge status={satellite.subsystems.power.status} />
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CircularGauge
            value={satellite.telemetry.power.solarPanel}
            label="Solar Panel"
            unit="%"
            status={satellite.subsystems.power.status}
          />
          <CircularGauge
            value={satellite.telemetry.power.battery}
            label="Battery"
            unit="%"
            status={satellite.subsystems.power.status}
          />
          <CircularGauge
            value={satellite.telemetry.power.consumption}
            label="Consumption"
            unit="W"
            max={400}
            status={satellite.subsystems.power.status}
          />
        </div>
      </div>

      {/* Thermal Systems */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
          Thermal Systems
          <StatusBadge status={satellite.subsystems.thermal.status} />
        </h3>
        <div className="space-y-4">
          <LinearGauge
            value={satellite.telemetry.thermal.core}
            label="Core Temperature"
            unit="°C"
            min={-40}
            max={80}
            status={satellite.subsystems.thermal.status}
          />
          <LinearGauge
            value={satellite.telemetry.thermal.panel}
            label="Panel Temperature"
            unit="°C"
            min={-100}
            max={100}
            status={satellite.subsystems.thermal.status}
          />
          <LinearGauge
            value={satellite.telemetry.thermal.battery}
            label="Battery Temperature"
            unit="°C"
            min={-20}
            max={60}
            status={satellite.subsystems.thermal.status}
          />
        </div>
      </div>

      {/* Propulsion Systems */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
          Propulsion Systems
          <StatusBadge status={satellite.subsystems.propulsion.status} />
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CircularGauge
            value={satellite.telemetry.propulsion.fuel}
            label="Fuel"
            unit="%"
            status={satellite.subsystems.propulsion.status}
          />
          <CircularGauge
            value={satellite.telemetry.propulsion.oxidizer}
            label="Oxidizer"
            unit="%"
            status={satellite.subsystems.propulsion.status}
          />
          <CircularGauge
            value={satellite.telemetry.propulsion.pressure}
            label="Pressure"
            unit="PSI"
            max={300}
            status={satellite.subsystems.propulsion.status}
          />
        </div>
      </div>

      {/* Communication Systems */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
          Communication Systems
          <StatusBadge status={satellite.subsystems.payload.status} />
        </h3>
        <div className="space-y-4">
          <LinearGauge
            value={satellite.telemetry.communication.signalStrength}
            label="Signal Strength"
            unit="dBm"
            min={-100}
            max={-40}
            status={satellite.subsystems.payload.status}
          />
          <LinearGauge
            value={satellite.telemetry.communication.dataRate}
            label="Data Rate"
            unit="Mbps"
            min={0}
            max={15}
            status={satellite.subsystems.payload.status}
          />
          <LinearGauge
            value={satellite.telemetry.communication.latency}
            label="Latency"
            unit="ms"
            min={0}
            max={300}
            status={satellite.subsystems.payload.status}
          />
        </div>
      </div>

      {/* Cost Information */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-6">Cost Information</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-2xl font-bold text-foreground">
              ${satellite.costs.total.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Total Cost</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">
              ${satellite.costs.operational.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Operational/Day</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">
              ${satellite.costs.maintenance.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Maintenance/Day</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">
              ${satellite.costs.fuel.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Fuel/Day</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SubsystemGauges;
