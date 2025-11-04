import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Text } from '@react-three/drei';
import * as THREE from 'three';

// Earth component
function Earth() {
  const earthRef = useRef();

  useFrame((state) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.001;
    }
  });

  return (
    <Sphere ref={earthRef} args={[6371 / 1000, 64, 64]} position={[0, 0, 0]}>
      <meshStandardMaterial
        color="#1e40af"
        roughness={0.7}
        metalness={0.2}
      />
    </Sphere>
  );
}

// Satellite component
function Satellite({ position, status, id, isSelected, onClick }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  const color = useMemo(() => {
    switch (status) {
      case 'critical':
        return '#ef4444';
      case 'warning':
        return '#f59e0b';
      case 'offline':
        return '#6b7280';
      default:
        return '#10b981';
    }
  }, [status]);

  useFrame((state) => {
    if (meshRef.current && (isSelected || hovered)) {
      meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 3) * 0.2);
    } else if (meshRef.current) {
      meshRef.current.scale.setScalar(1);
    }
  });

  // Scale position for better visualization
  const scaledPosition = [
    position.x / 1000,
    position.y / 1000,
    position.z / 1000,
  ];

  return (
    <group>
      <Sphere
        ref={meshRef}
        args={[0.3, 16, 16]}
        position={scaledPosition}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isSelected || hovered ? 0.8 : 0.3}
        />
      </Sphere>
      {(isSelected || hovered) && (
        <Text
          position={[scaledPosition[0], scaledPosition[1] + 1, scaledPosition[2]]}
          fontSize={0.5}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {id}
        </Text>
      )}
    </group>
  );
}

// Orbit path component
function OrbitPath({ satellite }) {
  const points = useMemo(() => {
    const pts = [];
    const segments = 64;
    const r = Math.sqrt(
      satellite.orbit.position.x ** 2 +
      satellite.orbit.position.y ** 2 +
      satellite.orbit.position.z ** 2
    ) / 1000;

    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      pts.push(
        new THREE.Vector3(
          r * Math.cos(angle),
          r * Math.sin(angle) * Math.cos(satellite.orbit.inclination * Math.PI / 180),
          r * Math.sin(angle) * Math.sin(satellite.orbit.inclination * Math.PI / 180)
        )
      );
    }
    return pts;
  }, [satellite]);

  return (
    <Line
      points={points}
      color="#3b82f6"
      lineWidth={1}
      transparent
      opacity={0.3}
    />
  );
}

// Main visualization component
function OrbitVisualization({ satellites = [], selectedSatelliteId, onSatelliteClick }) {
  // Limit displayed satellites for performance
  const displayedSatellites = useMemo(() => {
    const selected = satellites.find(s => s.id === selectedSatelliteId);
    const others = satellites
      .filter(s => s.id !== selectedSatelliteId)
      .slice(0, 100); // Show max 100 satellites

    return selected ? [selected, ...others] : others;
  }, [satellites, selectedSatelliteId]);

  const selectedSatellite = useMemo(
    () => satellites.find(s => s.id === selectedSatelliteId),
    [satellites, selectedSatelliteId]
  );

  return (
    <div className="w-full h-full bg-card rounded-lg overflow-hidden">
      <Canvas
        camera={{ position: [20, 20, 20], fov: 60 }}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={['#020617']} />
        <ambientLight intensity={0.3} />
        <pointLight position={[50, 50, 50]} intensity={1} />
        <pointLight position={[-50, -50, -50]} intensity={0.5} />

        <Earth />

        {selectedSatellite && <OrbitPath satellite={selectedSatellite} />}

        {displayedSatellites.map((satellite) => (
          <Satellite
            key={satellite.id}
            position={satellite.orbit.position}
            status={satellite.overallStatus}
            id={satellite.id}
            isSelected={satellite.id === selectedSatelliteId}
            onClick={() => onSatelliteClick(satellite.id)}
          />
        ))}

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={10}
          maxDistance={100}
        />

        <gridHelper args={[100, 20, '#1e293b', '#0f172a']} />
      </Canvas>

      <div className="absolute top-4 left-4 bg-card/90 backdrop-blur-sm border border-border rounded-lg p-3 text-sm">
        <div className="font-semibold text-foreground mb-2">Legend</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-muted-foreground">Nominal</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-muted-foreground">Warning</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-muted-foreground">Critical</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-500"></div>
            <span className="text-muted-foreground">Offline</span>
          </div>
        </div>
        <div className="mt-3 pt-2 border-t border-border text-xs text-muted-foreground">
          Showing {displayedSatellites.length} of {satellites.length} satellites
        </div>
      </div>
    </div>
  );
}

export default OrbitVisualization;
