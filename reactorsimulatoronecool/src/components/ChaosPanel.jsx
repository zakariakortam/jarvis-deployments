import useReactorStore, { FUEL_TYPES } from '../store/reactorStore';

export default function ChaosPanel() {
  const {
    fuelType,
    setFuelType,
    maxChaos,
    toggleAutoScram,
    disableScram,
    triggerHydrogenExplosion,
    triggerCriticalityAccident,
    autoScramDisabled,
    scramEnabled,
    coolantEnabled,
    controlRodPosition,
    isMeltdown,
    isExplosion,
    isContainmentBreach,
    isChinaSyndrome,
    isHydrogenExplosion,
    isCriticalityAccident,
  } = useReactorStore();

  const fuelOptions = Object.entries(FUEL_TYPES).map(([key, data]) => ({
    id: key,
    ...data,
  }));

  return (
    <div className="panel chaos-panel">
      <h3>Chaos Controls</h3>
      <p className="panel-subtitle">For educational purposes only...</p>

      {/* Fuel Selection */}
      <div className="control-section">
        <label>Fuel Type</label>
        <div className="fuel-grid">
          {fuelOptions.map((fuel) => (
            <button
              key={fuel.id}
              className={`fuel-btn ${fuelType === fuel.id ? 'active' : ''} ${
                fuel.reactivity > 2 ? 'dangerous' : ''
              }`}
              onClick={() => setFuelType(fuel.id)}
              style={{
                '--fuel-color': fuel.color,
              }}
            >
              <span className="fuel-name">{fuel.name}</span>
              <span className="fuel-stats">
                <span>Reactivity: {fuel.reactivity.toFixed(1)}x</span>
                <span>Melt: {fuel.meltdownTemp}°C</span>
              </span>
            </button>
          ))}
        </div>
        <p className="control-hint">
          Higher reactivity = faster power changes. Lower meltdown temp = easier disasters.
        </p>
      </div>

      {/* Safety Override */}
      <div className="control-section">
        <label>Safety Overrides</label>
        <div className="safety-grid">
          <button
            className={`safety-btn ${autoScramDisabled ? 'danger' : ''}`}
            onClick={toggleAutoScram}
          >
            <span className="btn-icon">{autoScramDisabled ? '🔓' : '🔒'}</span>
            <span>Auto-SCRAM: {autoScramDisabled ? 'DISABLED' : 'Enabled'}</span>
          </button>

          <button
            className={`safety-btn ${!scramEnabled ? 'danger' : ''}`}
            onClick={disableScram}
            disabled={!scramEnabled}
          >
            <span className="btn-icon">{scramEnabled ? '⚡' : '💀'}</span>
            <span>Manual SCRAM: {scramEnabled ? 'Available' : 'DISABLED'}</span>
          </button>
        </div>
        <p className="control-hint warning">
          Disabling safety systems removes all automated protections!
        </p>
      </div>

      {/* One-Click Chaos */}
      <div className="control-section">
        <label>Instant Chaos</label>
        <button
          className="chaos-btn max-chaos"
          onClick={maxChaos}
        >
          <span className="chaos-icon">☢️</span>
          <span className="chaos-text">
            <strong>MAXIMUM CHAOS</strong>
            <small>Disable all safety, remove rods, kill coolant</small>
          </span>
        </button>
      </div>

      {/* Disaster Triggers */}
      <div className="control-section">
        <label>Trigger Disasters</label>
        <div className="disaster-grid">
          <button
            className={`disaster-btn ${isHydrogenExplosion ? 'triggered' : ''}`}
            onClick={triggerHydrogenExplosion}
            disabled={isHydrogenExplosion}
          >
            <span className="disaster-icon">💨</span>
            <span className="disaster-name">Hydrogen Explosion</span>
            <span className="disaster-desc">Fukushima-style hydrogen buildup</span>
          </button>

          <button
            className={`disaster-btn ${isCriticalityAccident ? 'triggered' : ''}`}
            onClick={triggerCriticalityAccident}
            disabled={isCriticalityAccident}
          >
            <span className="disaster-icon">🔵</span>
            <span className="disaster-name">Criticality Accident</span>
            <span className="disaster-desc">Instant supercritical flash</span>
          </button>
        </div>
      </div>

      {/* Current Status */}
      <div className="control-section">
        <label>Disaster Status</label>
        <div className="status-grid">
          <div className={`status-item ${isMeltdown ? 'active' : ''}`}>
            <span className="status-icon">🔥</span>
            <span>Core Meltdown</span>
          </div>
          <div className={`status-item ${isExplosion ? 'active' : ''}`}>
            <span className="status-icon">💥</span>
            <span>Explosion</span>
          </div>
          <div className={`status-item ${isContainmentBreach ? 'active' : ''}`}>
            <span className="status-icon">☢️</span>
            <span>Containment Breach</span>
          </div>
          <div className={`status-item ${isChinaSyndrome ? 'active' : ''}`}>
            <span className="status-icon">🌏</span>
            <span>China Syndrome</span>
          </div>
          <div className={`status-item ${isHydrogenExplosion ? 'active' : ''}`}>
            <span className="status-icon">💨</span>
            <span>H2 Explosion</span>
          </div>
          <div className={`status-item ${isCriticalityAccident ? 'active' : ''}`}>
            <span className="status-icon">🔵</span>
            <span>Criticality</span>
          </div>
        </div>
      </div>

      {/* Quick Reference */}
      <div className="control-section reference">
        <label>Disaster Guide</label>
        <div className="guide-list">
          <div className="guide-item">
            <strong>Meltdown:</strong> Reach meltdown temperature (varies by fuel)
          </div>
          <div className="guide-item">
            <strong>Explosion:</strong> Pressure &gt; 25 atm or Power &gt; 200%
          </div>
          <div className="guide-item">
            <strong>Breach:</strong> Containment integrity reaches 0%
          </div>
          <div className="guide-item">
            <strong>China Syndrome:</strong> Sustained meltdown at 1.5x melt temp
          </div>
        </div>
      </div>

      {/* Speedrun Tips */}
      <div className="control-section tips">
        <label>Speedrun Tips</label>
        <ul className="tips-list">
          <li>Use Californium-252 for fastest meltdown (800°C threshold)</li>
          <li>Disable Auto-SCRAM first, then Manual SCRAM</li>
          <li>Set rods to 0% and disable coolant</li>
          <li>Start reactor and watch the fireworks</li>
          <li>Meltdown in under 30 seconds unlocks achievement!</li>
        </ul>
      </div>
    </div>
  );
}
