import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  Users,
  TrendingUp,
  TrendingDown,
  Globe,
  MessageSquare,
  Share2,
  Eye,
  AlertTriangle,
  Activity,
  BarChart3,
  Target,
  Radio,
  Zap,
  Filter,
  Search,
  ChevronRight,
} from 'lucide-react';
import useStore from '../../stores/mainStore';
import { Panel, Badge, SearchInput, Select, ProgressBar, StatusIndicator, Tabs } from '../common';

export default function PsyopsMonitor() {
  const {
    influenceOps,
    influenceFilters,
    setInfluenceFilters,
    selectEntity,
    selectedEntity,
  } = useStore();

  const [activeTab, setActiveTab] = useState('campaigns');
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  const platformOptions = [
    { value: 'all', label: 'All Platforms' },
    { value: 'social_media', label: 'Social Media' },
    { value: 'news_media', label: 'News Media' },
    { value: 'forums', label: 'Forums' },
    { value: 'messaging', label: 'Messaging Apps' },
    { value: 'state_media', label: 'State Media' },
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'monitoring', label: 'Monitoring' },
    { value: 'countered', label: 'Countered' },
    { value: 'dormant', label: 'Dormant' },
  ];

  const threatOptions = [
    { value: 'all', label: 'All Threat Levels' },
    { value: 'critical', label: 'Critical' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
  ];

  const filteredOps = useMemo(() => {
    return influenceOps.filter(op => {
      if (influenceFilters.platform !== 'all' && !op.platforms.includes(influenceFilters.platform)) return false;
      if (influenceFilters.status !== 'all' && op.status !== influenceFilters.status) return false;
      if (influenceFilters.threatLevel !== 'all' && op.threatLevel !== influenceFilters.threatLevel) return false;
      if (influenceFilters.search) {
        const search = influenceFilters.search.toLowerCase();
        if (!op.name.toLowerCase().includes(search) &&
            !op.actor.toLowerCase().includes(search) &&
            !op.targetAudience.toLowerCase().includes(search)) return false;
      }
      return true;
    });
  }, [influenceOps, influenceFilters]);

  const metrics = useMemo(() => {
    const active = influenceOps.filter(o => o.status === 'active').length;
    const totalReach = influenceOps.reduce((sum, o) => sum + o.metrics.reach, 0);
    const avgEngagement = influenceOps.reduce((sum, o) => sum + o.metrics.engagement, 0) / influenceOps.length;
    const criticalOps = influenceOps.filter(o => o.threatLevel === 'critical').length;
    return { active, totalReach, avgEngagement, criticalOps };
  }, [influenceOps]);

  const handleCampaignSelect = (campaign) => {
    setSelectedCampaign(campaign);
    selectEntity(campaign, 'influenceOp');
  };

  const getThreatColor = (level) => {
    const colors = {
      critical: 'text-threat-critical',
      high: 'text-threat-high',
      medium: 'text-threat-elevated',
      low: 'text-threat-low',
    };
    return colors[level] || 'text-gray-400';
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const tabs = [
    { id: 'campaigns', label: 'Campaigns', icon: Target },
    { id: 'narratives', label: 'Narratives', icon: MessageSquare },
    { id: 'networks', label: 'Networks', icon: Share2 },
    { id: 'counters', label: 'Counter-Ops', icon: Zap },
  ];

  const detailTabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'narratives', label: 'Narratives' },
    { id: 'metrics', label: 'Metrics' },
    { id: 'attribution', label: 'Attribution' },
    { id: 'counters', label: 'Counter Measures' },
  ];

  const [detailTab, setDetailTab] = useState('overview');

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 bg-cmd-panel border-b border-cmd-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-agency-psyops/20">
              <Brain size={24} className="text-agency-psyops" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Psychological Operations & Influence Monitoring</h1>
              <p className="text-sm text-gray-500">Foreign influence campaign detection and analysis</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={metrics.criticalOps > 0 ? 'critical' : 'success'}>
              {metrics.criticalOps} Critical
            </Badge>
            <Badge variant="default">
              {metrics.active} Active Campaigns
            </Badge>
          </div>
        </div>

        {/* Metrics Bar */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-cmd-dark rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Activity size={14} className="text-agency-psyops" />
              <span className="text-xs text-gray-500">Active Campaigns</span>
            </div>
            <p className="text-xl font-bold text-white">{metrics.active}</p>
          </div>
          <div className="bg-cmd-dark rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Users size={14} className="text-cmd-accent" />
              <span className="text-xs text-gray-500">Total Reach</span>
            </div>
            <p className="text-xl font-bold text-cmd-accent">{formatNumber(metrics.totalReach)}</p>
          </div>
          <div className="bg-cmd-dark rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={14} className="text-status-active" />
              <span className="text-xs text-gray-500">Avg Engagement</span>
            </div>
            <p className="text-xl font-bold text-status-active">{metrics.avgEngagement.toFixed(1)}%</p>
          </div>
          <div className="bg-cmd-dark rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle size={14} className="text-threat-critical" />
              <span className="text-xs text-gray-500">Critical Threats</span>
            </div>
            <p className="text-xl font-bold text-threat-critical">{metrics.criticalOps}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* List Panel */}
        <div className="w-96 border-r border-cmd-border flex flex-col">
          {/* Filters */}
          <div className="p-3 border-b border-cmd-border space-y-2">
            <SearchInput
              value={influenceFilters.search}
              onChange={(v) => setInfluenceFilters({ search: v })}
              placeholder="Search campaigns, actors..."
            />
            <div className="flex gap-2">
              <Select
                value={influenceFilters.status}
                onChange={(v) => setInfluenceFilters({ status: v })}
                options={statusOptions}
                className="flex-1"
              />
              <Select
                value={influenceFilters.threatLevel}
                onChange={(v) => setInfluenceFilters({ threatLevel: v })}
                options={threatOptions}
                className="flex-1"
              />
            </div>
          </div>

          {/* Campaign List */}
          <div className="flex-1 overflow-y-auto">
            {filteredOps.map((op) => (
              <motion.div
                key={op.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => handleCampaignSelect(op)}
                className={`p-3 border-b border-cmd-border/50 cursor-pointer transition-colors ${
                  selectedCampaign?.id === op.id
                    ? 'bg-cmd-accent/10 border-l-2 border-l-cmd-accent'
                    : 'hover:bg-cmd-dark'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{op.name}</span>
                      <Badge variant={op.threatLevel}>{op.threatLevel}</Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{op.actor}</p>
                  </div>
                  <StatusIndicator status={op.status} />
                </div>
                <p className="text-xs text-gray-400 mb-2 line-clamp-2">{op.targetAudience}</p>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Users size={10} />
                    {formatNumber(op.metrics.reach)}
                  </span>
                  <span className="flex items-center gap-1">
                    <TrendingUp size={10} />
                    {op.metrics.engagement}%
                  </span>
                  <span className="flex items-center gap-1">
                    <Globe size={10} />
                    {op.platforms.length} platforms
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Detail Panel */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedCampaign ? (
            <>
              {/* Detail Header */}
              <div className="p-4 bg-cmd-dark border-b border-cmd-border">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-white">{selectedCampaign.name}</h2>
                      <Badge variant={selectedCampaign.threatLevel}>{selectedCampaign.threatLevel}</Badge>
                      <StatusIndicator status={selectedCampaign.status} showLabel />
                    </div>
                    <p className="text-sm text-gray-400 mt-1">
                      Actor: <span className="text-agency-psyops">{selectedCampaign.actor}</span>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn-secondary text-xs">
                      <Eye size={12} className="mr-1" />
                      Monitor
                    </button>
                    <button className="btn-primary text-xs">
                      <Zap size={12} className="mr-1" />
                      Counter
                    </button>
                  </div>
                </div>
              </div>

              {/* Detail Tabs */}
              <Tabs tabs={detailTabs} activeTab={detailTab} onTabChange={setDetailTab} />

              {/* Detail Content */}
              <div className="flex-1 overflow-y-auto p-4">
                {detailTab === 'overview' && (
                  <div className="space-y-4">
                    <Panel title="Campaign Overview" className="bg-cmd-dark">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Target Audience</p>
                          <p className="text-sm text-white">{selectedCampaign.targetAudience}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Objective</p>
                          <p className="text-sm text-white">{selectedCampaign.objective}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Start Date</p>
                          <p className="text-sm text-white">
                            {new Date(selectedCampaign.startDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Detection Date</p>
                          <p className="text-sm text-white">
                            {new Date(selectedCampaign.detectedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </Panel>

                    <Panel title="Platforms" className="bg-cmd-dark">
                      <div className="flex flex-wrap gap-2">
                        {selectedCampaign.platforms.map((platform, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-agency-psyops/20 text-agency-psyops rounded-full text-xs"
                          >
                            {platform}
                          </span>
                        ))}
                      </div>
                    </Panel>

                    <Panel title="Sentiment Analysis" className="bg-cmd-dark">
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-400">Positive</span>
                            <span className="text-status-active">{selectedCampaign.sentiment.positive}%</span>
                          </div>
                          <ProgressBar value={selectedCampaign.sentiment.positive} color="status-active" showLabel={false} />
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-400">Neutral</span>
                            <span className="text-gray-400">{selectedCampaign.sentiment.neutral}%</span>
                          </div>
                          <ProgressBar value={selectedCampaign.sentiment.neutral} color="gray-400" showLabel={false} />
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-400">Negative</span>
                            <span className="text-threat-critical">{selectedCampaign.sentiment.negative}%</span>
                          </div>
                          <ProgressBar value={selectedCampaign.sentiment.negative} color="threat-critical" showLabel={false} />
                        </div>
                      </div>
                    </Panel>
                  </div>
                )}

                {detailTab === 'narratives' && (
                  <div className="space-y-3">
                    {selectedCampaign.narratives.map((narrative, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-4 bg-cmd-dark rounded-lg border border-cmd-border"
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-agency-psyops/20 rounded-lg">
                            <MessageSquare size={16} className="text-agency-psyops" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-white mb-2">"{narrative}"</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>Spread: High</span>
                              <span>Virality: {Math.floor(Math.random() * 50 + 50)}%</span>
                              <span>Fact-check: Disputed</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {detailTab === 'metrics' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <Panel className="bg-cmd-dark">
                        <div className="text-center">
                          <Users size={24} className="mx-auto mb-2 text-cmd-accent" />
                          <p className="text-2xl font-bold text-white">{formatNumber(selectedCampaign.metrics.reach)}</p>
                          <p className="text-xs text-gray-500">Total Reach</p>
                        </div>
                      </Panel>
                      <Panel className="bg-cmd-dark">
                        <div className="text-center">
                          <TrendingUp size={24} className="mx-auto mb-2 text-status-active" />
                          <p className="text-2xl font-bold text-white">{selectedCampaign.metrics.engagement}%</p>
                          <p className="text-xs text-gray-500">Engagement Rate</p>
                        </div>
                      </Panel>
                      <Panel className="bg-cmd-dark">
                        <div className="text-center">
                          <Share2 size={24} className="mx-auto mb-2 text-agency-psyops" />
                          <p className="text-2xl font-bold text-white">{formatNumber(selectedCampaign.metrics.shares)}</p>
                          <p className="text-xs text-gray-500">Total Shares</p>
                        </div>
                      </Panel>
                    </div>

                    <Panel title="Growth Trend" className="bg-cmd-dark">
                      <div className="h-32 flex items-end gap-1">
                        {Array.from({ length: 30 }).map((_, i) => {
                          const height = Math.random() * 80 + 20;
                          return (
                            <div
                              key={i}
                              className="flex-1 bg-agency-psyops/50 rounded-t"
                              style={{ height: `${height}%` }}
                            />
                          );
                        })}
                      </div>
                      <p className="text-xs text-gray-500 text-center mt-2">Last 30 days activity</p>
                    </Panel>

                    <Panel title="Demographic Breakdown" className="bg-cmd-dark">
                      <div className="space-y-2">
                        {['18-24', '25-34', '35-44', '45-54', '55+'].map((age, i) => {
                          const value = Math.floor(Math.random() * 40 + 10);
                          return (
                            <div key={age} className="flex items-center gap-3">
                              <span className="text-xs text-gray-400 w-12">{age}</span>
                              <div className="flex-1">
                                <ProgressBar value={value} color="agency-psyops" showLabel={false} />
                              </div>
                              <span className="text-xs text-white w-8">{value}%</span>
                            </div>
                          );
                        })}
                      </div>
                    </Panel>
                  </div>
                )}

                {detailTab === 'attribution' && (
                  <div className="space-y-4">
                    <Panel title="Attribution Analysis" className="bg-cmd-dark">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400">Confidence Level</span>
                          <Badge variant={selectedCampaign.attribution.confidence > 80 ? 'success' : 'warning'}>
                            {selectedCampaign.attribution.confidence}%
                          </Badge>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Suspected Actor</p>
                          <p className="text-sm text-white">{selectedCampaign.actor}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Attribution Method</p>
                          <p className="text-sm text-white">{selectedCampaign.attribution.method}</p>
                        </div>
                      </div>
                    </Panel>

                    <Panel title="Evidence" className="bg-cmd-dark">
                      <div className="space-y-2">
                        {selectedCampaign.attribution.evidence.map((evidence, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <ChevronRight size={14} className="text-agency-psyops" />
                            <span className="text-gray-300">{evidence}</span>
                          </div>
                        ))}
                      </div>
                    </Panel>

                    <Panel title="Related Campaigns" className="bg-cmd-dark">
                      <div className="space-y-2">
                        {influenceOps
                          .filter(o => o.id !== selectedCampaign.id && o.actor === selectedCampaign.actor)
                          .slice(0, 3)
                          .map(op => (
                            <div
                              key={op.id}
                              onClick={() => handleCampaignSelect(op)}
                              className="p-2 bg-cmd-darker rounded cursor-pointer hover:bg-cmd-border transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-white">{op.name}</span>
                                <Badge variant={op.threatLevel}>{op.threatLevel}</Badge>
                              </div>
                            </div>
                          ))}
                      </div>
                    </Panel>
                  </div>
                )}

                {detailTab === 'counters' && (
                  <div className="space-y-4">
                    <Panel title="Active Counter Measures" className="bg-cmd-dark">
                      <div className="space-y-3">
                        {selectedCampaign.counterMeasures.map((measure, i) => (
                          <div
                            key={i}
                            className="p-3 bg-cmd-darker rounded-lg border border-cmd-border"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-white">{measure.type}</span>
                              <StatusIndicator status={measure.status} showLabel />
                            </div>
                            <p className="text-xs text-gray-400">{measure.description}</p>
                            <div className="mt-2">
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-500">Effectiveness</span>
                                <span className="text-status-active">{measure.effectiveness}%</span>
                              </div>
                              <ProgressBar value={measure.effectiveness} color="status-active" showLabel={false} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </Panel>

                    <Panel title="Recommended Actions" className="bg-cmd-dark">
                      <div className="space-y-2">
                        {[
                          'Deploy fact-checking bot network',
                          'Coordinate with platform trust & safety',
                          'Launch counter-narrative campaign',
                          'Brief media partners on disinformation',
                          'Escalate to diplomatic channels',
                        ].map((action, i) => (
                          <div key={i} className="flex items-center justify-between p-2 bg-cmd-darker rounded">
                            <span className="text-sm text-gray-300">{action}</span>
                            <button className="text-xs text-cmd-accent hover:underline">Execute</button>
                          </div>
                        ))}
                      </div>
                    </Panel>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Brain size={48} className="mx-auto mb-4 text-gray-600" />
                <p className="text-gray-500">Select a campaign to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
