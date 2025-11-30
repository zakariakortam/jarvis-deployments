import { motion } from 'framer-motion';
import useStore from '../store/useStore';
import audioService from '../services/audio';

const navItems = [
  {
    id: 'fleet',
    label: 'Fleet Ops',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    )
  },
  {
    id: 'map',
    label: 'Star Map',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="4" />
        <line x1="12" y1="2" x2="12" y2="8" />
        <line x1="12" y1="16" x2="12" y2="22" />
        <line x1="2" y1="12" x2="8" y2="12" />
        <line x1="16" y1="12" x2="22" y2="12" />
      </svg>
    )
  },
  {
    id: 'missions',
    label: 'Missions',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <line x1="8" y1="14" x2="8" y2="14.01" />
        <line x1="12" y1="14" x2="12" y2="14.01" />
        <line x1="16" y1="14" x2="16" y2="14.01" />
        <line x1="8" y1="18" x2="8" y2="18.01" />
        <line x1="12" y1="18" x2="12" y2="18.01" />
      </svg>
    )
  },
  {
    id: 'crew',
    label: 'Personnel',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    )
  },
  {
    id: 'engineering',
    label: 'Engineering',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
      </svg>
    )
  },
  {
    id: 'terminal',
    label: 'Terminal',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polyline points="4 17 10 11 4 5" />
        <line x1="12" y1="19" x2="20" y2="19" />
      </svg>
    )
  },
  {
    id: 'alerts',
    label: 'Alerts',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    )
  }
];

export default function Sidebar() {
  const { activePanel, setActivePanel, alertSummary } = useStore();

  const handleNavClick = (id) => {
    audioService.playClick();
    setActivePanel(id);
  };

  return (
    <nav className="w-20 bg-panel-bg/80 backdrop-blur-md border-r border-panel-border flex flex-col">
      <div className="flex-1 py-4">
        {navItems.map((item) => {
          const isActive = activePanel === item.id;
          const hasAlerts = item.id === 'alerts' && alertSummary?.unacknowledged > 0;

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`
                relative w-full h-16 flex flex-col items-center justify-center gap-1
                transition-all duration-200
                ${isActive
                  ? 'text-holo-blue bg-holo-blue/10'
                  : 'text-holo-cyan/60 hover:text-holo-cyan hover:bg-panel-border/20'
                }
              `}
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-holo-blue rounded-r"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}

              {/* Icon */}
              <div className="w-6 h-6 relative">
                {item.icon}
                {hasAlerts && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-holo-red rounded-full animate-pulse" />
                )}
              </div>

              {/* Label */}
              <span className="text-[10px] font-medium uppercase tracking-wider">
                {item.label}
              </span>

              {/* Hover glow effect */}
              {isActive && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: 'radial-gradient(circle at center, rgba(0, 240, 255, 0.1) 0%, transparent 70%)'
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom section */}
      <div className="p-2 border-t border-panel-border">
        <button
          className="w-full h-12 flex flex-col items-center justify-center gap-1 text-holo-cyan/40 hover:text-holo-cyan transition-colors"
          onClick={() => {
            audioService.playClick();
            // Toggle audio
            const enabled = !useStore.getState().audioEnabled;
            useStore.setState({ audioEnabled: enabled });
            audioService.setEnabled(enabled);
          }}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M11 5L6 9H2v6h4l5 4V5z" />
            <path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" />
          </svg>
          <span className="text-[9px] uppercase">Audio</span>
        </button>
      </div>
    </nav>
  );
}
