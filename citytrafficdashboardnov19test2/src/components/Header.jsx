import { Moon, Sun, Activity, Info } from 'lucide-react';
import useTrafficStore from '../store/trafficStore';
import { motion } from 'framer-motion';

export default function Header() {
  const darkMode = useTrafficStore(state => state.darkMode);
  const toggleDarkMode = useTrafficStore(state => state.toggleDarkMode);
  const stats = useTrafficStore(state => state.stats);

  return (
    <header className="bg-card border-b border-border shadow-sm sticky top-0 z-40 backdrop-blur-sm bg-card/95">
      <div className="px-4 lg:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center"
            >
              <Activity className="w-6 h-6 text-primary-foreground" />
            </motion.div>
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-card-foreground">
                City Traffic Dashboard
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Real-time traffic monitoring and analytics
              </p>
            </div>
          </div>

          {/* Stats and Controls */}
          <div className="flex items-center gap-4">
            {/* Quick Stats */}
            <div className="hidden md:flex items-center gap-4 text-sm">
              <div className="text-right">
                <div className="text-muted-foreground">Active Sensors</div>
                <div className="font-semibold text-card-foreground">300</div>
              </div>
              <div className="text-right">
                <div className="text-muted-foreground">Avg Speed</div>
                <div className="font-semibold text-card-foreground">
                  {stats.avgSpeed} mph
                </div>
              </div>
              <div className="text-right">
                <div className="text-muted-foreground">Congestion</div>
                <div
                  className={`font-semibold ${
                    stats.avgCongestion < 30
                      ? 'text-green-500'
                      : stats.avgCongestion < 60
                      ? 'text-yellow-500'
                      : 'text-red-500'
                  }`}
                >
                  {stats.avgCongestion}%
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="hidden md:block w-px h-8 bg-border" />

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
              aria-label="Toggle dark mode"
            >
              <motion.div
                initial={false}
                animate={{ rotate: darkMode ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {darkMode ? (
                  <Sun className="w-5 h-5 text-secondary-foreground" />
                ) : (
                  <Moon className="w-5 h-5 text-secondary-foreground" />
                )}
              </motion.div>
            </button>

            {/* Info Button */}
            <button
              className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
              aria-label="Information"
              title="View system information"
            >
              <Info className="w-5 h-5 text-secondary-foreground" />
            </button>
          </div>
        </div>

        {/* Mobile Stats */}
        <div className="md:hidden mt-3 grid grid-cols-3 gap-2 text-xs">
          <div className="bg-secondary rounded p-2 text-center">
            <div className="text-muted-foreground">Sensors</div>
            <div className="font-semibold text-card-foreground">300</div>
          </div>
          <div className="bg-secondary rounded p-2 text-center">
            <div className="text-muted-foreground">Speed</div>
            <div className="font-semibold text-card-foreground">{stats.avgSpeed} mph</div>
          </div>
          <div className="bg-secondary rounded p-2 text-center">
            <div className="text-muted-foreground">Congestion</div>
            <div
              className={`font-semibold ${
                stats.avgCongestion < 30
                  ? 'text-green-500'
                  : stats.avgCongestion < 60
                  ? 'text-yellow-500'
                  : 'text-red-500'
              }`}
            >
              {stats.avgCongestion}%
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
