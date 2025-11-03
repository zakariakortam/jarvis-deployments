import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';

export default function Menu() {
  const { startGame, highScore, difficulty, setDifficulty } = useGameStore();

  const difficulties = [
    { value: 'easy', label: 'Easy', color: 'text-green-400' },
    { value: 'normal', label: 'Normal', color: 'text-yellow-400' },
    { value: 'hard', label: 'Hard', color: 'text-red-400' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50"
    >
      <div className="text-center space-y-8 p-8">
        <motion.div
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        >
          <h1 className="text-7xl font-bold text-primary glow-text mb-4 pixelated">
            SPACE INVADERS
          </h1>
          <p className="text-xl text-muted-foreground">Classic Arcade Action</p>
        </motion.div>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-card/50 backdrop-blur-md p-6 rounded-lg retro-border"
        >
          <div className="text-3xl text-primary glow-text mb-2">HIGH SCORE</div>
          <div className="text-5xl font-bold text-yellow-400">{highScore.toLocaleString()}</div>
        </motion.div>

        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <div className="text-xl text-foreground mb-4">Select Difficulty</div>
          <div className="flex gap-4 justify-center">
            {difficulties.map((diff) => (
              <button
                key={diff.value}
                onClick={() => setDifficulty(diff.value)}
                className={`px-6 py-3 rounded-lg font-bold transition-all ${
                  difficulty === diff.value
                    ? 'bg-primary text-primary-foreground scale-110 shadow-lg shadow-primary/50'
                    : 'bg-secondary hover:bg-secondary/80'
                } ${diff.color}`}
                aria-label={`Select ${diff.label} difficulty`}
              >
                {diff.label}
              </button>
            ))}
          </div>
        </motion.div>

        <motion.button
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={startGame}
          className="px-12 py-4 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-2xl font-bold rounded-lg shadow-xl hover:shadow-primary/50 transition-all glow-text"
          aria-label="Start game"
        >
          START GAME
        </motion.button>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-muted-foreground space-y-2 mt-8"
        >
          <div className="text-lg font-semibold">Controls</div>
          <div className="flex gap-8 justify-center text-sm">
            <div>
              <span className="text-primary">←→</span> Move
            </div>
            <div>
              <span className="text-primary">SPACE</span> Fire
            </div>
            <div>
              <span className="text-primary">P</span> Pause
            </div>
            <div>
              <span className="text-primary">ESC</span> Menu
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-muted-foreground/70 text-xs"
        >
          <div className="flex gap-6 justify-center items-center">
            <div className="flex items-center gap-2">
              <span className="text-green-400 text-lg">▼</span> 10 pts
            </div>
            <div className="flex items-center gap-2">
              <span className="text-cyan-400 text-lg">▼</span> 20 pts
            </div>
            <div className="flex items-center gap-2">
              <span className="text-fuchsia-400 text-lg">▼</span> 30 pts
            </div>
            <div className="flex items-center gap-2">
              <span className="text-fuchsia-400 text-lg">◆</span> ??? pts
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
