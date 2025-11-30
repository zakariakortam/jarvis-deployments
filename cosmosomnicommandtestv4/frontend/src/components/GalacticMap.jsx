import { useRef, useMemo, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Html } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';
import HoloPanel from './HoloPanel';

function CelestialObject({ object, isSelected, onClick }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  const color = useMemo(() => {
    switch (object.type) {
      case 'star': return object.color || '#ffee77';
      case 'planet': return object.habitable ? '#44ff88' : '#8888aa';
      case 'station': return '#00f0ff';
      case 'nebula': return object.color?.primary || '#ff4466';
      case 'anomaly': return '#ff47ab';
      case 'asteroidField': return '#aa8866';
      default: return '#ffffff';
    }
  }, [object]);

  const scale = useMemo(() => {
    switch (object.type) {
      case 'star': return 2 + (object.radius || 1) * 0.2;
      case 'planet': return 1 + (object.radius || 1) * 0.1;
      case 'station': return 0.8;
      case 'nebula': return (object.radius || 100) * 0.01;
      case 'anomaly': return 1;
      case 'asteroidField': return (object.radius || 100) * 0.01;
      default: return 1;
    }
  }, [object]);

  useFrame((state) => {
    if (meshRef.current) {
      if (object.type === 'star') {
        meshRef.current.rotation.y += 0.001;
        const pulse = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
        meshRef.current.scale.setScalar(scale * pulse);
      } else if (object.type === 'anomaly') {
        meshRef.current.rotation.x += 0.01;
        meshRef.current.rotation.y += 0.01;
      }
    }
  });

  const position = [
    (object.position?.x || 0) * 0.01,
    (object.position?.z || 0) * 0.01,
    (object.position?.y || 0) * 0.01
  ];

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={(e) => { e.stopPropagation(); onClick(object); }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        {object.type === 'nebula' ? (
          <sphereGeometry args={[scale, 16, 16]} />
        ) : object.type === 'anomaly' ? (
          <torusKnotGeometry args={[scale * 0.3, scale * 0.1, 64, 8]} />
        ) : (
          <sphereGeometry args={[scale * 0.3, 32, 32]} />
        )}
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={object.type === 'star' ? 1 : (hovered || isSelected ? 0.5 : 0.2)}
          transparent={object.type === 'nebula'}
          opacity={object.type === 'nebula' ? 0.3 : 1}
        />
      </mesh>

      {/* Selection ring */}
      {isSelected && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[scale * 0.5, scale * 0.6, 32]} />
          <meshBasicMaterial color="#00f0ff" transparent opacity={0.5} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Label */}
      {(hovered || isSelected) && (
        <Html distanceFactor={20} position={[0, scale * 0.5, 0]}>
          <div className="bg-space-dark/90 border border-holo-blue/50 rounded px-2 py-1 text-xs text-holo-cyan whitespace-nowrap pointer-events-none">
            {object.name}
          </div>
        </Html>
      )}
    </group>
  );
}

function ShipMarker({ ship }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  const position = [
    (ship.position?.x || 0) * 0.01,
    (ship.position?.z || 0) * 0.01,
    (ship.position?.y || 0) * 0.01
  ];

  const color = ship.status === 'operational' ? '#00ff88' :
    ship.status === 'caution' ? '#ff8800' :
      ship.status === 'alert' ? '#ff3355' : '#888888';

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <coneGeometry args={[0.2, 0.5, 4]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
      </mesh>
      <pointLight color={color} intensity={0.5} distance={3} />
    </group>
  );
}

function HazardZone({ zone }) {
  if (!zone.active) return null;

  const position = [
    (zone.position?.x || 0) * 0.01,
    0,
    (zone.position?.y || 0) * 0.01
  ];

  return (
    <mesh position={position} rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[(zone.radius || 100) * 0.01 - 0.5, (zone.radius || 100) * 0.01, 32]} />
      <meshBasicMaterial color="#ff3355" transparent opacity={0.2} side={THREE.DoubleSide} />
    </mesh>
  );
}

