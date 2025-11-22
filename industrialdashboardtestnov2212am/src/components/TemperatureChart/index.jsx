import { useEffect, useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { Thermometer } from 'lucide-react';
import useDashboardStore from '../../store/dashboardStore';

const TemperatureChart = ({ equipmentIds = [] }) => {
  const { historicalData, isDarkMode } = useDashboardStore();
  const [selectedEquipment, setSelectedEquipment] = useState([]);

  useEffect(() => {
    if (equipmentIds.length > 0) {
      setSelectedEquipment(equipmentIds.slice(0, 5)); // Show max 5 lines
    }
  }, [equipmentIds]);

  const chartData = useMemo(() => {
    if (selectedEquipment.length === 0) return [];

    const allTimestamps = new Set();
    selectedEquipment.forEach(id => {
      if (historicalData[id]) {
        historicalData[id].forEach(point => allTimestamps.add(point.timestamp));
      }
    });

    const sortedTimestamps = Array.from(allTimestamps).sort();

    return sortedTimestamps.map(timestamp => {
      const dataPoint = {
        timestamp: new Date(timestamp).toLocaleTimeString(),
        time: timestamp,
      };

      selectedEquipment.forEach(id => {
        if (historicalData[id]) {
          const point = historicalData[id].find(p => p.timestamp === timestamp);
          if (point) {
            dataPoint[id] = point.temperature.toFixed(1);
          }
        }
      });

      return dataPoint;
    });
  }, [historicalData, selectedEquipment]);

  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Thermometer className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Temperature Monitoring</h3>
        </div>
        <div className="text-sm text-muted-foreground">
          Last {chartData.length} readings
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
          <XAxis
            dataKey="timestamp"
            stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
            tick={{ fontSize: 12 }}
            label={{ value: 'Temperature (°C)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
              border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
              borderRadius: '8px',
            }}
          />
          <Legend />
          {selectedEquipment.map((id, index) => (
            <Line
              key={id}
              type="monotone"
              dataKey={id}
              stroke={colors[index % colors.length]}
              strokeWidth={2}
              dot={false}
              animationDuration={300}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      {selectedEquipment.length === 0 && (
        <div className="flex items-center justify-center h-[300px] text-muted-foreground">
          Select equipment to view temperature data
        </div>
      )}
    </motion.div>
  );
};

export default TemperatureChart;
