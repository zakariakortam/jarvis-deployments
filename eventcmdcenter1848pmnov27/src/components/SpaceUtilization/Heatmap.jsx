import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import dataSimulator from '../../services/dataSimulator';

export const SpaceUtilizationHeatmap = ({ buildingId }) => {
  const [data, setData] = useState([]);
  const [selectedDay, setSelectedDay] = useState('Mon');

  useEffect(() => {
    if (buildingId) {
      const utilizationData = dataSimulator.generateSpaceUtilization(buildingId);
      setData(utilizationData);
    }
  }, [buildingId]);

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const dayData = data.filter(d => d.day === selectedDay);
  const floors = [...new Set(dayData.map(d => d.floor))].sort((a, b) => b - a);

  const getColor = (utilization) => {
    if (utilization >= 80) return 'bg-red-500';
    if (utilization >= 60) return 'bg-orange-500';
    if (utilization >= 40) return 'bg-yellow-500';
    if (utilization >= 20) return 'bg-green-500';
    return 'bg-blue-500';
  };

  const getOpacity = (utilization) => {
    return Math.max(0.2, utilization / 100);
  };

  return (
    <Card
      title="Space Utilization Heatmap"
      action={
        <div className="flex gap-2">
          {days.map(day => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                selectedDay === day
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      }
    >
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          <div className="flex gap-1 mb-2">
            <div className="w-16 text-sm font-medium text-muted-foreground">Floor</div>
            {hours.map(hour => (
              <div key={hour} className="w-8 text-xs text-center text-muted-foreground">
                {hour}
              </div>
            ))}
          </div>

          {floors.map(floor => (
            <div key={floor} className="flex gap-1 mb-1">
              <div className="w-16 text-sm font-medium text-foreground flex items-center">
                {floor}
              </div>
              {hours.map(hour => {
                const cell = dayData.find(d => d.floor === floor && d.hour === hour);
                const utilization = cell ? cell.utilization : 0;

                return (
                  <div
                    key={hour}
                    className={`w-8 h-8 rounded ${getColor(utilization)} cursor-pointer hover:ring-2 hover:ring-primary transition-all`}
                    style={{ opacity: getOpacity(utilization) }}
                    title={`Floor ${floor}, ${hour}:00 - ${utilization}%`}
                  />
                );
              })}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4 mt-6 text-sm">
          <span className="text-muted-foreground">Utilization:</span>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 opacity-20 rounded"></div>
            <span className="text-xs text-muted-foreground">0-20%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 opacity-40 rounded"></div>
            <span className="text-xs text-muted-foreground">20-40%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 opacity-60 rounded"></div>
            <span className="text-xs text-muted-foreground">40-60%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 opacity-80 rounded"></div>
            <span className="text-xs text-muted-foreground">60-80%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 opacity-100 rounded"></div>
            <span className="text-xs text-muted-foreground">80-100%</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
