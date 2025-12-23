import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import useReactorStore, { WEATHER_TYPES } from '../store/reactorStore';

// Radiation plume particles for atmosphere view
function RadiationCloud({ windDirection, windSpeed, radiation, airContamination, isActive }) {
  const groupRef = useRef();
  const particlesRef = useRef([]);

  const particles = useMemo(() => {
    return Array.from({ length: 200 }, (_, i) => ({
      id: i,
      offset: Math.random() * Math.PI * 2,
      speed: 0.5 + Math.random() * 1,
      height: 2 + Math.random() * 8,
      distance: 1 + Math.random() * 10,
      size: 0.2 + Math.random() * 0.5,
    }));
  }, []);

  useFrame((state) => {
    if (!groupRef.current || !isActive) return;

    const windRad = (windDirection * Math.PI) / 180;
    const time = state.clock.elapsedTime;

    particlesRef.current.forEach((mesh, i) => {
      if (!mesh) return;
      const p = particles[i];

      // Calculate position based on wind
      const baseX = Math.cos(windRad) * p.distance * (1 + time * p.speed * windSpeed * 0.02);
      const baseZ = Math.sin(windRad) * p.distance * (1 + time * p.speed * windSpeed * 0.02);

      // Add turbulence
      const turbX = Math.sin(time * p.speed + p.offset) * 0.5;
      const turbZ = Math.cos(time * p.speed + p.offset) * 0.5;
      const turbY = Math.sin(time * 0.5 + p.offset) * 0.3;

      mesh.position.x = baseX + turbX;
      mesh.position.z = baseZ + turbZ;
      mesh.position.y = p.height + turbY;

      // Reset if too far
      if (mesh.position.length() > 15) {
        mesh.position.set(0, p.height, 0);
      }

      // Scale based on contamination
      const scale = p.size * (1 + airContamination / 100);
      mesh.scale.setScalar(scale);
    });
  });

  if (!isActive || radiation < 50) return null;

  const intensity = Math.min(1, airContamination / 50);

  return (
    <group ref={groupRef}>
      {particles.map((p, i) => (
        <mesh
          key={p.id}
          ref={(el) => (particlesRef.current[i] = el)}
          position={[0, p.height, 0]}
        >
          <sphereGeometry args={[p.size, 8, 8]} />
          <meshBasicMaterial
            color={new THREE.Color().lerpColors(
              new THREE.Color('#ffcc00'),
              new THREE.Color('#ff2200'),
              intensity
            )}
            transparent
            opacity={0.3 + intensity * 0.3}
          />
        </mesh>
      ))}
    </group>
  );
}

