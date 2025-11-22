import { motion } from 'framer-motion';

const MetricCard = ({ icon: Icon, title, value, unit, trend, status = 'neutral' }) => {
  const statusColors = {
    success: 'text-success',
    warning: 'text-warning',
    critical: 'text-destructive',
    neutral: 'text-foreground',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="metric-card"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            {Icon && <Icon className="w-5 h-5 text-muted-foreground" />}
            <span className="text-sm font-medium text-muted-foreground">{title}</span>
          </div>
          <div className={`text-3xl font-bold ${statusColors[status]}`}>
            {value}
            {unit && <span className="text-lg ml-1">{unit}</span>}
          </div>
          {trend !== undefined && (
            <div className={`text-sm mt-1 ${trend >= 0 ? 'text-success' : 'text-destructive'}`}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}%
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MetricCard;
