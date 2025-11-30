import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Filter,
  RefreshCw,
  X,
  Network,
  AlertTriangle,
  Lock,
  Unlock,
  Globe,
  Clock,
  Zap,
  Activity,
  Server,
  Database,
  Bug,
  Eye,
  Target,
  Crosshair,
} from 'lucide-react';
import { ResponsiveContainer, Treemap, BarChart, Bar, Cell, XAxis, YAxis, Tooltip } from 'recharts';
import useStore from '../../stores/mainStore';
import { Panel, Badge, StatusIndicator, SearchInput, Select, Tabs, ProgressBar, Timeline } from '../common';
import { format } from 'date-fns';

export default function CyberTheater() {
  const {
    getFilteredCyberEvents,
    filters,
    setFilter,
    resetFilters,
    selectedEntity,
    selectedEntityType,
    selectEntity,
    clearSelection,
    cyberEvents,
    updateCyberEvent,
    isolateCyberNode,
  } = useStore();

  const [showFilters, setShowFilters] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const filteredEvents = getFilteredCyberEvents();
  const selectedEvent = selectedEntityType === 'cyberEvent' ? selectedEntity : null;

  const stats = useMemo(() => ({
    critical: cyberEvents.filter(c => c.severity === 'critical').length,
    active: cyberEvents.filter(c => c.status === 'active').length,
    contained: cyberEvents.filter(c => c.status === 'contained').length,
    remediated: cyberEvents.filter(c => c.status === 'remediated').length,
  }), [cyberEvents]);

  const severityColors = {
    critical: { bg: 'bg-threat-critical', text: 'text-threat-critical' },
    high: { bg: 'bg-threat-high', text: 'text-threat-high' },
    medium: { bg: 'bg-threat-elevated', text: 'text-threat-elevated' },
    low: { bg: 'bg-threat-low', text: 'text-threat-low' },
  };

  const cyberTabs = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'network', label: 'Network', icon: Network },
    { id: 'indicators', label: 'IOCs', icon: Bug },
    { id: 'timeline', label: 'Timeline', icon: Clock },
    { id: 'response', label: 'Response', icon: Shield },
  ];

  const handleIsolateNode = (nodeId) => {
    if (selectedEvent) {
      isolateCyberNode(selectedEvent.id, nodeId);
    }
  };

  const handleContain = () => {
    if (selectedEvent) {
      updateCyberEvent(selectedEvent.id, { status: 'contained' });
    }
  };

  return (
    <div className="h-full flex">
      {/* Left Panel */}
      <div className={`${selectedEvent ? 'w-1/2' : 'w-full'} flex flex-col border-r border-cmd-border transition-all duration-300`}>
        {/* Header */}
        <div className="p-4 border-b border-cmd-border bg-cmd-panel">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-agency-cyber/20">
                <Shield size={24} className="text-agency-cyber" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Cyber Operations Theater</h1>
                <p className="text-sm text-gray-500">Global cyber warfare analysis center</p>
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

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            <div className="bg-cmd-dark rounded-lg p-3 text-center border-l-4 border-threat-critical">
              <p className="text-2xl font-bold text-threat-critical">{stats.critical}</p>
              <p className="text-[10px] text-gray-500 uppercase">Critical</p>
            </div>
            <div className="bg-cmd-dark rounded-lg p-3 text-center border-l-4 border-status-active">
              <p className="text-2xl font-bold text-threat-high">{stats.active}</p>
              <p className="text-[10px] text-gray-500 uppercase">Active</p>
            </div>
            <div className="bg-cmd-dark rounded-lg p-3 text-center border-l-4 border-threat-elevated">
              <p className="text-2xl font-bold text-threat-elevated">{stats.contained}</p>
              <p className="text-[10px] text-gray-500 uppercase">Contained</p>
            </div>
            <div className="bg-cmd-dark rounded-lg p-3 text-center border-l-4 border-status-active">
              <p className="text-2xl font-bold text-status-active">{stats.remediated}</p>
              <p className="text-[10px] text-gray-500 uppercase">Remediated</p>
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
                    value={filters.cyberEvents.searchQuery}
                    onChange={(value) => setFilter('cyberEvents', 'searchQuery', value)}
                    placeholder="Search events..."
                  />
                  <Select
                    value={filters.cyberEvents.severity}
                    onChange={(value) => setFilter('cyberEvents', 'severity', value)}
                    options={['critical', 'high', 'medium', 'low'].map(s => ({ value: s, label: s.toUpperCase() }))}
                    placeholder="Severity"
                  />
                  <Select
                    value={filters.cyberEvents.status}
                    onChange={(value) => setFilter('cyberEvents', 'status', value)}
                    options={['active', 'contained', 'investigating', 'remediated', 'escalated'].map(s => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))}
                    placeholder="Status"
                  />
                  <Select
                    value={filters.cyberEvents.type}
                    onChange={(value) => setFilter('cyberEvents', 'type', value)}
                    options={[...new Set(cyberEvents.map(c => c.type))].map(t => ({ value: t, label: t }))}
                    placeholder="Type"
                  />
                  <button onClick={() => resetFilters('cyberEvents')} className="btn-secondary">
                    <RefreshCw size={14} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Events List */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            {filteredEvents.map((event, idx) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.02 }}
                onClick={() => selectEntity(event, 'cyberEvent')}
                className={`panel cursor-pointer transition-all duration-200 hover:border-cmd-accent/50
                  ${selectedEvent?.id === event.id ? 'border-cmd-accent ring-1 ring-cmd-accent/30' : ''}`}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${severityColors[event.severity]?.bg} ${
                        event.status === 'active' ? 'animate-pulse' : ''
                      }`} />
                      <Badge variant={event.severity}>{event.severity}</Badge>
                      <Badge variant={event.status === 'active' ? 'warning' : event.status === 'remediated' ? 'success' : 'default'}>
                        {event.status}
                      </Badge>
                    </div>
                    <span className="text-xs text-gray-500">{format(new Date(event.timestamp), 'dd MMM HH:mm')}</span>
                  </div>

                  <h3 className="text-sm font-semibold text-white mb-1">{event.type}</h3>
                  <p className="text-xs text-gray-400 mb-3">{event.target}</p>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3 text-gray-500">
                      <span className="flex items-center gap-1">
                        <Server size={10} />
                        {event.affectedSystems} systems
                      </span>
                      <span className="flex items-center gap-1">
                        <Database size={10} />
                        {event.dataAtRisk}
                      </span>
                    </div>
                    <span className="text-gray-500">{event.suspectedActor.name}</span>
                  </div>

                  {event.malwareFamily && (
                    <div className="mt-2 pt-2 border-t border-cmd-border/50">
                      <Badge variant="critical">
                        <Bug size={10} className="mr-1" />
                        {event.malwareFamily}
                      </Badge>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Detail */}
      <AnimatePresence>
        {selectedEvent && (
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
                    <Badge variant={selectedEvent.severity}>{selectedEvent.severity}</Badge>
                    <h2 className="text-lg font-bold text-white">{selectedEvent.type}</h2>
                  </div>
                  <p className="text-sm text-gray-500">{selectedEvent.id}</p>
                </div>
                <button onClick={clearSelection} className="p-2 hover:bg-cmd-dark rounded-lg transition-colors">
                  <X size={20} className="text-gray-400" />
                </button>
              </div>
              <Tabs tabs={cyberTabs} activeTab={activeTab} onTabChange={setActiveTab} />
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {activeTab === 'overview' && <CyberOverview event={selectedEvent} onContain={handleContain} />}
              {activeTab === 'network' && <CyberNetwork event={selectedEvent} onIsolate={handleIsolateNode} />}
              {activeTab === 'indicators' && <CyberIndicators event={selectedEvent} />}
              {activeTab === 'timeline' && <CyberTimeline event={selectedEvent} />}
              {activeTab === 'response' && <CyberResponse event={selectedEvent} />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CyberOverview({ event, onContain }) {
  return (
    <div className="space-y-4">
      <Panel title="Event Details" icon={Eye}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Target</p>
            <p className="text-sm font-medium text-white">{event.target}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Attack Vector</p>
            <Badge variant="default">{event.attackVector}</Badge>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Affected Systems</p>
            <p className="text-sm font-bold text-threat-critical">{event.affectedSystems}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Data at Risk</p>
            <p className="text-sm font-bold text-threat-elevated">{event.dataAtRisk}</p>
          </div>
        </div>

        {event.status === 'active' && (
          <button onClick={onContain} className="w-full mt-4 btn-danger flex items-center justify-center gap-2">
            <Shield size={14} />
            Initiate Containment
          </button>
        )}
      </Panel>

      <Panel title="Suspected Actor" icon={Target}>
        <div className="p-3 bg-cmd-dark rounded-lg">
          <p className="text-sm font-bold text-white">{event.suspectedActor.name}</p>
          <p className="text-xs text-gray-500 mb-2">{event.suspectedActor.id}</p>
          <div className="flex items-center gap-2">
            <Badge variant="default">{event.suspectedActor.type}</Badge>
            <Badge variant={event.suspectedActor.capability === 'elite' ? 'critical' : 'elevated'}>
              {event.suspectedActor.capability}
            </Badge>
          </div>
        </div>
      </Panel>

      {event.malwareFamily && (
        <Panel title="Malware Analysis" icon={Bug}>
          <div className="p-3 bg-threat-critical/10 border border-threat-critical/30 rounded-lg">
            <p className="text-sm font-bold text-threat-critical">{event.malwareFamily}</p>
            <p className="text-xs text-gray-400 mt-1">Identified malware family</p>
          </div>
        </Panel>
      )}

      <Panel title="MITRE ATT&CK Tactics" icon={Crosshair}>
        <div className="flex flex-wrap gap-2">
          {event.mitreTactics?.map((tactic, i) => (
            <Badge key={i} variant="default">{tactic}</Badge>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function CyberNetwork({ event, onIsolate }) {
  const nodeStatusColors = {
    clean: 'bg-status-active',
    infected: 'bg-threat-critical',
    isolated: 'bg-agency-intel',
    unknown: 'bg-status-unknown',
  };

  return (
    <div className="space-y-4">
      <Panel title="Network Topology" icon={Network}>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center p-2 bg-cmd-dark rounded">
            <p className="text-lg font-bold text-status-active">
              {event.networkNodes?.filter(n => n.status === 'clean').length}
            </p>
            <p className="text-[10px] text-gray-500">Clean</p>
          </div>
          <div className="text-center p-2 bg-cmd-dark rounded">
            <p className="text-lg font-bold text-threat-critical">
              {event.networkNodes?.filter(n => n.status === 'infected').length}
            </p>
            <p className="text-[10px] text-gray-500">Infected</p>
          </div>
          <div className="text-center p-2 bg-cmd-dark rounded">
            <p className="text-lg font-bold text-agency-intel">
              {event.networkNodes?.filter(n => n.status === 'isolated').length}
            </p>
            <p className="text-[10px] text-gray-500">Isolated</p>
          </div>
        </div>

        <div className="space-y-2 max-h-80 overflow-y-auto">
          {event.networkNodes?.map((node, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-cmd-dark rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${nodeStatusColors[node.status]} ${
                  node.status === 'infected' ? 'animate-pulse' : ''
                }`} />
                <div>
                  <p className="text-sm font-mono text-white">{node.id}</p>
                  <p className="text-xs text-gray-500">{node.ip} - {node.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={node.status === 'infected' ? 'critical' : node.status === 'isolated' ? 'default' : 'success'}>
                  {node.status}
                </Badge>
                {node.status === 'infected' && (
                  <button
                    onClick={() => onIsolate(node.id)}
                    className="px-2 py-1 text-xs bg-agency-intel/20 text-agency-intel border border-agency-intel/50 rounded hover:bg-agency-intel/30 transition-colors"
                  >
                    Isolate
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function CyberIndicators({ event }) {
  return (
    <div className="space-y-4">
      <Panel title="IP Addresses" icon={Globe}>
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {event.indicators?.ips?.map((ip, i) => (
            <div key={i} className="flex items-center justify-between p-2 bg-cmd-dark rounded">
              <span className="text-sm font-mono text-gray-300">{ip}</span>
              <button className="text-xs text-cmd-accent hover:underline">Block</button>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Malicious Domains" icon={Network}>
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {event.indicators?.domains?.map((domain, i) => (
            <div key={i} className="flex items-center justify-between p-2 bg-cmd-dark rounded">
              <span className="text-sm font-mono text-gray-300">{domain}</span>
              <button className="text-xs text-cmd-accent hover:underline">Sinkhole</button>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="File Hashes" icon={Database}>
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {event.indicators?.hashes?.map((hash, i) => (
            <div key={i} className="p-2 bg-cmd-dark rounded">
              <p className="text-xs font-mono text-gray-400 break-all">{hash}</p>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Signatures Detected" icon={Bug}>
        <div className="text-center py-4">
          <p className="text-3xl font-bold text-threat-critical">{event.indicators?.signatures}</p>
          <p className="text-xs text-gray-500 uppercase mt-1">Unique Signatures</p>
        </div>
      </Panel>
    </div>
  );
}

function CyberTimeline({ event }) {
  return (
    <div className="space-y-4">
      <Panel title="Event Timeline" icon={Clock}>
        <Timeline
          events={event.timeline || []}
          renderEvent={(item, idx) => (
            <div className={`panel p-3 ${
              item.severity === 'critical' ? 'border-l-2 border-l-threat-critical' :
              item.severity === 'warning' ? 'border-l-2 border-l-threat-elevated' :
              'border-l-2 border-l-cmd-accent'
            }`}>
              <p className="text-xs text-gray-500">{format(new Date(item.time), 'HH:mm:ss dd MMM')}</p>
              <p className="text-sm text-white mt-1">{item.event}</p>
              <Badge variant={item.severity === 'critical' ? 'critical' : item.severity === 'warning' ? 'warning' : 'default'} className="mt-2">
                {item.severity}
              </Badge>
            </div>
          )}
        />
      </Panel>
    </div>
  );
}

function CyberResponse({ event }) {
  const responseActions = [
    { action: 'Network Isolation', status: event.networkNodes?.some(n => n.status === 'isolated') ? 'active' : 'pending' },
    { action: 'Malware Quarantine', status: 'active' },
    { action: 'Credential Reset', status: 'pending' },
    { action: 'Forensic Collection', status: 'in-progress' },
    { action: 'Threat Hunt', status: 'pending' },
  ];

  return (
    <div className="space-y-4">
      <Panel title="Response Actions" icon={Shield}>
        <div className="space-y-2">
          {responseActions.map((action, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-cmd-dark rounded-lg">
              <span className="text-sm text-gray-300">{action.action}</span>
              <Badge variant={action.status === 'active' ? 'success' : action.status === 'in-progress' ? 'warning' : 'default'}>
                {action.status}
              </Badge>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Containment Status" icon={Lock}>
        <div className="text-center py-4">
          <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
            event.status === 'contained' ? 'bg-status-active/20' :
            event.status === 'active' ? 'bg-threat-critical/20' : 'bg-cmd-dark'
          }`}>
            {event.status === 'contained' ? (
              <Lock size={32} className="text-status-active" />
            ) : (
              <Unlock size={32} className="text-threat-critical" />
            )}
          </div>
          <p className={`text-lg font-bold mt-3 ${
            event.status === 'contained' ? 'text-status-active' : 'text-threat-critical'
          }`}>
            {event.status === 'contained' ? 'CONTAINED' : 'NOT CONTAINED'}
          </p>
        </div>
      </Panel>
    </div>
  );
}
