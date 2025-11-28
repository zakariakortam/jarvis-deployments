import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from '../common/Card';
import { Zap, Flame, Droplet, DollarSign } from 'lucide-react';
import dataSimulator from '../../services/dataSimulator';

export const EnergyDashboard = ({ buildingId }) => {
  const [data, setData] = useState([]);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    if (buildingId) {
      const energyData = dataSimulator.generateEnergyUsage(buildingId);
      setData(energyData);
    }
  }, [buildingId]);

  const totalEnergy = data.reduce((sum, d) => sum + d.total, 0);
  const totalCost = data.reduce((sum, d) => sum + d.cost, 0);
  const avgDaily = data.length > 0 ? totalEnergy / data.length : 0;

  const latestData = data[data.length - 1] || {};
  const previousData = data[data.length - 2] || {};
  const costChange = previousData.cost ? ((latestData.cost - previousData.cost) / previousData.cost * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Energy</p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {(totalEnergy / 1000).toFixed(1)}K
              </p>
              <p className="text-xs text-muted-foreground mt-1">kWh</p>
            </div>
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Zap className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Cost</p>
              <p className="text-2xl font-bold text-foreground mt-1">
                ${(totalCost / 1000).toFixed(1)}K
              </p>
              <p className={`text-xs mt-1 ${costChange > 0 ? 'text-red-500' : 'text-green-500'}`}>
                {costChange > 0 ? '+' : ''}{costChange.toFixed(1)}%
              </p>
            </div>
            <div className="p-2 bg-green-500/10 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg Daily</p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {avgDaily.toFixed(0)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">kWh/day</p>
            </div>
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <Flame className="w-6 h-6 text-orange-500" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Water Usage</p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {(data.reduce((sum, d) => sum + d.water, 0) / 1000).toFixed(1)}K
              </p>
              <p className="text-xs text-muted-foreground mt-1">gallons</p>
            </div>
            <div className="p-2 bg-cyan-500/10 rounded-lg">
              <Droplet className="w-6 h-6 text-cyan-500" />
            </div>
          </div>
        </Card>
      </div>

      <Card title="Energy Consumption by Type">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.slice(-14)}>
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
            <Bar dataKey="electricity" fill="#3b82f6" name="Electricity (kWh)" />
            <Bar dataKey="gas" fill="#f97316" name="Gas (kWh)" />
            <Bar dataKey="water" fill="#06b6d4" name="Water (gal)" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card title="Cost Trend">
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data}>
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
            <Line
              type="monotone"
              dataKey="cost"
              stroke="#10b981"
              strokeWidth={2}
              name="Cost ($)"
              dot={{ fill: '#10b981' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};
