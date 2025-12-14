import { useState } from 'react';
import useGameStore from '../../store/gameStore';

export function MainMenu() {
  const gameState = useGameStore(state => state.gameState);
  const startGame = useGameStore(state => state.startGame);
  const loadGame = useGameStore(state => state.loadGame);
  const hasSavedGame = useGameStore(state => state.hasSavedGame);
  const deleteSave = useGameStore(state => state.deleteSave);

  const [worldName, setWorldName] = useState('My World');
  const [seed, setSeed] = useState('');
  const [showNewWorld, setShowNewWorld] = useState(false);

  if (gameState !== 'menu') return null;

  const handleNewWorld = () => {
    const seedValue = seed ? parseInt(seed) || seed.split('').reduce((a, c) => a + c.charCodeAt(0), 0) : Date.now();
    startGame(worldName, seedValue);
  };

  const handleContinue = () => {
    if (loadGame()) {
      startGame();
    }
  };

  const handleDeleteWorld = () => {
    if (confirm('Are you sure you want to delete your saved world?')) {
      deleteSave();
    }
  };

  return (
    <div className="main-menu">
      <div className="menu-background">
        <div className="floating-blocks">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="floating-block"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 10}s`,
                animationDuration: `${15 + Math.random() * 10}s`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="menu-content">
        <h1 className="game-title">
          <span className="title-web">Web</span>
          <span className="title-craft">Craft</span>
        </h1>
        <p className="subtitle">A Minecraft-inspired voxel game</p>

        {!showNewWorld ? (
          <div className="menu-buttons">
            {hasSavedGame() && (
              <>
                <button className="menu-btn primary" onClick={handleContinue}>
                  Continue World
                </button>
                <button className="menu-btn small danger" onClick={handleDeleteWorld}>
                  Delete World
                </button>
              </>
            )}

            <button
              className="menu-btn"
              onClick={() => setShowNewWorld(true)}
            >
              New World
            </button>
          </div>
        ) : (
          <div className="new-world-form">
            <div className="form-group">
              <label>World Name</label>
              <input
                type="text"
                value={worldName}
                onChange={(e) => setWorldName(e.target.value)}
                placeholder="My World"
              />
            </div>

            <div className="form-group">
              <label>Seed (optional)</label>
              <input
                type="text"
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
                placeholder="Leave empty for random"
              />
            </div>

            <div className="form-buttons">
              <button className="menu-btn primary" onClick={handleNewWorld}>
                Create World
              </button>
              <button className="menu-btn" onClick={() => setShowNewWorld(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="menu-footer">
          <p>Controls: WASD to move, Space to jump, F to fly</p>
          <p>Left click to break, Right click to place</p>
          <p>Press F3 for debug info</p>
        </div>
      </div>
    </div>
  );
}

export default MainMenu;
