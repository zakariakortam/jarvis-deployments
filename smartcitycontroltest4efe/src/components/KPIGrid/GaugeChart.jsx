import React from 'react';
import { motion } from 'framer-motion';

const GaugeChart = ({ value, label, min = 0, max = 100 }) => {
  const percentage = ((value - min) / (max - min)) * 100;
  const rotation = (percentage / 100) * 180 - 90;

  const getColor = () => {
    if (percentage < 33) return '#10b981'; // green
    if (percentage < 66) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  return (
    <div className="relative w-full">
      <svg viewBox="0 0 200 120" className="w-full">
        {/* Background arc */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="12"
          strokeLinecap="round"
          className="dark:stroke-gray-700"
        />

        {/* Value arc */}
        <motion.path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke={getColor()}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${percentage * 2.51} 251`}
          initial={{ strokeDasharray: '0 251' }}
          animate={{ strokeDasharray: `${percentage * 2.51} 251` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />

        {/* Center text */}
        <text
          x="100"
          y="85"
          textAnchor="middle"
          className="text-3xl font-bold fill-gray-900 dark:fill-white"
        >
          {value.toFixed(1)}
        </text>
        <text
          x="100"
          y="105"
          textAnchor="middle"
          className="text-xs fill-gray-600 dark:fill-gray-400"
        >
          {label}
        </text>

        {/* Needle */}
        <motion.line
          x1="100"
          y1="100"
          x2="100"
          y2="40"
          stroke="#1f2937"
          strokeWidth="2"
          strokeLinecap="round"
          className="dark:stroke-gray-300"
          initial={{ rotate: -90 }}
          animate={{ rotate: rotation }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{ transformOrigin: '100px 100px' }}
        />
        <circle cx="100" cy="100" r="5" fill="#1f2937" className="dark:fill-gray-300" />
      </svg>
    </div>
  );
};

export default GaugeChart;
