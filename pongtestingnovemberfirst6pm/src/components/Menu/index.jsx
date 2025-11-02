import { motion } from 'framer-motion'
import { useGameStore } from '../../store/gameStore'
import './styles.css'

export default function Menu() {
  const { startGame, playerScore, aiScore, constants } = useGameStore()

  return (
    <motion.div
      className="menu-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <motion.h1
        className="menu-title"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        PONG
      </motion.h1>

      <motion.p
        className="menu-subtitle"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Classic Arcade Action
      </motion.p>

      <motion.div
        className="menu-buttons"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <button
          onClick={startGame}
          className="menu-button menu-button-primary"
          aria-label="Start game"
        >
          Start Game
        </button>
      </motion.div>

      <motion.div
        className="menu-info"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <div className="menu-info-section">
          <h3>How to Play</h3>
          <ul>
            <li>Use <kbd>↑</kbd> <kbd>↓</kbd> or <kbd>W</kbd> <kbd>S</kbd> to move</li>
            <li>First to {constants.MAX_SCORE} points wins</li>
            <li>Press <kbd>ESC</kbd> to pause</li>
          </ul>
        </div>

        <div className="menu-info-section">
          <h3>Features</h3>
          <ul>
            <li>Intelligent AI opponent</li>
            <li>Multiple difficulty levels</li>
            <li>Responsive controls</li>
            <li>Sound effects</li>
            <li>Dark mode support</li>
          </ul>
        </div>
      </motion.div>

      <motion.div
        className="menu-footer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <p>Built with React + Vite</p>
      </motion.div>
    </motion.div>
  )
}
