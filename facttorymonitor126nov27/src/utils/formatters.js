import { format, formatDistanceToNow } from 'date-fns';

export const formatNumber = (value, decimals = 0) => {
  if (value === null || value === undefined) return '--';
  return Number(value).toFixed(decimals);
};

export const formatTemperature = (temp) => {
  return `${formatNumber(temp, 1)}°C`;
};

export const formatVoltage = (voltage) => {
  return `${formatNumber(voltage, 0)}V`;
};

export const formatCurrent = (current) => {
  return `${formatNumber(current, 1)}A`;
};

export const formatPercentage = (value) => {
  return `${formatNumber(value, 1)}%`;
};

export const formatEnergy = (kw) => {
  return `${formatNumber(kw, 1)} kW`;
};

export const formatDuration = (minutes) => {
  if (minutes < 60) {
    return `${Math.round(minutes)}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return `${hours}h ${mins}m`;
};

export const formatDate = (timestamp) => {
  return format(new Date(timestamp), 'MMM dd, yyyy HH:mm');
};

export const formatTimeAgo = (timestamp) => {
  return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const getSeverityColor = (severity) => {
  const colors = {
    critical: 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400',
    error: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400',
    warning: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400',
    info: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400',
  };
  return colors[severity] || colors.info;
};

export const getStatusColor = (status) => {
  const colors = {
    running: 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400',
    idle: 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-400',
    error: 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400',
    maintenance: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400',
  };
  return colors[status] || colors.idle;
};

export const getHealthColor = (health) => {
  if (health >= 80) {
    return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
  } else if (health >= 60) {
    return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
  } else {
    return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
  }
};

export const getEfficiencyColor = (efficiency) => {
  if (efficiency >= 85) {
    return 'text-green-600';
  } else if (efficiency >= 70) {
    return 'text-yellow-600';
  } else {
    return 'text-red-600';
  }
};
