import useReactorStore, { WEATHER_TYPES } from '../store/reactorStore';

export default function EnvironmentStats() {
  const {
    weather,
    windDirection,
    windSpeed,
    timeOfDay,
    isNight,
    airContamination,
    groundContamination,
    waterContamination,
    totalPopulationExposed,
    totalEvacuated,
    lethalExposures,
    neighborhood,
    isMeltdown,
    isContainmentBreach,
    isChinaSyndrome,
  } = useReactorStore();

  const weatherData = WEATHER_TYPES[weather] || WEATHER_TYPES.clear;

  // Calculate neighborhood statistics
  const stats = {
    totalCells: 0,
    contaminatedCells: 0,
    evacuatedCells: 0,
    totalPopulation: 0,
    remainingPopulation: 0,
    maxRadiation: 0,
    avgRadiation: 0,
  };

  let totalRad = 0;
  neighborhood.forEach(row => {
    row.forEach(cell => {
      if (cell.type !== 'reactor' && cell.type !== 'exclusion') {
        stats.totalCells++;
        if (cell.contaminated) stats.contaminatedCells++;
        if (cell.evacuated) stats.evacuatedCells++;
        if (cell.population) {
          stats.totalPopulation += cell.population;
          if (!cell.evacuated) stats.remainingPopulation += cell.population;
        }
        if (cell.radiation > stats.maxRadiation) {
          stats.maxRadiation = cell.radiation;
        }
        totalRad += cell.radiation || 0;
      }
    });
  });
  stats.avgRadiation = totalRad / (stats.totalCells || 1);

  const getContaminationLevel = (value) => {
    if (value < 10) return { text: 'SAFE', color: '#00ff00' };
    if (value < 30) return { text: 'LOW', color: '#88ff00' };
    if (value < 50) return { text: 'MODERATE', color: '#ffcc00' };
    if (value < 75) return { text: 'HIGH', color: '#ff6600' };
    return { text: 'CRITICAL', color: '#ff0000' };
  };

  const airLevel = getContaminationLevel(airContamination);
  const groundLevel = getContaminationLevel(groundContamination);
  const waterLevel = getContaminationLevel(waterContamination);

  const getWindDirectionName = (deg) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(deg / 45) % 8;
    return directions[index];
  };

  const formatTime = (hour) => {
    const h = Math.floor(hour);
    const m = Math.floor((hour % 1) * 60);
    const period = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 || 12;
    return `${displayHour}:${m.toString().padStart(2, '0')} ${period}`;
  };

  return (
    <div className="panel environment-stats">
      <h3>Environment Status</h3>

      {/* Weather & Time */}
      <div className="stats-section">
        <h4>Conditions</h4>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-icon">{weatherData.icon}</span>
            <div className="stat-info">
              <span className="stat-label">Weather</span>
              <span className="stat-value">{weatherData.name}</span>
            </div>
          </div>
          <div className="stat-item">
            <span className="stat-icon">{isNight ? '🌙' : '☀️'}</span>
            <div className="stat-info">
              <span className="stat-label">Time</span>
              <span className="stat-value">{formatTime(timeOfDay)}</span>
            </div>
          </div>
          <div className="stat-item">
            <span className="stat-icon">🧭</span>
            <div className="stat-info">
              <span className="stat-label">Wind</span>
              <span className="stat-value">
                {getWindDirectionName(windDirection)} @ {windSpeed.toFixed(1)} m/s
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Contamination Levels */}
      <div className="stats-section">
        <h4>Contamination</h4>
        <div className="contamination-meters">
          <div className="meter">
            <div className="meter-header">
              <span>🌫️ Air</span>
              <span style={{ color: airLevel.color }}>{airLevel.text}</span>
            </div>
            <div className="meter-bar">
              <div
                className="meter-fill"
                style={{
                  width: `${airContamination}%`,
                  background: `linear-gradient(90deg, #00ff00, ${airLevel.color})`,
                }}
              />
            </div>
            <span className="meter-value">{airContamination.toFixed(1)}%</span>
          </div>

          <div className="meter">
            <div className="meter-header">
              <span>🌍 Ground</span>
              <span style={{ color: groundLevel.color }}>{groundLevel.text}</span>
            </div>
            <div className="meter-bar">
              <div
                className="meter-fill"
                style={{
                  width: `${groundContamination}%`,
                  background: `linear-gradient(90deg, #00ff00, ${groundLevel.color})`,
                }}
              />
            </div>
            <span className="meter-value">{groundContamination.toFixed(1)}%</span>
          </div>

          <div className="meter">
            <div className="meter-header">
              <span>💧 Water</span>
              <span style={{ color: waterLevel.color }}>{waterLevel.text}</span>
            </div>
            <div className="meter-bar">
              <div
                className="meter-fill"
                style={{
                  width: `${waterContamination}%`,
                  background: `linear-gradient(90deg, #00ff00, ${waterLevel.color})`,
                }}
              />
            </div>
            <span className="meter-value">{waterContamination.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* Radiation Spread */}
      <div className="stats-section">
        <h4>Radiation Spread</h4>
        <div className="radiation-stats">
          <div className="rad-stat">
            <span className="rad-label">Contaminated Area</span>
            <span className="rad-value">
              {((stats.contaminatedCells / stats.totalCells) * 100).toFixed(1)}%
            </span>
          </div>
          <div className="rad-stat">
            <span className="rad-label">Max Reading</span>
            <span className="rad-value" style={{
              color: stats.maxRadiation > 1000 ? '#ff0000' : stats.maxRadiation > 100 ? '#ff6600' : '#00ff00'
            }}>
              {stats.maxRadiation.toFixed(0)} mSv/h
            </span>
          </div>
          <div className="rad-stat">
            <span className="rad-label">Average Reading</span>
            <span className="rad-value">
              {stats.avgRadiation.toFixed(1)} mSv/h
            </span>
          </div>
        </div>
      </div>

      {/* Population Impact */}
      <div className="stats-section">
        <h4>Population Impact</h4>
        <div className="population-grid">
          <div className="pop-stat">
            <span className="pop-icon">👥</span>
            <div className="pop-info">
              <span className="pop-value">{stats.totalPopulation.toLocaleString()}</span>
              <span className="pop-label">Total Population</span>
            </div>
          </div>
          <div className="pop-stat warning">
            <span className="pop-icon">☢️</span>
            <div className="pop-info">
              <span className="pop-value">{totalPopulationExposed.toLocaleString()}</span>
              <span className="pop-label">Exposed</span>
            </div>
          </div>
          <div className="pop-stat">
            <span className="pop-icon">🚗</span>
            <div className="pop-info">
              <span className="pop-value">{totalEvacuated.toLocaleString()}</span>
              <span className="pop-label">Evacuated</span>
            </div>
          </div>
          <div className="pop-stat danger">
            <span className="pop-icon">💀</span>
            <div className="pop-info">
              <span className="pop-value">{lethalExposures.toLocaleString()}</span>
              <span className="pop-label">Lethal Dose</span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Disasters */}
      {(isMeltdown || isContainmentBreach || isChinaSyndrome) && (
        <div className="stats-section disasters">
          <h4>Active Disasters</h4>
          <div className="disaster-list">
            {isMeltdown && (
              <div className="disaster-item">
                <span className="disaster-icon">🔥</span>
                <span>Core Meltdown</span>
              </div>
            )}
            {isContainmentBreach && (
              <div className="disaster-item">
                <span className="disaster-icon">☢️</span>
                <span>Containment Breach</span>
              </div>
            )}
            {isChinaSyndrome && (
              <div className="disaster-item">
                <span className="disaster-icon">🌏</span>
                <span>China Syndrome</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
