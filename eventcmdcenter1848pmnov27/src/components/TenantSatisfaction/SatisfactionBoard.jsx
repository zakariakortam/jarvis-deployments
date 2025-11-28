import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from '../common/Card';
import { ThumbsUp, TrendingUp, TrendingDown, Users } from 'lucide-react';
import dataSimulator from '../../services/dataSimulator';

export const TenantSatisfactionBoard = ({ buildingId }) => {
  const [data, setData] = useState({ current: [], historical: [] });

  useEffect(() => {
    if (buildingId) {
      const satisfactionData = dataSimulator.generateTenantSatisfaction(buildingId);
      setData(satisfactionData);
    }
  }, [buildingId]);

  const avgScore = data.current.length > 0
    ? data.current.reduce((sum, d) => sum + d.score, 0) / data.current.length
    : 0;

  const totalResponses = data.current.reduce((sum, d) => sum + d.responses, 0);

  const getScoreColor = (score) => {
    if (score >= 85) return 'text-green-600 dark:text-green-400';
    if (score >= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBg = (score) => {
    if (score >= 85) return 'bg-green-100 dark:bg-green-900';
    if (score >= 70) return 'bg-yellow-100 dark:bg-yellow-900';
    return 'bg-red-100 dark:bg-red-900';
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg Satisfaction</p>
              <p className={`text-3xl font-bold mt-1 ${getScoreColor(avgScore)}`}>
                {avgScore.toFixed(1)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">out of 100</p>
            </div>
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <ThumbsUp className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Responses</p>
              <p className="text-3xl font-bold text-foreground mt-1">
                {totalResponses}
              </p>
              <p className="text-xs text-muted-foreground mt-1">this month</p>
            </div>
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Users className="w-6 h-6 text-purple-500" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Response Rate</p>
              <p className="text-3xl font-bold text-foreground mt-1">
                {data.historical.length > 0
                  ? data.historical[data.historical.length - 1].responseRate.toFixed(0)
                  : 0}%
              </p>
              <p className="text-xs text-green-500 mt-1">
                <TrendingUp className="w-3 h-3 inline" /> +5.2%
              </p>
            </div>
            <div className="p-2 bg-green-500/10 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Satisfaction by Category">
          <div className="space-y-3">
            {data.current.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{item.category}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${getScoreColor(item.score)}`}>
                      {item.score.toFixed(1)}
                    </span>
                    {item.trend > 0 ? (
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    ) : item.trend < 0 ? (
                      <TrendingDown className="w-4 h-4 text-red-500" />
                    ) : null}
                  </div>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getScoreBg(item.score)}`}
                    style={{ width: `${item.score}%` }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {item.responses} responses
                </p>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Satisfaction Radar">
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={data.current}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="category" className="text-xs" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar
                name="Score"
                dataKey="score"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.6}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.5rem'
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card title="Historical Trend">
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data.historical}>
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
              dataKey="satisfaction"
              stroke="#3b82f6"
              strokeWidth={2}
              name="Satisfaction Score"
              dot={{ fill: '#3b82f6' }}
            />
            <Line
              type="monotone"
              dataKey="responseRate"
              stroke="#10b981"
              strokeWidth={2}
              name="Response Rate %"
              dot={{ fill: '#10b981' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};
