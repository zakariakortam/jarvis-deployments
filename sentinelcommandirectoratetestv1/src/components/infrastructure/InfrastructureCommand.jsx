import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Building,
  Zap,
  Wifi,
  Radio,
  Shield,
  AlertTriangle,
  Activity,
  Server,
  Globe,
  Lock,
  Unlock,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Layers,
  Database,
  Network,
} from 'lucide-react';
import useStore from '../../stores/mainStore';
import { Panel, Badge, SearchInput, Select, ProgressBar, StatusIndicator, Tabs } from '../common';

export default function InfrastructureCommand() {
  const { incidents, cyberEvents } = useStore();

  const [activeTab, setActiveTab] = useState('overview');
  const [selectedSector, setSelectedSector] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedAsset, setSelectedAsset] = useState(null);

  const infrastructureSectors = [
    {
      id: 'power',
      name: 'Power Grid',
      icon: Zap,
      status: 'operational',
      health: 94,
      assets: 1247,
      incidents: 3,
      color: '#f59e0b',
    },
    {
      id: 'telecom',
      name: 'Telecommunications',
      icon: Radio,
      status: 'degraded',
      health: 78,
      assets: 892,
      incidents: 7,
      color: '#6366f1',
    },
    {
      id: 'water',
      name: 'Water Systems',
      icon: Activity,
      status: 'operational',
      health: 96,
      assets: 534,
      incidents: 1,
      color: '#00d4ff',
    },
    {
      id: 'transport',
      name: 'Transportation',
      icon: Globe,
      status: 'operational',
      health: 89,
      assets: 2103,
      incidents: 4,
      color: '#22c55e',
    },
    {
      id: 'financial',
      name: 'Financial Systems',
      icon: Database,
      status: 'operational',
      health: 99,
      assets: 456,
      incidents: 0,
      color: '#8b5cf6',
    },
    {
      id: 'healthcare',
      name: 'Healthcare',
      icon: Shield,
      status: 'degraded',
      health: 82,
      assets: 1876,
      incidents: 5,
      color: '#ff0040',
    },
  ];

  const criticalAssets = useMemo(() => {
    return infrastructureSectors.flatMap(sector =>
      Array.from({ length: Math.floor(Math.random() * 5) + 3 }).map((_, i) => ({
        id: `${sector.id}-asset-${i}`,
        name: `${sector.name} Node ${i + 1}`,
        sector: sector.id,
        sectorName: sector.name,
        status: ['operational', 'degraded', 'failed', 'maintenance'][Math.floor(Math.random() * 4)],
        location: ['East Coast', 'West Coast', 'Central', 'International'][Math.floor(Math.random() * 4)],
        lastCheck: new Date(Date.now() - Math.random() * 3600000),
        uptime: Math.floor(Math.random() * 10 + 90),
        load: Math.floor(Math.random() * 60 + 20),
        criticality: ['critical', 'high', 'medium'][Math.floor(Math.random() * 3)],
      }))
    );
  }, []);

  const activeIncidents = useMemo(() => {
    return incidents.filter(i => i.status === 'active' || i.status === 'responding').slice(0, 10);
  }, [incidents]);

  const filteredAssets = useMemo(() => {
    return criticalAssets.filter(asset => {
      if (selectedSector !== 'all' && asset.sector !== selectedSector) return false;
      if (selectedStatus !== 'all' && asset.status !== selectedStatus) return false;
      return true;
    });
  }, [criticalAssets, selectedSector, selectedStatus]);

  const overallHealth = useMemo(() => {
    return Math.round(
      infrastructureSectors.reduce((sum, s) => sum + s.health, 0) / infrastructureSectors.length
    );
  }, []);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Layers },
    { id: 'assets', label: 'Critical Assets', icon: Server },
    { id: 'incidents', label: 'Incidents', icon: AlertTriangle },
    { id: 'monitoring', label: 'Live Monitoring', icon: Activity },
  ];

  const sectorOptions = [
    { value: 'all', label: 'All Sectors' },
    ...infrastructureSectors.map(s => ({ value: s.id, label: s.name })),
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'operational', label: 'Operational' },
    { value: 'degraded', label: 'Degraded' },
    { value: 'failed', label: 'Failed' },
    { value: 'maintenance', label: 'Maintenance' },
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'operational': return <CheckCircle size={14} className="text-status-active" />;
      case 'degraded': return <AlertTriangle size={14} className="text-status-standby" />;
      case 'failed': return <XCircle size={14} className="text-status-compromised" />;
      case 'maintenance': return <RefreshCw size={14} className="text-cmd-accent" />;
      default: return <Clock size={14} className="text-gray-400" />;
    }
  };

  const getHealthColor = (health) => {
    if (health >= 90) return 'status-active';
    if (health >= 70) return 'status-standby';
    return 'status-compromised';
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 bg-cmd-panel border-b border-cmd-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-threat-elevated/20">
              <Building size={24} className="text-threat-elevated" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">National Infrastructure Command & Crisis Network</h1>
              <p className="text-sm text-gray-500">Critical infrastructure monitoring and incident response</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-gray-500">System Health</p>
              <p className={`text-2xl font-bold text-${getHealthColor(overallHealth)}`}>{overallHealth}%</p>
            </div>
            <div className={`w-3 h-3 rounded-full ${overallHealth >= 90 ? 'bg-status-active' : 'bg-status-standby'} animate-pulse`} />
          </div>
        </div>

        {/* Sector Overview Cards */}
        <div className="grid grid-cols-6 gap-3">
          {infrastructureSectors.map((sector) => {
            const Icon = sector.icon;
            return (
              <motion.div
                key={sector.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedSector(sector.id)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedSector === sector.id
                    ? 'bg-cmd-accent/20 border border-cmd-accent/50'
                    : 'bg-cmd-dark hover:bg-cmd-border'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={16} style={{ color: sector.color }} />
                  <span className="text-xs text-gray-400 truncate">{sector.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-lg font-bold text-${getHealthColor(sector.health)}`}>
                    {sector.health}%
                  </span>
                  {getStatusIcon(sector.status)}
                </div>
                {sector.incidents > 0 && (
                  <div className="mt-1">
                    <Badge variant={sector.incidents > 3 ? 'error' : 'warning'} className="text-[9px]">
                      {sector.incidents} incidents
                    </Badge>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'overview' && (
          <div className="h-full overflow-y-auto p-4">
            <div className="grid grid-cols-3 gap-4">
              {/* System Status Map */}
              <Panel title="Infrastructure Map" className="col-span-2">
                <div className="h-64 relative bg-cmd-dark rounded-lg overflow-hidden">
                  {/* Simplified network visualization */}
                  <svg className="w-full h-full">
                    {infrastructureSectors.map((sector, i) => {
                      const angle = (i * 60) * Math.PI / 180;
                      const x = 200 + Math.cos(angle) * 80;
                      const y = 130 + Math.sin(angle) * 80;
                      const Icon = sector.icon;
                      return (
                        <g key={sector.id}>
                          <line x1="200" y1="130" x2={x} y2={y} stroke={sector.color} strokeWidth="2" opacity="0.5" />
                          <circle cx={x} cy={y} r="20" fill={sector.color} opacity="0.2" />
                          <circle cx={x} cy={y} r="8" fill={sector.color} />
                          <text x={x} y={y + 35} textAnchor="middle" fill="#666" fontSize="10">
                            {sector.name.split(' ')[0]}
                          </text>
                        </g>
                      );
                    })}
                    <circle cx="200" cy="130" r="30" fill="#00d4ff" opacity="0.2" />
                    <circle cx="200" cy="130" r="15" fill="#00d4ff" />
                    <text x="200" y="135" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">
                      CMD
                    </text>
                  </svg>
                </div>
              </Panel>

              {/* Quick Stats */}
              <div className="space-y-4">
                <Panel title="System Statistics">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Total Assets</span>
                      <span className="text-lg font-bold text-white">
                        {infrastructureSectors.reduce((sum, s) => sum + s.assets, 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Active Incidents</span>
                      <span className="text-lg font-bold text-threat-critical">
                        {infrastructureSectors.reduce((sum, s) => sum + s.incidents, 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Degraded Systems</span>
                      <span className="text-lg font-bold text-status-standby">
                        {infrastructureSectors.filter(s => s.status === 'degraded').length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Avg Response Time</span>
                      <span className="text-lg font-bold text-status-active">4.2min</span>
                    </div>
                  </div>
                </Panel>

                <Panel title="Threat Level">
                  <div className="text-center py-4">
                    <div className="w-24 h-24 mx-auto rounded-full border-4 border-threat-elevated flex items-center justify-center mb-3">
                      <span className="text-2xl font-bold text-threat-elevated">ELEVATED</span>
                    </div>
                    <p className="text-xs text-gray-500">National Infrastructure Protection Level</p>
                  </div>
                </Panel>
              </div>

              {/* Recent Incidents */}
              <Panel title="Recent Incidents" className="col-span-3">
                <div className="grid grid-cols-3 gap-3">
                  {activeIncidents.slice(0, 6).map((incident) => (
                    <div key={incident.id} className="p-3 bg-cmd-dark rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant={incident.severity}>{incident.severity}</Badge>
                        <StatusIndicator status={incident.status} />
                      </div>
                      <p className="text-sm font-medium text-white mb-1">{incident.type}</p>
                      <p className="text-xs text-gray-500">{incident.location}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(incident.reportedAt).toLocaleTimeString()}
                      </p>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          </div>
        )}

        {activeTab === 'assets' && (
          <div className="h-full flex">
            {/* Asset List */}
            <div className="w-96 border-r border-cmd-border flex flex-col">
              <div className="p-3 border-b border-cmd-border space-y-2">
                <Select
                  value={selectedSector}
                  onChange={setSelectedSector}
                  options={sectorOptions}
                />
                <Select
                  value={selectedStatus}
                  onChange={setSelectedStatus}
                  options={statusOptions}
                />
              </div>
              <div className="flex-1 overflow-y-auto">
                {filteredAssets.map((asset) => (
                  <div
                    key={asset.id}
                    onClick={() => setSelectedAsset(asset)}
                    className={`p-3 border-b border-cmd-border/50 cursor-pointer transition-colors ${
                      selectedAsset?.id === asset.id
                        ? 'bg-cmd-accent/10 border-l-2 border-l-cmd-accent'
                        : 'hover:bg-cmd-dark'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-white">{asset.name}</span>
                      {getStatusIcon(asset.status)}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{asset.sectorName}</span>
                      <span>|</span>
                      <span>{asset.location}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs text-gray-400">Load:</span>
                      <ProgressBar value={asset.load} showLabel={false} height="h-1" />
                      <span className="text-xs text-white">{asset.load}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Asset Detail */}
            <div className="flex-1 overflow-y-auto p-4">
              {selectedAsset ? (
                <div className="space-y-4">
                  <Panel>
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-xl font-bold text-white">{selectedAsset.name}</h2>
                        <p className="text-sm text-gray-400">{selectedAsset.sectorName}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(selectedAsset.status)}
                        <span className="text-sm capitalize text-gray-300">{selectedAsset.status}</span>
                      </div>
                    </div>
                  </Panel>

                  <div className="grid grid-cols-3 gap-4">
                    <Panel className="bg-cmd-dark">
                      <p className="text-xs text-gray-500 mb-1">Uptime</p>
                      <p className="text-2xl font-bold text-status-active">{selectedAsset.uptime}%</p>
                    </Panel>
                    <Panel className="bg-cmd-dark">
                      <p className="text-xs text-gray-500 mb-1">Current Load</p>
                      <p className="text-2xl font-bold text-cmd-accent">{selectedAsset.load}%</p>
                    </Panel>
                    <Panel className="bg-cmd-dark">
                      <p className="text-xs text-gray-500 mb-1">Criticality</p>
                      <Badge variant={selectedAsset.criticality}>{selectedAsset.criticality}</Badge>
                    </Panel>
                  </div>

                  <Panel title="Asset Details">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Location</p>
                        <p className="text-sm text-white">{selectedAsset.location}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Last Health Check</p>
                        <p className="text-sm text-white">{selectedAsset.lastCheck.toLocaleTimeString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Sector</p>
                        <p className="text-sm text-white">{selectedAsset.sectorName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Asset ID</p>
                        <p className="text-sm text-white font-mono">{selectedAsset.id}</p>
                      </div>
                    </div>
                  </Panel>

                  <Panel title="Actions">
                    <div className="flex flex-wrap gap-2">
                      <button className="btn-secondary">
                        <RefreshCw size={14} className="mr-1" />
                        Health Check
                      </button>
                      <button className="btn-secondary">
                        <Lock size={14} className="mr-1" />
                        Isolate
                      </button>
                      <button className="btn-secondary">
                        <Activity size={14} className="mr-1" />
                        Diagnostics
                      </button>
                      <button className="btn-primary">
                        <AlertTriangle size={14} className="mr-1" />
                        Report Issue
                      </button>
                    </div>
                  </Panel>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <Server size={48} className="mx-auto mb-4 text-gray-600" />
                    <p className="text-gray-500">Select an asset to view details</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'incidents' && (
          <div className="h-full overflow-y-auto p-4">
            <div className="space-y-3">
              {incidents.slice(0, 20).map((incident, i) => (
                <motion.div
                  key={incident.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-4 bg-cmd-panel border border-cmd-border rounded-lg"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant={incident.severity}>{incident.severity}</Badge>
                        <StatusIndicator status={incident.status} showLabel />
                      </div>
                      <h3 className="text-lg font-bold text-white mt-2">{incident.type}</h3>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(incident.reportedAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-3">{incident.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin size={12} />
                      {incident.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Shield size={12} />
                      {incident.respondingAgencies?.join(', ') || 'Pending'}
                    </span>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button className="btn-secondary text-xs">View Details</button>
                    <button className="btn-secondary text-xs">Update Status</button>
                    <button className="btn-primary text-xs">Coordinate Response</button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'monitoring' && (
          <div className="h-full p-4">
            <div className="grid grid-cols-2 gap-4 h-full">
              {infrastructureSectors.map((sector) => {
                const Icon = sector.icon;
                return (
                  <Panel key={sector.id} title={sector.name} icon={Icon} className="flex flex-col">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(sector.status)}
                          <span className="text-sm capitalize text-gray-300">{sector.status}</span>
                        </div>
                        <span className={`text-2xl font-bold text-${getHealthColor(sector.health)}`}>
                          {sector.health}%
                        </span>
                      </div>

                      {/* Live metrics visualization */}
                      <div className="h-20 flex items-end gap-0.5">
                        {Array.from({ length: 40 }).map((_, i) => {
                          const height = Math.random() * 80 + 20;
                          return (
                            <motion.div
                              key={i}
                              initial={{ height: 0 }}
                              animate={{ height: `${height}%` }}
                              transition={{ duration: 0.5, delay: i * 0.02 }}
                              className="flex-1 rounded-t"
                              style={{ backgroundColor: sector.color, opacity: 0.6 }}
                            />
                          );
                        })}
                      </div>

                      <div className="grid grid-cols-3 gap-2 mt-4 text-xs">
                        <div className="text-center p-2 bg-cmd-dark rounded">
                          <p className="text-gray-500">Assets</p>
                          <p className="text-white font-bold">{sector.assets}</p>
                        </div>
                        <div className="text-center p-2 bg-cmd-dark rounded">
                          <p className="text-gray-500">Incidents</p>
                          <p className="text-threat-critical font-bold">{sector.incidents}</p>
                        </div>
                        <div className="text-center p-2 bg-cmd-dark rounded">
                          <p className="text-gray-500">Load</p>
                          <p className="text-cmd-accent font-bold">{Math.floor(Math.random() * 30 + 50)}%</p>
                        </div>
                      </div>
                    </div>
                  </Panel>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
