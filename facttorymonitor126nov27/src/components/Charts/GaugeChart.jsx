import { motion } from 'framer-motion';

export const GaugeChart = ({ value, max = 100, title, unit = '', color = 'primary' }) => {
  const percentage = (value / max) * 100;
  const rotation = (percentage / 100) * 180 - 90;

  const colorClasses = {
    primary: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
  };

  const strokeColor = colorClasses[color] || colorClasses.primary;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-40 h-20 overflow-hidden">
        <svg viewBox="0 0 200 100" className="w-full h-full">
          {/* Background arc */}
          <path
            d="M 10 100 A 90 90 0 0 1 190 100"
            fill="none"
            stroke="currentColor"
            strokeWidth="12"
            className="text-muted opacity-20"
          />
          {/* Value arc */}
          <motion.path
            d="M 10 100 A 90 90 0 0 1 190 100"
            fill="none"
            stroke={strokeColor}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray="283"
            initial={{ strokeDashoffset: 283 }}
            animate={{ strokeDashoffset: 283 - (283 * percentage / 100) }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
          {/* Center circle */}
          <circle cx="100" cy="100" r="8" fill="currentColor" className="text-muted-foreground" />
          {/* Needle */}
          <motion.line
            x1="100"
            y1="100"
            x2="100"
            y2="30"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            className="text-foreground"
            initial={{ rotate: -90 }}
            animate={{ rotate: rotation }}
            transition={{ duration: 1, ease: 'easeOut' }}
            style={{ transformOrigin: '100px 100px' }}
          />
        </svg>
      </div>
      <div className="text-center mt-2">
        <div className="text-2xl font-bold text-foreground">
          {value.toFixed(1)}{unit}
        </div>
        {title && <div className="text-sm text-muted-foreground">{title}</div>}
      </div>
    </div>
  );
};
