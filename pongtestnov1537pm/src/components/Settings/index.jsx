import { motion } from 'framer-motion'
import { useGameStore } from '../../store/gameStore'
import { useThemeStore } from '../../store/themeStore'
import './styles.css'

export default function Settings() {
  const {
    gameState,
    pauseGame,
    resumeGame,
    returnToMenu,
    difficulty,
    setDifficulty,
    soundEnabled,
    toggleSound,
    playerScore,
    aiScore,
    constants,
  } = useGameStore()

  const { darkMode, toggleDarkMode } = useThemeStore()

  const isPaused = gameState === 'paused'
  const isGameOver = gameState === 'gameOver'

  const handleDifficultyChange = (newDifficulty) => {
    setDifficulty(newDifficulty)
  }

  return (
    <div className="settings-overlay">
      <motion.div
        className="settings-panel"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        {isPaused && (
          <>
            <h2 className="settings-title">Paused</h2>
            <div className="settings-score">
              <div className="score-item">
                <span className="score-label">Player</span>
                <span className="score-value">{playerScore}</span>
              </div>
              <div className="score-divider">-</div>
              <div className="score-item">
                <span className="score-label">AI</span>
                <span className="score-value">{aiScore}</span>
              </div>
            </div>
          </>
        )}

        {isGameOver && (
          <>
            <h2 className="settings-title">Game Over!</h2>
            <div className="settings-score">
              <div className="score-item">
                <span className="score-label">Player</span>
                <span className="score-value">{playerScore}</span>
              </div>
              <div className="score-divider">-</div>
              <div className="score-item">
                <span className="score-label">AI</span>
                <span className="score-value">{aiScore}</span>
              </div>
            </div>
            <div className="game-result">
              {playerScore >= constants.MAX_SCORE ? (
                <motion.p
                  className="result-winner"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                >
                  🎉 You Win! 🎉
                </motion.p>
              ) : (
                <motion.p
                  className="result-loser"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                >
                  AI Wins! Try Again
                </motion.p>
              )}
            </div>
          </>
        )}

        <div className="settings-section">
          <h3 className="settings-section-title">Difficulty</h3>
          <div className="difficulty-buttons">
            <button
              className={`difficulty-button ${difficulty === 'easy' ? 'active' : ''}`}
              onClick={() => handleDifficultyChange('easy')}
              aria-pressed={difficulty === 'easy'}
            >
              Easy
            </button>
            <button
              className={`difficulty-button ${difficulty === 'medium' ? 'active' : ''}`}
              onClick={() => handleDifficultyChange('medium')}
              aria-pressed={difficulty === 'medium'}
            >
              Medium
            </button>
            <button
              className={`difficulty-button ${difficulty === 'hard' ? 'active' : ''}`}
              onClick={() => handleDifficultyChange('hard')}
              aria-pressed={difficulty === 'hard'}
            >
              Hard
            </button>
          </div>
        </div>

        <div className="settings-section">
          <h3 className="settings-section-title">Options</h3>
          <div className="settings-options">
            <label className="settings-option">
              <span>Sound Effects</span>
              <button
                className={`toggle-button ${soundEnabled ? 'active' : ''}`}
                onClick={toggleSound}
                aria-label="Toggle sound effects"
                aria-pressed={soundEnabled}
              >
                <span className="toggle-slider"></span>
              </button>
            </label>
            <label className="settings-option">
              <span>Dark Mode</span>
              <button
                className={`toggle-button ${darkMode ? 'active' : ''}`}
                onClick={toggleDarkMode}
                aria-label="Toggle dark mode"
                aria-pressed={darkMode}
              >
                <span className="toggle-slider"></span>
              </button>
            </label>
          </div>
        </div>

        <div className="settings-actions">
          {isPaused && (
            <button
              className="settings-button settings-button-primary"
              onClick={resumeGame}
            >
              Resume Game
            </button>
          )}
          <button
            className="settings-button settings-button-secondary"
            onClick={returnToMenu}
          >
            {isGameOver ? 'Back to Menu' : 'Exit to Menu'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
