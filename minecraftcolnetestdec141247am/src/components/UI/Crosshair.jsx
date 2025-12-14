import useGameStore from '../../store/gameStore';

export function Crosshair() {
  const isPlaying = useGameStore(state => state.isPlaying);
  const isPaused = useGameStore(state => state.isPaused);
  const showInventory = useGameStore(state => state.showInventory);

  if (!isPlaying || isPaused || showInventory) return null;

  return (
    <div className="crosshair">
      <div className="crosshair-h" />
      <div className="crosshair-v" />
    </div>
  );
}

export default Crosshair;
