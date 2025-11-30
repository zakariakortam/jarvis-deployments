import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Radio,
  Filter,
  RefreshCw,
  X,
  Signal,
  Lock,
  Unlock,
  Globe,
  Clock,
  AlertTriangle,
  Zap,
  Activity,
  Database,
  FileText,
  Target,
  Cpu,
  Waves,
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, BarChart, Bar, Cell } from 'recharts';
import useStore from '../../stores/mainStore';
import { Panel, Badge, StatusIndicator, SearchInput, Select, Tabs, ProgressBar } from '../common';
import { format } from 'date-fns';

export default function SigintChamber() {
  const {
    getFilteredIntercepts,
    filters,
    setFilter,
    resetFilters,
    selectedEntity,
    selectedEntityType,
    selectEntity,
    clearSelection,
    intercepts,
    decryptIntercept,
  } = useStore();

  const [showFilters, setShowFilters] = useState(true);
  const [activeTab, setActiveTab] = useState('metadata');
  const [decrypting, setDecrypting] = useState(null);

  const filteredIntercepts = getFilteredIntercepts();
  const selectedIntercept = selectedEntityType === 'intercept' ? selectedEntity : null;

  const stats = useMemo(() => ({
    total: intercepts.length,
    encrypted: intercepts.filter(i => i.decryptionStatus === 'encrypted').length,
    decrypted: intercepts.filter(i => i.decryptionStatus === 'decrypted').length,
    processing: intercepts.filter(i => i.decryptionStatus === 'processing').length,
  }), [intercepts]);

  const protocols = [...new Set(intercepts.map(i => i.protocol))];
  const encryptions = [...new Set(intercepts.map(i => i.encryption))];

  const interceptTabs = [
    { id: 'metadata', label: 'Metadata', icon: Database },
    { id: 'waveform', label: 'Signal', icon: Waves },
    { id: 'content', label: 'Content', icon: FileText },
    { id: 'correlation', label: 'Correlation', icon: Target },
  ];

  const signalData = useMemo(() => {
    return Array(50).fill(0).map((_, i) => ({
      time: i,
      amplitude: Math.sin(i * 0.3) * 50 + Math.random() * 30 + 50,
      noise: Math.random() * 20,
    }));
  }, []);

  const handleDecrypt = async (interceptId) => {
    setDecrypting(interceptId);
    await new Promise(resolve => setTimeout(resolve, 2000));
    decryptIntercept(interceptId);
    setDecrypting(null);
  };

  const decryptionColors = {
    encrypted: { bg: 'bg-threat-critical', text: 'text-threat-critical', icon: Lock },
    partial: { bg: 'bg-threat-elevated', text: 'text-threat-elevated', icon: Lock },
    decrypted: { bg: 'bg-status-active', text: 'text-status-active', icon: Unlock },
    processing: { bg: 'bg-cmd-accent', text: 'text-cmd-accent', icon: Cpu },
  };

  return (
    <div className="h-full flex">
      {/* Left Panel */}
      <div className={`${selectedIntercept ? 'w-1/2' : 'w-full'} flex flex-col border-r border-cmd-border transition-all duration-300`}>
        {/* Header */}
        <div className="p-4 border-b border-cmd-border bg-cmd-panel">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-agency-intel/20">
                <Radio size={24} className="text-agency-intel" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Deep SIGINT Intercept Chamber</h1>
                <p className="text-sm text-gray-500">Global communications traffic analysis</p>
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
            <div className="bg-cmd-dark rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-cmd-accent">{stats.total}</p>
              <p className="text-[10px] text-gray-500 uppercase">Total Intercepts</p>
            </div>
            <div className="bg-cmd-dark rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-threat-critical">{stats.encrypted}</p>
              <p className="text-[10px] text-gray-500 uppercase">Encrypted</p>
            </div>
            <div className="bg-cmd-dark rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-status-active">{stats.decrypted}</p>
              <p className="text-[10px] text-gray-500 uppercase">Decrypted</p>
            </div>
            <div className="bg-cmd-dark rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-cmd-accent">{stats.processing}</p>
              <p className="text-[10px] text-gray-500 uppercase">Processing</p>
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
                    value={filters.intercepts.searchQuery}
                    onChange={(value) => setFilter('intercepts', 'searchQuery', value)}
                    placeholder="Search intercepts..."
                  />
                  <Select
                    value={filters.intercepts.protocol}
                    onChange={(value) => setFilter('intercepts', 'protocol', value)}
                    options={protocols.map(p => ({ value: p, label: p }))}
                    placeholder="Protocol"
                  />
                  <Select
                    value={filters.intercepts.encryption}
                    onChange={(value) => setFilter('intercepts', 'encryption', value)}
                    options={encryptions.map(e => ({ value: e, label: e }))}
                    placeholder="Encryption"
                  />
                  <Select
                    value={filters.intercepts.decryptionStatus}
                    onChange={(value) => setFilter('intercepts', 'decryptionStatus', value)}
                    options={['encrypted', 'partial', 'decrypted', 'processing'].map(s => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))}
                    placeholder="Status"
                  />
                  <button onClick={() => resetFilters('intercepts')} className="btn-secondary">
                    <RefreshCw size={14} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Intercepts List */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {filteredIntercepts.slice(0, 50).map((intercept, idx) => {
              const StatusIcon = decryptionColors[intercept.decryptionStatus]?.icon || Lock;
              return (
                <motion.div
                  key={intercept.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.01 }}
                  onClick={() => selectEntity(intercept, 'intercept')}
                  className={`panel cursor-pointer transition-all duration-200 hover:border-cmd-accent/50
                    ${selectedIntercept?.id === intercept.id ? 'border-cmd-accent ring-1 ring-cmd-accent/30' : ''}`}
                >
                  <div className="p-3 flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${decryptionColors[intercept.decryptionStatus]?.bg}/20`}>
                      <StatusIcon size={16} className={decryptionColors[intercept.decryptionStatus]?.text} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-cmd-accent">{intercept.id}</span>
                        <Badge variant="default">{intercept.protocol}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Signal size={10} />
                          {intercept.signalStrength} dBm
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={10} />
                          {format(new Date(intercept.timestamp), 'HH:mm:ss')}
                        </span>
                        <span className="truncate">{intercept.suspectedActor.name}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {intercept.anomalyFlags?.length > 0 && (
                        <AlertTriangle size={14} className="text-threat-elevated" />
                      )}
                      <Badge variant={intercept.decryptionStatus === 'decrypted' ? 'success' : intercept.decryptionStatus === 'encrypted' ? 'critical' : 'warning'}>
                        {intercept.decryptionStatus}
                      </Badge>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Panel - Detail */}
      <AnimatePresence>
        {selectedIntercept && (
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
                    <span className="text-sm font-mono text-cmd-accent">{selectedIntercept.id}</span>
                    <Badge variant={selectedIntercept.decryptionStatus === 'decrypted' ? 'success' : 'critical'}>
                      {selectedIntercept.decryptionStatus}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">{selectedIntercept.protocol} - {selectedIntercept.encryption}</p>
                </div>
                <button onClick={clearSelection} className="p-2 hover:bg-cmd-dark rounded-lg transition-colors">
                  <X size={20} className="text-gray-400" />
                </button>
              </div>
              <Tabs tabs={interceptTabs} activeTab={activeTab} onTabChange={setActiveTab} />
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {activeTab === 'metadata' && (
                <InterceptMetadata intercept={selectedIntercept} onDecrypt={handleDecrypt} decrypting={decrypting} />
              )}
              {activeTab === 'waveform' && (
                <InterceptWaveform intercept={selectedIntercept} signalData={signalData} />
              )}
              {activeTab === 'content' && (
                <InterceptContent intercept={selectedIntercept} />
              )}
              {activeTab === 'correlation' && (
                <InterceptCorrelation intercept={selectedIntercept} />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InterceptMetadata({ intercept, onDecrypt, decrypting }) {
  return (
    <div className="space-y-4">
      <Panel title="Signal Information" icon={Signal}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Protocol</p>
            <p className="text-sm font-medium text-white">{intercept.protocol}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Frequency</p>
            <p className="text-sm font-medium text-white">{intercept.frequency}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Signal Strength</p>
            <p className="text-sm font-medium text-white">{intercept.signalStrength} dBm</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Duration</p>
            <p className="text-sm font-medium text-white">{intercept.duration}s</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Encryption</p>
            <Badge variant={intercept.encryption === 'UNENCRYPTED' ? 'success' : 'warning'}>
              {intercept.encryption}
            </Badge>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Decryption Status</p>
            <Badge variant={intercept.decryptionStatus === 'decrypted' ? 'success' : intercept.decryptionStatus === 'encrypted' ? 'critical' : 'warning'}>
              {intercept.decryptionStatus}
            </Badge>
          </div>
        </div>

        {intercept.decryptionStatus !== 'decrypted' && (
          <button
            onClick={() => onDecrypt(intercept.id)}
            disabled={decrypting === intercept.id}
            className="w-full mt-4 btn-primary flex items-center justify-center gap-2"
          >
            {decrypting === intercept.id ? (
              <>
                <Cpu size={14} className="animate-spin" />
                Decrypting...
              </>
            ) : (
              <>
                <Unlock size={14} />
                Attempt Decryption
              </>
            )}
          </button>
        )}
      </Panel>

      <Panel title="Origin Information" icon={Globe}>
        <div className="space-y-3">
          <div className="p-3 bg-cmd-dark rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Origin Location</p>
            <p className="text-sm text-white">{intercept.origin.city?.name || 'Unknown'}</p>
            <p className="text-xs text-gray-500">Confidence: {intercept.origin.confidence}%</p>
          </div>
          <div className="p-3 bg-cmd-dark rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Destination</p>
            <p className="text-sm text-white">Coordinates: {intercept.destination.coords?.join(', ')}</p>
            <p className="text-xs text-gray-500">Confidence: {intercept.destination.confidence}%</p>
          </div>
        </div>
      </Panel>

      <Panel title="Packet Metadata" icon={Database}>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-2 bg-cmd-dark rounded">
            <span className="text-gray-500">Packets:</span>
            <span className="text-white ml-2">{intercept.metadata?.packetCount?.toLocaleString()}</span>
          </div>
          <div className="p-2 bg-cmd-dark rounded">
            <span className="text-gray-500">Size:</span>
            <span className="text-white ml-2">{(intercept.metadata?.byteSize / 1024).toFixed(1)} KB</span>
          </div>
          <div className="p-2 bg-cmd-dark rounded">
            <span className="text-gray-500">Error Rate:</span>
            <span className="text-white ml-2">{intercept.metadata?.errorRate}</span>
          </div>
          <div className="p-2 bg-cmd-dark rounded">
            <span className="text-gray-500">Latency:</span>
            <span className="text-white ml-2">{intercept.metadata?.latency}</span>
          </div>
          <div className="p-2 bg-cmd-dark rounded col-span-2">
            <span className="text-gray-500">Session ID:</span>
            <span className="text-cmd-accent ml-2 font-mono">{intercept.metadata?.sessionId}</span>
          </div>
        </div>
      </Panel>

      {intercept.tags?.length > 0 && (
        <Panel title="Classification Tags" icon={Target}>
          <div className="flex flex-wrap gap-2">
            {intercept.tags.map((tag, i) => (
              <Badge key={i} variant={tag.includes('HIGH') ? 'critical' : 'default'}>{tag}</Badge>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}

function InterceptWaveform({ intercept, signalData }) {
  return (
    <div className="space-y-4">
      <Panel title="Signal Waveform" icon={Waves}>
        <div className="h-48 bg-cmd-dark rounded-lg p-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={signalData}>
              <defs>
                <linearGradient id="signalGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#00d4ff" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="#333" tick={false} />
              <YAxis stroke="#333" tick={{ fill: '#666', fontSize: 10 }} domain={[0, 150]} />
              <Area type="monotone" dataKey="amplitude" stroke="#00d4ff" fillOpacity={1} fill="url(#signalGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-3">
          <div className="text-center p-2 bg-cmd-dark rounded">
            <p className="text-lg font-bold text-cmd-accent">{intercept.signalStrength}</p>
            <p className="text-[10px] text-gray-500">dBm</p>
          </div>
          <div className="text-center p-2 bg-cmd-dark rounded">
            <p className="text-lg font-bold text-threat-elevated">{intercept.metadata?.errorRate}</p>
            <p className="text-[10px] text-gray-500">Error Rate</p>
          </div>
          <div className="text-center p-2 bg-cmd-dark rounded">
            <p className="text-lg font-bold text-agency-intel">{intercept.metadata?.hopCount}</p>
            <p className="text-[10px] text-gray-500">Hops</p>
          </div>
        </div>
      </Panel>

      <Panel title="Frequency Analysis" icon={Activity}>
        <div className="h-32 bg-cmd-dark rounded-lg p-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={Array(20).fill(0).map((_, i) => ({ freq: i, value: Math.random() * 100 }))}>
              <Bar dataKey="value" fill="#00d4ff">
                {Array(20).fill(0).map((_, index) => (
                  <Cell key={index} fill={index === 10 ? '#ff0040' : '#00d4ff'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>
    </div>
  );
}

function InterceptContent({ intercept }) {
  return (
    <div className="space-y-4">
      <Panel title="Intercepted Content" icon={FileText}>
        {intercept.decryptionStatus === 'decrypted' || intercept.content ? (
          <div className="p-4 bg-cmd-dark rounded-lg font-mono text-sm">
            <pre className="whitespace-pre-wrap text-gray-300">
              {intercept.content || '[No readable content available]'}
            </pre>
          </div>
        ) : (
          <div className="p-8 text-center">
            <Lock size={48} className="mx-auto text-threat-critical mb-4" />
            <p className="text-gray-400">Content encrypted</p>
            <p className="text-xs text-gray-500 mt-2">Encryption: {intercept.encryption}</p>
          </div>
        )}
      </Panel>

      {intercept.anomalyFlags?.length > 0 && (
        <Panel title="Anomaly Flags" icon={AlertTriangle}>
          <div className="space-y-2">
            {intercept.anomalyFlags.map((flag, i) => (
              <div key={i} className="flex items-center gap-2 p-2 bg-threat-elevated/10 border border-threat-elevated/30 rounded">
                <AlertTriangle size={14} className="text-threat-elevated" />
                <span className="text-sm text-gray-300">{flag}</span>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}

function InterceptCorrelation({ intercept }) {
  return (
    <div className="space-y-4">
      <Panel title="Suspected Actor" icon={Target}>
        <div className="p-3 bg-cmd-dark rounded-lg">
          <p className="text-sm font-bold text-white">{intercept.suspectedActor.name}</p>
          <p className="text-xs text-gray-500">{intercept.suspectedActor.id}</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="default">{intercept.suspectedActor.type}</Badge>
            <Badge variant={intercept.suspectedActor.capability === 'elite' ? 'critical' : 'elevated'}>
              {intercept.suspectedActor.capability}
            </Badge>
          </div>
        </div>
      </Panel>

      <Panel title="Correlations" icon={Zap}>
        <div className="text-center py-6">
          <p className="text-3xl font-bold text-cmd-accent">{intercept.correlations}</p>
          <p className="text-xs text-gray-500 uppercase mt-1">Related Intercepts Found</p>
        </div>
        <div className="space-y-2">
          {Array(Math.min(5, intercept.correlations)).fill(0).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-2 bg-cmd-dark rounded">
              <span className="text-xs font-mono text-gray-400">INTERCEPT-{String(Math.floor(Math.random() * 100000)).padStart(6, '0')}</span>
              <span className="text-xs text-gray-500">{Math.floor(Math.random() * 50) + 50}% match</span>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
