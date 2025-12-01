import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export default function GaugeChart({
  value,
  min = 0,
  max = 100,
  thresholds = { warning: 70, danger: 90 },
  label,
  unit = '',
  size = 150,
}) {
  const percentage = useMemo(() => {
    return Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  }, [value, min, max]);

  const getColor = () => {
    const pct = (value - min) / (max - min) * 100;
    if (pct >= thresholds.danger) return '#ef4444';
    if (pct >= thresholds.warning) return '#f59e0b';
    return '#10b981';
  };

  const data = [
    { name: 'value', value: percentage },
    { name: 'empty', value: 100 - percentage },
  ];

  return (
    <div className="relative" style={{ width: size, height: size * 0.7 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="90%"
            startAngle={180}
            endAngle={0}
            innerRadius="60%"
            outerRadius="100%"
            paddingAngle={0}
            dataKey="value"
          >
            <Cell fill={getColor()} />
            <Cell fill="#e5e7eb" className="dark:fill-gray-700" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
        <span className="text-2xl font-bold text-gray-900 dark:text-white">
          {typeof value === 'number' ? value.toFixed(1) : value}
        </span>
        {unit && (
          <span className="text-xs text-gray-500 dark:text-gray-400">{unit}</span>
        )}
        {label && (
          <span className="text-xs font-medium text-gray-600 dark:text-gray-300 mt-1">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
