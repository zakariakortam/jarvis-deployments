import { useState } from 'react';
import useReactorStore, { FUEL_TYPES } from '../store/reactorStore';

export default function ControlPanel() {
  const {
    isRunning,
    startReactor,
    stopReactor,
    controlRodPosition,
    setControlRods,
    coolantFlow,
    setCoolantFlow,
    coolantEnabled,
    toggleCoolant,
    fuelType,
    setFuelType,
    scramEnabled,
    disableScram,
    autoScramDisabled,
    toggleAutoScram,
    emergencyScram,
    reset,
    isMeltdown,
    isExplosion,
  } = useReactorStore();

  const [confirmDisableScram, setConfirmDisableScram] = useState(false);

  const handleDisableScram = () => {
    if (!confirmDisableScram) {
      setConfirmDisableScram(true);
      setTimeout(() => setConfirmDisableScram(false), 3000);
    } else {
      disableScram();
      setConfirmDisableScram(false);
    }
  };

  const isDisaster = isMeltdown || isExplosion;

  return (
    <div className="panel">
      <div className="panel-header">
        <span>Control Systems</span>
        {isRunning && <span className="status-dot running" />}
      </div>
      <div className="panel-content control-panel">
        {/* Main Controls */}
        <div className="control-group">
          <div className="control-group-title">Reactor Control</div>
          <div style={{ display: 'flex', gap: '10px' }}>
            {!isRunning ? (
              <button
                className="btn btn-start btn-full"
                onClick={startReactor}
                disabled={isDisaster}
              >
                Start Reactor
              </button>
            ) : (
              <button className="btn btn-stop btn-full" onClick={stopReactor}>
                Stop Reactor
              </button>
            )}
          </div>
          {isDisaster && (
            <button
              className="btn btn-reset btn-full"
              onClick={reset}
              style={{ marginTop: '10px' }}
            >
              Reset Reactor
            </button>
          )}
        </div>

        {/* Control Rods */}
        <div className="control-group">
          <div className="control-group-title">Control Rods</div>
          <div className="control-row">
            <span className="control-label">Position</span>
            <span
              className="control-value"
              style={{
                color:
                  controlRodPosition < 20
                    ? 'var(--danger)'
                    : controlRodPosition < 50
                      ? 'var(--warning)'
                      : 'var(--safe)',
              }}
            >
              {controlRodPosition.toFixed(0)}%
            </span>
          </div>
          <div className="slider-container">
            <input
              type="range"
              className={`slider ${controlRodPosition < 20 ? 'danger' : controlRodPosition < 50 ? 'warning' : ''}`}
              min="0"
              max="100"
              value={controlRodPosition}
              onChange={(e) => setControlRods(Number(e.target.value))}
            />
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '10px',
              color: 'var(--text-dim)',
            }}
          >
            <span>WITHDRAWN (DANGER)</span>
            <span>INSERTED (SAFE)</span>
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
            <button
              className="btn btn-danger btn-small"
              onClick={() => setControlRods(0)}
            >
              Full Withdraw
            </button>
            <button
              className="btn btn-small"
              onClick={() => setControlRods(50)}
              style={{ background: 'var(--warning)', color: '#000' }}
            >
              50%
            </button>
            <button
              className="btn btn-start btn-small"
              onClick={() => setControlRods(100)}
            >
              Full Insert
            </button>
          </div>
        </div>

        {/* Coolant System */}
        <div className="control-group">
          <div className="control-group-title">Coolant System</div>
          <div className="control-row">
            <span className="control-label">System Status</span>
            <div className="toggle-container">
              <span style={{ fontSize: '11px', color: coolantEnabled ? 'var(--safe)' : 'var(--danger)' }}>
                {coolantEnabled ? 'ENABLED' : 'DISABLED'}
              </span>
              <div
                className={`toggle ${coolantEnabled ? 'active' : ''} ${!coolantEnabled ? 'danger' : ''}`}
                onClick={toggleCoolant}
              />
            </div>
          </div>
          <div className="control-row">
            <span className="control-label">Flow Rate</span>
            <span className="control-value">{coolantFlow.toFixed(0)}%</span>
          </div>
          <div className="slider-container">
            <input
              type="range"
              className={`slider ${!coolantEnabled ? 'danger' : coolantFlow < 30 ? 'warning' : ''}`}
              min="0"
              max="100"
              value={coolantFlow}
              onChange={(e) => setCoolantFlow(Number(e.target.value))}
              disabled={!coolantEnabled}
            />
          </div>
        </div>

        {/* Fuel Selection */}
        <div className="control-group">
          <div className="control-group-title">Fuel Type</div>
          <select
            className="select"
            value={fuelType}
            onChange={(e) => setFuelType(e.target.value)}
            disabled={isRunning}
          >
            {Object.entries(FUEL_TYPES).map(([key, fuel]) => (
              <option key={key} value={key}>
                {fuel.name} (Reactivity: {fuel.reactivity}x)
              </option>
            ))}
          </select>
          {fuelType === 'unstablium' && (
            <div
              style={{
                marginTop: '8px',
                padding: '8px',
                background: 'rgba(255, 0, 0, 0.2)',
                borderRadius: '4px',
                fontSize: '11px',
                color: 'var(--danger)',
              }}
            >
              WARNING: Unstablium-666 is extremely volatile!
            </div>
          )}
        </div>

        {/* Safety Systems */}
        <div className="control-group">
          <div className="control-group-title">Safety Systems</div>
          <div className="control-row">
            <span className="control-label">Auto-SCRAM</span>
            <div className="toggle-container">
              <span
                style={{
                  fontSize: '11px',
                  color: autoScramDisabled ? 'var(--danger)' : 'var(--safe)',
                }}
              >
                {autoScramDisabled ? 'DISABLED' : 'ENABLED'}
              </span>
              <div
                className={`toggle ${!autoScramDisabled ? 'active' : ''} ${autoScramDisabled ? 'danger' : ''}`}
                onClick={toggleAutoScram}
              />
            </div>
          </div>
          <button
            className="btn btn-scram btn-full"
            onClick={emergencyScram}
            disabled={!scramEnabled || isDisaster}
            style={{ marginTop: '10px' }}
          >
            EMERGENCY SCRAM
          </button>
        </div>

        {/* Danger Zone */}
        <div className="danger-zone">
          <div className="danger-zone-title">DANGER ZONE</div>
          <div className="danger-buttons">
            <button
              className="btn btn-danger btn-full"
              onClick={handleDisableScram}
              disabled={!scramEnabled}
            >
              {confirmDisableScram
                ? 'CONFIRM: DISABLE SCRAM?'
                : scramEnabled
                  ? 'Disable SCRAM System'
                  : 'SCRAM Disabled'}
            </button>
            <button
              className="btn btn-danger btn-full"
              onClick={() => {
                setControlRods(0);
                setCoolantFlow(0);
                toggleCoolant();
              }}
              disabled={isDisaster}
            >
              Maximum Chaos Mode
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
