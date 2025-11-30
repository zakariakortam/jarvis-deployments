import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target,
  Users,
  Shield,
  Clock,
  MapPin,
  ChevronRight,
  Filter,
  RefreshCw,
  X,
  Play,
  Pause,
  CheckCircle,
  AlertCircle,
  Calendar,
  Building,
  Radio,
  Globe,
  FileText,
  Activity,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import useStore from '../../stores/mainStore';
import { Panel, Badge, StatusIndicator, SearchInput, Select, Tabs, ProgressBar, Timeline } from '../common';
import { format } from 'date-fns';
import { AGENCIES } from '../../data/generators';

export default function OperationsCommand() {
  const {
    getFilteredOperations,
    filters,
    setFilter,
    resetFilters,
    selectedEntity,
    selectedEntityType,
    selectEntity,
    clearSelection,
    operations,
    updateOperation,
  } = useStore();

  const [showFilters, setShowFilters] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const filteredOperations = getFilteredOperations();
  const selectedOperation = selectedEntityType === 'operation' ? selectedEntity : null;

  const stats = useMemo(() => ({
    active: operations.filter(o => o.status === 'active').length,
    planning: operations.filter(o => o.status === 'planning').length,
    standby: operations.filter(o => o.status === 'standby').length,
    completed: operations.filter(o => o.status === 'completed').length,
  }), [operations]);

  const statusColors = {
    active: { bg: 'bg-status-active', text: 'text-status-active' },
    planning: { bg: 'bg-cmd-accent', text: 'text-cmd-accent' },
    standby: { bg: 'bg-status-standby', text: 'text-status-standby' },
    completed: { bg: 'bg-gray-500', text: 'text-gray-500' },
    suspended: { bg: 'bg-threat-critical', text: 'text-threat-critical' },
  };

  const operationTabs = [
    { id: 'overview', label: 'Overview', icon: Target },
    { id: 'timeline', label: 'Timeline', icon: Calendar },
    { id: 'assets', label: 'Assets', icon: Users },
    { id: 'objectives', label: 'Objectives', icon: CheckCircle },
    { id: 'risks', label: 'Risks', icon: AlertCircle },
  ];

  const pieData = [
    { name: 'Active', value: stats.active, color: '#00ff88' },
    { name: 'Planning', value: stats.planning, color: '#00d4ff' },
    { name: 'Standby', value: stats.standby, color: '#ffaa00' },
    { name: 'Completed', value: stats.completed, color: '#666666' },
  ];

  return (
    <div className="h-full flex">
      {/* Left Panel - Operations List */}
      <div className={`${selectedOperation ? 'w-1/2' : 'w-full'} flex flex-col border-r border-cmd-border transition-all duration-300`}>
        {/* Header */}
        <div className="p-4 border-b border-cmd-border bg-cmd-panel">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-agency-defense/20">
                <Target size={24} className="text-agency-defense" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Multi-Agency Operations Command</h1>
                <p className="text-sm text-gray-500">Joint task force coordination center</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`btn-secondary flex items-center gap-2 ${showFilters ? 'bg-cmd-accent/20 border-cmd-accent' : ''}`}
              >
                <Filter size={14} />
                Filters
              </button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 grid grid-cols-4 gap-3">
              {Object.entries(stats).map(([key, value]) => (
                <div key={key} className="bg-cmd-dark rounded-lg p-3 text-center">
                  <p className={`text-2xl font-bold ${statusColors[key]?.text || 'text-gray-400'}`}>{value}</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">{key}</p>
                </div>
              ))}
            </div>
            <div className="w-32 h-24">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={25}
                    outerRadius={40}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-5 gap-3 pt-4 border-t border-cmd-border">
                  <SearchInput
                    value={filters.operations.searchQuery}
                    onChange={(value) => setFilter('operations', 'searchQuery', value)}
                    placeholder="Search operations..."
                  />
                  <Select
                    value={filters.operations.agency}
                    onChange={(value) => setFilter('operations', 'agency', value)}
                    options={AGENCIES.filter(a => a.country === 'US').map(a => ({ value: a.id, label: a.id }))}
                    placeholder="Lead Agency"
                  />
                  <Select
                    value={filters.operations.status}
                    onChange={(value) => setFilter('operations', 'status', value)}
                    options={['active', 'planning', 'standby', 'completed', 'suspended'].map(s => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))}
                    placeholder="Status"
                  />
                  <Select
                    value={filters.operations.type}
                    onChange={(value) => setFilter('operations', 'type', value)}
                    options={[...new Set(operations.map(o => o.type))].map(t => ({ value: t, label: t }))}
                    placeholder="Type"
                  />
                  <button onClick={() => resetFilters('operations')} className="btn-secondary">
                    <RefreshCw size={14} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Operations List */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            {filteredOperations.map((op, idx) => (
              <motion.div
                key={op.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.02 }}
                onClick={() => selectEntity(op, 'operation')}
                className={`panel cursor-pointer transition-all duration-200 hover:border-cmd-accent/50
                  ${selectedOperation?.id === op.id ? 'border-cmd-accent ring-1 ring-cmd-accent/30' : ''}`}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <StatusIndicator status={op.status === 'active' ? 'active' : op.status === 'standby' ? 'standby' : 'inactive'} />
                      <h3 className="text-sm font-bold text-cmd-accent">{op.codeName}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={op.status === 'active' ? 'success' : op.status === 'suspended' ? 'critical' : 'default'}>
                        {op.status}
                      </Badge>
                      <span className={`classification-badge class-${
                        op.classification.includes('TOP SECRET') ? 'topsecret' : 'secret'
                      }`}>
                        {op.classification.split('//')[0]}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-400 mb-3">{op.type}</p>

                  <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                    <div className="flex items-center gap-1 text-gray-500">
                      <Building size={12} />
                      <span>{op.leadAgency.id}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500">
                      <MapPin size={12} />
                      <span>{op.targetRegion?.name}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500">
                      <Users size={12} />
                      <span>{op.personnelCount} personnel</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge variant="default">{op.phase}</Badge>
                    <div className="flex items-center gap-2 flex-1 ml-4">
                      <ProgressBar value={op.phaseProgress} showLabel={false} height="h-1.5" />
                      <span className="text-xs text-cmd-accent">{op.phaseProgress}%</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Operation Detail */}
      <AnimatePresence>
        {selectedOperation && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: '50%', opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="flex flex-col bg-cmd-panel overflow-hidden"
          >
            <div className="p-4 border-b border-cmd-border bg-cmd-dark/50">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <StatusIndicator status={selectedOperation.status === 'active' ? 'active' : 'standby'} />
                    <h2 className="text-lg font-bold text-cmd-accent">{selectedOperation.codeName}</h2>
                  </div>
                  <p className="text-sm text-gray-500">{selectedOperation.id}</p>
                </div>
                <button onClick={clearSelection} className="p-2 hover:bg-cmd-dark rounded-lg transition-colors">
                  <X size={20} className="text-gray-400" />
                </button>
              </div>
              <Tabs tabs={operationTabs} activeTab={activeTab} onTabChange={setActiveTab} />
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {activeTab === 'overview' && <OperationOverview operation={selectedOperation} />}
              {activeTab === 'timeline' && <OperationTimeline operation={selectedOperation} />}
              {activeTab === 'assets' && <OperationAssets operation={selectedOperation} />}
              {activeTab === 'objectives' && <OperationObjectives operation={selectedOperation} />}
              {activeTab === 'risks' && <OperationRisks operation={selectedOperation} />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function OperationOverview({ operation }) {
  return (
    <div className="space-y-4">
      <Panel title="Operation Details" icon={FileText}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Operation Type</p>
            <p className="text-sm font-medium text-white">{operation.type}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Classification</p>
            <span className={`classification-badge class-${
              operation.classification.includes('TOP SECRET') ? 'topsecret' : 'secret'
            }`}>
              {operation.classification}
            </span>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Start Date</p>
            <p className="text-sm text-gray-300">{format(new Date(operation.startDate), 'dd MMM yyyy')}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Personnel</p>
            <p className="text-sm text-gray-300">{operation.personnelCount} assigned</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Target Region</p>
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-threat-elevated" />
              <span className="text-sm text-gray-300">{operation.targetRegion?.name}</span>
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Secure Channels</p>
            <p className="text-sm text-gray-300">{operation.secureChannels} active</p>
          </div>
        </div>
      </Panel>

      <Panel title="Lead Agency" icon={Building}>
        <div className="flex items-center gap-3 p-3 bg-cmd-dark rounded-lg">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${operation.leadAgency.color}20` }}>
            <Shield size={24} style={{ color: operation.leadAgency.color }} />
          </div>
          <div>
            <p className="text-sm font-bold text-white">{operation.leadAgency.name}</p>
            <p className="text-xs text-gray-500">{operation.leadAgency.type.toUpperCase()} - {operation.leadAgency.country}</p>
          </div>
        </div>
      </Panel>

      <Panel title="Supporting Agencies" icon={Users}>
        <div className="grid grid-cols-2 gap-2">
          {operation.supportingAgencies?.map((agency, i) => (
            <div key={i} className="flex items-center gap-2 p-2 bg-cmd-dark rounded">
              <div className="w-8 h-8 rounded flex items-center justify-center" style={{ backgroundColor: `${agency.color}20` }}>
                <Shield size={16} style={{ color: agency.color }} />
              </div>
              <div>
                <p className="text-xs font-medium text-white">{agency.id}</p>
                <p className="text-[10px] text-gray-500">{agency.type}</p>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Current Phase" icon={Activity}>
        <div className="flex items-center justify-between mb-3">
          <Badge variant="success">{operation.phase}</Badge>
          <span className="text-lg font-bold text-cmd-accent">{operation.phaseProgress}%</span>
        </div>
        <ProgressBar value={operation.phaseProgress} />
      </Panel>
    </div>
  );
}

function OperationTimeline({ operation }) {
  return (
    <div className="space-y-4">
      <Panel title="Phase Timeline" icon={Calendar}>
        <div className="space-y-4">
          {operation.timeline?.map((phase, i) => (
            <div key={i} className={`p-3 rounded-lg border ${
              phase.status === 'completed' ? 'bg-status-active/10 border-status-active/30' :
              phase.status === 'active' ? 'bg-cmd-accent/10 border-cmd-accent/30' :
              'bg-cmd-dark border-cmd-border'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {phase.status === 'completed' ? (
                    <CheckCircle size={16} className="text-status-active" />
                  ) : phase.status === 'active' ? (
                    <Play size={16} className="text-cmd-accent" />
                  ) : (
                    <Pause size={16} className="text-gray-500" />
                  )}
                  <span className="text-sm font-medium text-white">{phase.phase}</span>
                </div>
                <Badge variant={phase.status === 'completed' ? 'success' : phase.status === 'active' ? 'default' : 'warning'}>
                  {phase.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Duration: {phase.duration}</span>
                <span>{phase.milestones} milestones</span>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function OperationAssets({ operation }) {
  const assetIcons = {
    HUMINT: Users,
    SIGINT: Radio,
    GEOINT: Globe,
    CYBER: Shield,
    SOF: Target,
    AIR: Activity,
    MARITIME: Activity,
    TECHNICAL: Activity,
  };

  return (
    <div className="space-y-4">
      <Panel title="Deployed Assets" icon={Users}>
        <div className="space-y-3">
          {operation.assets?.map((asset, i) => {
            const Icon = assetIcons[asset.type] || Activity;
            return (
              <div key={i} className="flex items-center justify-between p-3 bg-cmd-dark rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-cmd-accent/20 flex items-center justify-center">
                    <Icon size={20} className="text-cmd-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{asset.type}</p>
                    <p className="text-xs text-gray-500">{asset.location?.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-cmd-accent">{asset.count}</p>
                  <StatusIndicator status={asset.status === 'deployed' ? 'active' : 'standby'} showLabel />
                </div>
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}

function OperationObjectives({ operation }) {
  const priorityColors = {
    critical: 'threat-critical',
    high: 'threat-high',
    medium: 'threat-elevated',
    low: 'threat-low',
  };

  return (
    <div className="space-y-4">
      <Panel title="Mission Objectives" icon={CheckCircle}>
        <div className="space-y-3">
          {operation.objectives?.map((obj, i) => (
            <div key={i} className={`p-3 rounded-lg border ${
              obj.status === 'completed' ? 'bg-status-active/10 border-status-active/30' :
              obj.status === 'in-progress' ? 'bg-cmd-accent/10 border-cmd-accent/30' :
              obj.status === 'blocked' ? 'bg-threat-critical/10 border-threat-critical/30' :
              'bg-cmd-dark border-cmd-border'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-2">
                  <span className="w-6 h-6 flex items-center justify-center rounded-full bg-cmd-dark text-cmd-accent text-xs font-bold">
                    {obj.id}
                  </span>
                  <div>
                    <p className="text-sm text-white">{obj.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={priorityColors[obj.priority]}>{obj.priority}</Badge>
                      <Badge variant={obj.status === 'completed' ? 'success' : obj.status === 'blocked' ? 'critical' : 'default'}>
                        {obj.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function OperationRisks({ operation }) {
  const levelColors = {
    critical: 'threat-critical',
    high: 'threat-high',
    medium: 'threat-elevated',
    low: 'threat-low',
  };

  return (
    <div className="space-y-4">
      <Panel title="Risk Assessment" icon={AlertCircle}>
        <div className="space-y-3">
          {operation.risks?.map((risk, i) => (
            <div key={i} className="p-3 bg-cmd-dark rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white">{risk.type}</span>
                <Badge variant={levelColors[risk.level]}>{risk.level}</Badge>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Shield size={12} />
                <span>Mitigation: {risk.mitigation}</span>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
