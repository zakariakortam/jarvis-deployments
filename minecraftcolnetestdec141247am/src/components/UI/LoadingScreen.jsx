import useGameStore from '../../store/gameStore';

export function LoadingScreen() {
  const isLoading = useGameStore(state => state.isLoading);
  const gameState = useGameStore(state => state.gameState);
  const chunksLoaded = useGameStore(state => state.chunksLoaded);

  if (!isLoading || gameState === 'menu') return null;

  return (
    <div className="loading-screen">
      <div className="loading-content">
        <h2 className="loading-title">Generating World...</h2>

        <div className="loading-bar-container">
          <div
            className="loading-bar"
            style={{ width: `${Math.min(100, chunksLoaded * 2)}%` }}
          />
        </div>

        <p className="loading-info">
          Chunks loaded: {chunksLoaded}
        </p>

        <div className="loading-tips">
          <p>Tip: Press F to toggle flying mode</p>
        </div>
      </div>
    </div>
  );
}

export default LoadingScreen;