function MapScene({ onSelectObject }) {
  const { celestialObjects, hazardZones, ships, selectedObject } = useStore();

  return (
    <>
      <ambientLight intensity={0.1} />
      <pointLight position={[0, 10, 0]} intensity={0.5} />

      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

      {/* Celestial objects */}
      {celestialObjects.map(obj => (
        <CelestialObject
          key={obj.id}
          object={obj}
          isSelected={selectedObject?.id === obj.id}
          onClick={onSelectObject}
        />
      ))}

      {/* Hazard zones */}
      {hazardZones.map(zone => (
        <HazardZone key={zone.id} zone={zone} />
      ))}

      {/* Ship markers */}
      {ships.map(ship => (
        <ShipMarker key={ship.id} ship={ship} />
      ))}

      {/* Grid helper */}
      <gridHelper args={[100, 50, '#00f0ff', '#001a33']} position={[0, -5, 0]} />

      <OrbitControls
        enablePan
        enableZoom
        enableRotate
        maxDistance={80}
        minDistance={5}
      />
    </>
  );
}

function ObjectDetailPanel({ object, onClose }) {
  if (!object) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="absolute right-4 top-4 bottom-4 w-80 z-10"
    >
      <HoloPanel
        title={object.name}
        subtitle={object.type?.toUpperCase()}
        headerActions={
          <button onClick={onClose} className="text-holo-cyan/60 hover:text-holo-cyan">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        }
        className="h-full"
      >
        <div className="p-4 space-y-4 overflow-auto max-h-[calc(100%-60px)]">
          {/* Type-specific info */}
          {object.type === 'star' && (
            <>
              <div>
                <div className="text-xs text-holo-blue/60 uppercase">Star Type</div>
                <div className="text-holo-cyan">{object.starType}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-space-dark/50 rounded p-2">
                  <div className="text-xs text-holo-blue/60">Temperature</div>
                  <div className="text-holo-orange font-mono">{object.temperature?.toLocaleString()}K</div>
                </div>
                <div className="bg-space-dark/50 rounded p-2">
                  <div className="text-xs text-holo-blue/60">Mass</div>
                  <div className="text-holo-cyan font-mono">{object.mass?.toFixed(2)} M☉</div>
                </div>
              </div>
              <div>
                <div className="text-xs text-holo-blue/60">Planets: {object.planets}</div>
                <div className="text-xs text-holo-blue/60">Stations: {object.stations}</div>
              </div>
            </>
          )}

          {object.type === 'planet' && (
            <>
              <div>
                <div className="text-xs text-holo-blue/60 uppercase">Planet Type</div>
                <div className="text-holo-cyan">{object.planetType}</div>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${object.habitable ? 'bg-holo-green' : 'bg-holo-red'}`} />
                <span className="text-sm text-holo-cyan">
                  {object.habitable ? 'Habitable' : 'Not Habitable'}
                </span>
              </div>
              {object.population > 0 && (
                <div>
                  <div className="text-xs text-holo-blue/60">Population</div>
                  <div className="text-holo-cyan font-mono">{object.population.toLocaleString()}</div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-space-dark/50 rounded p-2">
                  <div className="text-xs text-holo-blue/60">Gravity</div>
                  <div className="text-holo-cyan font-mono">{object.gravity?.toFixed(2)}g</div>
                </div>
                <div className="bg-space-dark/50 rounded p-2">
                  <div className="text-xs text-holo-blue/60">Temperature</div>
                  <div className="text-holo-orange font-mono">{object.temperature?.toFixed(0)}°C</div>
                </div>
              </div>
            </>
          )}

          {object.type === 'station' && (
            <>
              <div>
                <div className="text-xs text-holo-blue/60 uppercase">Station Type</div>
                <div className="text-holo-cyan">{object.stationType}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-space-dark/50 rounded p-2">
                  <div className="text-xs text-holo-blue/60">Capacity</div>
                  <div className="text-holo-cyan font-mono">{object.capacity?.toLocaleString()}</div>
                </div>
                <div className="bg-space-dark/50 rounded p-2">
                  <div className="text-xs text-holo-blue/60">Population</div>
                  <div className="text-holo-cyan font-mono">{object.population?.toLocaleString()}</div>
                </div>
              </div>
              <div>
                <div className="text-xs text-holo-blue/60 mb-2">Services</div>
                <div className="flex flex-wrap gap-1">
                  {object.services?.map(service => (
                    <span key={service} className="text-xs bg-holo-blue/20 text-holo-cyan px-2 py-0.5 rounded">
                      {service}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}

          {object.type === 'anomaly' && (
            <>
              <div>
                <div className="text-xs text-holo-blue/60 uppercase">Anomaly Type</div>
                <div className="text-holo-pink">{object.anomalyType}</div>
              </div>
              <div className="bg-holo-red/10 border border-holo-red/30 rounded p-2">
                <div className="text-xs text-holo-red">Danger Level: {object.dangerLevel}/10</div>
              </div>
              <div>
                <div className="text-xs text-holo-blue/60 mb-2">Effects</div>
                <div className="space-y-1">
                  {object.effects?.map(effect => (
                    <div key={effect} className="text-xs text-holo-orange">{effect}</div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Position */}
          <div>
            <div className="text-xs text-holo-blue/60 uppercase mb-2">Position</div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-space-dark/50 rounded p-1">
                <div className="text-[10px] text-holo-blue/60">X</div>
                <div className="text-xs text-holo-cyan font-mono">{object.position?.x?.toFixed(0)}</div>
              </div>
              <div className="bg-space-dark/50 rounded p-1">
                <div className="text-[10px] text-holo-blue/60">Y</div>
                <div className="text-xs text-holo-cyan font-mono">{object.position?.y?.toFixed(0)}</div>
              </div>
              <div className="bg-space-dark/50 rounded p-1">
                <div className="text-[10px] text-holo-blue/60">Z</div>
                <div className="text-xs text-holo-cyan font-mono">{object.position?.z?.toFixed(0)}</div>
              </div>
            </div>
          </div>

          {/* Controlled by */}
          {object.controlledBy && (
            <div>
              <div className="text-xs text-holo-blue/60">Controlled By</div>
              <div className="text-holo-purple">{object.controlledBy}</div>
            </div>
          )}

          {/* Resources */}
          {object.resources && object.resources.length > 0 && (
            <div>
              <div className="text-xs text-holo-blue/60 uppercase mb-2">Resources</div>
              <div className="space-y-1">
                {object.resources.map(res => (
                  <div key={res.name} className="flex items-center justify-between text-xs">
                    <span className="text-holo-cyan">{res.name}</span>
                    <div className="w-16 h-1 bg-space-dark rounded-full overflow-hidden">
                      <div
                        className="h-full bg-holo-green"
                        style={{ width: `${(res.abundance || 0) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </HoloPanel>
    </motion.div>
  );
}

export default function GalacticMap() {
  const { celestialObjects, selectedObject, setSelectedObject } = useStore();
  const [filter, setFilter] = useState('all');

  const objectCounts = useMemo(() => {
    return {
      all: celestialObjects.length,
      star: celestialObjects.filter(o => o.type === 'star').length,
      planet: celestialObjects.filter(o => o.type === 'planet').length,
      station: celestialObjects.filter(o => o.type === 'station').length,
      nebula: celestialObjects.filter(o => o.type === 'nebula').length,
      anomaly: celestialObjects.filter(o => o.type === 'anomaly').length
    };
  }, [celestialObjects]);

  return (
    <div className="h-full flex flex-col relative">
      {/* Controls */}
      <div className="absolute left-4 top-4 z-10 space-y-2">
        <HoloPanel className="p-3">
          <h3 className="font-display text-sm text-holo-blue uppercase mb-3">Galactic Navigation</h3>

          <div className="space-y-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="holo-input text-xs py-1"
            >
              <option value="all">All Objects ({objectCounts.all})</option>
              <option value="star">Stars ({objectCounts.star})</option>
              <option value="planet">Planets ({objectCounts.planet})</option>
              <option value="station">Stations ({objectCounts.station})</option>
              <option value="nebula">Nebulae ({objectCounts.nebula})</option>
              <option value="anomaly">Anomalies ({objectCounts.anomaly})</option>
            </select>
          </div>

          <div className="mt-3 text-xs text-holo-cyan/60">
            <p>Drag to rotate</p>
            <p>Scroll to zoom</p>
            <p>Click object to select</p>
          </div>
        </HoloPanel>

        {/* Legend */}
        <HoloPanel className="p-3">
          <h4 className="text-xs text-holo-blue uppercase mb-2">Legend</h4>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <span className="text-holo-cyan">Star</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-holo-green" />
              <span className="text-holo-cyan">Habitable Planet</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-400" />
              <span className="text-holo-cyan">Planet</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-holo-blue" />
              <span className="text-holo-cyan">Station</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-holo-pink" />
              <span className="text-holo-cyan">Anomaly</span>
            </div>
          </div>
        </HoloPanel>
      </div>

      {/* 3D Canvas */}
      <div className="flex-1">
        <Canvas camera={{ position: [20, 15, 20], fov: 60 }}>
          <MapScene onSelectObject={setSelectedObject} />
        </Canvas>
      </div>

      {/* Object detail panel */}
      <AnimatePresence>
        {selectedObject && (
          <ObjectDetailPanel
            object={selectedObject}
            onClose={() => setSelectedObject(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
