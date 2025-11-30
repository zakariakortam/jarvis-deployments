import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Globe,
  Building2,
  BarChart3,
  PieChart,
  Activity,
  AlertTriangle,
  FileText,
  Link,
  Briefcase,
  Landmark,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from 'lucide-react';
import useStore from '../../stores/mainStore';
import { Panel, Badge, SearchInput, Select, ProgressBar, Tabs } from '../common';
import { COUNTRIES } from '../../data/generators';

export default function EconomicIntel() {
  const { threats, operations, incidents } = useStore();

  const [activeTab, setActiveTab] = useState('overview');
  const [selectedSector, setSelectedSector] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const sectors = [
    { id: 'energy', name: 'Energy', icon: Activity, value: 245.8, change: 2.3 },
    { id: 'technology', name: 'Technology', icon: Building2, value: 892.4, change: -1.2 },
    { id: 'defense', name: 'Defense', icon: Briefcase, value: 156.7, change: 4.1 },
    { id: 'finance', name: 'Finance', icon: Landmark, value: 567.2, change: 0.8 },
    { id: 'commodities', name: 'Commodities', icon: BarChart3, value: 342.1, change: -3.4 },
    { id: 'agriculture', name: 'Agriculture', icon: Globe, value: 128.9, change: 1.7 },
  ];

  const sanctions = useMemo(() => {
    return COUNTRIES.filter(c => ['critical', 'high'].includes(c.threatLevel)).map(c => ({
      id: c.code,
      country: c.name,
      level: c.threatLevel === 'critical' ? 'Comprehensive' : 'Targeted',
      sectors: ['Finance', 'Energy', 'Technology'].slice(0, Math.floor(Math.random() * 3) + 1),
      entities: Math.floor(Math.random() * 500) + 50,
      lastUpdated: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      effectiveness: Math.floor(Math.random() * 40) + 60,
    }));
  }, []);

  const tradeFlows = useMemo(() => {
    return [
      { from: 'United States', to: 'China', value: 456.7, change: -8.2, risk: 'high' },
      { from: 'European Union', to: 'Russia', value: 123.4, change: -45.3, risk: 'critical' },
      { from: 'United States', to: 'European Union', value: 789.2, change: 3.1, risk: 'low' },
      { from: 'China', to: 'Africa', value: 234.5, change: 12.4, risk: 'medium' },
      { from: 'Middle East', to: 'Asia Pacific', value: 567.8, change: 5.6, risk: 'medium' },
    ];
  }, []);

  const economicIndicators = [
    { name: 'Global GDP Growth', value: '3.2%', trend: 'up', change: '+0.3%' },
    { name: 'Inflation (US)', value: '3.4%', trend: 'down', change: '-0.2%' },
    { name: 'Oil Price (Brent)', value: '$82.45', trend: 'up', change: '+$1.23' },
    { name: 'Gold Price', value: '$2,034', trend: 'stable', change: '+$12' },
    { name: 'USD Index', value: '104.2', trend: 'down', change: '-0.8' },
    { name: 'VIX', value: '14.32', trend: 'down', change: '-2.1' },
  ];

  const economicThreats = useMemo(() => {
    return threats.filter(t =>
      t.type.includes('economic') ||
      t.type.includes('sanctions') ||
      t.description?.toLowerCase().includes('economic')
    ).slice(0, 5);
  }, [threats]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: PieChart },
    { id: 'sanctions', label: 'Sanctions', icon: AlertTriangle },
    { id: 'trade', label: 'Trade Flows', icon: Link },
    { id: 'sectors', label: 'Sectors', icon: Building2 },
  ];

  const sectorOptions = [
    { value: 'all', label: 'All Sectors' },
    ...sectors.map(s => ({ value: s.id, label: s.name })),
  ];

  const regionOptions = [
    { value: 'all', label: 'All Regions' },
    { value: 'americas', label: 'Americas' },
    { value: 'europe', label: 'Europe' },
    { value: 'asia', label: 'Asia Pacific' },
    { value: 'middle_east', label: 'Middle East' },
    { value: 'africa', label: 'Africa' },
  ];

  const getTrendIcon = (trend) => {
    if (trend === 'up') return <ArrowUpRight size={14} className="text-status-active" />;
    if (trend === 'down') return <ArrowDownRight size={14} className="text-threat-critical" />;
    return <Minus size={14} className="text-gray-400" />;
  };

  const getRiskColor = (risk) => {
    const colors = {
      critical: 'text-threat-critical',
      high: 'text-threat-high',
      medium: 'text-threat-elevated',
      low: 'text-threat-low',
    };
    return colors[risk] || 'text-gray-400';
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 bg-cmd-panel border-b border-cmd-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-status-active/20">
              <DollarSign size={24} className="text-status-active" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Economic & Diplomatic Intelligence Engine</h1>
              <p className="text-sm text-gray-500">Global economic indicators and sanctions monitoring</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Select
              value={selectedSector}
              onChange={setSelectedSector}
              options={sectorOptions}
              className="w-40"
            />
            <Select
              value={selectedRegion}
              onChange={setSelectedRegion}
              options={regionOptions}
              className="w-40"
            />
          </div>
        </div>

        {/* Key Indicators */}
        <div className="grid grid-cols-6 gap-3">
          {economicIndicators.map((indicator) => (
            <div key={indicator.name} className="bg-cmd-dark rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500">{indicator.name}</span>
                {getTrendIcon(indicator.trend)}
              </div>
              <p className="text-lg font-bold text-white">{indicator.value}</p>
              <p className={`text-xs ${indicator.trend === 'up' ? 'text-status-active' : indicator.trend === 'down' ? 'text-threat-critical' : 'text-gray-400'}`}>
                {indicator.change}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-3 gap-4">
            {/* Sector Performance */}
            <Panel title="Sector Performance" icon={BarChart3} className="col-span-2">
              <div className="space-y-3">
                {sectors.map((sector) => {
                  const Icon = sector.icon;
                  return (
                    <div key={sector.id} className="flex items-center gap-4 p-3 bg-cmd-dark rounded-lg">
                      <div className="p-2 bg-cmd-darker rounded-lg">
                        <Icon size={20} className="text-cmd-accent" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-white">{sector.name}</span>
                          <span className="text-sm text-white">${sector.value}B</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-cmd-darker rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(sector.value / 900) * 100}%` }}
                              className={`h-full ${sector.change >= 0 ? 'bg-status-active' : 'bg-threat-critical'}`}
                            />
                          </div>
                          <span className={`text-xs ${sector.change >= 0 ? 'text-status-active' : 'text-threat-critical'}`}>
                            {sector.change >= 0 ? '+' : ''}{sector.change}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Panel>

            {/* Economic Threats */}
            <Panel title="Economic Threats" icon={AlertTriangle}>
              <div className="space-y-2">
                {economicThreats.length > 0 ? economicThreats.map((threat) => (
                  <div key={threat.id} className="p-3 bg-cmd-dark rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-white">{threat.name}</span>
                      <Badge variant={threat.threatLevel}>{threat.threatLevel}</Badge>
                    </div>
                    <p className="text-xs text-gray-500">{threat.origin?.name}</p>
                  </div>
                )) : (
                  <p className="text-sm text-gray-500 text-center py-4">No active economic threats</p>
                )}
              </div>
            </Panel>

            {/* Trade Flow Summary */}
            <Panel title="Major Trade Flows" icon={Link} className="col-span-2">
              <div className="space-y-2">
                {tradeFlows.map((flow, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-4 p-3 bg-cmd-dark rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-white">{flow.from}</span>
                        <ArrowUpRight size={14} className="text-gray-500" />
                        <span className="text-sm text-white">{flow.to}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-white">${flow.value}B</p>
                      <p className={`text-xs ${flow.change >= 0 ? 'text-status-active' : 'text-threat-critical'}`}>
                        {flow.change >= 0 ? '+' : ''}{flow.change}%
                      </p>
                    </div>
                    <Badge variant={flow.risk}>{flow.risk}</Badge>
                  </motion.div>
                ))}
              </div>
            </Panel>

            {/* Quick Stats */}
            <Panel title="Global Statistics">
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Active Sanctions Programs</p>
                  <p className="text-2xl font-bold text-threat-critical">{sanctions.length}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Sanctioned Entities</p>
                  <p className="text-2xl font-bold text-white">
                    {sanctions.reduce((sum, s) => sum + s.entities, 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Trade Disruption Index</p>
                  <p className="text-2xl font-bold text-threat-elevated">7.4</p>
                </div>
              </div>
            </Panel>
          </div>
        )}

        {activeTab === 'sanctions' && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 mb-4">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search sanctions programs..."
                className="w-64"
              />
            </div>

            <div className="grid gap-4">
              {sanctions.filter(s =>
                searchQuery === '' ||
                s.country.toLowerCase().includes(searchQuery.toLowerCase())
              ).map((sanction) => (
                <motion.div
                  key={sanction.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-cmd-panel border border-cmd-border rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-white">{sanction.country}</h3>
                      <p className="text-sm text-gray-500">Sanctions Program</p>
                    </div>
                    <Badge variant={sanction.level === 'Comprehensive' ? 'critical' : 'warning'}>
                      {sanction.level}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Sanctioned Entities</p>
                      <p className="text-lg font-bold text-white">{sanction.entities}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Affected Sectors</p>
                      <div className="flex flex-wrap gap-1">
                        {sanction.sectors.map((sector, i) => (
                          <span key={i} className="text-xs px-2 py-0.5 bg-cmd-dark rounded text-gray-300">
                            {sector}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Last Updated</p>
                      <p className="text-sm text-white">{sanction.lastUpdated.toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Effectiveness</p>
                      <div className="flex items-center gap-2">
                        <ProgressBar value={sanction.effectiveness} showLabel={false} height="h-1.5" />
                        <span className="text-xs text-white">{sanction.effectiveness}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button className="btn-secondary text-xs">View Details</button>
                    <button className="btn-secondary text-xs">Export Report</button>
                    <button className="btn-primary text-xs">Update Program</button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'trade' && (
          <div className="space-y-4">
            <Panel title="Global Trade Flow Analysis" icon={Globe}>
              <div className="h-64 relative bg-cmd-dark rounded-lg overflow-hidden">
                {/* Simplified trade flow visualization */}
                <svg className="w-full h-full">
                  <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                      <polygon points="0 0, 10 3.5, 0 7" fill="#00d4ff" />
                    </marker>
                  </defs>
                  {tradeFlows.map((flow, i) => {
                    const startX = 100 + (i * 50);
                    const startY = 50 + (i * 30);
                    const endX = 400 + (i * 30);
                    const endY = 100 + (i * 25);
                    return (
                      <g key={i}>
                        <line
                          x1={startX}
                          y1={startY}
                          x2={endX}
                          y2={endY}
                          stroke="#00d4ff"
                          strokeWidth={Math.max(1, flow.value / 200)}
                          strokeOpacity={0.5}
                          markerEnd="url(#arrowhead)"
                        />
                        <circle cx={startX} cy={startY} r="8" fill="#00d4ff" opacity="0.8" />
                        <circle cx={endX} cy={endY} r="8" fill="#22c55e" opacity="0.8" />
                      </g>
                    );
                  })}
                </svg>
                <div className="absolute bottom-2 left-2 text-xs text-gray-500">
                  Line width represents trade volume
                </div>
              </div>
            </Panel>

            <div className="grid grid-cols-2 gap-4">
              <Panel title="Top Exports">
                <div className="space-y-2">
                  {['Semiconductors', 'Crude Oil', 'Vehicles', 'Pharmaceuticals', 'Machinery'].map((item, i) => (
                    <div key={item} className="flex items-center justify-between p-2 bg-cmd-dark rounded">
                      <span className="text-sm text-white">{item}</span>
                      <span className="text-sm text-status-active">${(500 - i * 80).toFixed(1)}B</span>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel title="Top Imports">
                <div className="space-y-2">
                  {['Electronics', 'Oil Products', 'Chemicals', 'Textiles', 'Steel'].map((item, i) => (
                    <div key={item} className="flex items-center justify-between p-2 bg-cmd-dark rounded">
                      <span className="text-sm text-white">{item}</span>
                      <span className="text-sm text-threat-elevated">${(450 - i * 70).toFixed(1)}B</span>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          </div>
        )}

        {activeTab === 'sectors' && (
          <div className="grid grid-cols-2 gap-4">
            {sectors.map((sector) => {
              const Icon = sector.icon;
              return (
                <Panel key={sector.id} className="bg-cmd-panel">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-cmd-dark rounded-lg">
                      <Icon size={24} className="text-cmd-accent" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white">{sector.name}</h3>
                      <p className="text-2xl font-bold text-cmd-accent mt-1">${sector.value}B</p>
                      <p className={`text-sm ${sector.change >= 0 ? 'text-status-active' : 'text-threat-critical'}`}>
                        {sector.change >= 0 ? '+' : ''}{sector.change}% YoY
                      </p>

                      <div className="mt-4 space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Market Cap</span>
                          <span className="text-white">${(sector.value * 2.3).toFixed(1)}B</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Volatility</span>
                          <span className="text-white">{(Math.random() * 20 + 10).toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Risk Score</span>
                          <Badge variant={sector.change < 0 ? 'warning' : 'success'}>
                            {sector.change < 0 ? 'Elevated' : 'Normal'}
                          </Badge>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-cmd-border flex gap-2">
                        <button className="btn-secondary text-xs flex-1">Analysis</button>
                        <button className="btn-primary text-xs flex-1">Report</button>
                      </div>
                    </div>
                  </div>
                </Panel>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
