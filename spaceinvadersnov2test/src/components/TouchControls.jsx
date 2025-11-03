import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';

export default function TouchControls() {
  const { gameState, movePlayer, fireBullet } = useGameStore();

  if (gameState !== 'playing') return null;

  const handleMoveLeft = () => {
    const interval = setInterval(() => movePlayer(-1), 16);
    return () => clearInterval(interval);
  };

  const handleMoveRight = () => {
    const interval = setInterval(() => movePlayer(1), 16);
    return () => clearInterval(interval);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute bottom-8 left-0 right-0 z-40 flex justify-center gap-4 md:hidden"
    >
      <button
        onTouchStart={handleMoveLeft}
        onTouchEnd={(e) => e.currentTarget.blur()}
        className="touch-control px-8 py-6 bg-primary/80 text-primary-foreground rounded-lg shadow-xl active:bg-primary"
        aria-label="Move left"
      >
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      <button
        onTouchStart={fireBullet}
        className="touch-control px-12 py-6 bg-destructive/80 text-destructive-foreground rounded-lg shadow-xl active:bg-destructive"
        aria-label="Fire"
      >
        <svg
          className="w-8 h-8"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      <button
        onTouchStart={handleMoveRight}
        onTouchEnd={(e) => e.currentTarget.blur()}
        className="touch-control px-8 py-6 bg-primary/80 text-primary-foreground rounded-lg shadow-xl active:bg-primary"
        aria-label="Move right"
      >
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </motion.div>
  );
}
