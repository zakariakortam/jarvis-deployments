import { useEffect, useRef, Component, useState } from 'react';
import useReactorStore from './store/reactorStore';
import ControlPanel from './components/ControlPanel';
import ReactorCore from './components/ReactorCore';
import MetricsPanel from './components/MetricsPanel';
import EventsLog from './components/EventsLog';
import AchievementsPanel from './components/AchievementsPanel';
import DisasterOverlay from './components/DisasterOverlay';
import EnvironmentMap from './components/EnvironmentMap';
import EnvironmentStats from './components/EnvironmentStats';
import WeatherControls from './components/WeatherControls';
import UndergroundView from './components/UndergroundView';
import AtmosphereView from './components/AtmosphereView';
import ChaosPanel from './components/ChaosPanel';
import './styles/index.css';

// Error Boundary
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-screen">
          <div className="error-content">
            <div className="error-icon">☢️</div>
            <h2>Reactor Malfunction</h2>
            <p>An unexpected error occurred in the control systems.</p>
            <pre className="error-message">
              {this.state.error?.message || 'Unknown error'}
            </pre>
            <button onClick={() => window.location.reload()} className="restart-btn">
              Restart Systems
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Navigation tabs
const TABS = [
  { id: 'control', label: 'Control Room', icon: '🎛️' },
  { id: 'environment', label: 'Environment Map', icon: '🗺️' },
  { id: 'atmosphere', label: 'Atmosphere', icon: '🌫️' },
  { id: 'underground', label: 'Groundwater', icon: '💧' },
  { id: 'chaos', label: 'Chaos Lab', icon: '☢️' },
];

function ReactorSimulator() {
  const {
    tick,
    isRunning,
    isMeltdown,
    isExplosion,
    isContainmentBreach,
    isChinaSyndrome,
    currentView,
    setView,
    reset,
  } = useReactorStore();

  const lastTimeRef = useRef(Date.now());
  const frameRef = useRef(null);

  // Game loop
  useEffect(() => {
    const gameLoop = () => {
      const now = Date.now();
      const deltaTime = now - lastTimeRef.current;
      lastTimeRef.current = now;

      tick(deltaTime);

      frameRef.current = requestAnimationFrame(gameLoop);
    };

    frameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [tick]);

  const getAppClass = () => {
    let classes = ['app'];
    if (isMeltdown && !isExplosion) classes.push('meltdown');
    if (isExplosion) classes.push('explosion');
    if (isChinaSyndrome) classes.push('china-syndrome');
    return classes.join(' ');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'environment':
        return (
          <div className="view-layout environment-layout">
            <div className="view-main">
              <EnvironmentMap />
            </div>
            <div className="view-sidebar">
              <EnvironmentStats />
              <WeatherControls />
            </div>
          </div>
        );

      case 'atmosphere':
        return (
          <div className="view-layout atmosphere-layout">
            <div className="view-main">
              <AtmosphereView />
            </div>
            <div className="view-sidebar">
              <WeatherControls />
              <EventsLog />
            </div>
          </div>
        );

      case 'underground':
        return (
          <div className="view-layout underground-layout">
            <div className="view-main">
              <UndergroundView />
            </div>
            <div className="view-sidebar">
              <EnvironmentStats />
              <EventsLog />
            </div>
          </div>
        );

      case 'chaos':
        return (
          <div className="view-layout chaos-layout">
            <div className="view-main">
              <ChaosPanel />
            </div>
            <div className="view-sidebar">
              <ReactorCore />
              <MetricsPanel />
              <AchievementsPanel />
            </div>
          </div>
        );

      case 'control':
      default:
        return (
          <div className="main-content control-layout">
            <div className="column left-column">
              <ControlPanel />
            </div>
            <div className="column center-column">
              <ReactorCore />
              <MetricsPanel />
            </div>
            <div className="column right-column">
              <EventsLog />
              <AchievementsPanel />
            </div>
          </div>
        );
    }
  };

  return (
    <div className={getAppClass()}>
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <div className="header-title">
            <span className="icon">☢️</span>
            <span>NUCLEAR REACTOR SIMULATOR</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="header-nav">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`nav-tab ${currentView === tab.id ? 'active' : ''}`}
              onClick={() => setView(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="header-right">
          <div className="status-indicator">
            <span
              className={`status-dot ${
                isExplosion
                  ? 'critical'
                  : isMeltdown
                    ? 'danger'
                    : isRunning
                      ? 'running'
                      : ''
              }`}
            />
            <span>
              {isExplosion
                ? 'EXPLODED'
                : isMeltdown
                  ? 'MELTDOWN'
                  : isRunning
                    ? 'ONLINE'
                    : 'OFFLINE'}
            </span>
          </div>

          {isContainmentBreach && (
            <div className="status-indicator breach">
              <span className="status-dot critical" />
              <span>BREACH</span>
            </div>
          )}

          {isChinaSyndrome && (
            <div className="status-indicator china">
              <span className="status-dot critical" />
              <span>CHINA</span>
            </div>
          )}

          <button className="reset-btn" onClick={reset}>
            Reset
          </button>
        </div>
      </header>

      {/* Warning Banner */}
      {(isMeltdown || isExplosion || isContainmentBreach) && (
        <div className="warning-banner">
          <span className="warning-icon">⚠️</span>
          <span className="warning-text">
            EMERGENCY ALERT: {' '}
            {isExplosion ? 'REACTOR EXPLOSION' : isMeltdown ? 'CORE MELTDOWN' : ''}{' '}
            {isContainmentBreach ? '- CONTAINMENT BREACH' : ''}{' '}
            {isChinaSyndrome ? '- CHINA SYNDROME' : ''}{' '}
            - EVACUATE IMMEDIATELY
          </span>
          <span className="warning-icon">⚠️</span>
        </div>
      )}

      {/* Main Content */}
      <main className="main-container">
        {renderContent()}
      </main>

      {/* Disaster Overlay */}
      <DisasterOverlay />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ReactorSimulator />
    </ErrorBoundary>
  );
}
