import { useRef, useEffect, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import useReactorStore, { BUILDING_TYPES, WEATHER_TYPES } from '../store/reactorStore';

// Radiation particle system for plume visualization
function RadiationPlume({ windDirection, windSpeed, radiation, containmentBreach }) {
  const particlesRef = useRef();
  const particleCount = 500;

  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = 0;
      pos[i * 3 + 1] = 0;
      pos[i * 3 + 2] = 0;
    }
    return pos;
  }, []);

  const velocities = useRef(
    Array.from({ length: particleCount }, () => ({
      x: (Math.random() - 0.5) * 0.1,
      y: Math.random() * 0.05 + 0.02,
      z: (Math.random() - 0.5) * 0.1,
      life: Math.random(),
    }))
  );

  useFrame((state, delta) => {
    if (!particlesRef.current || !containmentBreach) return;

    const positions = particlesRef.current.geometry.attributes.position.array;
    const windRad = (windDirection * Math.PI) / 180;
    const windX = Math.cos(windRad) * windSpeed * 0.05;
    const windZ = Math.sin(windRad) * windSpeed * 0.05;

    for (let i = 0; i < particleCount; i++) {
      const vel = velocities.current[i];
      vel.life -= delta * 0.3;

      if (vel.life <= 0) {
        // Reset particle at reactor
        positions[i * 3] = (Math.random() - 0.5) * 0.5;
        positions[i * 3 + 1] = Math.random() * 0.2;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
        vel.life = Math.random();
        vel.x = (Math.random() - 0.5) * 0.1;
        vel.y = Math.random() * 0.05 + 0.02;
        vel.z = (Math.random() - 0.5) * 0.1;
      } else {
        // Move with wind
        positions[i * 3] += (vel.x + windX) * delta * 10;
        positions[i * 3 + 1] += vel.y * delta * 5;
        positions[i * 3 + 2] += (vel.z + windZ) * delta * 10;

        // Add turbulence
        positions[i * 3] += (Math.random() - 0.5) * 0.01;
        positions[i * 3 + 2] += (Math.random() - 0.5) * 0.01;
      }
    }

    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  if (!containmentBreach || radiation < 100) return null;

  const intensity = Math.min(1, radiation / 5000);

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        color={new THREE.Color(1, 1 - intensity, 0)}
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

// Building component
function Building({ type, x, z, radiation, contaminated, evacuated, population }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  const buildingConfig = BUILDING_TYPES[type] || { icon: '?', name: type };

  // Building height based on type
  const height = useMemo(() => {
    switch (type) {
      case 'apartment': return 1.5;
      case 'hospital': return 1.2;
      case 'school': return 0.8;
      case 'factory': return 1.0;
      case 'house': return 0.5;
      case 'farm': return 0.4;
      case 'park': return 0.2;
      case 'lake': return 0.05;
      default: return 0.5;
    }
  }, [type]);

  // Color based on contamination
  const color = useMemo(() => {
    if (evacuated) return '#444444';
    if (radiation > 1000) return '#ff0000';
    if (radiation > 500) return '#ff6600';
    if (radiation > 100) return '#ffcc00';
    if (contaminated) return '#ffff00';

    switch (type) {
      case 'lake': return '#0066cc';
      case 'park': return '#228b22';
      case 'farm': return '#8b7355';
      case 'hospital': return '#ffffff';
      case 'school': return '#ff9999';
      case 'factory': return '#666666';
      case 'apartment': return '#8888cc';
      case 'house': return '#cc9966';
      default: return '#888888';
    }
  }, [type, radiation, contaminated, evacuated]);

  // Glow for contaminated buildings
  useFrame((state) => {
    if (meshRef.current && contaminated && !evacuated) {
      meshRef.current.material.emissiveIntensity =
        0.3 + Math.sin(state.clock.elapsedTime * 3) * 0.2;
    }
  });

  if (type === 'reactor' || type === 'exclusion') return null;

  return (
    <group position={[x - 9.5, 0, z - 9.5]}>
      <mesh
        ref={meshRef}
        position={[0, height / 2, 0]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={[0.8, height, 0.8]} />
        <meshStandardMaterial
          color={color}
          emissive={contaminated ? '#ff4400' : '#000000'}
          emissiveIntensity={contaminated ? 0.3 : 0}
        />
      </mesh>

      {/* Radiation indicator */}
      {radiation > 50 && (
        <mesh position={[0, height + 0.3, 0]}>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshBasicMaterial
            color={radiation > 500 ? '#ff0000' : '#ffcc00'}
            transparent
            opacity={0.7}
          />
        </mesh>
      )}

      {/* Hover tooltip */}
      {hovered && (
        <Html position={[0, height + 0.5, 0]} center>
          <div style={{
            background: 'rgba(0,0,0,0.9)',
            padding: '8px 12px',
            borderRadius: '4px',
            border: '1px solid #333',
            whiteSpace: 'nowrap',
            fontSize: '11px',
            color: '#fff',
            fontFamily: 'monospace',
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
              {buildingConfig.icon} {buildingConfig.name}
            </div>
            <div>Population: {evacuated ? '0 (evacuated)' : population}</div>
            <div style={{ color: radiation > 100 ? '#ff6600' : '#00ff00' }}>
              Radiation: {radiation.toFixed(1)} mSv/h
            </div>
            {contaminated && <div style={{ color: '#ff0000' }}>CONTAMINATED</div>}
          </div>
        </Html>
      )}
    </group>
  );
}

// Reactor building at center
function ReactorBuilding({ meltdown, explosion, containmentBreach }) {
  const meshRef = useRef();
  const glowRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      if (meltdown) {
        meshRef.current.material.emissiveIntensity =
          0.5 + Math.sin(state.clock.elapsedTime * 5) * 0.3;
      }
    }
    if (glowRef.current) {
      glowRef.current.scale.setScalar(
        1 + Math.sin(state.clock.elapsedTime * 2) * 0.1
      );
    }
  });

  return (
    <group>
      {/* Main reactor building */}
      <mesh ref={meshRef} position={[0, 1, 0]}>
        <cylinderGeometry args={[1.2, 1.5, 2, 16]} />
        <meshStandardMaterial
          color={explosion ? '#333' : meltdown ? '#ff4400' : '#555566'}
          emissive={meltdown ? '#ff2200' : '#000'}
          emissiveIntensity={meltdown ? 0.5 : 0}
          metalness={0.5}
          roughness={0.3}
        />
      </mesh>

      {/* Cooling towers */}
      <mesh position={[-2, 1.5, 0]}>
        <cylinderGeometry args={[0.3, 0.8, 3, 12]} />
        <meshStandardMaterial color="#667788" />
      </mesh>
      <mesh position={[2, 1.5, 0]}>
        <cylinderGeometry args={[0.3, 0.8, 3, 12]} />
        <meshStandardMaterial color="#667788" />
      </mesh>

      {/* Steam from cooling towers */}
      {!explosion && (
        <>
          <mesh position={[-2, 3.2, 0]}>
            <sphereGeometry args={[0.4, 8, 8]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.5} />
          </mesh>
          <mesh position={[2, 3.2, 0]}>
            <sphereGeometry args={[0.4, 8, 8]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.5} />
          </mesh>
        </>
      )}

      {/* Containment dome */}
      <mesh position={[0, 2.5, 0]}>
        <sphereGeometry args={[1.2, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial
          color={containmentBreach ? '#882222' : '#444455'}
          transparent
          opacity={containmentBreach ? 0.5 : 0.9}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Radiation glow during incidents */}
      {(meltdown || containmentBreach) && (
        <mesh ref={glowRef} position={[0, 1, 0]}>
          <sphereGeometry args={[2, 16, 16]} />
          <meshBasicMaterial
            color="#ffaa00"
            transparent
            opacity={0.2}
            side={THREE.BackSide}
          />
        </mesh>
      )}

      {/* Explosion debris */}
      {explosion && (
        <>
          {Array.from({ length: 10 }).map((_, i) => (
            <mesh
              key={i}
              position={[
                (Math.random() - 0.5) * 4,
                Math.random() * 2,
                (Math.random() - 0.5) * 4,
              ]}
              rotation={[Math.random() * Math.PI, Math.random() * Math.PI, 0]}
            >
              <boxGeometry args={[0.3, 0.3, 0.3]} />
              <meshStandardMaterial color="#333" />
            </mesh>
          ))}
        </>
      )}
    </group>
  );
}

// Ground plane with radiation visualization
function Ground({ neighborhood, groundwater }) {
  const meshRef = useRef();
  const gridSize = 20;

  // Create texture based on radiation levels
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Draw grid with radiation colors
    const cellSize = 256 / gridSize;

    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const cell = neighborhood[y]?.[x];
        if (!cell) continue;

        const radiation = cell.radiation || 0;
        const soilContam = cell.soilContamination || 0;

        let r = 34, g = 60, b = 34; // Base ground color

        if (cell.type === 'lake') {
          r = 30; g = 80; b = 140;
        }

        // Add radiation coloring
        if (radiation > 0 || soilContam > 0) {
          const intensity = Math.min(1, (radiation + soilContam) / 500);
          r = Math.floor(r + (255 - r) * intensity);
          g = Math.floor(g + (100 - g) * intensity);
          b = Math.floor(b * (1 - intensity));
        }

        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);

        // Add grid lines
        ctx.strokeStyle = 'rgba(0,0,0,0.1)';
        ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, [neighborhood]);

  // Update texture when radiation changes
  useEffect(() => {
    if (texture) {
      texture.needsUpdate = true;
    }
  }, [neighborhood, texture]);

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
      <planeGeometry args={[gridSize, gridSize]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
}

// Wind direction indicator
function WindIndicator({ direction, speed }) {
  const arrowRef = useRef();

  useFrame(() => {
    if (arrowRef.current) {
      arrowRef.current.rotation.y = -(direction * Math.PI) / 180 + Math.PI / 2;
    }
  });

  return (
    <group ref={arrowRef} position={[0, 5, 0]}>
      <mesh rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.2, 0.6, 8]} />
        <meshBasicMaterial color="#00ccff" />
      </mesh>
      <mesh position={[0.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, 1]} />
        <meshBasicMaterial color="#00ccff" />
      </mesh>
      <Html position={[0, 0.5, 0]} center>
        <div style={{
          color: '#00ccff',
          fontSize: '10px',
          fontFamily: 'monospace',
          whiteSpace: 'nowrap',
        }}>
          Wind: {speed.toFixed(1)} m/s
        </div>
      </Html>
    </group>
  );
}

