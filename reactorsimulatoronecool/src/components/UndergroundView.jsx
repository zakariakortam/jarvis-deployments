import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import useReactorStore from '../store/reactorStore';

// Groundwater cell visualization
function GroundwaterCell({ x, z, contamination, depth, flowDirection }) {
  const meshRef = useRef();
  const flowRef = useRef();

  const color = useMemo(() => {
    if (contamination < 1) return '#006699';
    if (contamination < 10) return '#338866';
    if (contamination < 50) return '#66aa44';
    if (contamination < 100) return '#aaaa00';
    if (contamination < 500) return '#ff6600';
    return '#ff0000';
  }, [contamination]);

  // Animate flow arrows
  useFrame((state) => {
    if (flowRef.current && contamination > 1) {
      flowRef.current.position.y = -depth + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  return (
    <group position={[x - 9.5, 0, z - 9.5]}>
      {/* Water layer */}
      <mesh ref={meshRef} position={[0, -depth, 0]}>
        <boxGeometry args={[0.9, 0.3, 0.9]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.6 + Math.min(contamination / 200, 0.3)}
        />
      </mesh>

      {/* Flow direction indicator */}
      {contamination > 5 && (
        <group ref={flowRef} position={[0, -depth, 0]}>
          <mesh
            position={[flowDirection.x * 0.3, 0, flowDirection.y * 0.3]}
            rotation={[Math.PI / 2, 0, Math.atan2(flowDirection.y, flowDirection.x)]}
          >
            <coneGeometry args={[0.1, 0.2, 4]} />
            <meshBasicMaterial color="#00ffff" transparent opacity={0.7} />
          </mesh>
        </group>
      )}

      {/* Contamination intensity glow */}
      {contamination > 50 && (
        <mesh position={[0, -depth, 0]}>
          <sphereGeometry args={[0.3 + contamination / 500, 8, 8]} />
          <meshBasicMaterial
            color="#ff4400"
            transparent
            opacity={0.2}
          />
        </mesh>
      )}
    </group>
  );
}

// Underground layers visualization
function UndergroundLayers() {
  return (
    <group>
      {/* Topsoil layer */}
      <mesh position={[0, -1, 0]}>
        <boxGeometry args={[20, 2, 20]} />
        <meshStandardMaterial color="#4a3728" transparent opacity={0.3} />
      </mesh>

      {/* Bedrock layer */}
      <mesh position={[0, -15, 0]}>
        <boxGeometry args={[20, 10, 20]} />
        <meshStandardMaterial color="#333333" transparent opacity={0.2} />
      </mesh>

      {/* Aquifer layer outline */}
      <mesh position={[0, -5, 0]}>
        <boxGeometry args={[20, 5, 20]} />
        <meshBasicMaterial color="#006699" wireframe transparent opacity={0.1} />
      </mesh>
    </group>
  );
}

// Reactor foundation showing melt-through
function ReactorFoundation({ floorIntegrity, chinaSyndrome }) {
  const coriumRef = useRef();

  useFrame((state) => {
    if (coriumRef.current && chinaSyndrome) {
      // Animate corium blob
      coriumRef.current.position.y = -3 - Math.sin(state.clock.elapsedTime) * 0.2;
      coriumRef.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  return (
    <group>
      {/* Foundation */}
      <mesh position={[0, -1, 0]}>
        <cylinderGeometry args={[2, 2.5, 2, 16]} />
        <meshStandardMaterial
          color={floorIntegrity < 50 ? '#882222' : '#555555'}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Damage indicator */}
      {floorIntegrity < 100 && (
        <mesh position={[0, -2, 0]}>
          <cylinderGeometry args={[1.5 * (1 - floorIntegrity / 100), 0.1, 1, 16]} />
          <meshBasicMaterial color="#ff4400" transparent opacity={0.5} />
        </mesh>
      )}

      {/* Corium blob (molten core) */}
      {chinaSyndrome && (
        <mesh ref={coriumRef} position={[0, -3, 0]}>
          <sphereGeometry args={[1.2, 16, 16]} />
          <meshStandardMaterial
            color="#ff2200"
            emissive="#ff4400"
            emissiveIntensity={0.8}
          />
        </mesh>
      )}

      {/* Contamination trail from corium */}
      {chinaSyndrome && (
        <>
          {Array.from({ length: 8 }).map((_, i) => (
            <mesh key={i} position={[0, -4 - i * 0.5, 0]}>
              <sphereGeometry args={[0.8 - i * 0.08, 8, 8]} />
              <meshBasicMaterial
                color="#ff6600"
                transparent
                opacity={0.3 - i * 0.03}
              />
            </mesh>
          ))}
        </>
      )}
    </group>
  );
}

// Cross-section view
function CrossSection({ neighborhood, groundwater }) {
  const centerRow = 10;

  return (
    <group>
      {/* Surface level indicator */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#2a3c2a" transparent opacity={0.5} />
      </mesh>

      {/* Cross-section slice */}
      {neighborhood[centerRow]?.map((cell, x) => {
        const gwCell = groundwater[centerRow]?.[x];
        if (!gwCell) return null;

        return (
          <group key={x} position={[x - 9.5, 0, 0]}>
            {/* Surface radiation */}
            {cell.radiation > 0 && (
              <mesh position={[0, 0.5, 0]}>
                <boxGeometry args={[0.9, Math.min(cell.radiation / 100, 5), 0.1]} />
                <meshBasicMaterial
                  color={cell.radiation > 500 ? '#ff0000' : '#ffaa00'}
                  transparent
                  opacity={0.7}
                />
              </mesh>
            )}

            {/* Underground water column */}
            <mesh position={[0, -gwCell.depth / 2, 0]}>
              <boxGeometry args={[0.9, gwCell.depth, 0.1]} />
              <meshStandardMaterial
                color={gwCell.contamination > 10 ? '#ff6600' : '#006699'}
                transparent
                opacity={0.4}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

// Scene component
function Scene() {
  const {
    groundwater,
    neighborhood,
    floorIntegrity,
    isChinaSyndrome,
    waterContamination,
    mapView,
  } = useReactorStore();

  return (
    <>
      <OrbitControls
        enablePan
        enableZoom
        enableRotate
        minDistance={5}
        maxDistance={50}
        maxPolarAngle={Math.PI / 1.5}
      />

      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 10, 5]} intensity={0.5} />
      <pointLight position={[0, -5, 0]} color="#006699" intensity={0.5} />

      {/* Background */}
      <color attach="background" args={['#0a1520']} />

      {/* Fog for depth */}
      <fog attach="fog" color="#0a1520" near={10} far={40} />

      {/* Underground layers */}
      <UndergroundLayers />

      {/* Reactor foundation */}
      <ReactorFoundation
        floorIntegrity={floorIntegrity}
        chinaSyndrome={isChinaSyndrome}
      />

      {/* Groundwater cells */}
      {groundwater.map((row, y) =>
        row.map((cell, x) => (
          <GroundwaterCell
            key={`${x}-${y}`}
            x={x}
            z={y}
            contamination={cell.contamination}
            depth={cell.depth / 5}
            flowDirection={cell.flowDirection}
          />
        ))
      )}

      {/* Cross-section overlay */}
      {mapView === 'cross-section' && (
        <CrossSection neighborhood={neighborhood} groundwater={groundwater} />
      )}

      {/* Labels */}
      <Html position={[-8, 0.5, -8]} center>
        <div style={{
          background: 'rgba(0,0,0,0.8)',
          padding: '6px 10px',
          borderRadius: '4px',
          color: '#00ccff',
          fontSize: '12px',
          fontFamily: 'monospace',
        }}>
          Surface Level
        </div>
      </Html>

      <Html position={[-8, -5, -8]} center>
        <div style={{
          background: 'rgba(0,0,0,0.8)',
          padding: '6px 10px',
          borderRadius: '4px',
          color: '#006699',
          fontSize: '12px',
          fontFamily: 'monospace',
        }}>
          Aquifer Layer
        </div>
      </Html>

      <Html position={[-8, -15, -8]} center>
        <div style={{
          background: 'rgba(0,0,0,0.8)',
          padding: '6px 10px',
          borderRadius: '4px',
          color: '#444',
          fontSize: '12px',
          fontFamily: 'monospace',
        }}>
          Bedrock
        </div>
      </Html>
    </>
  );
}

export default function UndergroundView() {
  const {
    groundwater,
    waterContamination,
    floorIntegrity,
    isChinaSyndrome,
    mapView,
    setMapView,
  } = useReactorStore();

  // Calculate stats
  const stats = useMemo(() => {
    let totalContam = 0;
    let maxContam = 0;
    let contaminatedCells = 0;

    groundwater.forEach(row => {
      row.forEach(cell => {
        totalContam += cell.contamination;
        if (cell.contamination > maxContam) maxContam = cell.contamination;
        if (cell.contamination > 1) contaminatedCells++;
      });
    });

    return {
      avgContam: totalContam / (20 * 20),
      maxContam,
      contaminatedCells,
      percentContaminated: (contaminatedCells / (20 * 20)) * 100,
    };
  }, [groundwater]);

  return (
    <div className="underground-view">
      <div className="view-header">
        <h3>Groundwater Contamination</h3>
        <div className="view-tabs">
          <button
            className={mapView === 'underground' ? 'active' : ''}
            onClick={() => setMapView('underground')}
          >
            3D View
          </button>
          <button
            className={mapView === 'cross-section' ? 'active' : ''}
            onClick={() => setMapView('cross-section')}
          >
            Cross-Section
          </button>
        </div>
      </div>

      <div className="canvas-container">
        <Canvas camera={{ position: [15, 5, 15], fov: 50 }}>
          <Scene />
        </Canvas>
      </div>

      <div className="underground-stats">
        <div className="stat-row">
          <div className="stat-box">
            <span className="stat-label">Water Contamination</span>
            <span className="stat-value" style={{
              color: waterContamination > 50 ? '#ff4400' : waterContamination > 20 ? '#ffaa00' : '#00ff00'
            }}>
              {waterContamination.toFixed(1)}%
            </span>
          </div>
          <div className="stat-box">
            <span className="stat-label">Floor Integrity</span>
            <span className="stat-value" style={{
              color: floorIntegrity < 30 ? '#ff4400' : floorIntegrity < 70 ? '#ffaa00' : '#00ff00'
            }}>
              {floorIntegrity.toFixed(0)}%
            </span>
          </div>
          <div className="stat-box">
            <span className="stat-label">Max Contamination</span>
            <span className="stat-value">
              {stats.maxContam.toFixed(1)} Bq/L
            </span>
          </div>
          <div className="stat-box">
            <span className="stat-label">Affected Area</span>
            <span className="stat-value">
              {stats.percentContaminated.toFixed(1)}%
            </span>
          </div>
        </div>

        {isChinaSyndrome && (
          <div className="china-syndrome-alert">
            <span className="alert-icon">🌏</span>
            <div className="alert-content">
              <strong>CHINA SYNDROME ACTIVE</strong>
              <span>Molten core material is penetrating the containment floor and contaminating groundwater!</span>
            </div>
          </div>
        )}

        <div className="legend">
          <span className="legend-title">Contamination Level:</span>
          <div className="legend-items">
            <span style={{ color: '#006699' }}>Clean</span>
            <span style={{ color: '#66aa44' }}>Low</span>
            <span style={{ color: '#aaaa00' }}>Medium</span>
            <span style={{ color: '#ff6600' }}>High</span>
            <span style={{ color: '#ff0000' }}>Critical</span>
          </div>
        </div>
      </div>
    </div>
  );
}
