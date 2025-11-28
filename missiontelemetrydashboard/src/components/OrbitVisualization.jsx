import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Sphere, Line, Stars } from '@react-three/drei'
import * as THREE from 'three'

// Earth component
function Earth() {
  const earthRef = useRef()

  useFrame((state) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.001
    }
  })

  return (
    <Sphere ref={earthRef} args={[6.371, 64, 64]} position={[0, 0, 0]}>
      <meshStandardMaterial
        color="#2a5a8a"
        roughness={0.8}
        metalness={0.2}
        emissive="#1a3a5a"
        emissiveIntensity={0.1}
      />
    </Sphere>
  )
}

// Satellite marker component
function SatelliteMarker({ satellite, isSelected, onClick }) {
  const meshRef = useRef()
  const { position } = satellite.orbit

  // Scale position down (divide by 1000 for better visualization)
  const scaledPosition = [position.x / 1000, position.y / 1000, position.z / 1000]

  // Color based on status
  const statusColors = {
    nominal: '#22c55e',
    warning: '#f59e0b',
    critical: '#ef4444',
    offline: '#6b7280',
  }

  const color = statusColors[satellite.status] || '#6b7280'

  useFrame((state) => {
    if (meshRef.current) {
      // Pulse animation for selected satellite
      if (isSelected) {
        const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.2
        meshRef.current.scale.set(scale, scale, scale)
      }
    }
  })

  return (
    <group>
      <Sphere
        ref={meshRef}
        args={[0.1, 16, 16]}
        position={scaledPosition}
        onClick={(e) => {
          e.stopPropagation()
          onClick(satellite)
        }}
      >
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isSelected ? 0.8 : 0.3}
        />
      </Sphere>
      {isSelected && (
        <Sphere args={[0.15, 16, 16]} position={scaledPosition}>
          <meshBasicMaterial color={color} transparent opacity={0.2} />
        </Sphere>
      )}
    </group>
  )
}

// Orbit path component
function OrbitPath({ satellite }) {
  const points = useMemo(() => {
    const curve = []
    const { altitude, inclination } = satellite.orbit

    // Generate orbit path (simplified circular orbit)
    for (let i = 0; i <= 64; i++) {
      const theta = (i / 64) * Math.PI * 2
      const phi = (inclination * Math.PI) / 180
      const radius = (6371 + altitude) / 1000

      curve.push(
        new THREE.Vector3(
          radius * Math.sin(phi) * Math.cos(theta),
          radius * Math.sin(phi) * Math.sin(theta),
          radius * Math.cos(phi)
        )
      )
    }

    return curve
  }, [satellite.orbit.altitude, satellite.orbit.inclination])

  return (
    <Line
      points={points}
      color="#4b5563"
      lineWidth={1}
      transparent
      opacity={0.3}
      dashed
      dashSize={0.5}
      gapSize={0.3}
    />
  )
}

// Main scene component
function Scene({ satellites, selectedSatellite, onSelectSatellite, showOrbits, maxDisplay }) {
  // Limit displayed satellites for performance
  const displayedSatellites = useMemo(
    () => satellites.slice(0, maxDisplay),
    [satellites, maxDisplay]
  )

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[100, 100, 100]} intensity={1} />
      <Stars radius={300} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

      <Earth />

      {displayedSatellites.map((satellite) => (
        <SatelliteMarker
          key={satellite.id}
          satellite={satellite}
          isSelected={selectedSatellite?.id === satellite.id}
          onClick={onSelectSatellite}
        />
      ))}

      {showOrbits && selectedSatellite && <OrbitPath satellite={selectedSatellite} />}

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={8}
        maxDistance={100}
      />
    </>
  )
}

// Main component
export default function OrbitVisualization({
  satellites = [],
  selectedSatellite = null,
  onSelectSatellite = () => {},
  showOrbits = true,
  maxDisplay = 500,
  className = '',
}) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ position: [30, 30, 30], fov: 50 }}
        style={{ background: '#000000' }}
      >
        <Scene
          satellites={satellites}
          selectedSatellite={selectedSatellite}
          onSelectSatellite={onSelectSatellite}
          showOrbits={showOrbits}
          maxDisplay={maxDisplay}
        />
      </Canvas>
    </div>
  )
}
