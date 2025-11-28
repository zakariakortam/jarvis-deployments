import React, { useState, useEffect } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from '../common/Card';
import dataSimulator from '../../services/dataSimulator';

export const OccupancyChart = ({ buildingId }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    if (buildingId) {
      const occupancyData = dataSimulator.generateOccupancyData(buildingId);
      setData(occupancyData);
    }
  }, [buildingId]);

  return (
    <Card title="Occupancy Rate Trend">
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="date" className="text-muted-foreground" />
          <YAxis className="text-muted-foreground" />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '0.5rem'
            }}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="occupancy"
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary))"
            fillOpacity={0.3}
            name="Occupancy %"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
};
