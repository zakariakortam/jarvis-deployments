import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';
import useDashboardStore from '../../store/dashboardStore';

const VibrationChart = ({ equipmentId }) => {
  const { historicalData, isDarkMode } = useDashboardStore();

  const chartData = useMemo(() => {
    if (!historicalData[equipmentId]) return [];

    return historicalData[equipmentId].map(point => ({
      timestamp: new Date(point.timestamp).toLocaleTimeString(),
      vibration: point.vibration.toFixed(3),
    }));
  }, [historicalData, equipmentId]);

  const maxVibration = useMemo(() => {
    if (chartData.length === 0) return 5;
    return Math.max(...chartData.map(d => parseFloat(d.vibration)));
  }, [chartData]);

  const currentVibration = chartData.length > 0 ? parseFloat(chartData[chartData.length - 1].vibration) : 0;
  const status = currentVibration > 5 ? 'critical' : currentVibration > 3 ? 'warning' : 'success';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Vibration Analysis</h3>
        </div>
        <div className={`text-2xl font-bold text-${status}`}>
          {currentVibration.toFixed(2)} mm/s
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="vibrationGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
          <XAxis
            dataKey="timestamp"
            stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
            tick={{ fontSize: 12 }}
            domain={[0, Math.ceil(maxVibration)]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
              border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
              borderRadius: '8px',
            }}
          />
          <Area
            type="monotone"
            dataKey="vibration"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#vibrationGradient)"
            animationDuration={300}
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
        <div>
          <div className="text-muted-foreground">Normal</div>
          <div className="font-semibold text-success">&lt; 3.0 mm/s</div>
        </div>
        <div>
          <div className="text-muted-foreground">Warning</div>
          <div className="font-semibold text-warning">3.0 - 5.0 mm/s</div>
        </div>
        <div>
          <div className="text-muted-foreground">Critical</div>
          <div className="font-semibold text-destructive">&gt; 5.0 mm/s</div>
        </div>
      </div>
    </motion.div>
  );
};

export default VibrationChart;
