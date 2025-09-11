'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock data for demonstration
const mockData = [
  { time: '00:00', efficiency: 85.2, target: 87.0 },
  { time: '04:00', efficiency: 86.1, target: 87.0 },
  { time: '08:00', efficiency: 87.5, target: 87.0 },
  { time: '12:00', efficiency: 88.2, target: 87.0 },
  { time: '16:00', efficiency: 87.8, target: 87.0 },
  { time: '20:00', efficiency: 87.3, target: 87.0 },
  { time: '24:00', efficiency: 87.1, target: 87.0 },
];

export default function EfficiencyChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Process Efficiency Trend</CardTitle>
        <CardDescription>
          24-hour efficiency performance vs target
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={mockData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              domain={['dataMin - 2', 'dataMax + 2']}
              tick={{ fontSize: 12 }}
              label={{ value: 'Efficiency (%)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              formatter={(value: number, name: string) => [
                `${value.toFixed(1)}%`,
                name === 'efficiency' ? 'Actual' : 'Target'
              ]}
              labelFormatter={(label) => `Time: ${label}`}
            />
            <Line 
              type="monotone" 
              dataKey="efficiency" 
              stroke="#2563eb" 
              strokeWidth={2}
              dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="target" 
              stroke="#dc2626" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: '#dc2626', strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}