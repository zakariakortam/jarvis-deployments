import { motion } from 'framer-motion';
import clsx from 'clsx';

export const Card = ({ children, className, title, action, ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={clsx(
        'bg-card rounded-lg border border-border shadow-sm overflow-hidden',
        className
      )}
      {...props}
    >
      {title && (
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h3 className="text-lg font-semibold text-card-foreground">{title}</h3>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={clsx(title && 'p-6', !title && 'p-6')}>
        {children}
      </div>
    </motion.div>
  );
};

export const MetricCard = ({ title, value, subtitle, icon: Icon, trend, color = 'primary' }) => {
  const colorClasses = {
    primary: 'text-primary bg-primary/10',
    success: 'text-green-600 bg-green-100 dark:bg-green-900/30',
    warning: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30',
    danger: 'text-red-600 bg-red-100 dark:bg-red-900/30',
    info: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-card rounded-lg border border-border p-6 shadow-sm"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        {Icon && (
          <div className={clsx('p-2 rounded-lg', colorClasses[color])}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-card-foreground">{value}</span>
        {trend !== undefined && (
          <span className={clsx(
            'text-sm font-medium',
            trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-muted-foreground'
          )}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      {subtitle && (
        <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
      )}
    </motion.div>
  );
};
