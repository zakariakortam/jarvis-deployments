import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Folder,
  FolderOpen,
  Lock,
  Unlock,
  Search,
  Filter,
  Download,
  Eye,
  Clock,
  User,
  Shield,
  AlertTriangle,
  ChevronRight,
  ChevronDown,
  Star,
  StarOff,
  Tag,
  Calendar,
  Building2,
} from 'lucide-react';
import useStore from '../../stores/mainStore';
import { Panel, Badge, SearchInput, Select, Tabs, Timeline } from '../common';

export default function DocumentVault() {
  const { documents, filters, setFilter, selectEntity, selectedEntity } = useStore();
  const documentFilters = filters.documents;

  const [activeTab, setActiveTab] = useState('browse');
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [expandedFolders, setExpandedFolders] = useState(['top_secret', 'secret']);
  const [viewMode, setViewMode] = useState('list');

  const classificationLevels = [
    { id: 'top_secret_sci', label: 'TOP SECRET//SCI', color: '#ff0040', badge: 'critical' },
    { id: 'top_secret', label: 'TOP SECRET', color: '#ff4400', badge: 'high' },
    { id: 'secret', label: 'SECRET', color: '#ff8800', badge: 'elevated' },
    { id: 'confidential', label: 'CONFIDENTIAL', color: '#00cc44', badge: 'low' },
    { id: 'unclassified', label: 'UNCLASSIFIED', color: '#666666', badge: 'default' },
  ];

  const classificationOptions = [
    { value: 'all', label: 'All Classifications' },
    ...classificationLevels.map(c => ({ value: c.id, label: c.label })),
  ];

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'intelligence_report', label: 'Intelligence Reports' },
    { value: 'threat_assessment', label: 'Threat Assessments' },
    { value: 'operation_plan', label: 'Operation Plans' },
    { value: 'briefing', label: 'Briefings' },
    { value: 'cable', label: 'Cables' },
    { value: 'analysis', label: 'Analysis' },
  ];

  const agencyOptions = [
    { value: 'all', label: 'All Agencies' },
    { value: 'CIA', label: 'CIA' },
    { value: 'NSA', label: 'NSA' },
    { value: 'FBI', label: 'FBI' },
    { value: 'DIA', label: 'DIA' },
    { value: 'NRO', label: 'NRO' },
    { value: 'DHS', label: 'DHS' },
  ];

  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      if (documentFilters?.classification && documentFilters.classification !== 'all' && doc.classification !== documentFilters.classification) return false;
      if (documentFilters?.type && documentFilters.type !== 'all' && doc.type !== documentFilters.type) return false;
      if (documentFilters?.agency && documentFilters.agency !== 'all' && doc.originatingAgency !== documentFilters.agency) return false;
      if (documentFilters?.searchQuery) {
        const search = documentFilters.searchQuery.toLowerCase();
        if (!doc.title?.toLowerCase().includes(search) &&
            !doc.summary?.toLowerCase().includes(search) &&
            !doc.codeword?.toLowerCase().includes(search)) return false;
      }
      return true;
    });
  }, [documents, documentFilters]);

  const documentsByClassification = useMemo(() => {
    const grouped = {};
    classificationLevels.forEach(level => {
      grouped[level.id] = filteredDocuments.filter(d => d.classification === level.id);
    });
    return grouped;
  }, [filteredDocuments]);

  const handleDocumentSelect = (doc) => {
    setSelectedDocument(doc);
    selectEntity(doc, 'document');
  };

  const toggleFolder = (folderId) => {
    setExpandedFolders(prev =>
      prev.includes(folderId)
        ? prev.filter(id => id !== folderId)
        : [...prev, folderId]
    );
  };

  const getClassificationBadge = (classification) => {
    const level = classificationLevels.find(c => c.id === classification);
    return level ? level.badge : 'default';
  };

  const getClassificationLabel = (classification) => {
    const level = classificationLevels.find(c => c.id === classification);
    return level ? level.label : classification;
  };

  const tabs = [
    { id: 'browse', label: 'Browse', icon: Folder },
    { id: 'recent', label: 'Recent', icon: Clock },
    { id: 'starred', label: 'Starred', icon: Star },
    { id: 'audit', label: 'Audit Log', icon: Shield },
  ];

  const detailTabs = [
    { id: 'content', label: 'Content' },
    { id: 'metadata', label: 'Metadata' },
    { id: 'access', label: 'Access Log' },
    { id: 'related', label: 'Related' },
  ];

  const [detailTab, setDetailTab] = useState('content');

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 bg-cmd-panel border-b border-cmd-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-class-topsecret/20">
              <Lock size={24} className="text-class-topsecret" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Classified Document Vault</h1>
              <p className="text-sm text-gray-500">Secure document management and access control</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="critical">{documents.filter(d => d.classification === 'top_secret_sci').length} TS/SCI</Badge>
            <Badge variant="high">{documents.filter(d => d.classification === 'top_secret').length} TS</Badge>
            <Badge variant="elevated">{documents.filter(d => d.classification === 'secret').length} S</Badge>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <SearchInput
            value={documentFilters?.searchQuery || ''}
            onChange={(v) => setFilter('documents', 'searchQuery', v)}
            placeholder="Search documents, codewords..."
            className="w-64"
          />
          <Select
            value={documentFilters?.classification || 'all'}
            onChange={(v) => setFilter('documents', 'classification', v)}
            options={classificationOptions}
            className="w-48"
          />
          <Select
            value={documentFilters?.type || 'all'}
            onChange={(v) => setFilter('documents', 'type', v)}
            options={typeOptions}
            className="w-48"
          />
          <Select
            value={documentFilters?.agency || 'all'}
            onChange={(v) => setFilter('documents', 'agency', v)}
            options={agencyOptions}
            className="w-32"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Document Tree/List */}
        <div className="w-96 border-r border-cmd-border flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'browse' && (
              <div className="py-2">
                {classificationLevels.map((level) => {
                  const docs = documentsByClassification[level.id] || [];
                  const isExpanded = expandedFolders.includes(level.id);

                  return (
                    <div key={level.id}>
                      <button
                        onClick={() => toggleFolder(level.id)}
                        className="w-full flex items-center gap-2 px-4 py-2 hover:bg-cmd-dark transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronDown size={14} className="text-gray-500" />
                        ) : (
                          <ChevronRight size={14} className="text-gray-500" />
                        )}
                        {isExpanded ? (
                          <FolderOpen size={16} style={{ color: level.color }} />
                        ) : (
                          <Folder size={16} style={{ color: level.color }} />
                        )}
                        <span className="text-sm text-white flex-1 text-left">{level.label}</span>
                        <span className="text-xs text-gray-500">{docs.length}</span>
                      </button>

                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          {docs.map((doc) => (
                            <div
                              key={doc.id}
                              onClick={() => handleDocumentSelect(doc)}
                              className={`flex items-center gap-2 px-4 py-2 pl-10 cursor-pointer transition-colors ${
                                selectedDocument?.id === doc.id
                                  ? 'bg-cmd-accent/10 border-l-2 border-l-cmd-accent'
                                  : 'hover:bg-cmd-dark'
                              }`}
                            >
                              <FileText size={14} className="text-gray-400 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-white truncate">{doc.title}</p>
                                <p className="text-xs text-gray-500 truncate">{doc.codeword}</p>
                              </div>
                              {doc.status === 'new' && (
                                <div className="w-2 h-2 rounded-full bg-cmd-accent" />
                              )}
                            </div>
                          ))}
                          {docs.length === 0 && (
                            <p className="text-xs text-gray-500 px-4 py-2 pl-10">No documents</p>
                          )}
                        </motion.div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === 'recent' && (
              <div className="py-2">
                {[...filteredDocuments]
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .slice(0, 20)
                  .map((doc) => (
                    <div
                      key={doc.id}
                      onClick={() => handleDocumentSelect(doc)}
                      className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-cmd-border/50 ${
                        selectedDocument?.id === doc.id
                          ? 'bg-cmd-accent/10 border-l-2 border-l-cmd-accent'
                          : 'hover:bg-cmd-dark'
                      }`}
                    >
                      <FileText size={16} className="text-gray-400" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{doc.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={getClassificationBadge(doc.classification)} className="text-[9px]">
                            {getClassificationLabel(doc.classification)}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {new Date(doc.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {activeTab === 'starred' && (
              <div className="py-8 text-center">
                <Star size={32} className="mx-auto mb-3 text-gray-600" />
                <p className="text-sm text-gray-500">No starred documents</p>
                <p className="text-xs text-gray-600 mt-1">Star documents for quick access</p>
              </div>
            )}

            {activeTab === 'audit' && (
              <div className="py-2 px-4">
                <Timeline
                  events={documents.slice(0, 10).map(doc => ({
                    time: doc.createdAt,
                    event: `Document accessed: ${doc.title}`,
                    user: doc.author,
                    action: 'view',
                  }))}
                  renderEvent={(event) => (
                    <div className="p-2 bg-cmd-dark rounded text-xs">
                      <p className="text-gray-500">{new Date(event.time).toLocaleString()}</p>
                      <p className="text-white mt-1">{event.event}</p>
                      <p className="text-gray-400 mt-1">By: {event.user}</p>
                    </div>
                  )}
                />
              </div>
            )}
          </div>
        </div>

        {/* Document Detail */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedDocument ? (
            <>
              {/* Document Header */}
              <div className="p-4 bg-cmd-dark border-b border-cmd-border">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={getClassificationBadge(selectedDocument.classification)}>
                        {getClassificationLabel(selectedDocument.classification)}
                      </Badge>
                      {selectedDocument.codeword && (
                        <span className="text-xs text-cmd-accent font-mono">//{selectedDocument.codeword}</span>
                      )}
                    </div>
                    <h2 className="text-lg font-bold text-white">{selectedDocument.title}</h2>
                    <p className="text-sm text-gray-400 mt-1">
                      {selectedDocument.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn-secondary">
                      <Star size={14} className="mr-1" />
                      Star
                    </button>
                    <button className="btn-secondary">
                      <Download size={14} className="mr-1" />
                      Export
                    </button>
                    <button className="btn-primary">
                      <Eye size={14} className="mr-1" />
                      Full View
                    </button>
                  </div>
                </div>
              </div>

              {/* Detail Tabs */}
              <Tabs tabs={detailTabs} activeTab={detailTab} onTabChange={setDetailTab} />

              {/* Detail Content */}
              <div className="flex-1 overflow-y-auto p-4">
                {detailTab === 'content' && (
                  <div className="space-y-4">
                    {/* Classification Banner */}
                    <div
                      className="p-3 rounded-lg text-center font-bold text-sm"
                      style={{
                        backgroundColor: classificationLevels.find(c => c.id === selectedDocument.classification)?.color + '20',
                        color: classificationLevels.find(c => c.id === selectedDocument.classification)?.color,
                      }}
                    >
                      {getClassificationLabel(selectedDocument.classification)}
                      {selectedDocument.codeword && ` // ${selectedDocument.codeword}`}
                    </div>

                    <Panel title="Executive Summary" className="bg-cmd-dark">
                      <p className="text-sm text-gray-300 leading-relaxed">
                        {selectedDocument.summary}
                      </p>
                    </Panel>

                    <Panel title="Key Findings" className="bg-cmd-dark">
                      <ul className="space-y-2">
                        {selectedDocument.keyFindings?.map((finding, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                            <ChevronRight size={14} className="text-cmd-accent mt-0.5 flex-shrink-0" />
                            {finding}
                          </li>
                        )) || (
                          <li className="text-sm text-gray-500">No key findings listed</li>
                        )}
                      </ul>
                    </Panel>

                    <Panel title="Recommendations" className="bg-cmd-dark">
                      <ul className="space-y-2">
                        {selectedDocument.recommendations?.map((rec, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                            <ChevronRight size={14} className="text-status-active mt-0.5 flex-shrink-0" />
                            {rec}
                          </li>
                        )) || (
                          <li className="text-sm text-gray-500">No recommendations listed</li>
                        )}
                      </ul>
                    </Panel>

                    {/* Classification Banner Bottom */}
                    <div
                      className="p-3 rounded-lg text-center font-bold text-sm"
                      style={{
                        backgroundColor: classificationLevels.find(c => c.id === selectedDocument.classification)?.color + '20',
                        color: classificationLevels.find(c => c.id === selectedDocument.classification)?.color,
                      }}
                    >
                      {getClassificationLabel(selectedDocument.classification)}
                    </div>
                  </div>
                )}

                {detailTab === 'metadata' && (
                  <div className="space-y-4">
                    <Panel title="Document Information" className="bg-cmd-dark">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Document ID</p>
                          <p className="text-sm text-white font-mono">{selectedDocument.id}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Classification</p>
                          <Badge variant={getClassificationBadge(selectedDocument.classification)}>
                            {getClassificationLabel(selectedDocument.classification)}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Codeword</p>
                          <p className="text-sm text-cmd-accent font-mono">{selectedDocument.codeword || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Document Type</p>
                          <p className="text-sm text-white">
                            {selectedDocument.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </p>
                        </div>
                      </div>
                    </Panel>

                    <Panel title="Authorship" className="bg-cmd-dark">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Author</p>
                          <div className="flex items-center gap-2">
                            <User size={14} className="text-gray-400" />
                            <span className="text-sm text-white">{selectedDocument.author}</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Originating Agency</p>
                          <div className="flex items-center gap-2">
                            <Building2 size={14} className="text-gray-400" />
                            <span className="text-sm text-white">{selectedDocument.originatingAgency}</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Created</p>
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-gray-400" />
                            <span className="text-sm text-white">
                              {new Date(selectedDocument.createdAt).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Last Modified</p>
                          <div className="flex items-center gap-2">
                            <Clock size={14} className="text-gray-400" />
                            <span className="text-sm text-white">
                              {new Date(selectedDocument.updatedAt || selectedDocument.createdAt).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Panel>

                    <Panel title="Tags & Categories" className="bg-cmd-dark">
                      <div className="flex flex-wrap gap-2">
                        {selectedDocument.tags?.map((tag, i) => (
                          <span key={i} className="flex items-center gap-1 px-2 py-1 bg-cmd-darker rounded text-xs text-gray-300">
                            <Tag size={10} />
                            {tag}
                          </span>
                        )) || (
                          <span className="text-sm text-gray-500">No tags</span>
                        )}
                      </div>
                    </Panel>
                  </div>
                )}

                {detailTab === 'access' && (
                  <div className="space-y-4">
                    <Panel title="Access History" className="bg-cmd-dark">
                      <div className="space-y-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className="flex items-center justify-between p-2 bg-cmd-darker rounded">
                            <div className="flex items-center gap-3">
                              <User size={14} className="text-gray-400" />
                              <div>
                                <p className="text-sm text-white">Analyst {Math.floor(Math.random() * 900) + 100}</p>
                                <p className="text-xs text-gray-500">
                                  {['Viewed', 'Downloaded', 'Printed', 'Shared'][Math.floor(Math.random() * 4)]}
                                </p>
                              </div>
                            </div>
                            <span className="text-xs text-gray-500">
                              {new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </Panel>

                    <Panel title="Access Permissions" className="bg-cmd-dark">
                      <div className="space-y-2">
                        {selectedDocument.accessList?.map((access, i) => (
                          <div key={i} className="flex items-center justify-between p-2 bg-cmd-darker rounded">
                            <span className="text-sm text-white">{access}</span>
                            <Badge variant="success">Authorized</Badge>
                          </div>
                        )) || (
                          <p className="text-sm text-gray-500">Access list not available</p>
                        )}
                      </div>
                    </Panel>
                  </div>
                )}

                {detailTab === 'related' && (
                  <div className="space-y-4">
                    <Panel title="Related Documents" className="bg-cmd-dark">
                      <div className="space-y-2">
                        {documents
                          .filter(d => d.id !== selectedDocument.id && d.type === selectedDocument.type)
                          .slice(0, 5)
                          .map((doc) => (
                            <div
                              key={doc.id}
                              onClick={() => handleDocumentSelect(doc)}
                              className="flex items-center gap-3 p-2 bg-cmd-darker rounded cursor-pointer hover:bg-cmd-border transition-colors"
                            >
                              <FileText size={14} className="text-gray-400" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-white truncate">{doc.title}</p>
                                <p className="text-xs text-gray-500">{doc.originatingAgency}</p>
                              </div>
                              <Badge variant={getClassificationBadge(doc.classification)} className="text-[9px]">
                                {doc.classification.replace(/_/g, ' ').toUpperCase().slice(0, 2)}
                              </Badge>
                            </div>
                          ))}
                      </div>
                    </Panel>

                    <Panel title="Referenced Operations" className="bg-cmd-dark">
                      <div className="space-y-2">
                        {selectedDocument.relatedOperations?.map((op, i) => (
                          <div key={i} className="flex items-center justify-between p-2 bg-cmd-darker rounded">
                            <span className="text-sm text-cmd-accent">{op}</span>
                            <button className="text-xs text-gray-400 hover:text-white">View</button>
                          </div>
                        )) || (
                          <p className="text-sm text-gray-500">No related operations</p>
                        )}
                      </div>
                    </Panel>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Lock size={48} className="mx-auto mb-4 text-gray-600" />
                <p className="text-gray-500">Select a document to view details</p>
                <p className="text-xs text-gray-600 mt-2">All access is logged and audited</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
