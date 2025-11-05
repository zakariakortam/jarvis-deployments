import { Moon, Sun, Activity, Play, Pause } from 'lucide-react';
import { motion } from 'framer-motion';

const Header = ({ darkMode, onToggleDarkMode, isStreaming, onToggleStreaming }) => {
  return (
    <header className="bg-card border-b border-border">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <Activity className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Environmental Monitoring
              </h1>
              <p className="text-sm text-muted-foreground">Real-time sensor data dashboard</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Streaming Toggle */}
            <button
              onClick={onToggleStreaming}
              className={`flex items-center space-x-2 px-6 py-2.5 rounded-full font-medium transition-all shadow-lg ${
                isStreaming
                  ? 'bg-danger text-white hover:bg-danger/90'
                  : 'bg-success text-white hover:bg-success/90'
              }`}
            >
              {isStreaming ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>Stop Streaming</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Start Streaming</span>
                </>
              )}
            </button>

            {/* Streaming Indicator */}
            {isStreaming && (
              <motion.div
                className="flex items-center space-x-2 px-4 py-2 bg-success/10 rounded-full border border-success/30"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <motion.div
                  className="w-2 h-2 rounded-full bg-success"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                />
                <span className="text-sm font-medium text-success">Live</span>
              </motion.div>
            )}

            {/* Dark Mode Toggle */}
            <button
              onClick={onToggleDarkMode}
              className="p-2.5 rounded-full border border-border hover:bg-muted transition-colors shadow-md"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-foreground" />
              ) : (
                <Moon className="w-5 h-5 text-foreground" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
