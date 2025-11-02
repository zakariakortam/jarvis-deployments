import { format, formatDistanceToNow } from 'date-fns';

/**
 * Format timestamp to readable date
 */
export const formatTimestamp = (timestamp) => {
  return format(new Date(timestamp), 'MMM dd, yyyy HH:mm:ss');
};

/**
 * Format relative time
 */
export const formatRelativeTime = (timestamp) => {
  return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
};

/**
 * Format number with commas
 */
export const formatNumber = (num, decimals = 0) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(num);
};

/**
 * Format percentage
 */
export const formatPercentage = (value, decimals = 1) => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Get alert color based on level
 */
export const getAlertColor = (level) => {
  const colors = {
    critical: 'text-red-600 bg-red-50 dark:bg-red-900/20',
    warning: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20',
    info: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
  };
  return colors[level] || colors.info;
};

/**
 * Get status color
 */
export const getStatusColor = (status) => {
  const colors = {
    operational: 'text-green-600 bg-green-50 dark:bg-green-900/20',
    degraded: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20',
    offline: 'text-red-600 bg-red-50 dark:bg-red-900/20'
  };
  return colors[status] || colors.offline;
};

/**
 * Get system icon
 */
export const getSystemIcon = (system) => {
  const icons = {
    transportation: '🚗',
    power: '⚡',
    waste: '♻️',
    water: '💧'
  };
  return icons[system] || '📊';
};

/**
 * Calculate trend
 */
export const calculateTrend = (data, key = 'value') => {
  if (data.length < 2) return 0;

  const recent = data.slice(-10);
  const values = recent.map(d => d[key]);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const lastValue = values[values.length - 1];

  return ((lastValue - avg) / avg) * 100;
};

/**
 * Debounce function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Export data to CSV
 */
export const exportToCSV = (data, filename) => {
  if (!data.length) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',')
          ? `"${value}"`
          : value;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}-${Date.now()}.csv`;
  link.click();
};

/**
 * Generate color gradient
 */
export const getGradientColor = (value, min = 0, max = 100) => {
  const percentage = ((value - min) / (max - min)) * 100;

  if (percentage <= 33) {
    return '#10b981'; // Green
  } else if (percentage <= 66) {
    return '#f59e0b'; // Yellow
  } else {
    return '#ef4444'; // Red
  }
};

/**
 * Deep clone object
 */
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Group array by key
 */
export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const group = item[key];
    if (!result[group]) {
      result[group] = [];
    }
    result[group].push(item);
    return result;
  }, {});
};

/**
 * Sort array by key
 */
export const sortBy = (array, key, direction = 'asc') => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];

    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};

/**
 * Filter array by search query
 */
export const filterBySearch = (array, searchQuery, keys) => {
  if (!searchQuery) return array;

  const query = searchQuery.toLowerCase();
  return array.filter(item =>
    keys.some(key => {
      const value = item[key];
      return value && value.toString().toLowerCase().includes(query);
    })
  );
};

/**
 * Calculate statistics
 */
export const calculateStats = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  const sum = sorted.reduce((a, b) => a + b, 0);
  const mean = sum / sorted.length;

  const median = sorted.length % 2 === 0
    ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
    : sorted[Math.floor(sorted.length / 2)];

  const variance = sorted.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / sorted.length;
  const stdDev = Math.sqrt(variance);

  return {
    min: sorted[0],
    max: sorted[sorted.length - 1],
    mean,
    median,
    stdDev,
    sum,
    count: sorted.length
  };
};
