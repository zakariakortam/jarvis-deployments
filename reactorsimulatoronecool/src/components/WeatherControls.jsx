import useReactorStore, { WEATHER_TYPES } from '../store/reactorStore';

export default function WeatherControls() {
  const {
    weather,
    windDirection,
    windSpeed,
    timeOfDay,
    setWeather,
    setWindDirection,
    setWindSpeed,
    setTimeOfDay,
  } = useReactorStore();

  const weatherOptions = Object.entries(WEATHER_TYPES).map(([key, data]) => ({
    id: key,
    ...data,
  }));

  return (
    <div className="panel weather-controls">
      <h3>Weather & Environment</h3>

      {/* Weather Selection */}
      <div className="control-section">
        <label>Weather Conditions</label>
        <div className="weather-grid">
          {weatherOptions.map((w) => (
            <button
              key={w.id}
              className={`weather-btn ${weather === w.id ? 'active' : ''}`}
              onClick={() => setWeather(w.id)}
              title={w.name}
            >
              <span className="weather-icon">{w.icon}</span>
              <span className="weather-name">{w.name}</span>
            </button>
          ))}
        </div>
        <p className="control-hint">
          Weather affects radiation spread rate and wind patterns
        </p>
      </div>

      {/* Wind Direction */}
      <div className="control-section">
        <label>Wind Direction: {windDirection}°</label>
        <div className="wind-compass">
          <div className="compass-ring">
            <div
              className="compass-arrow"
              style={{ transform: `rotate(${windDirection}deg)` }}
            />
            <span className="compass-label n">N</span>
            <span className="compass-label e">E</span>
            <span className="compass-label s">S</span>
            <span className="compass-label w">W</span>
          </div>
        </div>
        <input
          type="range"
          min="0"
          max="359"
          step="15"
          value={windDirection}
          onChange={(e) => setWindDirection(Number(e.target.value))}
          className="slider"
        />
        <div className="wind-presets">
          <button onClick={() => setWindDirection(0)}>N</button>
          <button onClick={() => setWindDirection(90)}>E</button>
          <button onClick={() => setWindDirection(180)}>S</button>
          <button onClick={() => setWindDirection(270)}>W</button>
        </div>
      </div>

      {/* Wind Speed */}
      <div className="control-section">
        <label>Wind Speed: {windSpeed.toFixed(1)} m/s</label>
        <input
          type="range"
          min="0"
          max="50"
          step="1"
          value={windSpeed}
          onChange={(e) => setWindSpeed(Number(e.target.value))}
          className="slider"
        />
        <div className="speed-indicator">
          <span className={windSpeed < 5 ? 'active' : ''}>Calm</span>
          <span className={windSpeed >= 5 && windSpeed < 15 ? 'active' : ''}>Breeze</span>
          <span className={windSpeed >= 15 && windSpeed < 30 ? 'active' : ''}>Strong</span>
          <span className={windSpeed >= 30 ? 'active' : ''}>Gale</span>
        </div>
        <p className="control-hint">
          Higher wind speeds spread radiation plume further downwind
        </p>
      </div>

      {/* Time of Day */}
      <div className="control-section">
        <label>Time of Day: {formatTime(timeOfDay)}</label>
        <div className="time-visual">
          <div className="sky-gradient" style={{
            background: getSkyGradient(timeOfDay),
          }}>
            <div
              className="sun-moon"
              style={{
                left: `${(timeOfDay / 24) * 100}%`,
                bottom: `${getSunPosition(timeOfDay)}%`,
              }}
            >
              {timeOfDay >= 6 && timeOfDay <= 20 ? '☀️' : '🌙'}
            </div>
          </div>
        </div>
        <input
          type="range"
          min="0"
          max="24"
          step="0.5"
          value={timeOfDay}
          onChange={(e) => setTimeOfDay(Number(e.target.value))}
          className="slider"
        />
        <div className="time-presets">
          <button onClick={() => setTimeOfDay(6)}>🌅 Dawn</button>
          <button onClick={() => setTimeOfDay(12)}>☀️ Noon</button>
          <button onClick={() => setTimeOfDay(18)}>🌆 Dusk</button>
          <button onClick={() => setTimeOfDay(0)}>🌙 Night</button>
        </div>
        <p className="control-hint">
          Night disasters are extra terrifying! Affects visibility in 3D view.
        </p>
      </div>

      {/* Quick Presets */}
      <div className="control-section">
        <label>Scenario Presets</label>
        <div className="scenario-grid">
          <button
            className="scenario-btn"
            onClick={() => {
              setWeather('storm');
              setWindSpeed(30);
              setTimeOfDay(3);
            }}
          >
            <span>🌪️</span>
            <span>Perfect Storm</span>
          </button>
          <button
            className="scenario-btn"
            onClick={() => {
              setWeather('clear');
              setWindSpeed(5);
              setTimeOfDay(12);
            }}
          >
            <span>🌞</span>
            <span>Clear Day</span>
          </button>
          <button
            className="scenario-btn"
            onClick={() => {
              setWeather('rain');
              setWindSpeed(10);
              setTimeOfDay(15);
            }}
          >
            <span>🌧️</span>
            <span>Rainy Fallout</span>
          </button>
          <button
            className="scenario-btn"
            onClick={() => {
              setWeather('fog');
              setWindSpeed(2);
              setTimeOfDay(6);
            }}
          >
            <span>🌫️</span>
            <span>Silent Fog</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function formatTime(hour) {
  const h = Math.floor(hour);
  const m = Math.floor((hour % 1) * 60);
  const period = h >= 12 ? 'PM' : 'AM';
  const displayHour = h % 12 || 12;
  return `${displayHour}:${m.toString().padStart(2, '0')} ${period}`;
}

function getSkyGradient(hour) {
  if (hour < 5 || hour > 21) {
    return 'linear-gradient(180deg, #0a0a2e 0%, #1a1a3e 100%)';
  }
  if (hour < 7) {
    return 'linear-gradient(180deg, #1a1a3e 0%, #ff6b6b 50%, #ffd93d 100%)';
  }
  if (hour < 10) {
    return 'linear-gradient(180deg, #87ceeb 0%, #ffe4b5 100%)';
  }
  if (hour < 16) {
    return 'linear-gradient(180deg, #4a90d9 0%, #87ceeb 100%)';
  }
  if (hour < 19) {
    return 'linear-gradient(180deg, #87ceeb 0%, #ff6b6b 50%, #ffd93d 100%)';
  }
  return 'linear-gradient(180deg, #ff6b6b 0%, #1a1a3e 100%)';
}

function getSunPosition(hour) {
  // Peak at noon (50%), low at sunrise/sunset
  const normalized = Math.abs(hour - 12) / 12;
  return Math.max(10, 50 - normalized * 40);
}
