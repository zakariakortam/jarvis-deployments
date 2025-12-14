import { Suspense, useCallback, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stats } from '@react-three/drei';
import * as THREE from 'three';
import useGameStore from '../store/gameStore';
import { World } from './World';
import { Player } from './Player';
import { Sky } from './Sky';
import { TextureProvider } from './Chunk';
import {
  Hotbar,
  Crosshair,
  DebugPanel,
  PauseMenu,
  MainMenu,
  LoadingScreen,
  Inventory,
} from './UI';

// 3D Scene content
function Scene() {
  const settings = useGameStore(state => state.settings);
  const isPlaying = useGameStore(state => state.isPlaying);
  const isLoading = useGameStore(state => state.isLoading);
  const gameState = useGameStore(state => state.gameState);

  // Block interaction handler
  const handleBlockInteraction = useCallback((action) => {
    if (window.handleBlockInteraction) {
      window.handleBlockInteraction(action);
    }
  }, []);

  // Render during both loading and playing states
  if (!isPlaying && !isLoading && gameState !== 'loading') return null;

  return (
    <>
      {/* Sky and environment */}
      <Sky />

      {/* World with chunks */}
      <World />

      {/* Player controller - only active when actually playing */}
      {isPlaying && <Player onBlockInteraction={handleBlockInteraction} />}
    </>
  );
}

// Loading fallback for Suspense
function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="gray" />
    </mesh>
  );
}

// Main game component
export function Game() {
  const gameState = useGameStore(state => state.gameState);
  const showDebug = useGameStore(state => state.showDebug);
  const settings = useGameStore(state => state.settings);
  const isPlaying = useGameStore(state => state.isPlaying);
  const setFPS = useGameStore(state => state.setFPS);

  // FPS tracking
  const lastTime = useRef(performance.now());
  const frameCount = useRef(0);

  // Prevent context menu on right click
  useEffect(() => {
    const handleContextMenu = (e) => {
      if (isPlaying) {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, [isPlaying]);

  return (
    <div className="game-container">
      {/* Main Menu */}
      <MainMenu />

      {/* 3D Canvas */}
      {gameState !== 'menu' && (
        <Canvas
          frameloop="always"
          gl={{
            antialias: false,
            powerPreference: 'high-performance',
            stencil: false,
            depth: true,
            alpha: false,
          }}
          camera={{
            fov: settings.fov || 70,
            near: 0.1,
            far: 500,
            position: [0, 80, 0],
          }}
          onCreated={({ gl }) => {
            gl.setClearColor('#87ceeb');
            // Disable shadows for better performance
            gl.shadowMap.enabled = false;
          }}
        >
          <TextureProvider>
            <Suspense fallback={<LoadingFallback />}>
              <Scene />
            </Suspense>
          </TextureProvider>

          {/* Performance stats (only in debug mode) */}
          {showDebug && <Stats />}
        </Canvas>
      )}

      {/* UI Overlays */}
      <div className="ui-layer">
        <LoadingScreen />
        <Crosshair />
        <Hotbar />
        <DebugPanel />
        <PauseMenu />
        <Inventory />
      </div>
    </div>
  );
}

export default Game;
