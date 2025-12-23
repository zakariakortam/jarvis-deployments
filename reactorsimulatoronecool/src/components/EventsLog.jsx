import { useEffect, useRef } from 'react';
import useReactorStore from '../store/reactorStore';

export default function EventsLog() {
  const { events, ignoreWarning, warningsIgnored } = useReactorStore();
  const logRef = useRef(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [events]);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const warningCount = events.filter(
    (e) => e.type === 'warning' || e.type === 'danger'
  ).length;

  return (
    <div className="panel">
      <div className="panel-header">
        <span>Events Log</span>
        <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
          {events.length} events
        </span>
      </div>
      <div className="panel-content">
        <div className="events-log" ref={logRef}>
          {events.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                color: 'var(--text-dim)',
                padding: '20px',
              }}
            >
              No events yet. Start the reactor!
            </div>
          ) : (
            events.map((event, index) => (
              <div key={index} className={`event-item ${event.type}`}>
                <span className="event-time">{formatTime(event.time)}</span>
                <span className="event-message">{event.message}</span>
              </div>
            ))
          )}
        </div>

        {warningCount > 0 && (
          <div style={{ marginTop: '15px' }}>
            <button
              className="btn btn-danger btn-full btn-small"
              onClick={ignoreWarning}
            >
              Ignore Warning ({warningsIgnored}/10 for achievement)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
