import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Settings,
  Search,
  Clock,
  Play,
  Pause,
  FastForward,
  AlertTriangle,
  Shield,
  Radio,
  Building,
  X,
  ChevronRight,
  User,
  LogOut,
  HelpCircle,
} from 'lucide-react';
import useStore from '../../stores/mainStore';
import { format } from 'date-fns';

export default function Header() {
  const {
    currentTime,
    simulationRunning,
    simulationSpeed,
    startSimulation,
    stopSimulation,
    setSimulationSpeed,
    notifications,
    unreadCount,
    markNotificationRead,
    markAllNotificationsRead,
    alertLevel,
    globalMetrics,
  } = useStore();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTimeDisplay, setCurrentTimeDisplay] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTimeDisplay(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const alertColors = {
    LOW: { bg: 'bg-threat-low', text: 'text-threat-low', border: 'border-threat-low' },
    GUARDED: { bg: 'bg-threat-guarded', text: 'text-threat-guarded', border: 'border-threat-guarded' },
    ELEVATED: { bg: 'bg-threat-elevated', text: 'text-threat-elevated', border: 'border-threat-elevated' },
    HIGH: { bg: 'bg-threat-high', text: 'text-threat-high', border: 'border-threat-high' },
    SEVERE: { bg: 'bg-threat-critical', text: 'text-threat-critical', border: 'border-threat-critical' },
  };

  const notificationIcons = {
    threat: AlertTriangle,
    cyber: Shield,
    sigint: Radio,
    incident: Building,
  };

  const speedOptions = [1, 2, 5, 10];

  return (
    <header className="h-14 bg-cmd-panel border-b border-cmd-border flex items-center justify-between px-4">
      {/* Left Section - Alert Status */}
      <div className="flex items-center gap-6">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${alertColors[alertLevel].border} ${alertColors[alertLevel].bg}/10`}>
          <div className={`w-2 h-2 rounded-full ${alertColors[alertLevel].bg} animate-pulse`} />
          <span className={`text-xs font-bold uppercase tracking-wider ${alertColors[alertLevel].text}`}>
            THREAT LEVEL: {alertLevel}
          </span>
        </div>

        {/* Quick Stats */}
        <div className="hidden lg:flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle size={14} className="text-threat-critical" />
            <span className="text-gray-400">Active Threats:</span>
            <span className="text-white font-bold">{globalMetrics.threatCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-agency-cyber" />
            <span className="text-gray-400">Cyber Events:</span>
            <span className="text-white font-bold">{globalMetrics.cyberAlerts}</span>
          </div>
          <div className="flex items-center gap-2">
            <Building size={14} className="text-threat-elevated" />
            <span className="text-gray-400">Infra Alerts:</span>
            <span className="text-white font-bold">{globalMetrics.infrastructureAlerts}</span>
          </div>
        </div>
      </div>

      {/* Center Section - Time and Simulation */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-cmd-dark rounded-lg border border-cmd-border">
          <Clock size={14} className="text-cmd-accent" />
          <span className="text-sm font-mono text-gray-300">
            {format(currentTimeDisplay, 'HH:mm:ss')}
          </span>
          <span className="text-xs text-gray-500">
            {format(currentTimeDisplay, 'dd MMM yyyy')}
          </span>
          <span className="text-xs text-gray-600 uppercase">UTC</span>
        </div>

        {/* Simulation Controls */}
        <div className="flex items-center gap-1 px-2 py-1 bg-cmd-dark rounded-lg border border-cmd-border">
          <button
            onClick={simulationRunning ? stopSimulation : startSimulation}
            className={`p-1.5 rounded transition-colors ${
              simulationRunning ? 'bg-status-active/20 text-status-active' : 'bg-status-standby/20 text-status-standby'
            }`}
            title={simulationRunning ? 'Pause Simulation' : 'Start Simulation'}
          >
            {simulationRunning ? <Pause size={14} /> : <Play size={14} />}
          </button>

          <div className="flex items-center gap-0.5 ml-1">
            {speedOptions.map((speed) => (
              <button
                key={speed}
                onClick={() => setSimulationSpeed(speed)}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  simulationSpeed === speed
                    ? 'bg-cmd-accent/20 text-cmd-accent'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Section - Actions */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="p-2 rounded-lg hover:bg-cmd-dark transition-colors"
          >
            <Search size={18} className="text-gray-400" />
          </button>

          <AnimatePresence>
            {showSearch && (
              <motion.div
                initial={{ opacity: 0, y: -10, width: 0 }}
                animate={{ opacity: 1, y: 0, width: 300 }}
                exit={{ opacity: 0, y: -10, width: 0 }}
                className="absolute right-0 top-full mt-2 bg-cmd-panel border border-cmd-border rounded-lg shadow-xl overflow-hidden z-50"
              >
                <div className="p-3">
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search entities, operations, threats..."
                      className="input-field pl-10 pr-10"
                      autoFocus
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Press <kbd className="px-1.5 py-0.5 bg-cmd-dark rounded text-gray-400">Ctrl+K</kbd> for quick search
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg hover:bg-cmd-dark transition-colors"
          >
            <Bell size={18} className="text-gray-400" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 w-5 h-5 bg-threat-critical rounded-full flex items-center justify-center text-[10px] font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 top-full mt-2 w-96 bg-cmd-panel border border-cmd-border rounded-lg shadow-xl overflow-hidden z-50"
              >
                <div className="p-3 border-b border-cmd-border flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-xs text-cmd-accent hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      No notifications
                    </div>
                  ) : (
                    notifications.slice(0, 10).map((notification) => {
                      const Icon = notificationIcons[notification.type] || Bell;
                      const severityColors = {
                        critical: 'text-threat-critical',
                        high: 'text-threat-high',
                        elevated: 'text-threat-elevated',
                        medium: 'text-threat-elevated',
                        low: 'text-threat-low',
                      };

                      return (
                        <div
                          key={notification.id}
                          onClick={() => markNotificationRead(notification.id)}
                          className={`p-3 border-b border-cmd-border/50 hover:bg-cmd-dark/50 cursor-pointer transition-colors
                            ${!notification.read ? 'bg-cmd-accent/5' : ''}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-1.5 rounded ${severityColors[notification.severity]}/20`}>
                              <Icon size={16} className={severityColors[notification.severity]} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-medium text-white truncate">
                                  {notification.title}
                                </h4>
                                {!notification.read && (
                                  <span className="w-2 h-2 bg-cmd-accent rounded-full" />
                                )}
                              </div>
                              <p className="text-xs text-gray-400 mt-0.5 truncate">
                                {notification.message}
                              </p>
                              <p className="text-[10px] text-gray-500 mt-1">
                                {format(new Date(notification.timestamp), 'HH:mm:ss')}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {notifications.length > 10 && (
                  <div className="p-2 border-t border-cmd-border">
                    <button className="w-full text-xs text-cmd-accent hover:underline">
                      View all {notifications.length} notifications
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Settings */}
        <button className="p-2 rounded-lg hover:bg-cmd-dark transition-colors">
          <Settings size={18} className="text-gray-400" />
        </button>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-cmd-dark transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-cmd-accent/20 flex items-center justify-center">
              <User size={16} className="text-cmd-accent" />
            </div>
          </button>

          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 top-full mt-2 w-56 bg-cmd-panel border border-cmd-border rounded-lg shadow-xl overflow-hidden z-50"
              >
                <div className="p-3 border-b border-cmd-border">
                  <p className="text-sm font-medium text-white">Director Alpha</p>
                  <p className="text-xs text-gray-500">TOP SECRET//SCI Clearance</p>
                </div>

                <div className="py-1">
                  <button className="w-full px-3 py-2 flex items-center gap-2 text-sm text-gray-300 hover:bg-cmd-dark transition-colors">
                    <User size={14} />
                    Profile Settings
                  </button>
                  <button className="w-full px-3 py-2 flex items-center gap-2 text-sm text-gray-300 hover:bg-cmd-dark transition-colors">
                    <HelpCircle size={14} />
                    System Help
                  </button>
                  <button className="w-full px-3 py-2 flex items-center gap-2 text-sm text-threat-critical hover:bg-cmd-dark transition-colors">
                    <LogOut size={14} />
                    Secure Logout
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Click outside handlers */}
      {(showNotifications || showSearch || showUserMenu) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowNotifications(false);
            setShowSearch(false);
            setShowUserMenu(false);
          }}
        />
      )}
    </header>
  );
}
