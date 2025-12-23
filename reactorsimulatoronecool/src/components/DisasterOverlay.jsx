import useReactorStore from '../store/reactorStore';

export default function DisasterOverlay() {
  const { isMeltdown, isExplosion, isContainmentBreach, reset, runtime } =
    useReactorStore();

  if (!isMeltdown && !isExplosion && !isContainmentBreach) {
    return null;
  }

  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  return (
    <>
      {/* Meltdown overlay */}
      {isMeltdown && !isExplosion && (
        <div className="disaster-overlay meltdown-overlay">
          <div style={{ textAlign: 'center' }}>
            <div className="disaster-text">CORE MELTDOWN</div>
            <div
              style={{
                fontSize: '24px',
                marginTop: '10px',
                animation: 'disasterTextPulse 0.5s infinite',
              }}
            >
              ☢️ ☢️ ☢️
            </div>
          </div>
        </div>
      )}

      {/* Explosion overlay */}
      {isExplosion && (
        <div className="disaster-overlay explosion-overlay">
          <div style={{ textAlign: 'center' }}>
            <div className="disaster-text">REACTOR EXPLOSION</div>
            <div
              style={{
                fontSize: '32px',
                marginTop: '10px',
              }}
            >
              💥 💥 💥
            </div>
          </div>
        </div>
      )}

      {/* Stats and reset overlay */}
      <div
        style={{
          position: 'fixed',
          bottom: '50px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1001,
          background: 'rgba(0, 0, 0, 0.9)',
          padding: '30px 50px',
          borderRadius: '10px',
          border: '2px solid var(--danger)',
          textAlign: 'center',
          pointerEvents: 'auto',
        }}
      >
        <div
          style={{
            fontFamily: 'Orbitron',
            fontSize: '18px',
            color: 'var(--text-primary)',
            marginBottom: '15px',
          }}
        >
          DISASTER REPORT
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '20px',
            marginBottom: '20px',
          }}
        >
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
              Time to Disaster
            </div>
            <div
              style={{
                fontFamily: 'Orbitron',
                fontSize: '24px',
                color: 'var(--warning)',
              }}
            >
              {formatTime(runtime)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
              Meltdown
            </div>
            <div style={{ fontSize: '24px' }}>{isMeltdown ? '✅' : '❌'}</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
              Explosion
            </div>
            <div style={{ fontSize: '24px' }}>{isExplosion ? '✅' : '❌'}</div>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            marginBottom: '20px',
          }}
        >
          {isContainmentBreach && (
            <div
              style={{
                padding: '8px 15px',
                background: 'rgba(255, 0, 68, 0.3)',
                border: '1px solid var(--critical)',
                borderRadius: '4px',
                fontSize: '12px',
                color: 'var(--critical)',
              }}
            >
              ☢️ CONTAINMENT BREACH - RADIATION RELEASE
            </div>
          )}
        </div>

        <button
          className="btn btn-start"
          onClick={reset}
          style={{
            padding: '15px 40px',
            fontSize: '14px',
          }}
        >
          Try Again
        </button>

        <div
          style={{
            marginTop: '15px',
            fontSize: '11px',
            color: 'var(--text-dim)',
          }}
        >
          Press to reset the reactor and try for more achievements!
        </div>
      </div>
    </>
  );
}
