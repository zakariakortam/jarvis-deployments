import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sky as DreiSky } from '@react-three/drei';
import * as THREE from 'three';
import useGameStore from '../store/gameStore';
import { DAY_LENGTH } from '../utils/constants';

// Sun component
function Sun({ time }) {
  const sunRef = useRef();

  // Calculate sun position based on time
  const sunPosition = useMemo(() => {
    const angle = time * Math.PI * 2 - Math.PI / 2;
    const radius = 400;
    return [
      Math.cos(angle) * radius,
      Math.sin(angle) * radius,
      0
    ];
  }, [time]);

  // Sun color based on time of day
  const sunColor = useMemo(() => {
    if (time > 0.2 && time < 0.8) {
      return '#ffff80'; // Day
    } else if (time > 0.15 && time <= 0.2 || time >= 0.8 && time < 0.85) {
      return '#ff8844'; // Sunrise/sunset
    } else {
      return '#444444'; // Night (moon)
    }
  }, [time]);

  return (
    <mesh ref={sunRef} position={sunPosition}>
      <sphereGeometry args={[20, 32, 32]} />
      <meshBasicMaterial color={sunColor} />
    </mesh>
  );
}

// Moon component
function Moon({ time }) {
  const moonRef = useRef();

  // Moon is opposite to sun
  const moonPosition = useMemo(() => {
    const angle = time * Math.PI * 2 + Math.PI / 2;
    const radius = 400;
    return [
      Math.cos(angle) * radius,
      Math.sin(angle) * radius,
      0
    ];
  }, [time]);

  const isVisible = time < 0.2 || time > 0.8;

  if (!isVisible) return null;

  return (
    <mesh ref={moonRef} position={moonPosition}>
      <sphereGeometry args={[15, 32, 32]} />
      <meshBasicMaterial color="#e8e8e8" />
    </mesh>
  );
}

// Stars component
function Stars({ time }) {
  const starsRef = useRef();

  // Only show stars at night
  const opacity = useMemo(() => {
    if (time < 0.15 || time > 0.85) return 1;
    if (time < 0.25) return (0.25 - time) / 0.1;
    if (time > 0.75) return (time - 0.75) / 0.1;
    return 0;
  }, [time]);

  // Generate star positions
  const starPositions = useMemo(() => {
    const positions = [];
    const count = 500;

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = 450 + Math.random() * 50;

      positions.push(
        radius * Math.sin(phi) * Math.cos(theta),
        Math.abs(radius * Math.cos(phi)),
        radius * Math.sin(phi) * Math.sin(theta)
      );
    }

    return new Float32Array(positions);
  }, []);

  if (opacity <= 0) return null;

  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={starPositions.length / 3}
          array={starPositions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={2}
        color="#ffffff"
        transparent
        opacity={opacity}
        sizeAttenuation={false}
      />
    </points>
  );
}

// Clouds component
function Clouds({ time }) {
  const cloudsRef = useRef();

  // Cloud color based on time
  const cloudColor = useMemo(() => {
    if (time > 0.2 && time < 0.8) {
      return '#ffffff';
    } else if (time > 0.15 && time < 0.85) {
      return '#ffccaa';
    } else {
      return '#333344';
    }
  }, [time]);

  // Generate cloud positions
  const clouds = useMemo(() => {
    const cloudData = [];
    const count = 20;

    for (let i = 0; i < count; i++) {
      cloudData.push({
        position: [
          (Math.random() - 0.5) * 500,
          100 + Math.random() * 30,
          (Math.random() - 0.5) * 500
        ],
        scale: 10 + Math.random() * 20,
        opacity: 0.6 + Math.random() * 0.3
      });
    }

    return cloudData;
  }, []);

  // Animate clouds
  useFrame((state, delta) => {
    if (cloudsRef.current) {
      cloudsRef.current.children.forEach((cloud, i) => {
        cloud.position.x += delta * 2;
        if (cloud.position.x > 300) {
          cloud.position.x = -300;
        }
      });
    }
  });

  return (
    <group ref={cloudsRef}>
      {clouds.map((cloud, i) => (
        <mesh key={i} position={cloud.position}>
          <boxGeometry args={[cloud.scale * 2, cloud.scale * 0.3, cloud.scale]} />
          <meshBasicMaterial
            color={cloudColor}
            transparent
            opacity={cloud.opacity * 0.6}
          />
        </mesh>
      ))}
    </group>
  );
}

