import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatCard = ({ title, value, unit, icon: Icon, trend, change }) => {
  const isPositive = trend === 'up';
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <motion.div
      className="bg-card rounded-2xl border border-border p-6 shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-2">{title}</p>
          <div className="flex items-baseline space-x-2">
            <motion.h3
              className="text-3xl font-bold text-foreground"
              key={value}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {typeof value === 'number' ? value.toFixed(1) : value}
            </motion.h3>
            {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
          </div>
          {change !== undefined && (
            <div className="flex items-center space-x-1 mt-2">
              <TrendIcon
                className={`w-4 h-4 ${
                  isPositive ? 'text-success' : 'text-danger'
                }`}
              />
              <span
                className={`text-sm font-medium ${
                  isPositive ? 'text-success' : 'text-danger'
                }`}
              >
                {Math.abs(change).toFixed(1)}%
              </span>
              <span className="text-xs text-muted-foreground">vs last hour</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shadow-md">
            <Icon className="w-6 h-6 text-primary" />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StatCard;
