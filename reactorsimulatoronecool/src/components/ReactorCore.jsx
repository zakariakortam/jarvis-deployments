import useReactorStore, { FUEL_TYPES } from '../store/reactorStore';

export default function ReactorCore() {
  const {
    power,
    temperature,
    controlRodPosition,
    fuelType,
    isMeltdown,
    isExplosion,
  } = useReactorStore();

  const fuel = FUEL_TYPES[fuelType];
  const meltdownTemp = fuel.meltdownTemp;

  // Determine core state
  const getGlowClass = () => {
    if (isMeltdown || isExplosion) return 'meltdown';
    if (temperature > meltdownTemp * 0.8) return 'critical';
    if (temperature > meltdownTemp * 0.5) return 'hot';
    if (power > 5) return 'active';
    return '';
  };

  const getPowerClass = () => {
    if (temperature > meltdownTemp * 0.8) return 'critical';
    if (temperature > meltdownTemp * 0.5) return 'hot';
    return '';
  };

  // Generate fuel rod states
  const getFuelRodClass = (index) => {
    if (!power || power < 1) return '';
    const threshold = (index / 25) * 100;
    if (temperature > meltdownTemp * 0.8) return 'critical';
    if (power > threshold + 30) return 'hot';
    if (power > threshold) return 'active';
    return '';
  };

  // Control rod visualization
  const rodHeight = 100 - controlRodPosition;
  const getRodClass = () => {
    if (controlRodPosition < 20) return 'danger';
    if (controlRodPosition < 50) return 'withdrawn';
    return '';
  };

  return (
    <div className="panel" style={{ height: '100%' }}>
      <div className="panel-header">
        <span>Reactor Core</span>
        <span style={{ color: fuel.color }}>{fuel.name}</span>
      </div>
      <div className="reactor-core">
        <div className="core-container">
          <div className="core-outer">
            {/* Radiation rings */}
            {power > 20 && (
              <>
                <div
                  style={{
                    position: 'absolute',
                    inset: '-20px',
                    border: `2px solid ${temperature > meltdownTemp * 0.5 ? 'var(--danger)' : 'var(--radiation)'}`,
                    borderRadius: '50%',
                    opacity: 0.3,
                    animation: 'pulse 2s infinite',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: '-40px',
                    border: `1px solid ${temperature > meltdownTemp * 0.5 ? 'var(--danger)' : 'var(--radiation)'}`,
                    borderRadius: '50%',
                    opacity: 0.2,
                    animation: 'pulse 2s infinite 0.5s',
                  }}
                />
              </>
            )}
          </div>

          <div className="core-inner">
            <div className={`core-glow ${getGlowClass()}`} />

            {/* Fuel rod grid */}
            <div className="core-fuel-rods">
              {Array.from({ length: 25 }).map((_, i) => (
                <div key={i} className={`fuel-rod ${getFuelRodClass(i)}`} />
              ))}
            </div>

            {/* Center display */}
            <div className="core-center">
              <div className={`core-power ${getPowerClass()}`}>
                {power.toFixed(0)}
                <span style={{ fontSize: '24px' }}>%</span>
              </div>
              <div className="core-label">Power Output</div>
            </div>
          </div>
        </div>

        {/* Control Rods Visual */}
        <div className="control-rods-visual">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rod-visual">
              <div
                className={`rod-fill ${getRodClass()}`}
                style={{ height: `${rodHeight}%` }}
              />
            </div>
          ))}
        </div>
        <div
          style={{
            marginTop: '8px',
            fontSize: '11px',
            color: 'var(--text-secondary)',
            textAlign: 'center',
          }}
        >
          Control Rods: {controlRodPosition.toFixed(0)}% Inserted
        </div>

        {/* Temperature bar */}
        <div style={{ width: '100%', marginTop: '20px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '4px',
            }}
          >
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              Core Temperature
            </span>
            <span
              style={{
                fontSize: '11px',
                color:
                  temperature > meltdownTemp * 0.8
                    ? 'var(--danger)'
                    : temperature > meltdownTemp * 0.5
                      ? 'var(--warning)'
                      : 'var(--text-secondary)',
              }}
            >
              {temperature.toFixed(0)}°C / {meltdownTemp}°C
            </span>
          </div>
          <div className="progress-bar">
            <div
              className={`progress-fill ${
                temperature > meltdownTemp * 0.8
                  ? 'danger'
                  : temperature > meltdownTemp * 0.5
                    ? 'warning'
                    : ''
              }`}
              style={{
                width: `${Math.min(100, (temperature / meltdownTemp) * 100)}%`,
              }}
            />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.05); opacity: 0.1; }
        }
      `}</style>
    </div>
  );
}
