import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';

export default function GameOver() {
  const { score, highScore, level, startGame, returnToMenu } = useGameStore();

  const isNewHighScore = score === highScore && score > 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex items-center justify-center bg-black/90 backdrop-blur-sm z-50"
    >
      <div className="text-center space-y-8 p-8">
        {isNewHighScore && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="text-6xl mb-4"
          >
            🏆
          </motion.div>
        )}

        <motion.h1
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          className={`text-7xl font-bold mb-4 pixelated ${
            isNewHighScore ? 'text-yellow-400 glow-text' : 'text-destructive'
          }`}
        >
          {isNewHighScore ? 'NEW HIGH SCORE!' : 'GAME OVER'}
        </motion.h1>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <div className="bg-card/50 backdrop-blur-md p-6 rounded-lg retro-border">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider mb-2">
                  Final Score
                </div>
                <div className="text-5xl font-bold text-primary glow-text">
                  {score.toLocaleString()}
                </div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider mb-2">
                  Level Reached
                </div>
                <div className="text-5xl font-bold text-cyan-400 glow-text">
                  {level}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card/50 backdrop-blur-md p-4 rounded-lg retro-border">
            <div className="text-sm text-muted-foreground uppercase tracking-wider mb-2">
              High Score
            </div>
            <div className="text-4xl font-bold text-yellow-400 glow-text">
              {highScore.toLocaleString()}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex gap-4 justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startGame}
            className="px-8 py-4 bg-primary text-primary-foreground text-xl font-bold rounded-lg shadow-xl hover:shadow-primary/50 transition-all glow-text"
            aria-label="Play again"
          >
            PLAY AGAIN
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={returnToMenu}
            className="px-8 py-4 bg-secondary text-secondary-foreground text-xl font-bold rounded-lg shadow-xl hover:shadow-secondary/50 transition-all"
            aria-label="Return to menu"
          >
            MAIN MENU
          </motion.button>
        </motion.div>

        {isNewHighScore && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-yellow-400 text-xl"
          >
            Congratulations! You've set a new record!
          </motion.p>
        )}
      </div>
    </motion.div>
  );
}
