import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const SustainabilityGauge = ({ value, max, label, unit, thresholds }) => {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedValue(value), 100);
    return () => clearTimeout(timer);
  }, [value]);

  const percentage = Math.min((animatedValue / max) * 100, 100);

  // Determine status color based on thresholds
  const getStatusColor = () => {
    if (!thresholds) return 'hsl(var(--primary))';

    if (thresholds.danger && value >= thresholds.danger) {
      return 'hsl(var(--danger))';
    }
    if (thresholds.warning && value >= thresholds.warning) {
      return 'hsl(var(--warning))';
    }
    return 'hsl(var(--success))';
  };

  const getStatusText = () => {
    if (!thresholds) return 'Normal';

    if (thresholds.danger && value >= thresholds.danger) {
      return 'Critical';
    }
    if (thresholds.warning && value >= thresholds.warning) {
      return 'Warning';
    }
    return 'Good';
  };

  const radius = 80;
  const strokeWidth = 12;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="bg-card rounded-2xl border border-border p-6 flex flex-col items-center shadow-lg">
      <h4 className="text-sm font-medium text-muted-foreground mb-4">{label}</h4>

      <div className="relative">
        <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            stroke="hsl(var(--muted))"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />

          {/* Animated progress circle */}
          <motion.circle
            stroke={getStatusColor()}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </svg>

        {/* Center value */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            className="text-3xl font-bold text-foreground"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            {animatedValue.toFixed(1)}
          </motion.div>
          <div className="text-xs text-muted-foreground">{unit}</div>
        </div>
      </div>

      {/* Status indicator */}
      <div className="mt-4 flex items-center space-x-2">
        <motion.div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: getStatusColor() }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        />
        <span className="text-sm font-medium" style={{ color: getStatusColor() }}>
          {getStatusText()}
        </span>
      </div>

      {/* Range indicator */}
      <div className="mt-3 text-xs text-muted-foreground">
        Range: 0 - {max} {unit}
      </div>
    </div>
  );
};

export default SustainabilityGauge;
