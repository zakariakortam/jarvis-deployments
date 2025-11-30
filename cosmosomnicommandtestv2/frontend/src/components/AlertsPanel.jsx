import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';
import useStore from '../store/useStore';
import { alertApi } from '../services/api';
import HoloPanel from './HoloPanel';
import audioService from '../services/audio';

function AlertCard({ alert, isSelected, onClick }) {
  const severityStyles = {
    alert: 'border-holo-red bg-holo-red/10',
    warning: 'border-holo-orange bg-holo-orange/10',
    caution: 'border-holo-yellow bg-holo-yellow/10',
    info: 'border-holo-blue bg-holo-blue/10'
  };

  const severityIndicators = {
    alert: 'bg-holo-red animate-pulse',
    warning: 'bg-holo-orange',
    caution: 'bg-holo-yellow',
    info: 'bg-holo-blue'
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      onClick={onClick}
      className={`
        relative p-3 rounded-lg border cursor-pointer transition-all duration-300
        ${severityStyles[alert.severity] || severityStyles.info}
        ${isSelected ? 'ring-2 ring-holo-blue shadow-holo' : ''}
        ${!alert.acknowledged ? 'shadow-lg' : 'opacity-70'}
        hover:shadow-holo
      `}
    >
      <div className="flex items-start gap-3">
        {/* Severity indicator */}
        <div className={`w-3 h-3 rounded-full mt-1 ${severityIndicators[alert.severity]}`} />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-medium text-sm text-holo-cyan">{alert.title}</h4>
            <span className={`
              px-1.5 py-0.5 rounded text-[10px] uppercase font-medium shrink-0
              ${alert.severity === 'alert' ? 'bg-holo-red/20 text-holo-red' :
                alert.severity === 'warning' ? 'bg-holo-orange/20 text-holo-orange' :
                  'bg-holo-blue/20 text-holo-blue'}
            `}>
              {alert.severity}
            </span>
          </div>

          <p className="text-xs text-holo-cyan/60 mt-1 line-clamp-2">{alert.description}</p>

          <div className="flex items-center justify-between mt-2 text-xs">
            <span className="text-holo-purple">{alert.category}</span>
            <span className="text-holo-blue/60 font-mono">
              {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>

      {/* Unacknowledged indicator */}
      {!alert.acknowledged && (
        <div className="absolute top-0 right-0 w-2 h-2 bg-holo-red rounded-full -translate-y-1 translate-x-1" />
      )}
    </motion.div>
  );
}

function AnomalyCard({ anomaly, isSelected, onClick }) {
  const dangerColors = anomaly.dangerLevel >= 7 ? 'border-holo-red bg-holo-red/5' :
    anomaly.dangerLevel >= 4 ? 'border-holo-orange bg-holo-orange/5' :
      'border-holo-cyan bg-holo-cyan/5';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      onClick={onClick}
      className={`
        relative p-3 rounded-lg border cursor-pointer transition-all duration-300
        ${dangerColors}
        ${isSelected ? 'ring-2 ring-holo-blue shadow-holo' : ''}
        hover:shadow-holo
      `}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <h4 className="font-medium text-sm text-holo-cyan">{anomaly.name}</h4>
          <p className="text-xs text-holo-purple">{anomaly.type}</p>
        </div>
        <div className={`
          w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
          ${anomaly.status === 'active' ? 'bg-holo-green/20 text-holo-green' : 'bg-gray-500/20 text-gray-400'}
        `}>
          {anomaly.dangerLevel}
        </div>
      </div>

      <p className="text-xs text-holo-cyan/60 mb-2 line-clamp-2">{anomaly.description}</p>

      <div className="flex items-center justify-between text-xs">
        <span className={`
          px-1.5 py-0.5 rounded uppercase
          ${anomaly.status === 'active' ? 'bg-holo-green/20 text-holo-green' : 'bg-gray-500/20 text-gray-400'}
        `}>
          {anomaly.status}
        </span>
        <span className="text-holo-blue/60">
          {((1 - anomaly.stability) * 100).toFixed(0)}% unstable
        </span>
      </div>
    </motion.div>
  );
}

