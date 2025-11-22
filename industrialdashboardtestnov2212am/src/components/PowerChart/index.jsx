import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import useDashboardStore from '../../store/dashboardStore';

const PowerChart = () => {
  const { currentSnapshot, isDarkMode } = useDashboardStore();

  const chartData = useMemo(() => {
    if (!currentSnapshot || currentSnapshot.length === 0) return [];

    const topEquipment = [...currentSnapshot]
      .sort((a, b) => b.power - a.power)
      .slice(0, 10)
      .map(item => ({
        name: item.name.length > 15 ? item.name.substring(0, 15) + '...' : item.name,
        power: item.power.toFixed(2),
        status: item.status,
      }));

    return topEquipment;
  }, [currentSnapshot]);

  const totalPower = useMemo(() => {
    return currentSnapshot.reduce((sum, item) => sum + item.power, 0);
  }, [currentSnapshot]);

  const getBarColor = (status) => {
    switch (status) {
      case 'operational':
        return '#10b981';
      case 'warning':
        return '#f59e0b';
      case 'critical':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Zap className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Power Consumption</h3>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Total Power</div>
          <div className="text-2xl font-bold text-primary">{totalPower.toFixed(1)} kW</div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
          <XAxis
            dataKey="name"
            stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
            tick={{ fontSize: 11 }}
            angle={-45}
            textAnchor="end"
            height={100}
          />
          <YAxis
            stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
            tick={{ fontSize: 12 }}
            label={{ value: 'Power (kW)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
              border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
              borderRadius: '8px',
            }}
          />
          <Bar dataKey="power" radius={[8, 8, 0, 0]} animationDuration={300}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.status)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 text-sm text-muted-foreground text-center">
        Top 10 Equipment by Power Consumption
      </div>
    </motion.div>
  );
};

export default PowerChart;
