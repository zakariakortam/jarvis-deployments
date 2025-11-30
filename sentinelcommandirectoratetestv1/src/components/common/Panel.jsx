import { motion } from 'framer-motion';

export function Panel({ children, className = '', title, icon: Icon, actions, collapsible = false, defaultExpanded = true, headerClassName = '' }) {
  const [expanded, setExpanded] = React.useState(defaultExpanded);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`panel ${className}`}
    >
      {title && (
        <div className={`panel-header ${headerClassName}`}>
          <div className="panel-title">
            {Icon && <Icon size={16} />}
            <span>{title}</span>
          </div>
          <div className="flex items-center gap-2">
            {actions}
            {collapsible && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="p-1 hover:bg-cmd-accent/20 rounded transition-colors"
              >
                <motion.div
                  animate={{ rotate: expanded ? 0 : -90 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown size={16} className="text-cmd-accent" />
                </motion.div>
              </button>
            )}
          </div>
        </div>
      )}
      <motion.div
        initial={false}
        animate={{
          height: collapsible ? (expanded ? 'auto' : 0) : 'auto',
          opacity: collapsible ? (expanded ? 1 : 0) : 1,
        }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="panel-content">
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
}

import React from 'react';
import { ChevronDown } from 'lucide-react';

export function MetricCard({ label, value, trend, trendValue, icon: Icon, color = 'cmd-accent', onClick }) {
  const trendColors = {
    up: 'text-threat-critical',
    down: 'text-threat-low',
    stable: 'text-gray-400',
  };

  const trendIcons = {
    up: '↑',
    down: '↓',
    stable: '→',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
      className={`panel p-4 ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="metric-label mb-1">{label}</p>
          <p className={`metric-value text-${color}`}>{value}</p>
          {trend && (
            <p className={`text-xs mt-1 ${trendColors[trend]}`}>
              {trendIcons[trend]} {trendValue}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`p-2 rounded-lg bg-${color}/20`}>
            <Icon size={20} className={`text-${color}`} />
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-cmd-accent/20 text-cmd-accent border-cmd-accent/50',
    critical: 'bg-threat-critical/20 text-threat-critical border-threat-critical/50',
    high: 'bg-threat-high/20 text-threat-high border-threat-high/50',
    elevated: 'bg-threat-elevated/20 text-threat-elevated border-threat-elevated/50',
    guarded: 'bg-threat-guarded/20 text-threat-guarded border-threat-guarded/50',
    low: 'bg-threat-low/20 text-threat-low border-threat-low/50',
    success: 'bg-status-active/20 text-status-active border-status-active/50',
    warning: 'bg-status-standby/20 text-status-standby border-status-standby/50',
    error: 'bg-status-compromised/20 text-status-compromised border-status-compromised/50',
  };

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider border ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}

export function StatusIndicator({ status, showLabel = false, size = 'sm' }) {
  const sizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  const statusConfig = {
    active: { color: 'bg-status-active', label: 'Active', animate: true },
    standby: { color: 'bg-status-standby', label: 'Standby', animate: false },
    inactive: { color: 'bg-status-inactive', label: 'Inactive', animate: false },
    compromised: { color: 'bg-status-compromised', label: 'Compromised', animate: true },
    unknown: { color: 'bg-status-unknown', label: 'Unknown', animate: false },
    operational: { color: 'bg-status-active', label: 'Operational', animate: true },
    degraded: { color: 'bg-status-standby', label: 'Degraded', animate: false },
    failed: { color: 'bg-status-compromised', label: 'Failed', animate: true },
    isolated: { color: 'bg-agency-intel', label: 'Isolated', animate: false },
    encrypted: { color: 'bg-threat-elevated', label: 'Encrypted', animate: false },
    decrypted: { color: 'bg-status-active', label: 'Decrypted', animate: false },
    partial: { color: 'bg-status-standby', label: 'Partial', animate: false },
    processing: { color: 'bg-cmd-accent', label: 'Processing', animate: true },
  };

  const config = statusConfig[status] || statusConfig.unknown;

  return (
    <div className="flex items-center gap-2">
      <div className={`${sizes[size]} rounded-full ${config.color} ${config.animate ? 'animate-pulse' : ''}`} />
      {showLabel && <span className="text-xs text-gray-400">{config.label}</span>}
    </div>
  );
}

export function ProgressBar({ value, max = 100, color = 'cmd-accent', showLabel = true, height = 'h-2' }) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className="w-full">
      <div className={`w-full bg-cmd-darker rounded-full ${height} overflow-hidden`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={`h-full bg-${color} rounded-full`}
        />
      </div>
      {showLabel && (
        <p className="text-xs text-gray-400 mt-1">{percentage.toFixed(0)}%</p>
      )}
    </div>
  );
}

export function Tabs({ tabs, activeTab, onTabChange }) {
  return (
    <div className="flex border-b border-cmd-border">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
        >
          {tab.icon && <tab.icon size={14} className="inline mr-2" />}
          {tab.label}
          {tab.count !== undefined && (
            <span className="ml-2 px-1.5 py-0.5 text-xs bg-cmd-accent/20 rounded">
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

export function SearchInput({ value, onChange, placeholder = 'Search...', className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-field pl-10"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}

import { Search, X } from 'lucide-react';

export function Select({ value, onChange, options, placeholder = 'Select...', className = '' }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`select-field ${className}`}
    >
      {placeholder && <option value="all">{placeholder}</option>}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

export function LoadingSpinner({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`${sizes[size]} ${className}`}>
      <div className="w-full h-full border-2 border-cmd-accent/20 border-t-cmd-accent rounded-full animate-spin" />
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {Icon && (
        <div className="p-4 rounded-full bg-cmd-dark mb-4">
          <Icon size={32} className="text-gray-500" />
        </div>
      )}
      <h3 className="text-lg font-medium text-gray-300 mb-2">{title}</h3>
      {description && <p className="text-sm text-gray-500 mb-4 max-w-md">{description}</p>}
      {action}
    </div>
  );
}

export function Tooltip({ children, content, position = 'top' }) {
  const [show, setShow] = React.useState(false);

  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`tooltip ${positions[position]}`}
        >
          {content}
        </motion.div>
      )}
    </div>
  );
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-[95vw]',
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="modal-overlay"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className={`modal-content ${sizes[size]}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="panel-header">
          <h2 className="panel-title">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-cmd-accent/20 rounded transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[80vh]">
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
}

export function DataTable({ columns, data, onRowClick, selectedId, emptyMessage = 'No data available' }) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-cmd-border">
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider"
                style={{ width: col.width }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <motion.tr
              key={row.id || idx}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: idx * 0.02 }}
              onClick={() => onRowClick?.(row)}
              className={`border-b border-cmd-border/50 hover:bg-cmd-dark/50 cursor-pointer transition-colors
                ${selectedId === row.id ? 'bg-cmd-accent/10 border-l-2 border-l-cmd-accent' : ''}`}
            >
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-sm">
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Timeline({ events, renderEvent }) {
  return (
    <div className="relative">
      <div className="absolute left-4 top-0 bottom-0 w-px bg-cmd-border" />
      <div className="space-y-4">
        {events.map((event, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="relative pl-10"
          >
            <div className="absolute left-2.5 w-3 h-3 rounded-full bg-cmd-accent border-2 border-cmd-dark" />
            {renderEvent ? renderEvent(event, idx) : (
              <div className="panel p-3">
                <p className="text-xs text-gray-500">{new Date(event.time).toLocaleString()}</p>
                <p className="text-sm">{event.event}</p>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default Panel;
