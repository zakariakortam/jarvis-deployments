import useGameStore from '../../store/gameStore';

export function PauseMenu() {
  const isPaused = useGameStore(state => state.isPaused);
  const resumeGame = useGameStore(state => state.resumeGame);
  const exitToMenu = useGameStore(state => state.exitToMenu);
  const saveGame = useGameStore(state => state.saveGame);
  const settings = useGameStore(state => state.settings);
  const updateSettings = useGameStore(state => state.updateSettings);

  if (!isPaused) return null;

  const handleResume = () => {
    resumeGame();
  };

  const handleSaveAndQuit = () => {
    saveGame();
    exitToMenu();
  };

  return (
    <div className="pause-overlay">
      <div className="pause-menu">
        <h1 className="pause-title">Game Paused</h1>

        <div className="menu-buttons">
          <button className="menu-btn primary" onClick={handleResume}>
            Resume Game
          </button>

          <button className="menu-btn" onClick={saveGame}>
            Save Game
          </button>

          <div className="settings-section">
            <h3>Settings</h3>

            <div className="setting-row">
              <label>Render Distance: {settings.renderDistance}</label>
              <input
                type="range"
                min="2"
                max="12"
                value={settings.renderDistance}
                onChange={(e) => updateSettings({ renderDistance: parseInt(e.target.value) })}
              />
            </div>

            <div className="setting-row">
              <label>FOV: {settings.fov}</label>
              <input
                type="range"
                min="50"
                max="110"
                value={settings.fov}
                onChange={(e) => updateSettings({ fov: parseInt(e.target.value) })}
              />
            </div>

            <div className="setting-row">
              <label>
                <input
                  type="checkbox"
                  checked={settings.clouds}
                  onChange={(e) => updateSettings({ clouds: e.target.checked })}
                />
                Show Clouds
              </label>
            </div>

            <div className="setting-row">
              <label>
                <input
                  type="checkbox"
                  checked={settings.particles}
                  onChange={(e) => updateSettings({ particles: e.target.checked })}
                />
                Show Particles
              </label>
            </div>
          </div>

          <button className="menu-btn danger" onClick={handleSaveAndQuit}>
            Save & Quit to Menu
          </button>
        </div>
      </div>
    </div>
  );
}

export default PauseMenu;
