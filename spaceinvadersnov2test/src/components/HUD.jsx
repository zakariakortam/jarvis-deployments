import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';

export default function HUD() {
  const { score, lives, level, highScore, pauseGame, gameState } = useGameStore();

  if (gameState !== 'playing') return null;

  return (
    <motion.div
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="absolute top-0 left-0 right-0 z-40 p-4 bg-gradient-to-b from-black/80 to-transparent"
    >
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <div className="flex gap-8">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground uppercase tracking-wider">Score</div>
            <div className="text-3xl font-bold text-primary glow-text pixelated">
              {score.toLocaleString()}
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-sm text-muted-foreground uppercase tracking-wider">High Score</div>
            <div className="text-3xl font-bold text-yellow-400 glow-text pixelated">
              {highScore.toLocaleString()}
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-sm text-muted-foreground uppercase tracking-wider">Level</div>
            <div className="text-3xl font-bold text-cyan-400 glow-text pixelated">
              {level}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground uppercase tracking-wider">Lives</div>
            <div className="flex gap-2">
              {Array.from({ length: lives }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="w-8 h-6 bg-green-400 clip-triangle shadow-lg shadow-green-400/50"
                  style={{
                    clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                  }}
                  aria-label={`Life ${i + 1}`}
                />
              ))}
            </div>
          </div>

          <button
            onClick={pauseGame}
            className="px-4 py-2 bg-secondary/80 hover:bg-secondary text-secondary-foreground rounded-lg transition-all"
            aria-label="Pause game"
          >
            <svg
              className="w-6 h-6"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
