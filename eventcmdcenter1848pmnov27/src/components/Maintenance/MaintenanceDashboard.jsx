import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from '../common/Card';
import { Wrench, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import dataSimulator from '../../services/dataSimulator';

export const MaintenanceDashboard = ({ buildingId }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    if (buildingId) {
      const maintenanceData = dataSimulator.generateMaintenanceCosts(buildingId);
      setData(maintenanceData);
    }
  }, [buildingId]);

  const latestMonth = data[data.length - 1] || {};
  const totalCost = data.reduce((sum, d) => sum + d.total, 0);
  const avgMonthlyCost = data.length > 0 ? totalCost / data.length : 0;

  const categoryData = [
    { name: 'HVAC', value: latestMonth.hvac || 0, color: '#3b82f6' },
    { name: 'Electrical', value: latestMonth.electrical || 0, color: '#f59e0b' },
    { name: 'Plumbing', value: latestMonth.plumbing || 0, color: '#06b6d4' },
    { name: 'Elevators', value: latestMonth.elevators || 0, color: '#8b5cf6' },
    { name: 'Security', value: latestMonth.security || 0, color: '#10b981' },
    { name: 'Cleaning', value: latestMonth.cleaning || 0, color: '#ec4899' },
    { name: 'Landscaping', value: latestMonth.landscaping || 0, color: '#84cc16' }
  ];

  const typeData = data.slice(-6).map(d => ({
    month: d.month,
    Preventive: d.preventive,
    Reactive: d.reactive,
    Emergency: d.emergency,
    Planned: d.planned
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Cost</p>
              <p className="text-2xl font-bold text-foreground mt-1">
                ${(totalCost / 1000).toFixed(0)}K
              </p>
              <p className="text-xs text-muted-foreground mt-1">Last 12 months</p>
            </div>
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Wrench className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg Monthly</p>
              <p className="text-2xl font-bold text-foreground mt-1">
                ${avgMonthlyCost.toFixed(0)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">per month</p>
            </div>
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <Clock className="w-6 h-6 text-orange-500" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Preventive</p>
              <p className="text-2xl font-bold text-foreground mt-1">
                ${(latestMonth.preventive / 1000).toFixed(1)}K
              </p>
              <p className="text-xs text-green-500 mt-1">
                {((latestMonth.preventive / latestMonth.total) * 100).toFixed(0)}% of total
              </p>
            </div>
            <div className="p-2 bg-green-500/10 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Emergency</p>
              <p className="text-2xl font-bold text-foreground mt-1">
                ${(latestMonth.emergency / 1000).toFixed(1)}K
              </p>
              <p className="text-xs text-red-500 mt-1">
                {((latestMonth.emergency / latestMonth.total) * 100).toFixed(0)}% of total
              </p>
            </div>
            <div className="p-2 bg-red-500/10 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Cost by Type">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={typeData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" className="text-muted-foreground" />
              <YAxis className="text-muted-foreground" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.5rem'
                }}
              />
              <Legend />
              <Bar dataKey="Preventive" stackId="a" fill="#10b981" />
              <Bar dataKey="Reactive" stackId="a" fill="#f59e0b" />
              <Bar dataKey="Emergency" stackId="a" fill="#ef4444" />
              <Bar dataKey="Planned" stackId="a" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Cost by Category">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.5rem'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card title="Monthly Trend">
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="month" className="text-muted-foreground" />
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
              dataKey="total"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              name="Total Cost"
              dot={{ fill: 'hsl(var(--primary))' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};
