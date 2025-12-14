import { useRef, useState, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { BLOCK_TYPES, BLOCK_PROPERTIES } from '../utils/constants';

// Single block component for placing/breaking visualization
export function Block({ position, blockType, isBreaking = false, breakProgress = 0, isHighlighted = false }) {
  const meshRef = useRef();
  const props = BLOCK_PROPERTIES[blockType];

  if (!props || blockType === BLOCK_TYPES.AIR) return null;

  // Get colors for the block
  const getColor = (face) => {
    let color = props.color || '#ffffff';
    if (face === 'top' && props.topColor) color = props.topColor;
    if (face === 'side' && props.sideColor) color = props.sideColor;
    return color;
  };

  const topColor = getColor('top');
  const sideColor = getColor('side');
  const baseColor = props.color || '#ffffff';

  // Create materials for each face
  const materials = [
    new THREE.MeshLambertMaterial({ color: sideColor || baseColor }), // right
    new THREE.MeshLambertMaterial({ color: sideColor || baseColor }), // left
    new THREE.MeshLambertMaterial({ color: topColor || baseColor }),  // top
    new THREE.MeshLambertMaterial({ color: baseColor }),              // bottom
    new THREE.MeshLambertMaterial({ color: sideColor || baseColor }), // front
    new THREE.MeshLambertMaterial({ color: sideColor || baseColor }), // back
  ];

  // Apply transparency if needed
  if (props.transparent) {
    materials.forEach(mat => {
      mat.transparent = true;
      mat.opacity = blockType === BLOCK_TYPES.WATER ? 0.6 : 0.8;
    });
  }

  // Apply break effect
  if (isBreaking && breakProgress > 0) {
    const darkFactor = 1 - breakProgress * 0.5;
    materials.forEach(mat => {
      mat.color.multiplyScalar(darkFactor);
    });
  }

  return (
    <group position={position}>
      <mesh ref={meshRef} material={materials}>
        <boxGeometry args={[1, 1, 1]} />
      </mesh>
      {isHighlighted && (
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(1.002, 1.002, 1.002)]} />
          <lineBasicMaterial color="black" linewidth={2} />
        </lineSegments>
      )}
    </group>
  );
}

// Block selection highlight
export function BlockHighlight({ position, visible = true }) {
  if (!visible || !position) return null;

  return (
    <group position={[position[0] + 0.5, position[1] + 0.5, position[2] + 0.5]}>
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(1.01, 1.01, 1.01)]} />
        <lineBasicMaterial color="#000000" linewidth={2} transparent opacity={0.8} />
      </lineSegments>
    </group>
  );
}

// Preview block for placement
export function PlacementPreview({ position, blockType, visible = true }) {
  if (!visible || !position || blockType === BLOCK_TYPES.AIR) return null;

  const props = BLOCK_PROPERTIES[blockType];
  if (!props) return null;

  return (
    <mesh position={[position[0] + 0.5, position[1] + 0.5, position[2] + 0.5]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshLambertMaterial
        color={props.color || '#ffffff'}
        transparent
        opacity={0.5}
      />
    </mesh>
  );
}

// Breaking animation overlay
export function BreakingOverlay({ position, progress, visible = true }) {
  if (!visible || !position || progress <= 0) return null;

  // Create crack pattern based on progress
  const crackStage = Math.min(9, Math.floor(progress * 10));
  const opacity = 0.1 + crackStage * 0.08;

  return (
    <mesh position={[position[0] + 0.5, position[1] + 0.5, position[2] + 0.5]}>
      <boxGeometry args={[1.002, 1.002, 1.002]} />
      <meshBasicMaterial
        color="#000000"
        transparent
        opacity={opacity}
        depthWrite={false}
        polygonOffset
        polygonOffsetFactor={-1}
      />
    </mesh>
  );
}

export default Block;
