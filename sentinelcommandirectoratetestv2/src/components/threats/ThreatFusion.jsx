import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  Filter,
  RefreshCw,
  ChevronRight,
  MapPin,
  Clock,
  Users,
  Shield,
  Target,
  TrendingUp,
  TrendingDown,
  Minus,
  Eye,
  FileText,
  Radio,
  X,
  Maximize2,
  BarChart3,
  Globe,
  Crosshair,
} from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import useStore from '../../stores/mainStore';
import { Panel, Badge, StatusIndicator, SearchInput, Select, Modal, Tabs, ProgressBar, DataTable, Timeline } from '../common';
import { format } from 'date-fns';

export default function ThreatFusion() {
  const {
    getFilteredThreats,
    filters,
    setFilter,
    resetFilters,
    selectedEntity,
    selectedEntityType,
    selectEntity,
    clearSelection,
    threats,
    updateThreat,
  } = useStore();

  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'list', 'timeline'
  const [showFilters, setShowFilters] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const filteredThreats = getFilteredThreats();
  const selectedThreat = selectedEntityType === 'threat' ? selectedEntity : null;

  // Stats calculations
  const stats = useMemo(() => ({
    critical: threats.filter(t => t.threatLevel === 'critical').length,
    high: threats.filter(t => t.threatLevel === 'high').length,
    elevated: threats.filter(t => t.threatLevel === 'elevated').length,
    active: threats.filter(t => t.status === 'active').length,
    imminent: threats.filter(t => t.status === 'imminent').length,
  }), [threats]);

  // Get unique values for filters
  const filterOptions = useMemo(() => ({
    threatLevels: ['critical', 'high', 'elevated', 'guarded', 'low'],
    statuses: ['active', 'developing', 'imminent', 'suspected', 'confirmed'],
    regions: [...new Set(threats.map(t => t.origin?.region).filter(Boolean))],
    actorTypes: ['state', 'terror', 'proxy', 'criminal'],
    classifications: ['TOP SECRET//SCI', 'TOP SECRET', 'SECRET', 'CONFIDENTIAL', 'UNCLASSIFIED'],
  }), [threats]);

  const threatLevelColors = {
    critical: 'threat-critical',
    high: 'threat-high',
    elevated: 'threat-elevated',
    guarded: 'threat-guarded',
    low: 'threat-low',
  };

  const threatTabs = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'analysis', label: 'Analysis', icon: BarChart3 },
    { id: 'escalation', label: 'Escalation', icon: TrendingUp },
    { id: 'intelligence', label: 'Intelligence', icon: FileText },
    { id: 'related', label: 'Related', icon: Target },
  ];

  const handleThreatClick = (threat) => {
    selectEntity(threat, 'threat');
  };

  const handleUpdateStatus = (newStatus) => {
    if (selectedThreat) {
      updateThreat(selectedThreat.id, { status: newStatus });
    }
  };

  return (
    <div className="h-full flex">
      {/* Left Panel - Threat List */}
      <div className={`${selectedThreat ? 'w-1/2' : 'w-full'} flex flex-col border-r border-cmd-border transition-all duration-300`}>
        {/* Header */}
        <div className="p-4 border-b border-cmd-border bg-cmd-panel">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-threat-critical/20">
                <AlertTriangle size={24} className="text-threat-critical" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Strategic Threat Fusion Deck</h1>
                <p className="text-sm text-gray-500">Multi-domain threat intelligence aggregation</p>
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
              <button
                onClick={() => resetFilters('threats')}
                className="btn-secondary flex items-center gap-2"
              >
                <RefreshCw size={14} />
                Reset
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-5 gap-3 mb-4">
            {[
              { label: 'CRITICAL', value: stats.critical, color: 'threat-critical' },
              { label: 'HIGH', value: stats.high, color: 'threat-high' },
              { label: 'ELEVATED', value: stats.elevated, color: 'threat-elevated' },
              { label: 'ACTIVE', value: stats.active, color: 'status-active' },
              { label: 'IMMINENT', value: stats.imminent, color: 'threat-critical' },
            ].map((stat) => (
              <div key={stat.label} className="bg-cmd-dark rounded-lg p-3 text-center">
                <p className={`text-2xl font-bold text-${stat.color}`}>{stat.value}</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
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
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-4 border-t border-cmd-border">
                  <SearchInput
                    value={filters.threats.searchQuery}
                    onChange={(value) => setFilter('threats', 'searchQuery', value)}
                    placeholder="Search threats..."
                  />
                  <Select
                    value={filters.threats.threatLevel}
                    onChange={(value) => setFilter('threats', 'threatLevel', value)}
                    options={filterOptions.threatLevels.map(l => ({ value: l, label: l.toUpperCase() }))}
                    placeholder="Threat Level"
                  />
                  <Select
                    value={filters.threats.status}
                    onChange={(value) => setFilter('threats', 'status', value)}
                    options={filterOptions.statuses.map(s => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))}
                    placeholder="Status"
                  />
                  <Select
                    value={filters.threats.region}
                    onChange={(value) => setFilter('threats', 'region', value)}
                    options={filterOptions.regions.map(r => ({ value: r, label: r }))}
                    placeholder="Region"
                  />
                  <Select
                    value={filters.threats.actorType}
                    onChange={(value) => setFilter('threats', 'actorType', value)}
                    options={filterOptions.actorTypes.map(t => ({ value: t, label: t.charAt(0).toUpperCase() + t.slice(1) }))}
                    placeholder="Actor Type"
                  />
                  <Select
                    value={filters.threats.classification}
                    onChange={(value) => setFilter('threats', 'classification', value)}
                    options={filterOptions.classifications.map(c => ({ value: c, label: c }))}
                    placeholder="Classification"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Threat Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredThreats.map((threat, idx) => (
              <motion.div
                key={threat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.02 }}
                onClick={() => handleThreatClick(threat)}
                className={`panel cursor-pointer transition-all duration-200 hover:border-cmd-accent/50
                  ${selectedThreat?.id === threat.id ? 'border-cmd-accent ring-1 ring-cmd-accent/30' : ''}`}
              >
                <div className="p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full bg-${threatLevelColors[threat.threatLevel]} ${
                        threat.threatLevel === 'critical' ? 'animate-pulse' : ''
                      }`} />
                      <Badge variant={threat.threatLevel}>{threat.threatLevel}</Badge>
                    </div>
                    <span className={`classification-badge class-${
                      threat.classification.includes('TOP SECRET') ? 'topsecret' :
                      threat.classification.includes('SECRET') ? 'secret' :
                      threat.classification.includes('CONFIDENTIAL') ? 'confidential' : 'unclassified'
                    }`}>
                      {threat.classification.split('//')[0]}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-semibold text-white mb-1">{threat.type}</h3>
                  <p className="text-xs text-gray-400 mb-3">{threat.actor.name}</p>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1 text-gray-500">
                      <MapPin size={12} />
                      <span>{threat.origin.name}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500">
                      <Clock size={12} />
                      <span>{format(new Date(threat.timestamp), 'dd MMM HH:mm')}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500">
                      <Users size={12} />
                      <span>{threat.actor.type}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500">
                      <Target size={12} />
                      <span>{threat.targets?.length || 0} targets</span>
                    </div>
                  </div>

                  {/* Status & Confidence */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-cmd-border/50">
                    <Badge variant={threat.status === 'imminent' ? 'critical' : threat.status === 'active' ? 'warning' : 'default'}>
                      {threat.status}
                    </Badge>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-500">Confidence:</span>
                      <span className="text-xs font-bold text-cmd-accent">{threat.confidence}%</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredThreats.length === 0 && (
            <div className="text-center py-12">
              <AlertTriangle size={48} className="mx-auto text-gray-600 mb-4" />
              <p className="text-gray-500">No threats match your filters</p>
              <button
                onClick={() => resetFilters('threats')}
                className="mt-4 text-cmd-accent hover:underline text-sm"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Threat Detail */}
      <AnimatePresence>
        {selectedThreat && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: '50%', opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="flex flex-col bg-cmd-panel overflow-hidden"
          >
            {/* Detail Header */}
            <div className="p-4 border-b border-cmd-border bg-cmd-dark/50">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-${threatLevelColors[selectedThreat.threatLevel]}/20`}>
                    <AlertTriangle size={24} className={`text-${threatLevelColors[selectedThreat.threatLevel]}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-white">{selectedThreat.type}</h2>
                      <Badge variant={selectedThreat.threatLevel}>{selectedThreat.threatLevel}</Badge>
                    </div>
                    <p className="text-sm text-gray-500">{selectedThreat.id}</p>
                  </div>
                </div>
                <button
                  onClick={clearSelection}
                  className="p-2 hover:bg-cmd-dark rounded-lg transition-colors"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              </div>

              {/* Tabs */}
              <Tabs
                tabs={threatTabs}
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />
            </div>

            {/* Detail Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {activeTab === 'overview' && (
                <ThreatOverview threat={selectedThreat} onUpdateStatus={handleUpdateStatus} />
              )}
              {activeTab === 'analysis' && (
                <ThreatAnalysis threat={selectedThreat} />
              )}
              {activeTab === 'escalation' && (
                <ThreatEscalation threat={selectedThreat} />
              )}
              {activeTab === 'intelligence' && (
                <ThreatIntelligence threat={selectedThreat} />
              )}
              {activeTab === 'related' && (
                <ThreatRelated threat={selectedThreat} />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Threat Overview Component
function ThreatOverview({ threat, onUpdateStatus }) {
  const threatLevelColors = {
    critical: 'threat-critical',
    high: 'threat-high',
    elevated: 'threat-elevated',
    guarded: 'threat-guarded',
    low: 'threat-low',
  };

  return (
    <div className="space-y-4">
      {/* Classification Banner */}
      <div className={`p-3 rounded-lg border ${
        threat.classification.includes('TOP SECRET') ? 'bg-class-topsecret/10 border-class-topsecret/50' :
        threat.classification.includes('SECRET') ? 'bg-class-secret/10 border-class-secret/50' :
        'bg-class-confidential/10 border-class-confidential/50'
      }`}>
        <p className={`text-xs font-bold text-center uppercase tracking-wider ${
          threat.classification.includes('TOP SECRET') ? 'text-class-topsecret' :
          threat.classification.includes('SECRET') ? 'text-class-secret' : 'text-class-confidential'
        }`}>
          {threat.classification}
        </p>
      </div>

      {/* Threat Actor */}
      <Panel title="Threat Actor" icon={Users}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Actor Name</p>
            <p className="text-sm font-medium text-white">{threat.actor.name}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Actor ID</p>
            <p className="text-sm font-mono text-cmd-accent">{threat.actor.id}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Type</p>
            <Badge variant="default">{threat.actor.type}</Badge>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Capability</p>
            <Badge variant={threat.actor.capability === 'elite' ? 'critical' : 'elevated'}>
              {threat.actor.capability}
            </Badge>
          </div>
          <div className="col-span-2">
            <p className="text-xs text-gray-500 mb-1">Focus Areas</p>
            <div className="flex flex-wrap gap-1">
              {threat.actor.focus?.map((f, i) => (
                <Badge key={i} variant="default">{f}</Badge>
              ))}
            </div>
          </div>
        </div>
      </Panel>

      {/* Intelligence Brief */}
      <Panel title="Intelligence Brief" icon={FileText}>
        <p className="text-sm text-gray-300 leading-relaxed">{threat.briefing}</p>
      </Panel>

      {/* Origin & Targets */}
      <Panel title="Geographic Context" icon={Globe}>
        <div className="space-y-4">
          <div>
            <p className="text-xs text-gray-500 mb-2">Origin</p>
            <div className="flex items-center gap-2 p-2 bg-cmd-dark rounded">
              <MapPin size={14} className="text-threat-critical" />
              <span className="text-sm text-white">{threat.origin.name}</span>
              <Badge variant="default">{threat.origin.region}</Badge>
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-2">Potential Targets ({threat.targets?.length || 0})</p>
            <div className="space-y-1">
              {threat.targets?.map((target, i) => (
                <div key={i} className="flex items-center gap-2 p-2 bg-cmd-dark rounded">
                  <Target size={14} className="text-threat-elevated" />
                  <span className="text-sm text-gray-300">{target.name}</span>
                  <Badge variant="default">{target.region}</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Panel>

      {/* Status Management */}
      <Panel title="Threat Status" icon={Shield}>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Current Status</p>
            <Badge variant={threat.status === 'imminent' ? 'critical' : threat.status === 'active' ? 'warning' : 'default'}>
              {threat.status}
            </Badge>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Confidence Level</p>
            <div className="flex items-center gap-2">
              <ProgressBar value={threat.confidence} showLabel={false} height="h-1.5" />
              <span className="text-sm font-bold text-cmd-accent">{threat.confidence}%</span>
            </div>
          </div>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-2">Update Status</p>
          <div className="flex flex-wrap gap-2">
            {['active', 'developing', 'imminent', 'suspected', 'confirmed'].map((status) => (
              <button
                key={status}
                onClick={() => onUpdateStatus(status)}
                className={`px-3 py-1.5 text-xs rounded border transition-colors ${
                  threat.status === status
                    ? 'bg-cmd-accent/20 border-cmd-accent text-cmd-accent'
                    : 'bg-cmd-dark border-cmd-border text-gray-400 hover:border-gray-500'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </Panel>
    </div>
  );
}

// Threat Analysis Component
function ThreatAnalysis({ threat }) {
  const riskVectorData = threat.riskVectors?.map(v => ({
    name: v.name,
    value: v.score,
    fill: v.score > 70 ? '#ff0040' : v.score > 50 ? '#ff8800' : '#00d4ff',
  })) || [];

  return (
    <div className="space-y-4">
      {/* Risk Vectors */}
      <Panel title="Risk Vector Analysis" icon={BarChart3}>
        <div className="h-48 mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={riskVectorData} layout="vertical">
              <XAxis type="number" domain={[0, 100]} stroke="#666" />
              <YAxis dataKey="name" type="category" stroke="#666" width={80} tick={{ fill: '#999', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0d0d14', border: '1px solid #1a1a2e', borderRadius: '8px' }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {riskVectorData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-2">
          {threat.riskVectors?.map((vector, i) => (
            <div key={i} className="flex items-center justify-between p-2 bg-cmd-dark rounded">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-300">{vector.name}</span>
                <div className={`flex items-center gap-1 text-xs ${
                  vector.trend === 'rising' ? 'text-threat-critical' :
                  vector.trend === 'declining' ? 'text-threat-low' : 'text-gray-400'
                }`}>
                  {vector.trend === 'rising' ? <TrendingUp size={12} /> :
                   vector.trend === 'declining' ? <TrendingDown size={12} /> : <Minus size={12} />}
                  {vector.trend}
                </div>
              </div>
              <span className={`text-sm font-bold ${
                vector.score > 70 ? 'text-threat-critical' :
                vector.score > 50 ? 'text-threat-elevated' : 'text-cmd-accent'
              }`}>
                {vector.score}%
              </span>
            </div>
          ))}
        </div>
      </Panel>

      {/* Actor Capability Assessment */}
      <Panel title="Actor Capability Assessment" icon={Crosshair}>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-cmd-dark rounded">
            <p className="text-xs text-gray-500 mb-1">Technical Capability</p>
            <ProgressBar value={threat.actor.capability === 'elite' ? 95 : threat.actor.capability === 'advanced' ? 75 : 50} />
          </div>
          <div className="p-3 bg-cmd-dark rounded">
            <p className="text-xs text-gray-500 mb-1">Resource Access</p>
            <ProgressBar value={threat.actor.type === 'state' ? 90 : threat.actor.type === 'proxy' ? 70 : 50} color="agency-defense" />
          </div>
          <div className="p-3 bg-cmd-dark rounded">
            <p className="text-xs text-gray-500 mb-1">Operational Security</p>
            <ProgressBar value={Math.floor(Math.random() * 30) + 60} color="threat-elevated" />
          </div>
          <div className="p-3 bg-cmd-dark rounded">
            <p className="text-xs text-gray-500 mb-1">Historical Success Rate</p>
            <ProgressBar value={Math.floor(Math.random() * 40) + 40} color="agency-intel" />
          </div>
        </div>
      </Panel>
    </div>
  );
}

// Threat Escalation Component
function ThreatEscalation({ threat }) {
  return (
    <div className="space-y-4">
      <Panel title="Escalation Tree" icon={TrendingUp}>
        <div className="space-y-3">
          {threat.escalationTree?.map((level, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`p-3 rounded-lg border ${
                level.probability > 70 ? 'bg-threat-critical/10 border-threat-critical/30' :
                level.probability > 40 ? 'bg-threat-elevated/10 border-threat-elevated/30' :
                'bg-cmd-dark border-cmd-border'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 flex items-center justify-center rounded-full bg-cmd-accent/20 text-cmd-accent text-xs font-bold">
                    {level.level}
                  </span>
                  <span className="text-sm font-medium text-white">{level.action}</span>
                </div>
                <Badge variant={level.probability > 70 ? 'critical' : level.probability > 40 ? 'elevated' : 'low'}>
                  {level.probability}% likely
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Recommended Response:</span>
                <span className="text-cmd-accent">{level.response}</span>
              </div>
              <ProgressBar value={level.probability} showLabel={false} height="h-1" />
            </motion.div>
          ))}
        </div>
      </Panel>

      {/* Escalation Timeline */}
      <Panel title="Projected Timeline" icon={Clock}>
        <div className="relative pl-4 border-l-2 border-cmd-border space-y-4">
          {threat.escalationTree?.map((level, i) => (
            <div key={i} className="relative">
              <div className="absolute -left-[17px] w-3 h-3 rounded-full bg-cmd-accent" />
              <div className="pl-4">
                <p className="text-xs text-gray-500">Level {level.level} - Est. {i + 1}-{i + 2} weeks</p>
                <p className="text-sm text-white">{level.action}</p>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

// Threat Intelligence Component
function ThreatIntelligence({ threat }) {
  return (
    <div className="space-y-4">
      <Panel title="Intelligence Sources" icon={Radio}>
        <div className="space-y-2">
          {['SIGINT', 'HUMINT', 'GEOINT', 'OSINT', 'MASINT'].map((source, i) => {
            const hasData = Math.random() > 0.3;
            return (
              <div key={source} className="flex items-center justify-between p-2 bg-cmd-dark rounded">
                <div className="flex items-center gap-2">
                  <StatusIndicator status={hasData ? 'active' : 'inactive'} />
                  <span className="text-sm text-gray-300">{source}</span>
                </div>
                <span className="text-xs text-gray-500">
                  {hasData ? `${Math.floor(Math.random() * 10) + 1} reports` : 'No data'}
                </span>
              </div>
            );
          })}
        </div>
      </Panel>

      <Panel title="Full Briefing" icon={FileText}>
        <div className="prose prose-invert prose-sm max-w-none">
          <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
            {threat.briefing}

            {'\n\n'}ASSESSMENT: This threat represents a {threat.threatLevel} priority concern for national security interests.
            The {threat.actor.name} organization has demonstrated {threat.actor.capability}-level capabilities in previous operations.

            {'\n\n'}INDICATORS: Multiple intelligence streams have confirmed increased activity patterns consistent with operational preparation.
            SIGINT collection has identified communications indicating coordination between known entities.

            {'\n\n'}RECOMMENDATION: Continue enhanced monitoring and prepare contingency response options for escalation scenarios.
          </p>
        </div>
      </Panel>

      <Panel title="Collection Requirements" icon={Target}>
        <div className="space-y-2">
          {[
            'Monitor communications between identified nodes',
            'Track financial transactions through designated channels',
            'Maintain surveillance on key personnel',
            'Collect imagery of suspected facilities',
            'Intercept encrypted communications for analysis',
          ].map((req, i) => (
            <div key={i} className="flex items-start gap-2 p-2 bg-cmd-dark rounded">
              <div className="w-4 h-4 rounded flex items-center justify-center bg-cmd-accent/20 mt-0.5">
                <span className="text-[10px] text-cmd-accent font-bold">{i + 1}</span>
              </div>
              <span className="text-sm text-gray-300">{req}</span>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

// Threat Related Component
function ThreatRelated({ threat }) {
  const { threats, operations, cyberEvents } = useStore();

  const relatedThreats = threats
    .filter(t => t.id !== threat.id && (t.actor.id === threat.actor.id || t.origin.code === threat.origin.code))
    .slice(0, 5);

  const relatedOps = operations
    .filter(o => o.targetRegion?.code === threat.origin.code)
    .slice(0, 3);

  const relatedCyber = cyberEvents
    .filter(c => c.suspectedActor?.id === threat.actor.id)
    .slice(0, 3);

  return (
    <div className="space-y-4">
      <Panel title="Related Threats" icon={AlertTriangle}>
        {relatedThreats.length > 0 ? (
          <div className="space-y-2">
            {relatedThreats.map((t) => (
              <div key={t.id} className="flex items-center justify-between p-2 bg-cmd-dark rounded hover:bg-cmd-dark/70 cursor-pointer">
                <div className="flex items-center gap-2">
                  <Badge variant={t.threatLevel}>{t.threatLevel}</Badge>
                  <span className="text-sm text-gray-300">{t.type}</span>
                </div>
                <ChevronRight size={14} className="text-gray-500" />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No related threats found</p>
        )}
      </Panel>

      <Panel title="Related Operations" icon={Target}>
        {relatedOps.length > 0 ? (
          <div className="space-y-2">
            {relatedOps.map((op) => (
              <div key={op.id} className="flex items-center justify-between p-2 bg-cmd-dark rounded">
                <div>
                  <p className="text-sm font-medium text-cmd-accent">{op.codeName}</p>
                  <p className="text-xs text-gray-500">{op.type}</p>
                </div>
                <StatusIndicator status={op.status === 'active' ? 'active' : 'standby'} showLabel />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No related operations found</p>
        )}
      </Panel>

      <Panel title="Related Cyber Events" icon={Shield}>
        {relatedCyber.length > 0 ? (
          <div className="space-y-2">
            {relatedCyber.map((c) => (
              <div key={c.id} className="flex items-center justify-between p-2 bg-cmd-dark rounded">
                <div>
                  <p className="text-sm text-gray-300">{c.type}</p>
                  <p className="text-xs text-gray-500">{c.target}</p>
                </div>
                <Badge variant={c.severity}>{c.severity}</Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No related cyber events found</p>
        )}
      </Panel>
    </div>
  );
}
