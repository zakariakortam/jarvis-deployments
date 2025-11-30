import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';

export default function TopBar() {
  const [time, setTime] = useState(new Date());
  const { connected, fleetSummary, alertSummary, notifications, removeNotification } = useStore();
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatStardate = (date) => {
    const year = date.getFullYear();
    const dayOfYear = Math.floor((date - new Date(year, 0, 0)) / 86400000);
    const fraction = (date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds()) / 86400;
    return `${year - 1700}.${dayOfYear}${fraction.toFixed(2).slice(1)}`;
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <header className="h-14 bg-panel-bg/90 backdrop-blur-md border-b border-panel-border relative z-50">
      <div className="h-full px-4 flex items-center justify-between">
        {/* Left section - Logo and title */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-holo-blue to-holo-purple flex items-center justify-center">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 2v4M12 18v4M2 12h4M18 12h4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor" strokeWidth="1.5" fill="none" />
              </svg>
            </div>
            <div>
              <h1 className="font-display text-lg font-bold text-holo-blue tracking-wider">
                COSMOS OMNI-COMMAND
              </h1>
              <p className="text-xs text-holo-cyan/60 font-mono -mt-0.5">
                FLEET CONTROL INTERFACE v4.2.1
              </p>
            </div>
          </div>
        </div>

        {/* Center section - Status indicators */}
        <div className="flex items-center gap-6">
          {/* Connection status */}
          <div className="flex items-center gap-2">
            <div className={`status-indicator ${connected ? 'status-online' : 'status-critical'}`} />
            <span className="text-xs font-mono text-holo-cyan/80">
              {connected ? 'LINK ACTIVE' : 'DISCONNECTED'}
            </span>
          </div>

          {/* Fleet status */}
          {fleetSummary && (
            <div className="flex items-center gap-4 px-4 border-l border-r border-panel-border">
              <div className="text-center">
                <div className="text-lg font-display font-bold text-holo-green">
                  {fleetSummary.operational}
                </div>
                <div className="text-[10px] text-holo-cyan/60 uppercase">Operational</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-display font-bold text-holo-orange">
                  {fleetSummary.caution}
                </div>
                <div className="text-[10px] text-holo-cyan/60 uppercase">Caution</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-display font-bold text-holo-red">
                  {fleetSummary.alert}
                </div>
                <div className="text-[10px] text-holo-cyan/60 uppercase">Alert</div>
              </div>
            </div>
          )}

          {/* Alert status */}
          {alertSummary && (
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${alertSummary.critical > 0 ? 'status-critical' : 'status-online'}`} />
              <span className="text-xs font-mono text-holo-cyan/80">
                {alertSummary.unacknowledged} ALERTS
              </span>
            </div>
          )}
        </div>

        {/* Right section - Time and notifications */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded hover:bg-panel-border/30 transition-colors"
            >
              <svg className="w-5 h-5 text-holo-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-holo-red rounded-full text-[10px] font-bold flex items-center justify-center text-white">
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </span>
              )}
            </button>

            {/* Notifications dropdown */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-auto holo-panel"
                >
                  <div className="p-3 border-b border-panel-border">
                    <h3 className="font-display text-sm text-holo-blue uppercase">Notifications</h3>
                  </div>
                  <div className="p-2">
                    {notifications.length === 0 ? (
                      <p className="text-center text-holo-cyan/50 text-sm py-4">No notifications</p>
                    ) : (
                      notifications.slice(-10).reverse().map(notif => (
                        <div
                          key={notif.id}
                          className="p-2 rounded hover:bg-panel-border/20 mb-1 last:mb-0"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="text-sm text-holo-cyan font-medium">{notif.title}</p>
                              <p className="text-xs text-holo-cyan/60">{notif.message}</p>
                              <p className="text-[10px] text-holo-blue/40 mt-1">
                                {new Date(notif.timestamp).toLocaleTimeString()}
                              </p>
                            </div>
                            <button
                              onClick={() => removeNotification(notif.id)}
                              className="text-holo-cyan/40 hover:text-holo-red"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Time display */}
          <div className="text-right">
            <div className="font-mono text-sm text-holo-cyan">
              {time.toLocaleTimeString('en-US', { hour12: false })}
            </div>
            <div className="font-mono text-xs text-holo-blue/60">
              SD {formatStardate(time)}
            </div>
          </div>
        </div>
      </div>

      {/* Animated bottom border */}
      <div className="absolute bottom-0 left-0 right-0 h-px">
        <div
          className="h-full bg-gradient-to-r from-transparent via-holo-blue to-transparent animate-pulse"
          style={{ opacity: 0.5 }}
        />
      </div>
    </header>
  );
}