// Atmospheric layers
function AtmosphereLayers() {
  return (
    <group>
      {/* Troposphere visualization */}
      <mesh position={[0, 6, 0]}>
        <cylinderGeometry args={[15, 10, 12, 32, 1, true]} />
        <meshBasicMaterial
          color="#334466"
          transparent
          opacity={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Stratosphere */}
      <mesh position={[0, 15, 0]}>
        <cylinderGeometry args={[18, 15, 6, 32, 1, true]} />
        <meshBasicMaterial
          color="#223355"
          transparent
          opacity={0.05}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

// Wind flow visualization
function WindFlow({ direction, speed }) {
  const flowRef = useRef();
  const arrowCount = 20;

  const arrows = useMemo(() => {
    return Array.from({ length: arrowCount }, (_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 16,
      y: 1 + Math.random() * 8,
      z: (Math.random() - 0.5) * 16,
      phase: Math.random() * Math.PI * 2,
    }));
  }, []);

  useFrame((state) => {
    if (!flowRef.current) return;
    flowRef.current.rotation.y = -(direction * Math.PI) / 180;
  });

  return (
    <group ref={flowRef}>
      {arrows.map((arrow) => (
        <group key={arrow.id} position={[arrow.x, arrow.y, arrow.z]}>
          <mesh rotation={[0, 0, -Math.PI / 2]}>
            <coneGeometry args={[0.1, 0.3, 4]} />
            <meshBasicMaterial color="#00aaff" transparent opacity={0.5} />
          </mesh>
          <mesh position={[-0.3, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.02, 0.02, 0.4]} />
            <meshBasicMaterial color="#00aaff" transparent opacity={0.3} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// Weather effects
function WeatherEffects({ weather }) {
  const rainRef = useRef();
  const raindrops = useMemo(() => {
    return Array.from({ length: 100 }, () => ({
      x: (Math.random() - 0.5) * 20,
      y: Math.random() * 15,
      z: (Math.random() - 0.5) * 20,
      speed: 0.2 + Math.random() * 0.3,
    }));
  }, []);

  useFrame((state, delta) => {
    if (weather !== 'rain' && weather !== 'storm') return;
    if (!rainRef.current) return;

    const positions = rainRef.current.geometry.attributes.position.array;
    for (let i = 0; i < raindrops.length; i++) {
      positions[i * 3 + 1] -= raindrops[i].speed;
      if (positions[i * 3 + 1] < 0) {
        positions[i * 3 + 1] = 15;
      }
    }
    rainRef.current.geometry.attributes.position.needsUpdate = true;
  });

  if (weather !== 'rain' && weather !== 'storm') return null;

  const positions = new Float32Array(raindrops.length * 3);
  raindrops.forEach((drop, i) => {
    positions[i * 3] = drop.x;
    positions[i * 3 + 1] = drop.y;
    positions[i * 3 + 2] = drop.z;
  });

  return (
    <points ref={rainRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={raindrops.length}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        color="#aaccff"
        transparent
        opacity={0.6}
      />
    </points>
  );
}

// Ground reference with reactor
function GroundLevel({ containmentBreach }) {
  return (
    <group>
      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#2a3c2a" />
      </mesh>

      {/* Reactor */}
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[1, 1.2, 2, 16]} />
        <meshStandardMaterial
          color={containmentBreach ? '#882222' : '#555566'}
          emissive={containmentBreach ? '#ff2200' : '#000000'}
          emissiveIntensity={containmentBreach ? 0.5 : 0}
        />
      </mesh>

      {/* Smoke stack emission point */}
      {containmentBreach && (
        <mesh position={[0, 2.5, 0]}>
          <sphereGeometry args={[0.5, 8, 8]} />
          <meshBasicMaterial color="#ff4400" transparent opacity={0.6} />
        </mesh>
      )}
    </group>
  );
}

// Scene
function Scene() {
  const {
    windDirection,
    windSpeed,
    radiation,
    airContamination,
    weather,
    isContainmentBreach,
    isMeltdown,
    isNight,
  } = useReactorStore();

  const weatherData = WEATHER_TYPES[weather] || WEATHER_TYPES.clear;

  return (
    <>
      <OrbitControls
        enablePan
        enableZoom
        enableRotate
        minDistance={5}
        maxDistance={40}
        maxPolarAngle={Math.PI / 2.5}
        target={[0, 5, 0]}
      />

      {/* Lighting */}
      <ambientLight intensity={isNight ? 0.2 : 0.4} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={isNight ? 0.3 : 0.8}
        color={isNight ? '#6677aa' : '#ffffff'}
      />

      {/* Sky */}
      <color
        attach="background"
        args={[
          isNight ? '#0a0a2a' :
          weather === 'storm' ? '#2a2a4a' :
          weather === 'cloudy' ? '#4a5a6a' :
          '#3a5a8a'
        ]}
      />

      {/* Fog */}
      <fog
        attach="fog"
        color={weather === 'fog' ? '#8899aa' : '#1a2a3a'}
        near={weather === 'fog' ? 5 : 15}
        far={weather === 'fog' ? 20 : 50}
      />

      {/* Ground */}
      <GroundLevel containmentBreach={isContainmentBreach || isMeltdown} />

      {/* Atmosphere layers */}
      <AtmosphereLayers />

      {/* Wind visualization */}
      <WindFlow direction={windDirection} speed={windSpeed} />

      {/* Radiation plume */}
      <RadiationCloud
        windDirection={windDirection}
        windSpeed={windSpeed}
        radiation={radiation}
        airContamination={airContamination}
        isActive={isContainmentBreach || isMeltdown}
      />

      {/* Weather effects */}
      <WeatherEffects weather={weather} />

      {/* Labels */}
      <Html position={[0, 12, 0]} center>
        <div style={{
          background: 'rgba(0,0,0,0.7)',
          padding: '4px 8px',
          borderRadius: '4px',
          color: '#aabbcc',
          fontSize: '10px',
          fontFamily: 'monospace',
        }}>
          Troposphere
        </div>
      </Html>

      <Html position={[8, 2, 8]} center>
        <div style={{
          background: 'rgba(0,0,0,0.8)',
          padding: '6px 10px',
          borderRadius: '4px',
          color: '#fff',
          fontSize: '12px',
        }}>
          {weatherData.icon} {weatherData.name}
        </div>
      </Html>
    </>
  );
}

export default function AtmosphereView() {
  const {
    windDirection,
    windSpeed,
    airContamination,
    radiation,
    weather,
    isContainmentBreach,
    isMeltdown,
    totalPopulationExposed,
  } = useReactorStore();

  const weatherData = WEATHER_TYPES[weather] || WEATHER_TYPES.clear;

  // Calculate plume reach
  const plumeReach = useMemo(() => {
    if (!isContainmentBreach && !isMeltdown) return 0;
    return Math.min(50, (radiation * windSpeed * weatherData.spreadRate) / 100);
  }, [radiation, windSpeed, weatherData.spreadRate, isContainmentBreach, isMeltdown]);

  return (
    <div className="atmosphere-view">
      <div className="view-header">
        <h3>Atmospheric Dispersion</h3>
      </div>

      <div className="canvas-container">
        <Canvas camera={{ position: [15, 10, 15], fov: 50 }}>
          <Scene />
        </Canvas>
      </div>

      <div className="atmosphere-stats">
        <div className="stat-row">
          <div className="stat-box">
            <span className="stat-label">Air Contamination</span>
            <div className="stat-meter">
              <div
                className="meter-fill"
                style={{
                  width: `${airContamination}%`,
                  background: airContamination > 50 ? '#ff4400' : airContamination > 20 ? '#ffaa00' : '#00ff00',
                }}
              />
            </div>
            <span className="stat-value">{airContamination.toFixed(1)}%</span>
          </div>

          <div className="stat-box">
            <span className="stat-label">Wind</span>
            <span className="stat-value">
              {getDirectionName(windDirection)} @ {windSpeed.toFixed(0)} m/s
            </span>
          </div>

          <div className="stat-box">
            <span className="stat-label">Plume Reach</span>
            <span className="stat-value">{plumeReach.toFixed(1)} km</span>
          </div>

          <div className="stat-box">
            <span className="stat-label">Spread Rate</span>
            <span className="stat-value">{weatherData.spreadRate.toFixed(1)}x</span>
          </div>
        </div>

        {(isContainmentBreach || isMeltdown) && (
          <div className="plume-warning">
            <div className="warning-header">
              <span className="warning-icon">☢️</span>
              <span>RADIOACTIVE PLUME ACTIVE</span>
            </div>
            <div className="warning-details">
              <p>
                Radiation is being dispersed into the atmosphere.
                Wind is carrying contamination {getDirectionName(windDirection)} at {windSpeed.toFixed(0)} m/s.
              </p>
              <p>
                Estimated {totalPopulationExposed.toLocaleString()} people in affected area.
              </p>
            </div>
          </div>
        )}

        <div className="weather-impact">
          <h4>Weather Impact on Dispersion</h4>
          <div className="impact-grid">
            <div className="impact-item">
              <span className="impact-label">Rain</span>
              <span className="impact-value">Increases fallout, deposits contamination on ground</span>
            </div>
            <div className="impact-item">
              <span className="impact-label">Storm</span>
              <span className="impact-value">High winds spread plume faster and further</span>
            </div>
            <div className="impact-item">
              <span className="impact-label">Fog</span>
              <span className="impact-value">Traps contamination, slower dispersion</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getDirectionName(deg) {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(deg / 45) % 8;
  return directions[index];
}
