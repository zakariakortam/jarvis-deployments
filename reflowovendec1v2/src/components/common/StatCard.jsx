import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import clsx from 'clsx';

export default function StatCard({
  title,
  value,
  unit,
  change,
  changeType,
  icon: Icon,
  iconColor = 'text-primary-500',
  trend,
  className,
}) {
  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getChangeColor = () => {
    if (changeType === 'positive') return 'text-green-500';
    if (changeType === 'negative') return 'text-red-500';
    return 'text-gray-500';
  };

  return (
    <div className={clsx('stat-card', className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="stat-value">{value}</span>
            {unit && (
              <span className="text-sm text-gray-500 dark:text-gray-400">{unit}</span>
            )}
          </div>
        </div>
        {Icon && (
          <div className={clsx('p-3 rounded-xl bg-gray-100 dark:bg-gray-700/50', iconColor)}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>

      {(change !== undefined || trend) && (
        <div className={clsx('stat-change flex items-center gap-1', getChangeColor())}>
          {trend && getTrendIcon()}
          {change !== undefined && (
            <span>{change > 0 ? '+' : ''}{change}</span>
          )}
        </div>
      )}
    </div>
  );
}
