import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Filter,
  RefreshCw,
  X,
  UserCircle,
  MapPin,
  Shield,
  Clock,
  Target,
  Eye,
  FileText,
  Network,
  AlertTriangle,
  Phone,
  Briefcase,
  Globe,
  Heart,
  Brain,
} from 'lucide-react';
import useStore from '../../stores/mainStore';
import { Panel, Badge, StatusIndicator, SearchInput, Select, Tabs, ProgressBar } from '../common';
import { format } from 'date-fns';

export default function HumintNexus() {
  const {
    getFilteredAssets,
    filters,
    setFilter,
    resetFilters,
    selectedEntity,
    selectedEntityType,
    selectEntity,
    clearSelection,
    assets,
    updateAsset,
  } = useStore();

  const [showFilters, setShowFilters] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

  const filteredAssets = getFilteredAssets();
  const selectedAsset = selectedEntityType === 'asset' ? selectedEntity : null;

  const stats = useMemo(() => ({
    active: assets.filter(a => a.status === 'active').length,
    dormant: assets.filter(a => a.status === 'dormant').length,
    compromised: assets.filter(a => a.status === 'compromised').length,
    agents: assets.filter(a => a.type === 'agent').length,
    informants: assets.filter(a => a.type === 'informant').length,
  }), [assets]);

  const statusColors = {
    active: 'status-active',
    dormant: 'status-standby',
    compromised: 'status-compromised',
    terminated: 'status-inactive',
    unknown: 'status-unknown',
  };

  const reliabilityColors = {
    A: 'status-active',
    B: 'cmd-accent',
    C: 'threat-guarded',
    D: 'threat-elevated',
    E: 'threat-high',
    F: 'threat-critical',
  };

  const assetTabs = [
    { id: 'profile', label: 'Profile', icon: UserCircle },
    { id: 'psych', label: 'Psychology', icon: Brain },
    { id: 'network', label: 'Network', icon: Network },
    { id: 'history', label: 'History', icon: Clock },
    { id: 'comms', label: 'Communications', icon: Phone },
  ];

  return (
    <div className="h-full flex">
      {/* Left Panel */}
      <div className={`${selectedAsset ? 'w-1/2' : 'w-full'} flex flex-col border-r border-cmd-border transition-all duration-300`}>
        <div className="p-4 border-b border-cmd-border bg-cmd-panel">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-agency-covert/20">
                <Users size={24} className="text-agency-covert" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">HUMINT Asset Network Nexus</h1>
                <p className="text-sm text-gray-500">Field agents, informants, and contacts database</p>
              </div>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-secondary flex items-center gap-2 ${showFilters ? 'bg-cmd-accent/20 border-cmd-accent' : ''}`}
            >
              <Filter size={14} />
              Filters
            </button>
          </div>

          <div className="grid grid-cols-5 gap-3 mb-4">
            <div className="bg-cmd-dark rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-status-active">{stats.active}</p>
              <p className="text-[10px] text-gray-500 uppercase">Active</p>
            </div>
            <div className="bg-cmd-dark rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-status-standby">{stats.dormant}</p>
              <p className="text-[10px] text-gray-500 uppercase">Dormant</p>
            </div>
            <div className="bg-cmd-dark rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-status-compromised">{stats.compromised}</p>
              <p className="text-[10px] text-gray-500 uppercase">Compromised</p>
            </div>
            <div className="bg-cmd-dark rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-agency-intel">{stats.agents}</p>
              <p className="text-[10px] text-gray-500 uppercase">Agents</p>
            </div>
            <div className="bg-cmd-dark rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-agency-foreign">{stats.informants}</p>
              <p className="text-[10px] text-gray-500 uppercase">Informants</p>
            </div>
          </div>

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
                    value={filters.assets.searchQuery}
                    onChange={(value) => setFilter('assets', 'searchQuery', value)}
                    placeholder="Search assets..."
                  />
                  <Select
                    value={filters.assets.type}
                    onChange={(value) => setFilter('assets', 'type', value)}
                    options={['agent', 'informant', 'contact', 'liaison', 'target'].map(t => ({ value: t, label: t.charAt(0).toUpperCase() + t.slice(1) }))}
                    placeholder="Type"
                  />
                  <Select
                    value={filters.assets.status}
                    onChange={(value) => setFilter('assets', 'status', value)}
                    options={['active', 'dormant', 'compromised', 'terminated', 'unknown'].map(s => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))}
                    placeholder="Status"
                  />
                  <Select
                    value={filters.assets.reliability}
                    onChange={(value) => setFilter('assets', 'reliability', value)}
                    options={['A', 'B', 'C', 'D', 'E', 'F'].map(r => ({ value: r, label: `Rating ${r}` }))}
                    placeholder="Reliability"
                  />
                  <button onClick={() => resetFilters('assets')} className="btn-secondary">
                    <RefreshCw size={14} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredAssets.map((asset, idx) => (
              <motion.div
                key={asset.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.02 }}
                onClick={() => selectEntity(asset, 'asset')}
                className={`panel cursor-pointer transition-all duration-200 hover:border-cmd-accent/50
                  ${selectedAsset?.id === asset.id ? 'border-cmd-accent ring-1 ring-cmd-accent/30' : ''}`}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full bg-${statusColors[asset.status]}/20 flex items-center justify-center`}>
                        <UserCircle size={24} className={`text-${statusColors[asset.status]}`} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-cmd-accent">{asset.codeName}</p>
                        <p className="text-xs text-gray-500">{asset.type} - {asset.subtype}</p>
                      </div>
                    </div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-${reliabilityColors[asset.reliability]}/20`}>
                      <span className={`text-sm font-bold text-${reliabilityColors[asset.reliability]}`}>{asset.reliability}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div className="flex items-center gap-1 text-gray-500">
                      <Globe size={10} />
                      <span>{asset.nationality}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500">
                      <MapPin size={10} />
                      <span>{asset.location?.name}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <StatusIndicator status={asset.status} showLabel size="sm" />
                    <span className="text-[10px] text-gray-500">
                      Last contact: {format(new Date(asset.lastContact), 'dd MMM')}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Detail */}
      <AnimatePresence>
        {selectedAsset && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: '50%', opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="flex flex-col bg-cmd-panel overflow-hidden"
          >
            <div className="p-4 border-b border-cmd-border bg-cmd-dark/50">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full bg-${statusColors[selectedAsset.status]}/20 flex items-center justify-center`}>
                    <UserCircle size={32} className={`text-${statusColors[selectedAsset.status]}`} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-cmd-accent">{selectedAsset.codeName}</h2>
                    <p className="text-sm text-gray-500">{selectedAsset.id}</p>
                  </div>
                </div>
                <button onClick={clearSelection} className="p-2 hover:bg-cmd-dark rounded-lg transition-colors">
                  <X size={20} className="text-gray-400" />
                </button>
              </div>
              <Tabs tabs={assetTabs} activeTab={activeTab} onTabChange={setActiveTab} />
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {activeTab === 'profile' && <AssetProfile asset={selectedAsset} />}
              {activeTab === 'psych' && <AssetPsychology asset={selectedAsset} />}
              {activeTab === 'network' && <AssetNetwork asset={selectedAsset} />}
              {activeTab === 'history' && <AssetHistory asset={selectedAsset} />}
              {activeTab === 'comms' && <AssetCommunications asset={selectedAsset} />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AssetProfile({ asset }) {
  return (
    <div className="space-y-4">
      <Panel title="Identity" icon={UserCircle}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Real Name</p>
            <p className="text-sm font-medium text-white">{asset.realName}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Code Name</p>
            <p className="text-sm font-mono text-cmd-accent">{asset.codeName}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Nationality</p>
            <p className="text-sm text-gray-300">{asset.nationality}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Current Location</p>
            <p className="text-sm text-gray-300">{asset.location?.name}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Type</p>
            <Badge variant="default">{asset.type} - {asset.subtype}</Badge>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Reliability Rating</p>
            <Badge variant={asset.reliability <= 'B' ? 'success' : asset.reliability <= 'D' ? 'warning' : 'critical'}>
              {asset.reliability}
            </Badge>
          </div>
        </div>
      </Panel>

      <Panel title="Agency Assignment" icon={Briefcase}>
        <div className="p-3 bg-cmd-dark rounded-lg">
          <p className="text-sm font-bold text-white">{asset.agency?.name}</p>
          <p className="text-xs text-gray-500">Handler: {asset.handler}</p>
          <p className="text-xs text-gray-500 mt-1">Recruited: {format(new Date(asset.recruitedDate), 'dd MMM yyyy')}</p>
        </div>
      </Panel>

      <Panel title="Risk Assessment" icon={AlertTriangle}>
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-cmd-dark rounded text-center">
            <p className={`text-lg font-bold text-${
              asset.riskAssessment?.compromiseRisk === 'critical' ? 'threat-critical' :
              asset.riskAssessment?.compromiseRisk === 'high' ? 'threat-high' : 'threat-guarded'
            }`}>
              {asset.riskAssessment?.compromiseRisk?.toUpperCase()}
            </p>
            <p className="text-[10px] text-gray-500">Compromise Risk</p>
          </div>
          <div className="p-3 bg-cmd-dark rounded text-center">
            <p className="text-lg font-bold text-threat-elevated">{asset.riskAssessment?.doubleAgentProbability}</p>
            <p className="text-[10px] text-gray-500">Double Agent</p>
          </div>
          <div className="p-3 bg-cmd-dark rounded text-center">
            <p className="text-lg font-bold text-cmd-accent">{asset.riskAssessment?.loyaltyScore}</p>
            <p className="text-[10px] text-gray-500">Loyalty Score</p>
          </div>
        </div>
      </Panel>

      <Panel title="Biometric Data" icon={Eye}>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(asset.biometrics || {}).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between p-2 bg-cmd-dark rounded">
              <span className="text-xs text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
              <StatusIndicator status={value ? 'active' : 'inactive'} />
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function AssetPsychology({ asset }) {
  return (
    <div className="space-y-4">
      <Panel title="Psychological Profile" icon={Brain}>
        <div className="space-y-4">
          <div>
            <p className="text-xs text-gray-500 mb-2">Primary Motivation</p>
            <Badge variant="default">{asset.psychProfile?.motivation}</Badge>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-2">Reliability Assessment</p>
            <p className="text-sm text-gray-300">{asset.psychProfile?.reliability}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-2">Vulnerabilities</p>
            <div className="flex flex-wrap gap-2">
              {asset.psychProfile?.vulnerabilities?.map((v, i) => (
                <Badge key={i} variant="warning">{v}</Badge>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-2">Strengths</p>
            <div className="flex flex-wrap gap-2">
              {asset.psychProfile?.strengths?.map((s, i) => (
                <Badge key={i} variant="success">{s}</Badge>
              ))}
            </div>
          </div>
        </div>
      </Panel>
    </div>
  );
}

function AssetNetwork({ asset }) {
  return (
    <div className="space-y-4">
      <Panel title="Known Associates" icon={Network}>
        <div className="space-y-2">
          {asset.knownAssociates?.map((associate, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-cmd-dark rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-agency-foreign/20 flex items-center justify-center">
                  <UserCircle size={16} className="text-agency-foreign" />
                </div>
                <div>
                  <p className="text-sm text-white">{associate.name}</p>
                  <p className="text-xs text-gray-500">{associate.relationship}</p>
                </div>
              </div>
              <Badge variant={associate.trustLevel === 'trusted' ? 'success' : associate.trustLevel === 'suspected' ? 'critical' : 'default'}>
                {associate.trustLevel}
              </Badge>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function AssetHistory({ asset }) {
  return (
    <div className="space-y-4">
      <Panel title="Travel History" icon={Globe}>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {asset.travelHistory?.map((travel, i) => (
            <div key={i} className={`flex items-center justify-between p-2 bg-cmd-dark rounded ${travel.flagged ? 'border-l-2 border-l-threat-critical' : ''}`}>
              <div>
                <p className="text-sm text-gray-300">{travel.destination?.name}</p>
                <p className="text-xs text-gray-500">{travel.purpose} - {travel.duration}</p>
              </div>
              <span className="text-xs text-gray-500">{format(new Date(travel.date), 'dd MMM')}</span>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Operational History" icon={Target}>
        <div className="space-y-2">
          {asset.operationalHistory?.map((op, i) => (
            <div key={i} className="p-3 bg-cmd-dark rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-mono text-cmd-accent">{op.operation}</span>
                <Badge variant={op.outcome === 'success' ? 'success' : op.outcome === 'failed' ? 'critical' : 'warning'}>
                  {op.outcome}
                </Badge>
              </div>
              <p className="text-xs text-gray-500">Role: {op.role}</p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function AssetCommunications({ asset }) {
  return (
    <div className="space-y-4">
      <Panel title="Communication Log" icon={Phone}>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {asset.communications?.map((comm, i) => (
            <div key={i} className={`p-3 bg-cmd-dark rounded-lg ${!comm.verified ? 'border-l-2 border-l-threat-elevated' : ''}`}>
              <div className="flex items-center justify-between mb-2">
                <Badge variant="default">{comm.type}</Badge>
                <span className="text-xs text-gray-500">{format(new Date(comm.date), 'dd MMM HH:mm')}</span>
              </div>
              <p className="text-sm text-gray-300">{comm.summary}</p>
              <div className="flex items-center gap-2 mt-2">
                <StatusIndicator status={comm.verified ? 'active' : 'standby'} />
                <span className="text-xs text-gray-500">{comm.verified ? 'Verified' : 'Unverified'}</span>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
