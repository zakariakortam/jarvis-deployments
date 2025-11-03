import { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useGameStore } from './store/gameStore';
import useGameControls from './hooks/useGameControls';
import GameCanvas from './components/GameCanvas';
import Menu from './components/Menu';
import HUD from './components/HUD';
import GameOver from './components/GameOver';
import PauseMenu from './components/PauseMenu';
import TouchControls from './components/TouchControls';

export default function App() {
  const { gameState, darkMode } = useGameStore();
  useGameControls();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className="game-container scanline">
      <div className="absolute inset-0 flex items-center justify-center">
        <GameCanvas />
      </div>

      <AnimatePresence mode="wait">
        {gameState === 'menu' && <Menu key="menu" />}
        {gameState === 'paused' && <PauseMenu key="pause" />}
        {gameState === 'gameOver' && <GameOver key="gameover" />}
      </AnimatePresence>

      <HUD />
      <TouchControls />

      {/* Credits */}
      <div className="absolute bottom-4 left-0 right-0 text-center text-muted-foreground/50 text-xs">
        <p>Space Invaders - Built with React & Vite</p>
      </div>
    </div>
  );
}