// Camera controller
function CameraController() {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(15, 15, 15);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  return null;
}

// Main 3D scene
function Scene() {
  const {
    neighborhood,
    groundwater,
    windDirection,
    windSpeed,
    radiation,
    isMeltdown,
    isExplosion,
    isContainmentBreach,
    weather,
    isNight,
  } = useReactorStore();

  const weatherData = WEATHER_TYPES[weather] || WEATHER_TYPES.clear;

  return (
    <>
      <CameraController />
      <OrbitControls
        enablePan
        enableZoom
        enableRotate
        minDistance={5}
        maxDistance={40}
        maxPolarAngle={Math.PI / 2.1}
      />

      {/* Lighting */}
      <ambientLight intensity={isNight ? 0.2 : 0.5} />
      <directionalLight
        position={isNight ? [-5, 10, -5] : [10, 20, 10]}
        intensity={isNight ? 0.3 : 1}
        color={isNight ? '#6677aa' : '#ffffff'}
        castShadow
      />

      {/* Fog for atmosphere (stronger during weather) */}
      <fog
        attach="fog"
        color={weather === 'fog' ? '#aabbcc' : '#1a1a2e'}
        near={weather === 'fog' ? 5 : 15}
        far={weather === 'fog' ? 25 : 50}
      />

      {/* Sky color */}
      <color
        attach="background"
        args={[isNight ? '#0a0a1a' : weather === 'storm' ? '#2a2a3a' : '#1a1a3a']}
      />

      {/* Ground */}
      <Ground neighborhood={neighborhood} groundwater={groundwater} />

      {/* Reactor */}
      <ReactorBuilding
        meltdown={isMeltdown}
        explosion={isExplosion}
        containmentBreach={isContainmentBreach}
      />

      {/* Buildings */}
      {neighborhood.map((row, y) =>
        row.map((cell, x) => (
          <Building
            key={`${x}-${y}`}
            type={cell.type}
            x={x}
            z={y}
            radiation={cell.radiation}
            contaminated={cell.contaminated}
            evacuated={cell.evacuated}
            population={cell.population || 0}
          />
        ))
      )}

      {/* Radiation plume */}
      <RadiationPlume
        windDirection={windDirection}
        windSpeed={windSpeed}
        radiation={radiation}
        containmentBreach={isContainmentBreach || isMeltdown}
      />

      {/* Wind indicator */}
      <WindIndicator direction={windDirection} speed={windSpeed} />

      {/* Weather indicator */}
      <Html position={[-8, 4, -8]} center>
        <div style={{
          background: 'rgba(0,0,0,0.7)',
          padding: '8px',
          borderRadius: '4px',
          color: '#fff',
          fontSize: '14px',
        }}>
          {weatherData.icon} {weatherData.name}
        </div>
      </Html>
    </>
  );
}

