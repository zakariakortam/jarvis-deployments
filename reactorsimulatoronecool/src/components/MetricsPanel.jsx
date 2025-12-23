import useReactorStore, { FUEL_TYPES } from '../store/reactorStore';

export default function MetricsPanel() {
  const {
    power,
    temperature,
    pressure,
    radiation,
    fuelRemaining,
    xenonLevel,
    containmentIntegrity,
    fuelType,
    runtime,
    maxTempReached,
    maxPowerReached,
  } = useReactorStore();

  const fuel = FUEL_TYPES[fuelType];
  const meltdownTemp = fuel.meltdownTemp;

  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    return `${hours.toString().padStart(2, '0')}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  const getMetricClass = (value, warningThreshold, dangerThreshold) => {
    if (value >= dangerThreshold) return 'danger';
    if (value >= warningThreshold) return 'warning';
    return '';
  };

  const metrics = [
    {
      label: 'Power Output',
      value: power.toFixed(1),
      unit: '%',
      className: getMetricClass(power, 80, 120),
    },
    {
      label: 'Temperature',
      value: temperature.toFixed(0),
      unit: '°C',
      className: getMetricClass(
        temperature,
        meltdownTemp * 0.5,
        meltdownTemp * 0.8
      ),
    },
    {
      label: 'Pressure',
      value: pressure.toFixed(1),
      unit: 'atm',
      className: getMetricClass(pressure, 10, 20),
    },
    {
      label: 'Radiation',
      value: radiation.toFixed(0),
      unit: 'mSv/h',
      className: getMetricClass(radiation, 500, 1000),
    },
    {
      label: 'Fuel Remaining',
      value: fuelRemaining.toFixed(1),
      unit: '%',
      className: getMetricClass(100 - fuelRemaining, 70, 90),
    },
    {
      label: 'Xenon Level',
      value: xenonLevel.toFixed(1),
      unit: '%',
      className: getMetricClass(xenonLevel, 50, 80),
    },
    {
      label: 'Containment',
      value: containmentIntegrity.toFixed(0),
      unit: '%',
      className: getMetricClass(100 - containmentIntegrity, 30, 70),
    },
    {
      label: 'Runtime',
      value: formatTime(runtime),
      unit: '',
      className: '',
    },
  ];

  return (
    <div className="panel">
      <div className="panel-header">
        <span>System Metrics</span>
      </div>
      <div className="panel-content">
        <div className="metrics-grid">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className={`metric-card ${metric.className}`}
            >
              <div className="metric-label">{metric.label}</div>
              <div className={`metric-value ${metric.className}`}>
                {metric.value}
                <span className="metric-unit">{metric.unit}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div style={{ marginTop: '20px' }}>
          <div
            style={{
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: 'var(--text-secondary)',
              marginBottom: '10px',
            }}
          >
            Session Records
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px',
            }}
          >
            <div
              style={{
                background: 'var(--bg-panel-light)',
                padding: '10px',
                borderRadius: '4px',
              }}
            >
              <div
                style={{
                  fontSize: '10px',
                  color: 'var(--text-dim)',
                  marginBottom: '4px',
                }}
              >
                Max Temperature
              </div>
              <div
                style={{
                  fontFamily: 'Orbitron',
                  fontSize: '16px',
                  color:
                    maxTempReached > meltdownTemp * 0.8
                      ? 'var(--danger)'
                      : 'var(--text-primary)',
                }}
              >
                {maxTempReached.toFixed(0)}°C
              </div>
            </div>
            <div
              style={{
                background: 'var(--bg-panel-light)',
                padding: '10px',
                borderRadius: '4px',
              }}
            >
              <div
                style={{
                  fontSize: '10px',
                  color: 'var(--text-dim)',
                  marginBottom: '4px',
                }}
              >
                Max Power
              </div>
              <div
                style={{
                  fontFamily: 'Orbitron',
                  fontSize: '16px',
                  color:
                    maxPowerReached > 100
                      ? 'var(--warning)'
                      : 'var(--text-primary)',
                }}
              >
                {maxPowerReached.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>

        {/* Danger Indicators */}
        {(temperature > meltdownTemp * 0.7 ||
          pressure > 15 ||
          containmentIntegrity < 50) && (
          <div
            style={{
              marginTop: '20px',
              padding: '15px',
              background: 'rgba(255, 0, 51, 0.1)',
              border: '1px solid var(--danger)',
              borderRadius: '6px',
            }}
          >
            <div
              style={{
                fontFamily: 'Orbitron',
                fontSize: '12px',
                fontWeight: '700',
                color: 'var(--danger)',
                marginBottom: '8px',
                animation: 'blink 0.5s infinite',
              }}
            >
              CRITICAL CONDITIONS
            </div>
            <ul style={{ fontSize: '11px', paddingLeft: '15px' }}>
              {temperature > meltdownTemp * 0.7 && (
                <li style={{ color: 'var(--danger)' }}>
                  Core temperature approaching meltdown threshold
                </li>
              )}
              {pressure > 15 && (
                <li style={{ color: 'var(--danger)' }}>
                  Pressure exceeding safe limits
                </li>
              )}
              {containmentIntegrity < 50 && (
                <li style={{ color: 'var(--danger)' }}>
                  Containment integrity compromised
                </li>
              )}
            </ul>
          </div>
        )}
      </div>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
