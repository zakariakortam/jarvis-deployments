import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  AlertTriangle,
  Globe,
  Users,
  Radio,
  Shield,
  UserCircle,
  Brain,
  TrendingUp,
  Building,
  FileText,
  Terminal,
  ChevronLeft,
  ChevronRight,
  Activity,
  Wifi,
  Eye,
} from 'lucide-react';
import useStore from '../../stores/mainStore';

const navItems = [
  { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard, color: 'text-cmd-accent' },
  { id: 'threats', label: 'Threat Fusion', icon: AlertTriangle, color: 'text-threat-critical' },
  { id: 'geospatial', label: 'Geospatial Intel', icon: Globe, color: 'text-agency-foreign' },
  { id: 'operations', label: 'Operations', icon: Users, color: 'text-agency-defense' },
  { id: 'sigint', label: 'SIGINT Chamber', icon: Radio, color: 'text-agency-cyber' },
  { id: 'cyber', label: 'Cyber Theater', icon: Shield, color: 'text-threat-high' },
  { id: 'humint', label: 'HUMINT Nexus', icon: UserCircle, color: 'text-agency-covert' },
  { id: 'psyops', label: 'PSYOPS Monitor', icon: Brain, color: 'text-agency-intel' },
  { id: 'economic', label: 'Economic Intel', icon: TrendingUp, color: 'text-threat-guarded' },
  { id: 'infrastructure', label: 'Infrastructure', icon: Building, color: 'text-threat-elevated' },
  { id: 'documents', label: 'Document Vault', icon: FileText, color: 'text-class-secret' },
  { id: 'terminal', label: 'Command Terminal', icon: Terminal, color: 'text-status-active' },
];

export default function Sidebar() {
  const { activeModule, setActiveModule, sidebarExpanded, toggleSidebar, globalMetrics, alertLevel } = useStore();

  const alertColors = {
    LOW: 'bg-threat-low',
    GUARDED: 'bg-threat-guarded',
    ELEVATED: 'bg-threat-elevated',
    HIGH: 'bg-threat-high',
    SEVERE: 'bg-threat-critical',
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarExpanded ? 256 : 72 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="h-full bg-cmd-panel border-r border-cmd-border flex flex-col relative"
    >
      {/* Logo Section */}
      <div className="p-4 border-b border-cmd-border">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-lg bg-cmd-accent/20 flex items-center justify-center">
              <Eye size={24} className="text-cmd-accent" />
            </div>
            <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${alertColors[alertLevel]} animate-pulse`} />
          </div>
          <AnimatePresence>
            {sidebarExpanded && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="overflow-hidden"
              >
                <h1 className="text-sm font-bold text-cmd-accent tracking-wider font-display">SENTINEL</h1>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Command Directorate</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Alert Level Indicator */}
      <div className="px-4 py-3 border-b border-cmd-border">
        <div className="flex items-center gap-2">
          <Activity size={16} className={`${alertColors[alertLevel].replace('bg-', 'text-')} animate-pulse`} />
          <AnimatePresence>
            {sidebarExpanded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-500 uppercase">Alert Level</span>
                  <span className={`text-xs font-bold ${alertColors[alertLevel].replace('bg-', 'text-')}`}>
                    {alertLevel}
                  </span>
                </div>
                <div className="mt-1 h-1 bg-cmd-darker rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${globalMetrics.overallRiskScore}%` }}
                    className={`h-full ${alertColors[alertLevel]} transition-all duration-500`}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = activeModule === item.id;
            const Icon = item.icon;

            // Get notification count for certain modules
            let notificationCount = 0;
            if (item.id === 'threats') notificationCount = globalMetrics.threatCount;
            if (item.id === 'cyber') notificationCount = globalMetrics.cyberAlerts;
            if (item.id === 'infrastructure') notificationCount = globalMetrics.infrastructureAlerts;

            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveModule(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                    ${isActive
                      ? 'bg-cmd-accent/20 border border-cmd-accent/50'
                      : 'hover:bg-cmd-dark/50 border border-transparent'
                    }`}
                >
                  <div className="relative">
                    <Icon
                      size={20}
                      className={isActive ? item.color : 'text-gray-400'}
                    />
                    {notificationCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-threat-critical rounded-full flex items-center justify-center text-[9px] font-bold text-white">
                        {notificationCount > 9 ? '9+' : notificationCount}
                      </span>
                    )}
                  </div>
                  <AnimatePresence>
                    {sidebarExpanded && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className={`text-sm font-medium flex-1 text-left truncate
                          ${isActive ? 'text-white' : 'text-gray-400'}`}
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* System Status */}
      <div className="px-4 py-3 border-t border-cmd-border">
        <div className="flex items-center gap-2">
          <Wifi size={14} className="text-status-active animate-pulse" />
          <AnimatePresence>
            {sidebarExpanded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1"
              >
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-gray-500">SYSTEM STATUS</span>
                  <span className="text-status-active">OPERATIONAL</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-cmd-panel border border-cmd-border
                   rounded-full flex items-center justify-center hover:bg-cmd-dark transition-colors z-10"
      >
        {sidebarExpanded ? (
          <ChevronLeft size={14} className="text-cmd-accent" />
        ) : (
          <ChevronRight size={14} className="text-cmd-accent" />
        )}
      </button>
    </motion.aside>
  );
}
