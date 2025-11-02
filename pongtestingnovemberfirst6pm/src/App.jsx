import { useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useGameStore } from './store/gameStore'
import { useThemeStore } from './store/themeStore'
import Menu from './components/Menu'
import Game from './components/Game'
import ScoreBoard from './components/ScoreBoard'
import Settings from './components/Settings'
import './App.css'

function App() {
  const { gameState } = useGameStore()
  const { darkMode, setDarkMode } = useThemeStore()

  // Initialize theme
  useEffect(() => {
    setDarkMode(darkMode)
  }, [darkMode, setDarkMode])

  const isPlaying = gameState === 'playing'
  const isMenu = gameState === 'menu'
  const isPaused = gameState === 'paused'
  const isGameOver = gameState === 'gameOver'

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-logo">PONG</h1>
        {isPlaying && <ScoreBoard />}
      </header>

      <main className="app-main">
        <AnimatePresence mode="wait">
          {isMenu && <Menu key="menu" />}
          {isPlaying && <Game key="game" />}
        </AnimatePresence>

        <AnimatePresence>
          {(isPaused || isGameOver) && <Settings key="settings" />}
        </AnimatePresence>
      </main>

      <footer className="app-footer">
        <p>Use keyboard controls • Press ESC to pause • {darkMode ? '🌙' : '☀️'}</p>
      </footer>
    </div>
  )
}

export default App
