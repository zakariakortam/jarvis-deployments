import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

const VoltageGauge = ({ voltage, equipmentName, status = 'operational' }) => {
  const minVoltage = 200;
  const maxVoltage = 250;
  const normalMin = 215;
  const normalMax = 235;

  const percentage = ((voltage - minVoltage) / (maxVoltage - minVoltage)) * 100;
  const normalRangeStart = ((normalMin - minVoltage) / (maxVoltage - minVoltage)) * 100;
  const normalRangeWidth = ((normalMax - normalMin) / (maxVoltage - minVoltage)) * 100;

  const isInNormalRange = voltage >= normalMin && voltage <= normalMax;
  const gaugeColor = isInNormalRange ? 'bg-success' : 'bg-warning';
  const textColor = isInNormalRange ? 'text-success' : 'text-warning';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="card p-4"
    >
      <div className="flex items-center space-x-2 mb-3">
        <Zap className="w-4 h-4 text-primary" />
        <h4 className="text-sm font-semibold">{equipmentName}</h4>
      </div>

      <div className="relative">
        <div className="text-center mb-4">
          <div className={`text-3xl font-bold ${textColor}`}>
            {voltage.toFixed(1)}
            <span className="text-lg ml-1">V</span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Normal: {normalMin}-{normalMax}V
          </div>
        </div>

        <div className="relative h-3 bg-muted rounded-full overflow-hidden">
          <div
            className="absolute h-full bg-success/20"
            style={{
              left: `${normalRangeStart}%`,
              width: `${normalRangeWidth}%`,
            }}
          />
          <motion.div
            className={`absolute h-full ${gaugeColor} rounded-full`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.max(0, Math.min(100, percentage))}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>{minVoltage}V</span>
          <span>{maxVoltage}V</span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Status</span>
        <span className={`status-indicator status-${status}`}>
          {status.toUpperCase()}
        </span>
      </div>
    </motion.div>
  );
};

export default VoltageGauge;
