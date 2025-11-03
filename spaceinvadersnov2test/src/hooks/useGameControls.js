import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';

export default function useGameControls() {
  const {
    gameState,
    movePlayer,
    fireBullet,
    pauseGame,
    resumeGame,
    returnToMenu,
  } = useGameStore();

  const keysPressed = useRef(new Set());

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.repeat) return;

      keysPressed.current.add(e.key);

      // Global controls
      if (e.key === 'Escape') {
        e.preventDefault();
        if (gameState === 'playing') {
          pauseGame();
        } else if (gameState === 'paused') {
          returnToMenu();
        }
      }

      if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        if (gameState === 'playing') {
          pauseGame();
        } else if (gameState === 'paused') {
          resumeGame();
        }
      }

      // Game controls
      if (gameState === 'playing') {
        if (e.key === ' ' || e.key === 'Spacebar') {
          e.preventDefault();
          fireBullet();
        }
      }
    };

    const handleKeyUp = (e) => {
      keysPressed.current.delete(e.key);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, pauseGame, resumeGame, returnToMenu, fireBullet]);

  // Continuous movement handling
  useEffect(() => {
    if (gameState !== 'playing') return;

    const movementInterval = setInterval(() => {
      if (keysPressed.current.has('ArrowLeft') || keysPressed.current.has('a') || keysPressed.current.has('A')) {
        movePlayer(-1);
      }
      if (keysPressed.current.has('ArrowRight') || keysPressed.current.has('d') || keysPressed.current.has('D')) {
        movePlayer(1);
      }
    }, 16); // ~60fps

    return () => clearInterval(movementInterval);
  }, [gameState, movePlayer]);
}