function AlertDetailPanel({ alert, onClose, onAcknowledge, onResolve }) {
  if (!alert) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="w-96 h-full overflow-auto"
    >
      <HoloPanel
        title={alert.title}
        subtitle={alert.category?.toUpperCase()}
        headerActions={
          <button onClick={onClose} className="text-holo-cyan/60 hover:text-holo-cyan">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        }
      >
        <div className="p-4 space-y-4">
          {/* Severity badge */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-holo-blue/60 uppercase">Severity</span>
            <span className={`
              px-3 py-1 rounded text-xs uppercase font-medium
              ${alert.severity === 'alert' ? 'bg-holo-red/20 text-holo-red' :
                alert.severity === 'warning' ? 'bg-holo-orange/20 text-holo-orange' :
                  alert.severity === 'caution' ? 'bg-holo-yellow/20 text-holo-yellow' :
                    'bg-holo-blue/20 text-holo-blue'}
            `}>
              {alert.severity}
            </span>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-holo-blue/60 uppercase">Status</span>
            <div className="flex items-center gap-2">
              <span className={`
                px-2 py-0.5 rounded text-xs
                ${alert.acknowledged ? 'bg-holo-cyan/20 text-holo-cyan' : 'bg-holo-orange/20 text-holo-orange'}
              `}>
                {alert.acknowledged ? 'Acknowledged' : 'Pending'}
              </span>
              {alert.resolved && (
                <span className="px-2 py-0.5 rounded text-xs bg-holo-green/20 text-holo-green">
                  Resolved
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <div className="text-xs text-holo-blue/60 uppercase mb-1">Description</div>
            <p className="text-sm text-holo-cyan">{alert.description}</p>
          </div>

          {/* Timestamp */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-space-dark/50 rounded p-2">
              <div className="text-xs text-holo-blue/60">Detected</div>
              <div className="text-sm text-holo-cyan font-mono">
                {format(new Date(alert.timestamp), 'HH:mm:ss')}
              </div>
              <div className="text-xs text-holo-blue/40">
                {format(new Date(alert.timestamp), 'MMM dd, yyyy')}
              </div>
            </div>
            <div className="bg-space-dark/50 rounded p-2">
              <div className="text-xs text-holo-blue/60">Priority</div>
              <div className="text-sm text-holo-cyan font-mono">Level {alert.priority}</div>
            </div>
          </div>

          {/* Affected systems */}
          {alert.affectedSystems && alert.affectedSystems.length > 0 && (
            <div>
              <div className="text-xs text-holo-blue/60 uppercase mb-2">Affected Systems</div>
              <div className="flex flex-wrap gap-1">
                {alert.affectedSystems.map(sys => (
                  <span key={sys} className="px-2 py-0.5 bg-holo-purple/10 text-holo-purple text-xs rounded">
                    {sys}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Source */}
          {alert.source && (
            <div>
              <div className="text-xs text-holo-blue/60 uppercase mb-1">Source</div>
              <div className="text-sm text-holo-cyan">{alert.source}</div>
            </div>
          )}

          {/* Log */}
          {alert.log && alert.log.length > 0 && (
            <div>
              <div className="text-xs text-holo-blue/60 uppercase mb-2">Event Log</div>
              <div className="space-y-1 max-h-32 overflow-auto">
                {alert.log.map((entry, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <span className="text-holo-blue/40 font-mono shrink-0">
                      {format(new Date(entry.timestamp), 'HH:mm:ss')}
                    </span>
                    <span className="text-holo-cyan/80">{entry.entry}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2 pt-4 border-t border-panel-border">
            {!alert.acknowledged && (
              <button
                onClick={onAcknowledge}
                className="holo-button w-full"
              >
                Acknowledge Alert
              </button>
            )}
            {!alert.resolved && (
              <button
                onClick={onResolve}
                className="holo-button holo-button-success w-full"
              >
                Mark as Resolved
              </button>
            )}
          </div>
        </div>
      </HoloPanel>
    </motion.div>
  );
}

function AnomalyDetailPanel({ anomaly, onClose }) {
  if (!anomaly) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="w-96 h-full overflow-auto"
    >
      <HoloPanel
        title={anomaly.name}
        subtitle={anomaly.type?.toUpperCase()}
        headerActions={
          <button onClick={onClose} className="text-holo-cyan/60 hover:text-holo-cyan">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        }
      >
        <div className="p-4 space-y-4">
          {/* Danger level */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-holo-blue/60 uppercase">Danger Level</span>
            <div className={`
              w-12 h-12 rounded-full flex items-center justify-center font-display font-bold text-xl
              ${anomaly.dangerLevel >= 7 ? 'bg-holo-red/20 text-holo-red' :
                anomaly.dangerLevel >= 4 ? 'bg-holo-orange/20 text-holo-orange' :
                  'bg-holo-green/20 text-holo-green'}
            `}>
              {anomaly.dangerLevel}
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-holo-blue/60 uppercase">Status</span>
            <span className={`
              px-3 py-1 rounded text-xs uppercase
              ${anomaly.status === 'active' ? 'bg-holo-green/20 text-holo-green' : 'bg-gray-500/20 text-gray-400'}
            `}>
              {anomaly.status}
            </span>
          </div>

          {/* Description */}
          <div>
            <div className="text-xs text-holo-blue/60 uppercase mb-1">Description</div>
            <p className="text-sm text-holo-cyan">{anomaly.description}</p>
          </div>

          {/* Position */}
          <div>
            <div className="text-xs text-holo-blue/60 uppercase mb-2">Position</div>
            <div className="grid grid-cols-3 gap-2 text-center">
              {['x', 'y', 'z'].map(axis => (
                <div key={axis} className="bg-space-dark/50 rounded p-2">
                  <div className="text-[10px] text-holo-blue/60 uppercase">{axis}</div>
                  <div className="text-sm text-holo-cyan font-mono">
                    {anomaly.position?.[axis]?.toFixed(0)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stability */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-holo-blue/60">Stability</span>
              <span className="text-holo-cyan font-mono">{(anomaly.stability * 100).toFixed(0)}%</span>
            </div>
            <div className="h-2 bg-space-dark rounded-full overflow-hidden">
              <div
                className={`h-full ${anomaly.stability > 0.7 ? 'bg-holo-green' : anomaly.stability > 0.3 ? 'bg-holo-orange' : 'bg-holo-red'}`}
                style={{ width: `${anomaly.stability * 100}%` }}
              />
            </div>
          </div>

          {/* Effects */}
          {anomaly.effects && anomaly.effects.length > 0 && (
            <div>
              <div className="text-xs text-holo-blue/60 uppercase mb-2">Affected Systems</div>
              <div className="flex flex-wrap gap-1">
                {anomaly.effects.map(effect => (
                  <span key={effect} className="px-2 py-0.5 bg-holo-orange/10 text-holo-orange text-xs rounded">
                    {effect}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Readings */}
          {anomaly.readings && (
            <div>
              <div className="text-xs text-holo-blue/60 uppercase mb-2">Sensor Readings</div>
              <div className="space-y-1 bg-space-dark/50 rounded p-2">
                {Object.entries(anomaly.readings).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-xs">
                    <span className="text-holo-blue/60 capitalize">{key}</span>
                    <span className="text-holo-cyan font-mono">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {anomaly.recommendations && anomaly.recommendations.length > 0 && (
            <div>
              <div className="text-xs text-holo-blue/60 uppercase mb-2">Recommendations</div>
              <ul className="space-y-1">
                {anomaly.recommendations.map((rec, i) => (
                  <li key={i} className="text-xs text-holo-cyan flex items-start gap-2">
                    <span className="text-holo-green">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Study progress */}
          {anomaly.studyProgress !== undefined && (
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-holo-blue/60">Study Progress</span>
                <span className="text-holo-cyan font-mono">{anomaly.studyProgress.toFixed(0)}%</span>
              </div>
              <div className="h-2 bg-space-dark rounded-full overflow-hidden">
                <div
                  className="h-full bg-holo-purple"
                  style={{ width: `${anomaly.studyProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </HoloPanel>
    </motion.div>
  );
}

export default function AlertsPanel() {
  const { alerts, anomalies, alertSummary, selectedAlert, setSelectedAlert } = useStore();
  const [view, setView] = useState('alerts');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [selectedAnomaly, setSelectedAnomaly] = useState(null);

  const filteredAlerts = useMemo(() => {
    return alerts
      .filter(alert => {
        if (severityFilter !== 'all' && alert.severity !== severityFilter) return false;
        return true;
      })
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [alerts, severityFilter]);

  const selectedAlertData = alerts.find(a => a.id === selectedAlert);
  const selectedAnomalyData = anomalies.find(a => a.id === selectedAnomaly);

  const handleAcknowledge = async () => {
    if (selectedAlert) {
      audioService.playClick();
      try {
        await alertApi.acknowledge(selectedAlert);
      } catch (error) {
        console.error('Failed to acknowledge alert:', error);
      }
    }
  };

  const handleResolve = async () => {
    if (selectedAlert) {
      audioService.playClick();
      try {
        await alertApi.resolve(selectedAlert);
      } catch (error) {
        console.error('Failed to resolve alert:', error);
      }
    }
  };

  return (
    <div className="h-full flex">
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-panel-border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-xl font-bold text-holo-blue uppercase tracking-wider">
                Alerts & Anomalies
              </h2>
              <p className="text-sm text-holo-cyan/60">
                {alertSummary?.unacknowledged || 0} unacknowledged alerts
              </p>
            </div>

            {/* View toggle */}
            <div className="flex items-center gap-2">
              <div className="flex rounded overflow-hidden border border-panel-border">
                {['alerts', 'anomalies'].map(v => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    className={`px-3 py-1 text-xs uppercase transition-colors
                      ${view === v ? 'bg-holo-blue/20 text-holo-blue' : 'text-holo-cyan/60 hover:text-holo-cyan'}
                    `}
                  >
                    {v}
                  </button>
                ))}
              </div>

              {view === 'alerts' && (
                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  className="holo-input text-xs py-1"
                >
                  <option value="all">All Severities</option>
                  <option value="alert">Critical</option>
                  <option value="warning">Warning</option>
                  <option value="caution">Caution</option>
                  <option value="info">Info</option>
                </select>
              )}
            </div>
          </div>

          {/* Summary stats */}
          {alertSummary && (
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-space-dark/50 rounded p-2 text-center">
                <div className="text-2xl font-display font-bold text-holo-cyan">
                  {alertSummary.totalAlerts}
                </div>
                <div className="text-xs text-holo-blue/60">Total</div>
              </div>
              <div className="bg-space-dark/50 rounded p-2 text-center">
                <div className="text-2xl font-display font-bold text-holo-orange">
                  {alertSummary.unacknowledged}
                </div>
                <div className="text-xs text-holo-blue/60">Pending</div>
              </div>
              <div className="bg-space-dark/50 rounded p-2 text-center">
                <div className="text-2xl font-display font-bold text-holo-red">
                  {alertSummary.critical}
                </div>
                <div className="text-xs text-holo-blue/60">Critical</div>
              </div>
              <div className="bg-space-dark/50 rounded p-2 text-center">
                <div className="text-2xl font-display font-bold text-holo-purple">
                  {alertSummary.activeAnomalies}
                </div>
                <div className="text-xs text-holo-blue/60">Anomalies</div>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {view === 'alerts' ? (
            <div className="space-y-3">
              <AnimatePresence>
                {filteredAlerts.length === 0 ? (
                  <div className="text-center py-12 text-holo-cyan/50">
                    No alerts to display
                  </div>
                ) : (
                  filteredAlerts.map(alert => (
                    <AlertCard
                      key={alert.id}
                      alert={alert}
                      isSelected={selectedAlert === alert.id}
                      onClick={() => setSelectedAlert(selectedAlert === alert.id ? null : alert.id)}
                    />
                  ))
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <AnimatePresence>
                {anomalies.length === 0 ? (
                  <div className="col-span-2 text-center py-12 text-holo-cyan/50">
                    No anomalies detected
                  </div>
                ) : (
                  anomalies.map(anomaly => (
                    <AnomalyCard
                      key={anomaly.id}
                      anomaly={anomaly}
                      isSelected={selectedAnomaly === anomaly.id}
                      onClick={() => setSelectedAnomaly(selectedAnomaly === anomaly.id ? null : anomaly.id)}
                    />
                  ))
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Detail panels */}
      <AnimatePresence>
        {view === 'alerts' && selectedAlertData && (
          <AlertDetailPanel
            alert={selectedAlertData}
            onClose={() => setSelectedAlert(null)}
            onAcknowledge={handleAcknowledge}
            onResolve={handleResolve}
          />
        )}
        {view === 'anomalies' && selectedAnomalyData && (
          <AnomalyDetailPanel
            anomaly={selectedAnomalyData}
            onClose={() => setSelectedAnomaly(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
