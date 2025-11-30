import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Shield,
  Users,
  Radio,
  Globe,
  Building,
  Brain,
  TrendingUp,
  Activity,
  Eye,
  Zap,
  Target,
  Crosshair,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import useStore from '../../stores/mainStore';
import { Panel, MetricCard, Badge, StatusIndicator, ProgressBar } from '../common';
import { format } from 'date-fns';

export default function Dashboard() {
  const {
    globalMetrics,
    alertLevel,
    threats,
    operations,
    cyberEvents,
    intercepts,
    incidents,
    influenceOps,
    assets,
    setActiveModule,
    selectEntity,
  } = useStore();

  const [activityFeed, setActivityFeed] = useState([]);
  const [threatTrend, setThreatTrend] = useState([]);

  // Generate activity feed from recent events
  useEffect(() => {
    const activities = [
      ...threats.slice(0, 5).map(t => ({
        type: 'threat',
        icon: AlertTriangle,
        color: 'text-threat-critical',
        title: t.type,
        subtitle: t.actor.name,
        time: t.timestamp,
        severity: t.threatLevel,
      })),
      ...cyberEvents.slice(0, 5).map(c => ({
        type: 'cyber',
        icon: Shield,
        color: 'text-agency-cyber',
        title: c.type,
        subtitle: c.target,
        time: c.timestamp,
        severity: c.severity,
      })),
      ...intercepts.slice(0, 5).map(i => ({
        type: 'sigint',
        icon: Radio,
        color: 'text-agency-intel',
        title: `${i.protocol} Intercept`,
        subtitle: i.suspectedActor.name,
        time: i.timestamp,
        severity: 'elevated',
      })),
    ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 15);

    setActivityFeed(activities);
  }, [threats, cyberEvents, intercepts]);

  // Generate threat trend data
  useEffect(() => {
    const now = new Date();
    const trend = Array(24).fill(0).map((_, i) => {
      const hour = new Date(now - (23 - i) * 3600000);
      return {
        time: format(hour, 'HH:mm'),
        threats: Math.floor(Math.random() * 10) + 5,
        cyber: Math.floor(Math.random() * 8) + 3,
        influence: Math.floor(Math.random() * 6) + 2,
      };
    });
    setThreatTrend(trend);
  }, []);

  const alertColors = {
    LOW: { bg: 'bg-threat-low', text: 'text-threat-low' },
    GUARDED: { bg: 'bg-threat-guarded', text: 'text-threat-guarded' },
    ELEVATED: { bg: 'bg-threat-elevated', text: 'text-threat-elevated' },
    HIGH: { bg: 'bg-threat-high', text: 'text-threat-high' },
    SEVERE: { bg: 'bg-threat-critical', text: 'text-threat-critical' },
  };

  const threatDistribution = [
    { name: 'Cyber', value: threats.filter(t => t.actor.focus?.includes('cyber')).length, color: '#00d4ff' },
    { name: 'Espionage', value: threats.filter(t => t.actor.focus?.includes('espionage')).length, color: '#6366f1' },
    { name: 'Terror', value: threats.filter(t => t.actor.type === 'terror').length, color: '#ff0040' },
    { name: 'Military', value: threats.filter(t => t.actor.focus?.includes('military')).length, color: '#22c55e' },
    { name: 'Financial', value: threats.filter(t => t.actor.focus?.includes('financial')).length, color: '#f59e0b' },
  ];

  const operationsByStatus = [
    { name: 'Active', value: operations.filter(o => o.status === 'active').length, color: '#00ff88' },
    { name: 'Planning', value: operations.filter(o => o.status === 'planning').length, color: '#00d4ff' },
    { name: 'Standby', value: operations.filter(o => o.status === 'standby').length, color: '#ffaa00' },
    { name: 'Completed', value: operations.filter(o => o.status === 'completed').length, color: '#666666' },
  ];

  return (
    <div className="h-full overflow-auto p-4 space-y-4">
      {/* Top Row - Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <MetricCard
          label="Active Threats"
          value={globalMetrics.threatCount}
          icon={AlertTriangle}
          color="threat-critical"
          trend="up"
          trendValue="+3 today"
          onClick={() => setActiveModule('threats')}
        />
        <MetricCard
          label="Operations"
          value={globalMetrics.activeOperations}
          icon={Target}
          color="agency-defense"
          onClick={() => setActiveModule('operations')}
        />
        <MetricCard
          label="Intercepts (24h)"
          value={globalMetrics.interceptsToday}
          icon={Radio}
          color="agency-intel"
          onClick={() => setActiveModule('sigint')}
        />
        <MetricCard
          label="Cyber Alerts"
          value={globalMetrics.cyberAlerts}
          icon={Shield}
          color="agency-cyber"
          trend="up"
          trendValue="+5 active"
          onClick={() => setActiveModule('cyber')}
        />
        <MetricCard
          label="Active Assets"
          value={globalMetrics.assetsActive}
          icon={Users}
          color="agency-foreign"
          onClick={() => setActiveModule('humint')}
        />
        <MetricCard
          label="Influence Ops"
          value={globalMetrics.influenceOpsTracked}
          icon={Brain}
          color="agency-intel"
          onClick={() => setActiveModule('psyops')}
        />
        <MetricCard
          label="Infra Alerts"
          value={globalMetrics.infrastructureAlerts}
          icon={Building}
          color="threat-elevated"
          onClick={() => setActiveModule('infrastructure')}
        />
        <MetricCard
          label="Risk Score"
          value={`${globalMetrics.overallRiskScore}%`}
          icon={Activity}
          color={alertColors[alertLevel].text.replace('text-', '')}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column - Threat Overview */}
        <div className="lg:col-span-2 space-y-4">
          {/* Threat Trend Chart */}
          <Panel title="Threat Activity (24h)" icon={Activity}>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={threatTrend}>
                  <defs>
                    <linearGradient id="threatGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff0040" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ff0040" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="cyberGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00d4ff" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="#666" tick={{ fill: '#666', fontSize: 10 }} />
                  <YAxis stroke="#666" tick={{ fill: '#666', fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0d0d14', border: '1px solid #1a1a2e', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="threats" stroke="#ff0040" fillOpacity={1} fill="url(#threatGradient)" name="Threats" />
                  <Area type="monotone" dataKey="cyber" stroke="#00d4ff" fillOpacity={1} fill="url(#cyberGradient)" name="Cyber" />
                  <Line type="monotone" dataKey="influence" stroke="#6366f1" strokeWidth={2} dot={false} name="Influence" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          {/* Critical Threats */}
          <Panel
            title="Critical Threats"
            icon={AlertTriangle}
            actions={
              <button
                onClick={() => setActiveModule('threats')}
                className="text-xs text-cmd-accent hover:underline flex items-center gap-1"
              >
                View All <ChevronRight size={14} />
              </button>
            }
          >
            <div className="space-y-2">
              {threats
                .filter(t => ['critical', 'high'].includes(t.threatLevel))
                .slice(0, 5)
                .map((threat) => (
                  <motion.div
                    key={threat.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-3 bg-cmd-dark/50 rounded-lg hover:bg-cmd-dark cursor-pointer transition-colors"
                    onClick={() => {
                      selectEntity(threat, 'threat');
                      setActiveModule('threats');
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        threat.threatLevel === 'critical' ? 'bg-threat-critical animate-pulse' : 'bg-threat-high'
                      }`} />
                      <div>
                        <p className="text-sm font-medium text-white">{threat.type}</p>
                        <p className="text-xs text-gray-500">{threat.actor.name} - {threat.origin.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={threat.threatLevel}>{threat.threatLevel}</Badge>
                      <span className="text-xs text-gray-500">
                        {format(new Date(threat.timestamp), 'HH:mm')}
                      </span>
                    </div>
                  </motion.div>
                ))}
            </div>
          </Panel>

          {/* Active Operations */}
          <Panel
            title="Active Operations"
            icon={Target}
            actions={
              <button
                onClick={() => setActiveModule('operations')}
                className="text-xs text-cmd-accent hover:underline flex items-center gap-1"
              >
                View All <ChevronRight size={14} />
              </button>
            }
          >
            <div className="space-y-3">
              {operations
                .filter(o => o.status === 'active')
                .slice(0, 4)
                .map((op) => (
                  <div
                    key={op.id}
                    className="p-3 bg-cmd-dark/50 rounded-lg hover:bg-cmd-dark cursor-pointer transition-colors"
                    onClick={() => {
                      selectEntity(op, 'operation');
                      setActiveModule('operations');
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <StatusIndicator status="active" />
                        <span className="text-sm font-medium text-cmd-accent">{op.codeName}</span>
                      </div>
                      <Badge variant="success">{op.phase}</Badge>
                    </div>
                    <p className="text-xs text-gray-400 mb-2">{op.type} - {op.leadAgency.id}</p>
                    <ProgressBar value={op.phaseProgress} color="cmd-accent" />
                  </div>
                ))}
            </div>
          </Panel>
        </div>

        {/* Right Column - Activity Feed & Stats */}
        <div className="space-y-4">
          {/* Global Risk Indicator */}
          <Panel title="Global Risk Assessment" icon={Eye}>
            <div className="text-center py-4">
              <div className="relative w-32 h-32 mx-auto">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="#1a1a2e"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke={alertColors[alertLevel].bg.replace('bg-', 'rgb(var(--')}
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${globalMetrics.overallRiskScore * 3.52} 352`}
                    strokeLinecap="round"
                    className={alertColors[alertLevel].text}
                    style={{
                      stroke: alertLevel === 'SEVERE' ? '#ff0040' :
                              alertLevel === 'HIGH' ? '#ff4400' :
                              alertLevel === 'ELEVATED' ? '#ff8800' :
                              alertLevel === 'GUARDED' ? '#ffcc00' : '#00cc44'
                    }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-3xl font-bold ${alertColors[alertLevel].text}`}>
                    {globalMetrics.overallRiskScore}
                  </span>
                  <span className="text-xs text-gray-500 uppercase">Risk Score</span>
                </div>
              </div>
              <div className={`mt-4 px-4 py-2 rounded-lg ${alertColors[alertLevel].bg}/20 border ${alertColors[alertLevel].bg.replace('bg-', 'border-')}/50`}>
                <span className={`text-sm font-bold ${alertColors[alertLevel].text}`}>
                  THREAT LEVEL: {alertLevel}
                </span>
              </div>
            </div>
          </Panel>

          {/* Threat Distribution */}
          <Panel title="Threat Distribution" icon={Crosshair}>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={threatDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {threatDistribution.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0d0d14', border: '1px solid #1a1a2e', borderRadius: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {threatDistribution.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-gray-400">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </Panel>

          {/* Activity Feed */}
          <Panel title="Real-Time Activity" icon={Zap}>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {activityFeed.map((activity, idx) => {
                const Icon = activity.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-start gap-3 p-2 rounded hover:bg-cmd-dark/50 transition-colors"
                  >
                    <div className={`p-1.5 rounded ${activity.color}/20`}>
                      <Icon size={14} className={activity.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white truncate">{activity.title}</p>
                      <p className="text-[10px] text-gray-500 truncate">{activity.subtitle}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={activity.severity} className="text-[9px]">
                        {activity.severity}
                      </Badge>
                      <p className="text-[10px] text-gray-600 mt-1">
                        {format(new Date(activity.time), 'HH:mm:ss')}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </Panel>

          {/* Quick Stats */}
          <Panel title="Operations Status" icon={Target}>
            <div className="space-y-3">
              {operationsByStatus.map((status) => (
                <div key={status.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: status.color }} />
                    <span className="text-sm text-gray-400">{status.name}</span>
                  </div>
                  <span className="text-sm font-bold text-white">{status.value}</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>

      {/* Bottom Row - Regional Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { region: 'EURASIA', threats: threats.filter(t => t.origin.region === 'EURASIA').length, color: 'threat-critical' },
          { region: 'ASIA-PACIFIC', threats: threats.filter(t => t.origin.region === 'ASIA-PACIFIC').length, color: 'threat-high' },
          { region: 'MIDDLE-EAST', threats: threats.filter(t => t.origin.region === 'MIDDLE-EAST').length, color: 'threat-elevated' },
          { region: 'GLOBAL', threats: threats.filter(t => t.origin.region === 'GLOBAL' || !t.origin.region).length, color: 'threat-guarded' },
        ].map((region) => (
          <Panel key={region.region} className="cursor-pointer hover:border-cmd-accent/50 transition-colors" onClick={() => setActiveModule('geospatial')}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">{region.region}</p>
                <p className={`text-2xl font-bold text-${region.color}`}>{region.threats}</p>
                <p className="text-xs text-gray-500">Active Threats</p>
              </div>
              <Globe size={32} className={`text-${region.color}/50`} />
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