// Main component
export default function EnvironmentMap() {
  const {
    totalPopulationExposed,
    totalEvacuated,
    lethalExposures,
    airContamination,
    groundContamination,
    waterContamination,
  } = useReactorStore();

  return (
    <div className="environment-map">
      <div className="map-container">
        <Canvas shadows camera={{ fov: 50 }}>
          <Scene />
        </Canvas>
      </div>

      <div className="map-legend">
        <h4>Environment Status</h4>
        <div className="legend-grid">
          <div className="legend-item">
            <span className="legend-color" style={{ background: '#00ff00' }}></span>
            <span>Safe</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ background: '#ffcc00' }}></span>
            <span>Low Radiation</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ background: '#ff6600' }}></span>
            <span>High Radiation</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ background: '#ff0000' }}></span>
            <span>Lethal</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ background: '#444' }}></span>
            <span>Evacuated</span>
          </div>
        </div>

        <div className="contamination-bars">
          <div className="bar-item">
            <span>Air</span>
            <div className="bar-track">
              <div
                className="bar-fill air"
                style={{ width: `${airContamination}%` }}
              ></div>
            </div>
            <span>{airContamination.toFixed(0)}%</span>
          </div>
          <div className="bar-item">
            <span>Ground</span>
            <div className="bar-track">
              <div
                className="bar-fill ground"
                style={{ width: `${groundContamination}%` }}
              ></div>
            </div>
            <span>{groundContamination.toFixed(0)}%</span>
          </div>
          <div className="bar-item">
            <span>Water</span>
            <div className="bar-track">
              <div
                className="bar-fill water"
                style={{ width: `${waterContamination}%` }}
              ></div>
            </div>
            <span>{waterContamination.toFixed(0)}%</span>
          </div>
        </div>

        <div className="population-stats">
          <div className="stat">
            <span className="stat-label">Exposed</span>
            <span className="stat-value">{totalPopulationExposed.toLocaleString()}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Evacuated</span>
            <span className="stat-value">{totalEvacuated.toLocaleString()}</span>
          </div>
          <div className="stat danger">
            <span className="stat-label">Lethal Dose</span>
            <span className="stat-value">{lethalExposures.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
