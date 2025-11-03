import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';

export default function PauseMenu() {
  const {
    resumeGame,
    returnToMenu,
    soundEnabled,
    musicEnabled,
    darkMode,
    toggleSound,
    toggleMusic,
    toggleDarkMode,
  } = useGameStore();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50"
    >
      <div className="text-center space-y-8 p-8">
        <motion.h1
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          className="text-6xl font-bold text-primary glow-text mb-8 pixelated"
        >
          PAUSED
        </motion.h1>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-card/50 backdrop-blur-md p-6 rounded-lg retro-border space-y-4"
        >
          <h2 className="text-2xl font-bold text-foreground mb-4">Settings</h2>

          <div className="flex items-center justify-between gap-8">
            <span className="text-lg text-muted-foreground">Sound Effects</span>
            <button
              onClick={toggleSound}
              className={`px-6 py-2 rounded-lg font-bold transition-all ${
                soundEnabled
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground'
              }`}
              aria-label={soundEnabled ? 'Sound enabled' : 'Sound disabled'}
            >
              {soundEnabled ? 'ON' : 'OFF'}
            </button>
          </div>

          <div className="flex items-center justify-between gap-8">
            <span className="text-lg text-muted-foreground">Music</span>
            <button
              onClick={toggleMusic}
              className={`px-6 py-2 rounded-lg font-bold transition-all ${
                musicEnabled
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground'
              }`}
              aria-label={musicEnabled ? 'Music enabled' : 'Music disabled'}
            >
              {musicEnabled ? 'ON' : 'OFF'}
            </button>
          </div>

          <div className="flex items-center justify-between gap-8">
            <span className="text-lg text-muted-foreground">Dark Mode</span>
            <button
              onClick={toggleDarkMode}
              className={`px-6 py-2 rounded-lg font-bold transition-all ${
                darkMode
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground'
              }`}
              aria-label={darkMode ? 'Dark mode enabled' : 'Dark mode disabled'}
            >
              {darkMode ? 'ON' : 'OFF'}
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={resumeGame}
            className="px-12 py-4 bg-primary text-primary-foreground text-2xl font-bold rounded-lg shadow-xl hover:shadow-primary/50 transition-all glow-text"
            aria-label="Resume game"
          >
            RESUME
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={returnToMenu}
            className="px-12 py-4 bg-secondary text-secondary-foreground text-xl font-bold rounded-lg shadow-xl hover:shadow-secondary/50 transition-all"
            aria-label="Return to main menu"
          >
            MAIN MENU
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-muted-foreground text-sm"
        >
          Press <span className="text-primary font-bold">P</span> or{' '}
          <span className="text-primary font-bold">ESC</span> to resume
        </motion.div>
      </div>
    </motion.div>
  );
}
