import React, { useState, useEffect } from 'react';
import { LineChart, Line, AreaChart, Area, ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from '../common/Card';
import { TrendingUp, DollarSign, Percent, PieChart } from 'lucide-react';
import dataSimulator from '../../services/dataSimulator';

export const InvestmentAnalytics = ({ buildingId }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    if (buildingId) {
      const investmentData = dataSimulator.generateInvestmentPerformance(buildingId);
      setData(investmentData);
    }
  }, [buildingId]);

  const latestData = data[data.length - 1] || {};
  const previousData = data[data.length - 2] || {};
  const valueChange = previousData.value
    ? ((latestData.value - previousData.value) / previousData.value * 100)
    : 0;

  const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0);
  const totalExpenses = data.reduce((sum, d) => sum + d.expenses, 0);
  const totalNOI = data.reduce((sum, d) => sum + d.noi, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Property Value</p>
              <p className="text-2xl font-bold text-foreground mt-1">
                ${(latestData.value / 1000000).toFixed(2)}M
              </p>
              <p className={`text-xs mt-1 ${valueChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {valueChange >= 0 ? '+' : ''}{valueChange.toFixed(2)}%
              </p>
            </div>
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">ROI</p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {latestData.roi}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">Annual return</p>
            </div>
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Percent className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Cap Rate</p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {latestData.capRate}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">Current</p>
            </div>
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <PieChart className="w-6 h-6 text-purple-500" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">NOI</p>
              <p className="text-2xl font-bold text-foreground mt-1">
                ${(latestData.noi / 1000).toFixed(0)}K
              </p>
              <p className="text-xs text-muted-foreground mt-1">Monthly</p>
            </div>
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <TrendingUp className="w-6 h-6 text-orange-500" />
            </div>
          </div>
        </Card>
      </div>

      <Card title="Property Value Trend">
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
              formatter={(value) => `$${(value / 1000000).toFixed(2)}M`}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.3}
              name="Property Value"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Revenue vs Expenses">
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={data.slice(-12)}>
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
              <Bar dataKey="revenue" fill="#10b981" name="Revenue" />
              <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
              <Line
                type="monotone"
                dataKey="noi"
                stroke="#3b82f6"
                strokeWidth={2}
                name="NOI"
                dot={{ fill: '#3b82f6' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Return Metrics">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.slice(-12)}>
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
                dataKey="roi"
                stroke="#10b981"
                strokeWidth={2}
                name="ROI %"
                dot={{ fill: '#10b981' }}
              />
              <Line
                type="monotone"
                dataKey="capRate"
                stroke="#8b5cf6"
                strokeWidth={2}
                name="Cap Rate %"
                dot={{ fill: '#8b5cf6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card title="Performance Summary">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Total Revenue (24mo)</p>
            <p className="text-2xl font-bold text-foreground">
              ${(totalRevenue / 1000000).toFixed(2)}M
            </p>
            <div className="w-full bg-secondary rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Total Expenses (24mo)</p>
            <p className="text-2xl font-bold text-foreground">
              ${(totalExpenses / 1000000).toFixed(2)}M
            </p>
            <div className="w-full bg-secondary rounded-full h-2">
              <div className="bg-red-500 h-2 rounded-full" style={{ width: '45%' }}></div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Total NOI (24mo)</p>
            <p className="text-2xl font-bold text-foreground">
              ${(totalNOI / 1000000).toFixed(2)}M
            </p>
            <div className="w-full bg-secondary rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '85%' }}></div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
