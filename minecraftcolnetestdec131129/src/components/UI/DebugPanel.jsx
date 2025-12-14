import { useState, useEffect } from 'react';
import useGameStore from '../../store/gameStore';
import { BIOME_TYPES } from '../../utils/constants';

export function DebugPanel() {
  const showDebug = useGameStore(state => state.showDebug);
  const player = useGameStore(state => state.player);
  const fps = useGameStore(state => state.fps);
  const chunksLoaded = useGameStore(state => state.chunksLoaded);
  const triangleCount = useGameStore(state => state.triangleCount);
  const time = useGameStore(state => state.time);
  const dayCount = useGameStore(state => state.dayCount);
  const worldSeed = useGameStore(state => state.worldSeed);

  const [actualFps, setActualFps] = useState(60);
  const [frameCount, setFrameCount] = useState(0);
  const [lastTime, setLastTime] = useState(performance.now());

  // FPS counter
  useEffect(() => {
    let animationId;
    let frames = 0;
    let lastCheck = performance.now();

    const countFrame = () => {
      frames++;
      const now = performance.now();

      if (now - lastCheck >= 1000) {
        setActualFps(Math.round(frames * 1000 / (now - lastCheck)));
        frames = 0;
        lastCheck = now;
      }

      animationId = requestAnimationFrame(countFrame);
    };

    animationId = requestAnimationFrame(countFrame);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  if (!showDebug) return null;

  const pos = player.position;
  const chunkX = Math.floor(pos[0] / 16);
  const chunkZ = Math.floor(pos[2] / 16);

  // Format time
  const gameHour = Math.floor(time * 24);
  const gameMinute = Math.floor((time * 24 - gameHour) * 60);
  const timeString = `${gameHour.toString().padStart(2, '0')}:${gameMinute.toString().padStart(2, '0')}`;

  // Direction
  const getDirection = () => {
    const rot = player.rotation[0] || 0;
    const normalized = ((rot % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    if (normalized < Math.PI / 4 || normalized > Math.PI * 7 / 4) return 'South';
    if (normalized < Math.PI * 3 / 4) return 'West';
    if (normalized < Math.PI * 5 / 4) return 'North';
    return 'East';
  };

  return (
    <div className="debug-panel">
      <div className="debug-section">
        <div className="debug-title">WebCraft Debug [F3]</div>
        <div className="debug-line">FPS: {actualFps}</div>
        <div className="debug-line">Chunks: {chunksLoaded}</div>
        <div className="debug-line">Triangles: {(triangleCount / 1000).toFixed(1)}k</div>
      </div>

      <div className="debug-section">
        <div className="debug-title">Position</div>
        <div className="debug-line">X: {pos[0].toFixed(2)}</div>
        <div className="debug-line">Y: {pos[1].toFixed(2)}</div>
        <div className="debug-line">Z: {pos[2].toFixed(2)}</div>
        <div className="debug-line">Chunk: {chunkX}, {chunkZ}</div>
        <div className="debug-line">Facing: {getDirection()}</div>
      </div>

      <div className="debug-section">
        <div className="debug-title">World</div>
        <div className="debug-line">Seed: {worldSeed}</div>
        <div className="debug-line">Day: {dayCount}</div>
        <div className="debug-line">Time: {timeString}</div>
      </div>

      <div className="debug-section">
        <div className="debug-title">Player</div>
        <div className="debug-line">Health: {player.health}/{player.maxHealth}</div>
        <div className="debug-line">Hunger: {player.hunger}/{player.maxHunger}</div>
        <div className="debug-line">Flying: {player.isFlying ? 'Yes' : 'No'}</div>
        <div className="debug-line">On Ground: {player.isOnGround ? 'Yes' : 'No'}</div>
      </div>

      <div className="debug-section controls">
        <div className="debug-title">Controls</div>
        <div className="debug-line">WASD - Move</div>
        <div className="debug-line">Space - Jump</div>
        <div className="debug-line">F - Toggle Fly</div>
        <div className="debug-line">E - Inventory</div>
        <div className="debug-line">1-9 - Select Slot</div>
        <div className="debug-line">LMB - Break</div>
        <div className="debug-line">RMB - Place</div>
        <div className="debug-line">ESC - Pause</div>
      </div>
    </div>
  );
}

export default DebugPanel;