// Main Sky component
export function Sky() {
  const time = useGameStore(state => state.time);
  const updateTime = useGameStore(state => state.updateTime);
  const settings = useGameStore(state => state.settings);
  const isPlaying = useGameStore(state => state.isPlaying);

  // Update time
  useFrame((state, delta) => {
    if (isPlaying) {
      updateTime(delta);
    }
  });

  // Calculate sky parameters based on time
  const skyParams = useMemo(() => {
    // Rayleigh scattering coefficient changes with time
    let rayleigh = 2;
    let mieCoefficient = 0.005;
    let mieDirectionalG = 0.8;
    let turbidity = 10;

    // Calculate sun inclination (angle from horizon)
    // time 0 = sunrise, 0.25 = noon, 0.5 = sunset, 0.75 = midnight
    const inclination = 0.5 - Math.abs(time * 2 - 0.5);
    const azimuth = time * 360;

    // Adjust for night time
    if (time < 0.2 || time > 0.8) {
      rayleigh = 0.1;
      turbidity = 1;
    } else if (time < 0.25 || time > 0.75) {
      // Sunrise/sunset
      rayleigh = 3;
      turbidity = 8;
      mieCoefficient = 0.01;
    }

    return {
      rayleigh,
      turbidity,
      mieCoefficient,
      mieDirectionalG,
      inclination: Math.max(0, inclination),
      azimuth
    };
  }, [time]);

  // Calculate sun position for the drei Sky component
  const sunPosition = useMemo(() => {
    const angle = time * Math.PI * 2 - Math.PI / 2;
    const elevation = Math.sin(angle);
    const azimuthAngle = Math.cos(angle);

    return [
      Math.cos(time * Math.PI * 2) * 100,
      Math.sin(time * Math.PI * 2 - Math.PI / 2) * 100,
      Math.sin(time * Math.PI * 2) * 100
    ];
  }, [time]);

  // Ambient light intensity based on time
  const ambientIntensity = useMemo(() => {
    if (time > 0.2 && time < 0.8) {
      return 0.6; // Day
    } else if (time > 0.1 && time < 0.9) {
      return 0.3; // Dawn/dusk
    } else {
      return 0.15; // Night
    }
  }, [time]);

  // Directional light intensity
  const directionalIntensity = useMemo(() => {
    if (time > 0.2 && time < 0.8) {
      return 1.0;
    } else if (time > 0.1 && time < 0.9) {
      return 0.5;
    } else {
      return 0.1;
    }
  }, [time]);

  // Sky background color for night
  const backgroundColor = useMemo(() => {
    if (time < 0.15 || time > 0.85) {
      return '#0a0a1a';
    } else if (time < 0.2 || time > 0.8) {
      return '#1a1a3a';
    }
    return null;
  }, [time]);

  return (
    <>
      {/* Background color for night */}
      {backgroundColor && (
        <color attach="background" args={[backgroundColor]} />
      )}

      {/* Procedural sky */}
      <DreiSky
        distance={450000}
        sunPosition={sunPosition}
        inclination={skyParams.inclination}
        azimuth={skyParams.azimuth}
        rayleigh={skyParams.rayleigh}
        turbidity={skyParams.turbidity}
        mieCoefficient={skyParams.mieCoefficient}
        mieDirectionalG={skyParams.mieDirectionalG}
      />

      {/* Sun and moon */}
      <Sun time={time} />
      <Moon time={time} />

      {/* Stars */}
      <Stars time={time} />

      {/* Clouds */}
      {settings.clouds && <Clouds time={time} />}

      {/* Ambient light */}
      <ambientLight intensity={ambientIntensity} />

      {/* Directional light (sun) */}
      <directionalLight
        position={sunPosition}
        intensity={directionalIntensity}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={500}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
      />

      {/* Hemisphere light for ambient sky color */}
      <hemisphereLight
        skyColor={time > 0.2 && time < 0.8 ? '#87ceeb' : '#0a0a1a'}
        groundColor="#3d2817"
        intensity={0.3}
      />

      {/* Fog for distance fading */}
      <fog
        attach="fog"
        args={[
          time > 0.2 && time < 0.8 ? '#c8e6ff' : '#0a0a2a',
          50,
          250
        ]}
      />
    </>
  );
}

export default Sky;
